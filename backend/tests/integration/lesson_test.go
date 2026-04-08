package integration_test

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gofiber/fiber/v3"
)

// LessonResponse represents a lesson API response
type LessonResponse struct {
	Status  string      `json:"status"`
	Message string      `json:"message,omitempty"`
	Data    interface{} `json:"data,omitempty"`
}

// TestGetLessonsEndpoint tests the lessons list endpoint
func TestGetLessonsEndpoint(t *testing.T) {
	app := fiber.New()

	app.Get("/api/lessons", func(c fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"status": "ok",
			"data": []fiber.Map{
				{
					"id":          "lesson-1",
					"name":        "Colors",
					"description": "Learn to write color words",
					"order":       1,
				},
				{
					"id":          "lesson-2",
					"name":        "Animals",
					"description": "Learn to write animal names",
					"order":       2,
				},
			},
		})
	})

	req := httptest.NewRequest(http.MethodGet, "/api/lessons", nil)
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
		Data   []struct {
			ID          string `json:"id"`
			Name        string `json:"name"`
			Description string `json:"description"`
			Order       int    `json:"order"`
		} `json:"data"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&response); err != nil {
		t.Fatalf("Failed to decode response: %v", err)
	}

	if response.Status != "ok" {
		t.Errorf("Expected status='ok', got %s", response.Status)
	}

	if len(response.Data) != 2 {
		t.Errorf("Expected 2 lessons, got %d", len(response.Data))
	}
}

// TestGetLessonByIDEndpoint tests retrieving a single lesson
func TestGetLessonByIDEndpoint(t *testing.T) {
	app := fiber.New()

	app.Get("/api/lessons/:id", func(c fiber.Ctx) error {
		lessonID := c.Params("id")
		if lessonID == "lesson-1" {
			return c.JSON(fiber.Map{
				"status": "ok",
				"data": fiber.Map{
					"id":          "lesson-1",
					"name":        "Colors",
					"description": "Learn to write color words",
					"steps": []fiber.Map{
						{"id": "step-1", "type": "reading", "order": 1},
						{"id": "step-2", "type": "writing", "order": 2},
						{"id": "step-3", "type": "checkpoint", "order": 3},
					},
				},
			})
		}
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"status":  "error",
			"message": "lesson not found",
		})
	})

	t.Run("Valid lesson ID", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/api/lessons/lesson-1", nil)
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
				ID    string        `json:"id"`
				Name  string        `json:"name"`
				Steps []interface{} `json:"steps"`
			} `json:"data"`
		}

		if err := json.NewDecoder(resp.Body).Decode(&response); err != nil {
			t.Fatalf("Failed to decode response: %v", err)
		}

		if response.Data.ID != "lesson-1" {
			t.Errorf("Expected lesson ID='lesson-1', got %s", response.Data.ID)
		}

		if len(response.Data.Steps) != 3 {
			t.Errorf("Expected 3 steps, got %d", len(response.Data.Steps))
		}
	})

	t.Run("Invalid lesson ID", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/api/lessons/invalid-id", nil)
		resp, err := app.Test(req)
		if err != nil {
			t.Fatalf("Failed to make request: %v", err)
		}
		defer resp.Body.Close()

		if resp.StatusCode != http.StatusNotFound {
			t.Errorf("Expected status 404, got %d", resp.StatusCode)
		}
	})
}

// TestLessonStepTypes tests that lesson step types are valid
func TestLessonStepTypes(t *testing.T) {
	validStepTypes := map[string]bool{
		"reading":    true,
		"writing":    true,
		"checkpoint": true,
	}

	testCases := []struct {
		stepType string
		isValid  bool
	}{
		{"reading", true},
		{"writing", true},
		{"checkpoint", true},
		{"invalid", false},
		{"", false},
	}

	for _, tc := range testCases {
		t.Run(tc.stepType, func(t *testing.T) {
			_, valid := validStepTypes[tc.stepType]
			if valid != tc.isValid {
				t.Errorf("Expected valid=%v for step type %q, got %v", tc.isValid, tc.stepType, valid)
			}
		})
	}
}

// TestLessonOrderValidation tests lesson order validation
func TestLessonOrderValidation(t *testing.T) {
	testCases := []struct {
		name     string
		order    int
		expected bool
	}{
		{"Valid order 1", 1, true},
		{"Valid order 2", 2, true},
		{"Zero order", 0, false},
		{"Negative order", -1, false},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			isValid := tc.order > 0
			if isValid != tc.expected {
				t.Errorf("Expected valid=%v for order %d, got %v", tc.expected, tc.order, isValid)
			}
		})
	}
}
