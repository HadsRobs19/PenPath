package routes

import (
	"PenPath/backend"

	"PenPath/backend/internal/controllers"

	"github.com/gofiber/fiber/v3"
)

func RegisterHealthRoute(app *fiber.App) {
	app.Get("/health", controllers.HealthCheck)
	backend.PrintInfo("Successfully Registered Healthcheck API Route!")
}

func RegisterLoggerRoute(app *fiber.App) {

}
