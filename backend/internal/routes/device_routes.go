package routes

import (
	backend "penpath-backend"
	"penpath-backend/internal/controllers"
	"penpath-backend/internal/databases"
	"penpath-backend/internal/middleware"

	"github.com/gofiber/fiber/v3"
)

// frontend sends JSON body, Fiber receives request,
func RegisterDeviceRoute(app *fiber.App, db *databases.DBManager) {
	deviceController := controllers.NewDeviceController(db)

	api := app.Group("/api", middleware.JWTVerifierInstance.AuthMiddleware)
	api.Post("/devices/register", deviceController.PostDevice)

	backend.PrintInfo("Successfully Registered /devices/register route!")
}
