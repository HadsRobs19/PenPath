package dto

type ProgressSubmission struct {
	LessonStepID     string  `json:"lesson_step_id" validate:"required,uuid"`
	AccuracyPercent  float64 `json:"accuracy_percent" validate:"required,uuid"`
	TimeSpentSeconds int     `json:"time_spent_seconds" validate:"gte=0"`
	IsCompleted      bool    `json:"is_completed"`
	Notes            string  `json:"notes"`
	DeviceID         string  `json:"device_id" validate:"omitempty,uuid"`
}
