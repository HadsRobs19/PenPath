package main

import (
	"PenPath/backend"
	"PenPath/backend/internal/config"
	"PenPath/backend/internal/databases"
	"PenPath/backend/internal/middleware"
	"PenPath/backend/internal/routes"
	"PenPath/backend/internal/utils"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"os"

	"github.com/gofiber/fiber/v3"

	"github.com/charmbracelet/lipgloss"
)

var (
	AppConfig config.AppConfig
	//JWTMiddleware fiber.Handler
)

func main() {

	// loads all sub configs that make up the main app config (or backend building blocks) of PenPath to main: keeps routes out of main
	loadAppConfig(&AppConfig)
	backend.PrintInfo("Loaded main app configs!")

	initPenPathBox()

	app := fiber.New(fiber.Config{
		CaseSensitive: true,
		StrictRouting: true,
		ServerHeader:  "Fiber",
		AppName:       "PenPath",
		BodyLimit:     10 * 1024 * 1024,
		ErrorHandler: func(c fiber.Ctx, err error) error {
			code := fiber.StatusInternalServerError

			if e, ok := err.(*fiber.Error); ok {
				code = e.Code
			}
			log.Printf("Error: %v\n", err)

			return c.Status(code).JSON(fiber.Map{
				"error":   true,
				"message": err.Error(), // will probably change this message later to avoid showing raw errors
				"code":    code,
			})
		},
	})

	middleware.RegisterRecovery(app)
	middleware.RegisterLoggerMiddleware(app)
	middleware.RegisterCorsMiddleware(app)

	dbManager, err := databases.InitDBPool(&AppConfig.DBConfig)
	if err != nil {
		backend.PrintSevereErr("Failed to initialize database connection pool: " + err.Error())
		return
	}
	defer dbManager.Close()

	middleware.NewJWTVerifier(
		AppConfig.JWTConfig.Issuer,
		AppConfig.JWTConfig.Audience,
		AppConfig.JWTConfig.JWKSURL,
	)

	routes.RegisterHealthRoute(app, dbManager)
	routes.RegisterUserRoute(app, dbManager)
	routes.RegisterDeviceRoute(app, dbManager)
	routes.RegisterLessonRoute(app, dbManager)
	routes.RegisterProgressRoute(app, dbManager)
	routes.RegisterBadgeRoute(app, dbManager)

	backend.PrintInfo("Now Listening on " + AppConfig.ServiceConfig.IPv4Host + ":" + AppConfig.ServiceConfig.IPv4Port)
	err = app.Listen(AppConfig.ServiceConfig.IPv4Host + ":" + AppConfig.ServiceConfig.IPv4Port)
	if err != nil {
		backend.PrintSevereErr("Encountered an error when trying to enable the IPv4 socket. Error: " + err.Error())
		return
	}
}

func loadAppConfig(appConfig *config.AppConfig) {
	templateMainConfig := config.AppConfig{
		// Fiber is locked to 127.0.0.1 so only Caddy (running on the same machine)
		// can reach it. External traffic must go through Caddy on port 443.
		ServiceConfig: config.ServiceConfig{
			IPv4Host:    "127.0.0.1",
			IPv4Port:    "3000",
			IPv4Enabled: true,
			IPv6Host:    "[::]",
			IPv6Port:    "3000",
			IPv6Enabled: true,
		},
		// CaddyConfig describes how Caddy is set up in front of this Fiber backend.
		// Caddy handles TLS, HTTP->HTTPS redirects, and routes by domain to the correct port.
		//
		// Production config.json:  PublicHost = api.penpath.app,     ProxyTarget = localhost:3000
		// Staging config.json:     PublicHost = staging.penpath.app, ProxyTarget = localhost:3001
		// Local dev:               Caddy not used, Fiber runs directly on 127.0.0.1:3000
		CaddyConfig: config.CaddyConfig{
			AdminAPI:    "localhost:2019",
			PublicHost:  "api.penpath.app",
			ProxyTarget: "localhost:3000",
		},
		DBConfig: config.DBConfig{
			Host:     "localhost",
			Port:     5432,
			User:     "user",
			Password: os.Getenv("DB_PASSWORD"),
			DBName:   "mydb",
			SSLMode:  "disable",
		},
		SupabaseConfig: config.SupabaseConfig{
			ProjectURL:     os.Getenv("SUPABASE_URL"),
			AuthURL:        os.Getenv("SUPABASE_URL") + "/auth/v1",
			ServiceRoleKey: os.Getenv("SUPABASE_SERVICE_KEY"),
		},
		JWTConfig: config.JWTConfig{
			Issuer:        os.Getenv("SUPABASE_JWT_ISSUER"),
			Audience:      "authenticated",
			SigningMethod: "RS256",
			UseJWKS:       true,
			JWKSURL:       os.Getenv("SUPABASE_JWKS_URL"),
		},
		StorageConfig: config.StorageConfig{
			BucketName: os.Getenv("SUPABASE_STORAGE_BUCKET"),
			StorageURL: os.Getenv("SUPABASE_URL") + "/storage/v1",
		},
	}

	if _, unknownFolder := os.Stat("config"); os.IsNotExist(unknownFolder) {
		// if a config directory does not exist, it will be created
		err := os.Mkdir("config", 0755)
		if err != nil {
			backend.PrintError("Error creating directory:" + err.Error())
			return
		}
		backend.PrintInfo("Directory 'config' created successfully")
	}

	data, err := os.ReadFile("config/config.json")
	if errors.Is(err, os.ErrNotExist) {
		file, _ := os.Create("config/config.json")
		value, err1 := json.Marshal(templateMainConfig)
		if err1 != nil {
			backend.PrintError(err.Error())
		}
		_, err2 := file.Write(value)
		if err2 != nil {
			backend.PrintError("failed to write to file config.json: ")
		}

		backend.PrintError("Can't find main config file, creating config.json in config directory...")
		defer file.Close()
	}
	if err != nil {
		backend.PrintError("Failed to read file config/config.json")
		return
	}

	_ = json.Unmarshal(data, appConfig)
}

// this is VERY extra but wanted to try out lipgloss and put some ownership on our backend <3
func initPenPathBox() {
	borderStyle := lipgloss.NewStyle().
		Border(lipgloss.RoundedBorder()).
		BorderForeground(lipgloss.Color("#6B8BFD")).
		Align(lipgloss.Center).
		Width(80)

	topLineStyle := lipgloss.NewStyle().
		Foreground(lipgloss.Color("#94F4FF"))
	middleLineStyle := lipgloss.NewStyle().
		Foreground(lipgloss.Color("#61BFFF"))
	bottomLineStyle := lipgloss.NewStyle().
		Foreground(lipgloss.Color("#8C63D5"))
	extraBottomLineStyle := lipgloss.NewStyle().
		Foreground(lipgloss.Color("#BE63D5"))
	textLineStyle := lipgloss.NewStyle().
		Foreground(lipgloss.Color("#AAF0D1"))
	insertedTextLineStyle := lipgloss.NewStyle().
		Foreground(lipgloss.Color("#FFFFFF"))

	hostname, _ := os.Hostname()
	ipv4 := AppConfig.ServiceConfig.IPv4Host + ":" + AppConfig.ServiceConfig.IPv4Port
	ipv6 := AppConfig.ServiceConfig.IPv6Host + ":" + AppConfig.ServiceConfig.IPv6Port

	content := fmt.Sprintf(
		"%s\n%s\n%s\n%s\n%s\n%s\n%s\n%s\n%s\n%s\n%s\n%s\n%s\n%s\n%s\n",
		topLineStyle.Render("  ____                  ____        _   _     "),
		topLineStyle.Render(" |  _ \\ ___ _ __       |  _ \\ __ _ | |_| |__  "),
		middleLineStyle.Render(" | |_) / _ \\ '_ \\ _____| |_) / _` || __| '_ \\ "),
		middleLineStyle.Render(" |  __/  __/ | | |_____|  __/ (_| || |_| | | |"),
		bottomLineStyle.Render(" |_|   \\___|_| |_|     |_|   \\__,_| \\__|_| |_|"),
		bottomLineStyle.Render("                                               "),
		extraBottomLineStyle.Render("                                               "),
		extraBottomLineStyle.Render("                                               "),
		textLineStyle.Render("Pen Path. 2026 and affiliates."),
		textLineStyle.Render("All rights reserved."),
		textLineStyle.Render("Hostname: "+hostname),
		textLineStyle.Render("IPv4: "+ipv4),
		textLineStyle.Render("IPv6: "+ipv6),
		textLineStyle.Render("Version: ")+insertedTextLineStyle.Render(utils.PENPATH_VERSION),
		textLineStyle.Render("API Version: ")+insertedTextLineStyle.Render(utils.API_VERSION),
	)

	fmt.Println(borderStyle.Render(content))

}
