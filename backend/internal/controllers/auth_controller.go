package controllers

import (
	"context"
	"penpath-backend/internal/databases"
	"time"

	"github.com/gofiber/fiber/v3"
	"github.com/jackc/pgx/v5"
)

type AuthController struct {
	DB *databases.DBManager
}

// constructor
func NewAuthController(db *databases.DBManager) *AuthController {
	return &AuthController{DB: db}
}

// GetProfile returns the authenticated user's basic profile info. Assumes AuthMiddleware already ran and stored the JWT subject in c.Locals("user_id").
func (a *AuthController) GetProfile(c fiber.Ctx) error {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	// pull user id from Fiber context that was set in JWT middleware
	rawUserID := c.Locals("user_id")
	userID, ok := rawUserID.(string)
	if !ok || userID == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"status":  "error",
			"message": "missing or invalid auth context",
		})
	}

	var firstName, lastName string
	var age int

	err := a.DB.DB.QueryRow(
		ctx,
		`SELECT first_name, last_name, age
		FROM users
		WHERE id = $1`,
		userID,
	).Scan(&firstName, &lastName, &age)

	if err != nil {
		if err == pgx.ErrNoRows {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"status":  "error",
				"message": "user profile not found",
			})
		}

		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status":  "error",
			"message": "failed to retrieve user profile",
		})
	}
	// If DB is reachable, return healthy status.
	return c.Status(fiber.StatusOK).
		JSON(fiber.Map{
			"status":  "ok",
			"message": "User info retrieved",
			"data": fiber.Map{
				"firstname": firstName,
				"lastname":  lastName,
				"age":       age,
			},
		})
}
