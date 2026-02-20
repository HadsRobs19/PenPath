package backend

import (
	"fmt"

	"github.com/charmbracelet/lipgloss"
)

// kind of extra but makes the terminal look pretty and keeps errors, warnings, and info clear when debugging

var BRACKET_GRAY = lipgloss.NewStyle().Foreground(lipgloss.Color("#9F9F9F"))
var ERROR_RED = lipgloss.NewStyle().Foreground(lipgloss.Color("#FD0E35"))
var OPEN_BRACKET = BRACKET_GRAY.Render("[")
var CLOSE_BRACKET = BRACKET_GRAY.Render("]")
var ERROR_TAG = OPEN_BRACKET + ERROR_RED.Render("Error") + CLOSE_BRACKET
var TEXT_WHITE = lipgloss.NewStyle().Foreground(lipgloss.Color("#F3F3F3"))
var INFORMATION_BLUE = lipgloss.NewStyle().Foreground(lipgloss.Color("#038eeaff"))
var INFO_TAG = OPEN_BRACKET + INFORMATION_BLUE.Render("Information") + CLOSE_BRACKET
var SEVERE_DARK_RED = lipgloss.NewStyle().Foreground(lipgloss.Color("#FC2F00"))
var SEVERE_TAG = OPEN_BRACKET + SEVERE_DARK_RED.Render("Severe") + CLOSE_BRACKET

func PrintError(msg string) error {
	fmt.Println(ERROR_TAG + " " + TEXT_WHITE.Render(msg))
	return fmt.Errorf(msg)
}

func PrintInfo(msg string) {
	fmt.Println(INFO_TAG + " " + TEXT_WHITE.Render(msg))
}

func PrintSevereErr(msg string) error {
	fmt.Println(SEVERE_TAG + " " + TEXT_WHITE.Render(msg))
	return fmt.Errorf(msg)
}
