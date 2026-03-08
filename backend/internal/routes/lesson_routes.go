package routes

import (
	"PenPath/backend/internal/controllers"
	"PenPath/backend/internal/databases"
	"PenPath/backend/internal/middleware"

	"github.com/gofiber/fiber/v3"
)

func RegisterLessonRoute(app *fiber.App, db *databases.DBManager) {
	lessonController := controllers.NewLessonController(db)
	api := app.Group("/api", middleware.JWTVerifierInstance.AuthMiddleware)

	api.Get("/lessons/reading", lessonController.GetReadingLessons)
	api.Get("/lessons/writing", lessonController.GetWritingLessons)
}
