package controllers

import (
	"PenPath/backend"
	"PenPath/backend/internal/config"
	"PenPath/backend/internal/databases"
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/gofiber/fiber/v3"
	"github.com/jackc/pgx/v5"
)

type AuthController struct {
	DB             *databases.DBManager
	SupabaseConfig config.SupabaseConfig
}

// constructor
func NewAuthController(db *databases.DBManager, supabaseConfig config.SupabaseConfig) *AuthController {
	return &AuthController{
		DB:             db,
		SupabaseConfig: supabaseConfig,
	}
}

// GetProfile returns the authenticated user's basic profile info. Assumes AuthMiddleware already ran and stored the JWT subject in c.Locals("user_id").
func (a *AuthController) GetProfile(c fiber.Ctx) error {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	// pull user id from Fiber context that was set in JWT middleware
	rawUserID := c.Locals("user_id")
	userID, ok := rawUserID.(string)
	if !ok || userID == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"status":  "error",
			"message": "missing or invalid auth context",
		})
	}

	var firstName, lastName string
	var age int

	err := a.DB.DB.QueryRow(
		ctx,
		`SELECT first_name, last_name, age
		FROM users
		WHERE id = $1`,
		userID,
	).Scan(&firstName, &lastName, &age)

	if err != nil {
		if err == pgx.ErrNoRows {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"status":  "error",
				"message": "user profile not found",
			})
		}

		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status":  "error",
			"message": "failed to retrieve user profile",
		})
	}
	// If DB is reachable, return healthy status.
	return c.Status(fiber.StatusOK).
		JSON(fiber.Map{
			"status":  "ok",
			"message": "User info retrieved",
			"data": fiber.Map{
				"first_name": firstName,
				"last_name":  lastName,
				"age":        age,
			},
		})
}

// DeleteAccount permanently deletes the authenticated user's account
func (a *AuthController) DeleteAccount(c fiber.Ctx) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Get user ID from JWT context
	rawUserID := c.Locals("user_id")
	userID, ok := rawUserID.(string)
	if !ok || userID == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"status":  "error",
			"message": "missing or invalid auth context",
		})
	}

	backend.PrintInfo(fmt.Sprintf("[Auth] Processing account deletion for user: %s", userID))

	// Delete user data from database (foreign key cascades will handle related tables)
	_, err := a.DB.DB.Exec(ctx, `DELETE FROM users WHERE id = $1`, userID)
	if err != nil {
		backend.PrintError(fmt.Sprintf("[Auth] Failed to delete user data: %v", err))
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status":  "error",
			"message": "failed to delete user data",
		})
	}

	// Delete user from Supabase Auth using Admin API
	if err := a.deleteSupabaseUser(userID); err != nil {
		backend.PrintError(fmt.Sprintf("[Auth] Failed to delete Supabase auth user: %v", err))
		// Continue anyway - user data is already deleted from our DB
	}

	backend.PrintInfo(fmt.Sprintf("[Auth] Successfully deleted account for user: %s", userID))

	return c.JSON(fiber.Map{
		"status":  "ok",
		"message": "account deleted successfully",
	})
}

// deleteSupabaseUser calls Supabase Admin API to delete the auth user
func (a *AuthController) deleteSupabaseUser(userID string) error {
	url := fmt.Sprintf("%s/admin/users/%s", a.SupabaseConfig.AuthURL, userID)

	req, err := http.NewRequest("DELETE", url, bytes.NewBuffer(nil))
	if err != nil {
		return fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Authorization", "Bearer "+a.SupabaseConfig.ServiceRoleKey)
	req.Header.Set("apikey", a.SupabaseConfig.ServiceRoleKey)
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return fmt.Errorf("failed to call Supabase API: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		var errBody map[string]interface{}
		json.NewDecoder(resp.Body).Decode(&errBody)
		return fmt.Errorf("supabase API error (status %d): %v", resp.StatusCode, errBody)
	}

	return nil
}
