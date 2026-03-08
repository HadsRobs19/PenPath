package controllers

import (
	"PenPath/backend/internal/databases"
	"PenPath/backend/internal/dto"
	"context"
	"time"

	"github.com/gofiber/fiber/v3"
)

type ProgressController struct {
	DB *databases.DBManager
}

func NewProgressController(db *databases.DBManager) *ProgressController {
	return &ProgressController{DB: db}
}

func (p *ProgressController) SaveReadingProgress(c fiber.Ctx) error {
	return p.saveProgress(c, "reading")
}

func (p *ProgressController) SaveWritingProgress(c fiber.Ctx) error {
	return p.saveProgress(c, "writing")
}

func (p *ProgressController) saveProgress(c fiber.Ctx, progressType string) error {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
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
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"status":  "error",
			"message": "bad request binding",
		})
	}

	if body.LessonStepID == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"status":  "error",
			"message": "lesson_step_id is required",
		})
	}
	if body.AccuracyPercent < 0 || body.AccuracyPercent > 100 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"status":  "error",
			"message": "accuracy_percent is required",
		})
	}

	// because users can have multiple attempts on a lesson, tracking duplicate entries is done
	var previousAttempt int

	err := p.DB.DB.QueryRow(
		ctx,
		`SELECT COALESCE(MAX(attempt_number), 0)
		FROM user_progress
		WHERE student_id = $1
		AND lesson_step_id = $2`,
		userID,
		body.LessonStepID,
	).Scan(&previousAttempt)

	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status":  "error",
			"message": "failed to retrieve attempt history",
		})
	}

	attemptNumber := previousAttempt + 1

	// inserting user progress into database
	_, err = p.DB.DB.Exec(
		ctx,
		`INSERT INTO user_progress(
			student_id,
			lesson_step_id,
			attempt_number,
			accuracy_percent,
			time_spent_seconds,
			is_completed,
			notes,
			device_id,
			completion_timestamp
		)
		VALUES ($1,$2,$3,$4,$5,$6,$7,$8,NOW())`,
		userID,
		body.LessonStepID,
		attemptNumber,
		body.AccuracyPercent,
		body.TimeSpentSeconds,
		body.Notes,
		body.DeviceID,
		body.IsCompleted,
	)

	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status":  "error",
			"message": "failed to save progress",
		})
	}

	return c.JSON(fiber.Map{
		"status": "ok",
		"data": fiber.Map{
			"lesson_step_id": body.LessonStepID,
			"attempt_number": attemptNumber,
		},
	})

}
