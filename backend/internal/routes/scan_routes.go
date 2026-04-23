package routes

import (
	backend "PenPath/backend"
	"PenPath/backend/internal/config"
	"PenPath/backend/internal/controllers"

	"github.com/gofiber/fiber/v3"
)

func RegisterScanRoute(app *fiber.App, cfg config.AnthropicConfig) {
	scanController := controllers.NewScanController(cfg.APIKey, cfg.Model)

	api := app.Group("/api")
	api.Post("/scan", scanController.TranscribeCursive)

	backend.PrintInfo("Successfully Registered /api/scan route!")
}
