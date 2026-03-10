package validation

import "github.com/gofiber/fiber/v3"

func ValidationError(c fiber.Ctx, err error) error {
	return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
		"status":  "error",
		"message": "validation failed",
		"errors":  err.Error(),
	})
}

func BadRequest(c fiber.Ctx, message string) error {
	return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
		"status":  " error",
		"message": message,
	})
}
