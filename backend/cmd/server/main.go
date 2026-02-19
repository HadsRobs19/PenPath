package main

import (
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"os"

	"github.com/gofiber/fiber/v3"

	"github.com/charmbracelet/lipgloss"

	"PenPath/backend"

	"PenPath/backend/internal/config"
	"PenPath/backend/internal/middleware"
	"PenPath/backend/internal/routes"
	"PenPath/backend/internal/utils"
)

var (
	AppConfig     config.AppConfig
	JWTMiddleware fiber.Handler
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

	routes.RegisterHealthRoute(app)

	backend.PrintInfo("Now Listening on " + AppConfig.ServiceConfig.IPv4Host + ":" + AppConfig.ServiceConfig.IPv4Port)
	err := app.Listen(AppConfig.ServiceConfig.IPv4Host + ":" + AppConfig.ServiceConfig.IPv4Port)
	if err != nil {
		backend.PrintSevereErr("Encountered an error when trying to enable the IPv4 socket. Error: " + err.Error())
		return
	}
}

func loadAppConfig(appConfig *config.AppConfig) {
	templateMainConfig := config.AppConfig{
		ServiceConfig: config.ServiceConfig{
			IPv4Host:    "0.0.0.0",
			IPv4Port:    "3000",
			IPv4Enabled: true,
			IPv6Host:    "[::]",
			IPv6Port:    "3000",
			IPv6Enabled: true,
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
