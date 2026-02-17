package main

import (
	"log"

	"github.com/gofiber/fiber/v3"

	"github.com/gofiber/fiber/v3/middleware/healthcheck"
)

// TEST HEALTH CHECK

func main() {
	app := fiber.New()

	app.Get("/", func(c fiber.Ctx) error {
		return c.SendString("Hello, World!")
	})

	app.All("/healthz", healthcheck.New())

	log.Fatal(app.Listen(":3000"))
}
