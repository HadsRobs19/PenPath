package dto

type LessonStep struct {
	StepType      string `json:"step_type"`
	SequenceOrder int    `json:"sequence_order"`
	Title         string `json:"title"`
	Instruction   string `json:"instruction_text"`
	AudioURL      string `json:"audio_url"`
	ImageURL      string `json:"image_url"`
}

type Lesson struct {
	ID              string       `json:"lesson_id"`
	Letter          string       `json:"letter"`
	Title           string       `json:"title"`
	Description     string       `json:"description"`
	DifficultyLevel int          `json:"difficulty_level"`
	EstimatedTime   int          `json:"estimated_duration_minutes"`
	CoverImageURL   string       `json:"cover_image_url"`
	Steps           []LessonStep `json:"steps"`
}
