package routes

import (
	"PenPath/backend/internal/controllers"
	"PenPath/backend/internal/databases"
	"PenPath/backend/internal/middleware"

	"github.com/gofiber/fiber/v3"
)

func RegisterBadgeRoute(app *fiber.App, db *databases.DBManager) {
	badgeController := controllers.NewBadgeController(db)

	api := app.Group("/api", middleware.JWTVerifierInstance.AuthMiddleware)
	api.Get("/badges", badgeController.GetUserBadges)
}
