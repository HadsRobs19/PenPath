package routes

import (
	backend "penpath-backend"
	"penpath-backend/internal/controllers"
	"penpath-backend/internal/databases"
	"penpath-backend/internal/middleware"

	"github.com/gofiber/fiber/v3"
)

func RegisterUserRoute(app *fiber.App, db *databases.DBManager) {
	authController := controllers.NewAuthController(db)
	api := app.Group("/api", middleware.JWTVerifierInstance.AuthMiddleware)

	api.Get("/me", authController.GetProfile)
	backend.PrintInfo("Successfully Registered /me route!")
}
