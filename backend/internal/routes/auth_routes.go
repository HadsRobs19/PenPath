package routes

import (
	backend "PenPath/backend"
	"PenPath/backend/internal/controllers"
	"PenPath/backend/internal/databases"
	"PenPath/backend/internal/middleware"

	"github.com/gofiber/fiber/v3"
)

func RegisterUserRoute(app *fiber.App, db *databases.DBManager) {
	authController := controllers.NewAuthController(db)

	app.Get("/me", middleware.JWTVerifierInstance.AuthMiddleware, authController.GetProfile)
	backend.PrintInfo("Successfully Registered /me route!")
}
