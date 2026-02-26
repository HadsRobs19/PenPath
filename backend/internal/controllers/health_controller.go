package controllers

import (
	"PenPath/backend/internal/databases"
	"context"
	"time"

	"github.com/gofiber/fiber/v3"
)

// HealthController holds dependencies needed for health checks.
type HealthController struct {
	DB *databases.DBManager
}

// constructor
func NewHealthController(db *databases.DBManager) *HealthController {
	return &HealthController{DB: db}
}

func (h *HealthController) HealthCheck(c fiber.Ctx) error {
	// short timeout implemented with ctx so connection doesnt hang if the db isn't reachable
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	// call Ping() on underlying pgxpool to verify that a connection can happen and the db is reachable at request time
	if err := h.DB.DB.Ping(ctx); err != nil {
		return c.Status(fiber.StatusServiceUnavailable).
			JSON(fiber.Map{
				"status":   "degraded",
				"database": "down",
			})
	}

	// If DB is reachable, return healthy status.
	return c.Status(fiber.StatusOK).
		JSON(fiber.Map{
			"status":   "ok",
			"database": "ok",
		})
}
