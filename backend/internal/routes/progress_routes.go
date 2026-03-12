package routes

import (
	backend "PenPath/backend"
	"PenPath/backend/internal/controllers"
	"PenPath/backend/internal/databases"
	"PenPath/backend/internal/middleware"

	"github.com/gofiber/fiber/v3"
)

func RegisterProgressRoute(app *fiber.App, db *databases.DBManager) {
	progressController := controllers.NewProgressController(db)

	api := app.Group("/api", middleware.JWTVerifierInstance.AuthMiddleware)
	api.Post("/progress/reading", progressController.SaveReadingProgress)
	api.Post("/progress/writing", progressController.SaveWritingProgress)
	api.Get("/progress", progressController.GetProgressSummary)

	backend.PrintInfo("Successfully Registered /api/progress/reading, /api/progress/writing, and /progress routes!")
}
