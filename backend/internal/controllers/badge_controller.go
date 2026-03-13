package controllers

import (
	"PenPath/backend/internal/databases"
	"PenPath/backend/internal/dto"
	"context"
	"time"

	"github.com/gofiber/fiber/v3"
)

type BadgeController struct {
	DB *databases.DBManager
}

func NewBadgeController(db *databases.DBManager) *BadgeController {
	return &BadgeController{DB: db}
}

func (b *BadgeController) GetUserBadges(c fiber.Ctx) error {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	rawUserID := c.Locals("user_id")
	userID, ok := rawUserID.(string)
	if !ok || userID == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"status":  "error",
			"message": "missing or invalid user context",
		})
	}

	rows, err := b.DB.DB.Query(
		ctx,
		`SELECT
			b.id,
			b.name,
			b.description,
			b.icon_url,
			b.badge_type,
			b.points,
			ub.earned_at
		FROM user_badges ub
		JOIN badges b ON ub.badge_id = b.id
		WHERE ub.student_id = $1
		ORDER BY ub.earned_at DESC`,
		userID,
	)

	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status":  "error",
			"message": "failed to retrieve badges",
		})
	}

	defer rows.Close()

	var badges []dto.BadgeResponse

	for rows.Next() {
		var badge dto.BadgeResponse

		err := rows.Scan(
			&badge.ID,
			&badge.Name,
			&badge.Description,
			&badge.IconURL,
			&badge.BadgeType,
			&badge.Points,
			&badge.EarnedAt,
		)

		if err != nil {
			return err
		}

		badges = append(badges, badge)
	}

	if err := rows.Err(); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status":  "error",
			"message": "error reading badge rows",
		})
	}

	return c.JSON(fiber.Map{
		"status": "ok",
		"data":   badges,
	})
}
