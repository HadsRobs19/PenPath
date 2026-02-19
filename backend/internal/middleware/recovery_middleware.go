package middleware

import (
	"log"

	"github.com/gofiber/fiber/v3"
	"github.com/gofiber/fiber/v3/middleware/recover"
)

// RegisterRecoveryMiddleware applies global panic recovery.
func RegisterRecovery(app *fiber.App) {
	app.Use(recover.New(recover.Config{
		EnableStackTrace: true,
		StackTraceHandler: func(c fiber.Ctx, r interface{}) {
			log.Println("Panic caught in handle:", r)
		},
	}))
}
