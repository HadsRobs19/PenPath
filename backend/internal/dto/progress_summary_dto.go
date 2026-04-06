package dto

type ProgressSummary struct {
	LessonsCompleted   int      `json:"lessons_completed"`
	TotalLessons       int      `json:"total_lessons"`
	LettersMastered    []string `json:"letters_mastered"`
	LettersNeedingWork []string `json:"letters_needing_work"`
	AverageAccuracy    float64  `json:"average_accuracy"`
}
