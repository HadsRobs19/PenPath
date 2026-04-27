package middleware

import (
	"os"
	"strings"

	"github.com/gofiber/fiber/v3"
	"github.com/gofiber/fiber/v3/middleware/cors"
)

func RegisterCorsMiddleware(app *fiber.App) {

	origins := []string{"http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:3000", "http://127.0.0.1:5173"}

	if extra := os.Getenv("ALLOWED_ORIGINS"); extra != "" {
		for _, o := range strings.Split(extra, ",") {
			o = strings.TrimSpace(o)
			if o != "" {
				origins = append(origins, o)
			}
		}
	}

	// Check if we should allow all origins (for Docker/Pi development)
	allowAllOrigins := os.Getenv("CORS_ALLOW_ALL") == "true"

	corsConfig := cors.Config{
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		AllowCredentials: true,
	}

	if allowAllOrigins {
		// Allow any origin - useful for Docker/Pi setups where the IP may vary
		// Note: AllowCredentials with AllowOriginsFunc requires returning the specific origin
		corsConfig.AllowOriginsFunc = func(origin string) bool {
			return true
		}
	} else {
		corsConfig.AllowOrigins = origins
	}

	app.Use(cors.New(corsConfig))
}
