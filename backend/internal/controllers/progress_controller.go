package controllers

import (
	"PenPath/backend"
	"PenPath/backend/internal/databases"
	"PenPath/backend/internal/dto"
	services "PenPath/backend/internal/service"
	"PenPath/backend/internal/validation"
	"context"
	"fmt"
	"time"

	"github.com/gofiber/fiber/v3"
	"github.com/google/uuid"
)

type ProgressController struct {
	DB *databases.DBManager
}

func NewProgressController(db *databases.DBManager) *ProgressController {
	return &ProgressController{DB: db}
}

// resolveLessonStepID converts a string identifier to a UUID
// If it's already a valid UUID, returns it directly
// Otherwise, looks it up in the lesson_steps table by title
func (p *ProgressController) resolveLessonStepID(ctx context.Context, identifier string) (string, error) {
	// First, check if it's already a valid UUID
	if _, err := uuid.Parse(identifier); err == nil {
		return identifier, nil
	}

	// Not a UUID, try to look it up by title in lesson_steps table
	// The title field stores identifiers like "colors-writing-step", "animals-reading", etc.
	var lessonStepID string
	err := p.DB.DB.QueryRow(
		ctx,
		`SELECT id::text FROM lesson_steps WHERE title = $1 LIMIT 1`,
		identifier,
	).Scan(&lessonStepID)

	if err != nil {
		backend.PrintError(fmt.Sprintf("[Progress] Could not find lesson step with title '%s': %v", identifier, err))
		return "", err
	}

	backend.PrintInfo(fmt.Sprintf("[Progress] Resolved '%s' to UUID: %s", identifier, lessonStepID))
	return lessonStepID, nil
}

func (p *ProgressController) SaveReadingProgress(c fiber.Ctx) error {
	return p.saveProgress(c, "reading")
}

func (p *ProgressController) SaveWritingProgress(c fiber.Ctx) error {
	return p.saveProgress(c, "writing")
}

func (p *ProgressController) saveProgress(c fiber.Ctx, progressType string) error {
	var attemptNumber int

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_ = progressType

	rawUserID := c.Locals("user_id")

	userID, ok := rawUserID.(string)
	if !ok || userID == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"status":  "error",
			"message": "missing or invalid user context",
		})
	}

	body := new(dto.ProgressSubmission)
	if err := c.Bind().Body(body); err != nil {
		return validation.BadRequest(c, "invalid request body")
	}

	if err := validation.Validate(body); err != nil {
		return validation.ValidationError(c, err)
	}

	// Try to resolve lesson step ID (convert slug to UUID if needed)
	lessonStepID, err := p.resolveLessonStepID(ctx, body.LessonStepID)
	if err != nil {
		// Lesson step not found in database - return success anyway for dev purposes
		// This allows frontend to function while database is being set up
		backend.PrintInfo(fmt.Sprintf("[Progress] Skipping DB save for unknown lesson step: %s", body.LessonStepID))
		return c.JSON(fiber.Map{
			"status": "ok",
			"data": fiber.Map{
				"lesson_step_id": body.LessonStepID,
				"attempt_number": 1,
				"note":           "progress not saved - lesson step not in database",
			},
		})
	}

	// Get previous attempt count
	var previousAttempt int
	err = p.DB.DB.QueryRow(
		ctx,
		`SELECT COALESCE(MAX(attempt_number), 0)
		FROM user_progress
		WHERE student_id = $1
		AND lesson_step_id = $2`,
		userID,
		lessonStepID,
	).Scan(&previousAttempt)

	if err != nil {
		backend.PrintError(fmt.Sprintf("[Progress] DB query error: %v", err))
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status":  "error",
			"message": "failed to retrieve attempt history",
		})
	}

	attemptNumber = previousAttempt + 1

	// Insert user progress into database
	_, err = p.DB.DB.Exec(
		ctx,
		`INSERT INTO user_progress(
			student_id,
			lesson_step_id,
			client_event_id,
			attempt_number,
			accuracy_percent,
			time_spent_seconds,
			is_completed,
			notes,
			device_id,
			completion_timestamp,
			drawing_url
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
		ON CONFLICT (student_id, client_event_id)
		DO UPDATE SET
			accuracy_percent = EXCLUDED.accuracy_percent,
			is_completed = EXCLUDED.is_completed`,
		userID,
		lessonStepID,
		body.ClientEventID,
		attemptNumber,
		body.AccuracyPercent,
		body.TimeSpentSeconds,
		body.IsCompleted,
		body.Notes,
		body.DeviceID,
		body.CompletedAt,
		body.DrawingURL,
	)

	if err != nil {
		backend.PrintError(fmt.Sprintf("[Progress] Insert error: %v", err))
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status":  "error",
			"message": "failed to insert progress",
		})
	}

	// auto updates letter mastery (skip if it fails - non-critical)
	masteryService := services.NewLetterMasteryService(p.DB)
	if err := masteryService.UpdateLetterMastery(ctx, userID, lessonStepID); err != nil {
		backend.PrintError(fmt.Sprintf("[Progress] Letter mastery update failed: %v", err))
	}

	// badge checks (skip if it fails - non-critical)
	badgeService := services.NewBadgeService(p.DB)
	if err := badgeService.CheckBadgeCriteria(ctx, userID, lessonStepID); err != nil {
		backend.PrintError(fmt.Sprintf("[Progress] Badge check failed: %v", err))
	}

	return c.JSON(fiber.Map{
		"status": "ok",
		"data": fiber.Map{
			"lesson_step_id": body.LessonStepID,
			"attempt_number": attemptNumber,
		},
	})
}

// retrieves lesson progress summary
func (p *ProgressController) GetProgressSummary(c fiber.Ctx) error {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	rawUserID := c.Locals("user_id")
	userID, ok := rawUserID.(string)
	if !ok || userID == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"status":  "error",
			"message": "missing and invalid user context",
		})
	}

	var summary dto.ProgressSummary

	err := p.DB.DB.QueryRow(
		ctx,
		`
		SELECT
			COUNT(*) AS lessons_completed,

			COALESCE(AVG(up.accuracy_percent),0),

			(
				SELECT COALESCE(ARRAY_AGG(letter ORDER BY letter), '{}')
				FROM letter_mastery
				WHERE student_id = $1
				AND is_mastered = true
			),

			(
				SELECT COALESCE(ARRAY_AGG(letter ORDER BY letter), '{}')
				FROM letter_mastery
				WHERE student_id = $1
				AND is_mastered = false
			)

		FROM lessons l

		LEFT JOIN user_progress up ON up.student_id = $1

		WHERE (
			SELECT COUNT(*)
			FROM lesson_steps ls
			WHERE ls.lesson_id = l.id
		) = (
			SELECT COUNT(DISTINCT up.lesson_step_id)
			FROM user_progress up
			JOIN lesson_steps ls ON up.lesson_step_id = ls.id
			WHERE up.student_id = $1
			AND ls.lesson_id = l.id
			AND up.is_completed = true
		)`,
		userID,
	).Scan(
		&summary.LessonsCompleted,
		&summary.AverageAccuracy,
		&summary.LettersMastered,
		&summary.LettersNeedingWork,
	)

	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status":  "error",
			"message": "failed to retrieve progress summary",
		})
	}

	return c.JSON(fiber.Map{
		"status": "ok",
		"data":   summary,
	})
}
