package routes

import (
	backend "PenPath/backend"
	"PenPath/backend/internal/config"
	"PenPath/backend/internal/controllers"
	"PenPath/backend/internal/databases"
	"PenPath/backend/internal/middleware"

	"github.com/gofiber/fiber/v3"
)

func RegisterUserRoute(app *fiber.App, db *databases.DBManager, supabaseConfig config.SupabaseConfig) {
	authController := controllers.NewAuthController(db, supabaseConfig)
	api := app.Group("/api", middleware.JWTVerifierInstance.AuthMiddleware)

	api.Get("/me", authController.GetProfile)
	api.Delete("/account", authController.DeleteAccount)
	backend.PrintInfo("Successfully Registered /me and /account routes!")
}
