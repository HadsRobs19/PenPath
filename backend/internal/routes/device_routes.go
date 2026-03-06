package routes

import (
	backend "penpath-backend"
	"penpath-backend/internal/controllers"
	"penpath-backend/internal/databases"
	"penpath-backend/internal/middleware"

	"github.com/gofiber/fiber/v3"
)

type DeviceData struct {
	DeviceID        string `json:"device_identifier`
	DeviceType      string `json:"device_type"`
	DeviceNickname  string `json:"device_nickname"`
	OSName          string `json:"os_name"`
	OSVersion       string `json:"os_version"`
	BrowserName     string `json:"browser_name`
	ProcessorInfo   string `json:"processor_info"`
	SupportsWifi    bool   `json:"supports_wifi"`
	SupportsOffline bool   `json:"supports_offline"`
}

func RegisterDeviceRoute(app *fiber.App, db *databases.DBManager) {
	deviceController := controllers.NewDeviceController(db)

	app.Post("/devices/register", middleware.JWTVerifierInstance.AuthMiddleware, deviceController.PostDevice)
	backend.PrintInfo("Successfully Registered /devices/register route!")
}
