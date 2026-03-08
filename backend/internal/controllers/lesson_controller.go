package controllers

import (
	"PenPath/backend/internal/databases"
	"PenPath/backend/internal/dto"
	"context"
	"time"

	"github.com/gofiber/fiber/v3"
)

type LessonController struct {
	DB *databases.DBManager
}

func NewLessonController(db *databases.DBManager) *LessonController {
	return &LessonController{DB: db}
}

func (l *LessonController) GetReadingLessons(c fiber.Ctx) error {
	return l.getLessonsByCategory(c, "reading")
}

func (l *LessonController) GetWritingLessons(c fiber.Ctx) error {
	return l.getLessonsByCategory(c, "writing")
}

func (l *LessonController) getLessonsByCategory(c fiber.Ctx, category string) error {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	rows, err := l.DB.DB.Query(
		ctx,
		`SELECT l.id, l.letter, l.title, l.description, l.difficulty_level, l.estimated_duration_minutes, l.cover_image_url
		FROM lessons l
		JOIN lesson_categories c
		ON l.category_id = c.id
		WHERE c.name = $1
		AND l.is_active = true
		ORDER BY l.letter ASC`,
		category,
	)

	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status":  "error",
			"message": "failed to query lessons",
		})
	}

	defer rows.Close()

	lessons := []dto.Lesson{}

	for rows.Next() {
		var lesson dto.Lesson

		err := rows.Scan(
			&lesson.ID,
			&lesson.Letter,
			&lesson.Title,
			&lesson.Description,
			&lesson.DifficultyLevel,
			&lesson.EstimatedTime,
			&lesson.CoverImageURL,
		)

		if err != nil {
			continue
		}

		// retrieving lesson steps
		rowSteps, err := l.DB.DB.Query(
			ctx,
			`SELECT step_type, sequence_order, title, instruction_text, audio_url, image_url 
			FROM  lesson_steps
			WHERE lesson_id = $1
			AND is_active = true
			ORDER BY sequence_order ASC`,
			lesson.ID,
		)

		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"status":  "error",
				"message": "failed to query lesson steps",
			})
		}

		steps := []dto.LessonStep{}

		for rowSteps.Next() {
			var step dto.LessonStep

			err := rowSteps.Scan(
				&step.StepType,
				&step.SequenceOrder,
				&step.Title,
				&step.Instruction,
				&step.AudioURL,
				&step.ImageURL,
			)

			if err != nil {
				continue
			}

			steps = append(steps, step)
		}

		if err := rowSteps.Err(); err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"status":  "error",
				"message": "failed to iterate through lesson steps",
			})
		}

		rowSteps.Close()

		lesson.Steps = steps
		lessons = append(lessons, lesson)

	}

	if err := rows.Err(); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status":  "error",
			"message": "failed to iterate through lessons",
		})
	}

	return c.JSON(fiber.Map{
		"status":  "ok",
		"lessons": lessons,
	})
}
