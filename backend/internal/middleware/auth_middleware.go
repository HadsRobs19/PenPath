package middleware

import (
	"github.com/gofiber/fiber/v3"
)

func RegisterAuthMiddleware(c fiber.Ctx) error {
	authHeader := c.Get("Authorization")

	if authHeader == "" {
		return fiber.ErrUnauthorized
	}

	// TODO:
	// Later (MILESTONE5-004+), validate JWT or session token here.

	return c.Next()
}
