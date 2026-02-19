package middleware

import (
	"log/slog"
	"os"
	"time"

	"github.com/gofiber/fiber/v3"
	slogfiber "github.com/samber/slog-fiber"
	slogformatter "github.com/samber/slog-formatter"
)

// Logging middleware meant to log HTTP requests
func RegisterLoggerMiddleware(app *fiber.App) {
	logger := slog.New(
		slogformatter.NewFormatterHandler(
			slogformatter.TimezoneConverter(time.UTC),
			slogformatter.TimeFormatter(time.RFC3339, nil),
		)(
			slog.NewJSONHandler(os.Stdout, nil)),
	)

	logger = logger.With("env", "production")

	config := slogfiber.Config{
		WithRequestBody:    true,
		WithResponseBody:   true,
		WithRequestHeader:  true,
		WithResponseHeader: true,
	}

	app.Use(slogfiber.NewWithConfig(logger, config))
}
