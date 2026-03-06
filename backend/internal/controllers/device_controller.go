package controllers

import (
	"penpath-backend/internal/databases"

	"github.com/gofiber/fiber/v3"
)

type DeviceController struct {
	DB *databases.DBManager
}

func NewDeviceController(db *databases.DBManager) *DeviceController {
	return &DeviceController{DB: db}
}

func (d *DeviceController) PostDevice(c fiber.Ctx) error {
	//ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	//defer cancel()

	return c.Status(fiber.StatusOK).JSON(fiber.Map{})

}
