package integration_test

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gofiber/fiber/v3"
)

// APIResponse represents the standard API response format
type APIResponse struct {
	Status  string                 `json:"status"`
	Message string                 `json:"message,omitempty"`
	Data    map[string]interface{} `json:"data,omitempty"`
	Code    int                    `json:"code,omitempty"`
}

// TestAuthEndpointWithoutToken tests that auth endpoints reject requests without tokens
func TestAuthEndpointWithoutToken(t *testing.T) {
	app := fiber.New()

	// Mock the /api/me endpoint behavior
	app.Get("/api/me", func(c fiber.Ctx) error {
		authHeader := c.Get("Authorization")
		if authHeader == "" {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"status":  "error",
				"message": "missing authorization header",
			})
		}
		return c.JSON(fiber.Map{
			"status": "ok",
			"data": fiber.Map{
				"first_name": "Test",
				"last_name":  "User",
				"age":        8,
			},
		})
	})

	t.Run("Request without Authorization header", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/api/me", nil)
		resp, err := app.Test(req)
		if err != nil {
			t.Fatalf("Failed to make request: %v", err)
		}
		defer resp.Body.Close()

		if resp.StatusCode != http.StatusUnauthorized {
			t.Errorf("Expected status 401, got %d", resp.StatusCode)
		}

		var response APIResponse
		if err := json.NewDecoder(resp.Body).Decode(&response); err != nil {
			t.Fatalf("Failed to decode response: %v", err)
		}

		if response.Status != "error" {
			t.Errorf("Expected status='error', got %s", response.Status)
		}
	})

	t.Run("Request with Authorization header", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/api/me", nil)
		req.Header.Set("Authorization", "Bearer test-token")
		resp, err := app.Test(req)
		if err != nil {
			t.Fatalf("Failed to make request: %v", err)
		}
		defer resp.Body.Close()

		if resp.StatusCode != http.StatusOK {
			t.Errorf("Expected status 200, got %d", resp.StatusCode)
		}

		var response APIResponse
		if err := json.NewDecoder(resp.Body).Decode(&response); err != nil {
			t.Fatalf("Failed to decode response: %v", err)
		}

		if response.Status != "ok" {
			t.Errorf("Expected status='ok', got %s", response.Status)
		}
	})
}

// TestProfileResponseFormat tests the profile endpoint response format
func TestProfileResponseFormat(t *testing.T) {
	app := fiber.New()

	app.Get("/api/me", func(c fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"status":  "ok",
			"message": "User info retrieved",
			"data": fiber.Map{
				"first_name": "John",
				"last_name":  "Doe",
				"age":        7,
			},
		})
	})

	req := httptest.NewRequest(http.MethodGet, "/api/me", nil)
	resp, err := app.Test(req)
	if err != nil {
		t.Fatalf("Failed to make request: %v", err)
	}
	defer resp.Body.Close()

	var response struct {
		Status  string `json:"status"`
		Message string `json:"message"`
		Data    struct {
			FirstName string `json:"first_name"`
			LastName  string `json:"last_name"`
			Age       int    `json:"age"`
		} `json:"data"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&response); err != nil {
		t.Fatalf("Failed to decode response: %v", err)
	}

	// Verify response structure
	if response.Status != "ok" {
		t.Errorf("Expected status='ok', got %s", response.Status)
	}

	if response.Data.FirstName != "John" {
		t.Errorf("Expected first_name='John', got %s", response.Data.FirstName)
	}

	if response.Data.LastName != "Doe" {
		t.Errorf("Expected last_name='Doe', got %s", response.Data.LastName)
	}

	if response.Data.Age != 7 {
		t.Errorf("Expected age=7, got %d", response.Data.Age)
	}
}

// TestInvalidTokenFormat tests handling of invalid token formats
func TestInvalidTokenFormat(t *testing.T) {
	testCases := []struct {
		name          string
		authorization string
		expectError   bool
	}{
		{
			name:          "Empty token",
			authorization: "Bearer ",
			expectError:   true,
		},
		{
			name:          "No Bearer prefix",
			authorization: "some-token",
			expectError:   true,
		},
		{
			name:          "Undefined token",
			authorization: "Bearer undefined",
			expectError:   true,
		},
		{
			name:          "Null token",
			authorization: "Bearer null",
			expectError:   true,
		},
		{
			name:          "Valid format",
			authorization: "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.test",
			expectError:   false,
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			hasError := isInvalidToken(tc.authorization)
			if hasError != tc.expectError {
				t.Errorf("Expected error=%v for %q, got %v", tc.expectError, tc.authorization, hasError)
			}
		})
	}
}

// Helper function to check if token is invalid
func isInvalidToken(auth string) bool {
	if auth == "" {
		return true
	}
	const bearerPrefix = "Bearer "
	if len(auth) <= len(bearerPrefix) {
		return true
	}
	if auth[:len(bearerPrefix)] != bearerPrefix {
		return true
	}
	token := auth[len(bearerPrefix):]
	if token == "" || token == "undefined" || token == "null" {
		return true
	}
	return false
}

// TestErrorResponseFormat tests error response format consistency
func TestErrorResponseFormat(t *testing.T) {
	app := fiber.New()

	app.Get("/api/error", func(c fiber.Ctx) error {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"status":  "error",
			"message": "user profile not found",
			"code":    404,
		})
	})

	req := httptest.NewRequest(http.MethodGet, "/api/error", nil)
	resp, err := app.Test(req)
	if err != nil {
		t.Fatalf("Failed to make request: %v", err)
	}
	defer resp.Body.Close()

	var response APIResponse
	if err := json.NewDecoder(resp.Body).Decode(&response); err != nil {
		t.Fatalf("Failed to decode response: %v", err)
	}

	if response.Status != "error" {
		t.Errorf("Expected status='error', got %s", response.Status)
	}

	if response.Message == "" {
		t.Error("Expected non-empty message for error response")
	}

	if response.Code != 404 {
		t.Errorf("Expected code=404, got %d", response.Code)
	}
}
