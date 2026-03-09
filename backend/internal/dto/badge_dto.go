package dto

import "time"

type BadgeResponse struct {
	ID          string    `json:"id"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	IconURL     string    `json:"icon_url"`
	BadgeType   string    `json:"badge_type"`
	Points      int       `json:"points"`
	EarnedAt    time.Time `json:"earned_at"`
}
