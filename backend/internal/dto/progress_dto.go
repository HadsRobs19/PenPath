package dto

type ProgressSubmission struct {
	LessonStepID     string  `json:"lesson_step_id"`
	AccuracyPercent  float64 `json:"accuracy_percent"`
	TimeSpentSeconds int     `json:"time_spent_seconds"`
	IsCompleted      bool    `json:"is_completed"`
	Notes            string  `json:"notes"`
	DeviceID         string  `json:"device_id"`
}
