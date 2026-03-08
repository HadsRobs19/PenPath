package routes

import (
	"penpath-backend/internal/controllers"
	"penpath-backend/internal/databases"
	"penpath-backend/internal/middleware"

	"github.com/gofiber/fiber/v3"
)

func RegisterProgressRoute(app *fiber.App, db *databases.DBManager) {
	progressController := controllers.NewProgressController(db)

	api := app.Group("/api", middleware.JWTVerifierInstance.AuthMiddleware)
	api.Post("/progress/reading", progressController.SaveReadingProgress)
	api.Post("/progress/writing", progressController.SaveWritingProgress)
}
