package routes

import (
	backend "penpath-backend"
	"penpath-backend/internal/controllers"
	"penpath-backend/internal/databases"

	"github.com/gofiber/fiber/v3"
)

func RegisterHealthRoute(app *fiber.App, db *databases.DBManager) {
	healthController := controllers.NewHealthController(db)

	app.Get("/health", healthController.HealthCheck)
	backend.PrintInfo("Successfully Registered Healthcheck API Route!")
}

func RegisterLoggerRoute(app *fiber.App) {

}
