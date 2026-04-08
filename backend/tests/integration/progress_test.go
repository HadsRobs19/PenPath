package integration_test

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gofiber/fiber/v3"
)

// ProgressResponse represents a progress API response
type ProgressResponse struct {
	Status  string      `json:"status"`
	Message string      `json:"message,omitempty"`
	Data    interface{} `json:"data,omitempty"`
}

// TestGetUserProgressEndpoint tests retrieving user progress
func TestGetUserProgressEndpoint(t *testing.T) {
	app := fiber.New()

	app.Get("/api/progress", func(c fiber.Ctx) error {
		authHeader := c.Get("Authorization")
		if authHeader == "" {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"status":  "error",
				"message": "unauthorized",
			})
		}

		return c.JSON(fiber.Map{
			"status": "ok",
			"data": fiber.Map{
				"total_lessons":     3,
				"completed_lessons": 1,
				"progress_percent":  33,
				"lessons": []fiber.Map{
					{"id": "lesson-1", "name": "Colors", "completed": true},
					{"id": "lesson-2", "name": "Animals", "completed": false},
					{"id": "lesson-3", "name": "Foods", "completed": false},
				},
			},
		})
	})

	t.Run("Authenticated request", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/api/progress", nil)
		req.Header.Set("Authorization", "Bearer test-token")
		resp, err := app.Test(req)
		if err != nil {
			t.Fatalf("Failed to make request: %v", err)
		}
		defer resp.Body.Close()

		if resp.StatusCode != http.StatusOK {
			t.Errorf("Expected status 200, got %d", resp.StatusCode)
		}

		var response struct {
			Status string `json:"status"`
			Data   struct {
				TotalLessons     int `json:"total_lessons"`
				CompletedLessons int `json:"completed_lessons"`
				ProgressPercent  int `json:"progress_percent"`
			} `json:"data"`
		}

		if err := json.NewDecoder(resp.Body).Decode(&response); err != nil {
			t.Fatalf("Failed to decode response: %v", err)
		}

		if response.Status != "ok" {
			t.Errorf("Expected status='ok', got %s", response.Status)
		}

		if response.Data.TotalLessons != 3 {
			t.Errorf("Expected total_lessons=3, got %d", response.Data.TotalLessons)
		}
	})

	t.Run("Unauthenticated request", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/api/progress", nil)
		resp, err := app.Test(req)
		if err != nil {
			t.Fatalf("Failed to make request: %v", err)
		}
		defer resp.Body.Close()

		if resp.StatusCode != http.StatusUnauthorized {
			t.Errorf("Expected status 401, got %d", resp.StatusCode)
		}
	})
}

// TestUpdateProgressEndpoint tests updating user progress
func TestUpdateProgressEndpoint(t *testing.T) {
	app := fiber.New()

	app.Post("/api/progress", func(c fiber.Ctx) error {
		authHeader := c.Get("Authorization")
		if authHeader == "" {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"status":  "error",
				"message": "unauthorized",
			})
		}

		var body struct {
			LessonStepID    string  `json:"lesson_step_id"`
			IsCompleted     bool    `json:"is_completed"`
			AccuracyPercent float64 `json:"accuracy_percent"`
			TimeSpent       int     `json:"time_spent_seconds"`
		}

		if err := c.Bind().JSON(&body); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"status":  "error",
				"message": "invalid request body",
			})
		}

		if body.LessonStepID == "" {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"status":  "error",
				"message": "lesson_step_id is required",
			})
		}

		return c.JSON(fiber.Map{
			"status":  "ok",
			"message": "progress updated",
		})
	})

	t.Run("Valid progress update", func(t *testing.T) {
		body := map[string]interface{}{
			"lesson_step_id":     "step-1",
			"is_completed":       true,
			"accuracy_percent":   95.5,
			"time_spent_seconds": 120,
		}
		jsonBody, _ := json.Marshal(body)

		req := httptest.NewRequest(http.MethodPost, "/api/progress", bytes.NewReader(jsonBody))
		req.Header.Set("Authorization", "Bearer test-token")
		req.Header.Set("Content-Type", "application/json")
		resp, err := app.Test(req)
		if err != nil {
			t.Fatalf("Failed to make request: %v", err)
		}
		defer resp.Body.Close()

		if resp.StatusCode != http.StatusOK {
			t.Errorf("Expected status 200, got %d", resp.StatusCode)
		}
	})

	t.Run("Missing lesson_step_id", func(t *testing.T) {
		body := map[string]interface{}{
			"is_completed": true,
		}
		jsonBody, _ := json.Marshal(body)

		req := httptest.NewRequest(http.MethodPost, "/api/progress", bytes.NewReader(jsonBody))
		req.Header.Set("Authorization", "Bearer test-token")
		req.Header.Set("Content-Type", "application/json")
		resp, err := app.Test(req)
		if err != nil {
			t.Fatalf("Failed to make request: %v", err)
		}
		defer resp.Body.Close()

		if resp.StatusCode != http.StatusBadRequest {
			t.Errorf("Expected status 400, got %d", resp.StatusCode)
		}
	})
}

// TestProgressPercentCalculation tests progress percentage calculation logic
func TestProgressPercentCalculation(t *testing.T) {
	testCases := []struct {
		name            string
		completedSteps  int
		totalSteps      int
		expectedPercent int
	}{
		{"No progress", 0, 10, 0},
		{"Half progress", 5, 10, 50},
		{"Full progress", 10, 10, 100},
		{"One third", 1, 3, 33},
		{"Two thirds", 2, 3, 66},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			percent := calculateProgressPercent(tc.completedSteps, tc.totalSteps)
			if percent != tc.expectedPercent {
				t.Errorf("Expected %d%%, got %d%%", tc.expectedPercent, percent)
			}
		})
	}
}

// Helper function to calculate progress percentage
func calculateProgressPercent(completed, total int) int {
	if total == 0 {
		return 0
	}
	return (completed * 100) / total
}

// TestAccuracyValidation tests accuracy percentage validation
func TestAccuracyValidation(t *testing.T) {
	testCases := []struct {
		name     string
		accuracy float64
		isValid  bool
	}{
		{"Zero accuracy", 0, true},
		{"Full accuracy", 100, true},
		{"Partial accuracy", 75.5, true},
		{"Negative accuracy", -10, false},
		{"Over 100 accuracy", 150, false},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			valid := isValidAccuracy(tc.accuracy)
			if valid != tc.isValid {
				t.Errorf("Expected valid=%v for accuracy %.1f, got %v", tc.isValid, tc.accuracy, valid)
			}
		})
	}
}

// Helper function to validate accuracy
func isValidAccuracy(accuracy float64) bool {
	return accuracy >= 0 && accuracy <= 100
}

// TestTimeSpentValidation tests time spent validation
func TestTimeSpentValidation(t *testing.T) {
	testCases := []struct {
		name      string
		timeSpent int
		isValid   bool
	}{
		{"Zero time", 0, true},
		{"Positive time", 120, true},
		{"Negative time", -5, false},
		{"Large time", 3600, true},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			valid := tc.timeSpent >= 0
			if valid != tc.isValid {
				t.Errorf("Expected valid=%v for time_spent=%d, got %v", tc.isValid, tc.timeSpent, valid)
			}
		})
	}
}
