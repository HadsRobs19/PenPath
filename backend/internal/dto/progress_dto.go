package dto

import "time"

type ProgressSubmission struct {
	LessonStepID     string    `json:"lesson_step_id" validate:"required,uuid"`
	AccuracyPercent  float64   `json:"accuracy_percent" validate:"required,gte=0,lte=100"`
	TimeSpentSeconds int       `json:"time_spent_seconds" validate:"gte=0"`
	IsCompleted      bool      `json:"is_completed"`
	Notes            string    `json:"notes"`
	DeviceID         string    `json:"device_id" validate:"omitempty,uuid"`
	CompletedAt      time.Time `json:"completed_at" validate:"required"`
	ClientEventID    string    `json:"client_event_id" validate:"required,uuid"`
}
