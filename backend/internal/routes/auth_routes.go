package routes

import (
	backend "penpath-backend"
	//"penpath-backend/internal/controllers"
	"penpath-backend/internal/databases"

	"github.com/gofiber/fiber/v3"
)

func RegisterUserRoute(app *fiber.App, db *databases.DBManager) {
	//authController := controllers.NewAuthController(db)

	//app.Get("/health", healthController.HealthCheck)
	backend.PrintInfo("Successfully Registered Healthcheck API Route!")
}
