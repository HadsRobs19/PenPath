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

	app.Get("/me", middleware.JWTVerifierInstance.AuthMiddleware, authController.GetProfile)
	backend.PrintInfo("Successfully Registered /me route!")
}
