package dto

type ProgressSummary struct {
	LessonsCompleted   int      `json:"lessons_completed"`
	LettersMastered    []string `json:"letters_mastered"`
	LettersNeedingWork []string `json:"letters_needing_work"`
	AverageAccuracy    float64  `json:"average_accuracy"`
}
