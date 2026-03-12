package services

import (
	"context"
	"penpath-backend/internal/databases"
	"time"
)

type LetterMasteryService struct {
	DB *databases.DBManager
}

func NewLetterMasteryService(db *databases.DBManager) *LetterMasteryService {
	return &LetterMasteryService{DB: db}
}

// which letter a lesson step belongs to
func (lm *LetterMasteryService) UpdateLetterMastery(ctx context.Context, studentID string, lessonStepID string) error {
	var letter, mostMissedStepID string
	var totalAttempts, totalTime, perfectAttempts int
	var avgAccuracy float64

	err := lm.DB.DB.QueryRow(
		ctx,
		`SELECT l.letter
		FROM lesson_steps ls
		JOIN lessons l ON ls.lesson_id = l.id
		WHERE ls.id = $1`,
		lessonStepID,
	).Scan(&letter)

	if err != nil {
		return err
	}

	// collect performance statistics from lessonsteps from user progress
	err = lm.DB.DB.QueryRow(
		ctx,
		`SELECT 
			COUNT(*),
			COALESCE(AVG(accuracy_percent),0),
			COALESCE(SUM(time_spent_seconds),0)
			FROM user_progress up
			JOIN lesson_steps ls ON up.lesson_step_id = ls.id
			JOIN lessons l ON ls.lesson_id = l.id
			WHERE up.student_id = $1
			AND l.letter = $2
		`,
		studentID,
		letter,
	).Scan(&totalAttempts, &avgAccuracy, &totalTime)

	if err != nil {
		return err
	}

	// keep track of count of perfect lesson attempts made by user
	err = lm.DB.DB.QueryRow(
		ctx,
		`
		SELECT COUNT(*)
		FROM user_progress up
		JOIN lesson_steps ls ON up.lesson_step_id = ls.id
		JOIN lessons l ON ls.lesson_id = l.id
		WHERE up.student_id = $1
		AND l.letter = $2
		AND up.accuracy_percent = 100
		AND up.is_completed = true`,
		studentID,
		letter,
	).Scan(&perfectAttempts)

	if err != nil {
		return err
	}

	// figure out how many lesson step attempts were missed steps
	err = lm.DB.DB.QueryRow(
		ctx,
		`SELECT up.lesson_step_id
		FROM user_progress up
		JOIN lesson_steps ls ON up.lesson_step_id = ls.id
		JOIN lessons l ON ls.lesson_id = l.id
		WHERE up.student_id = $1
		AND l.letter = $2
		GROUP BY up.lesson_step_id
		ORDER BY AVG(up.accuracy_percent) ASC
		LIMIT 1`,
		studentID,
		letter,
	).Scan(&mostMissedStepID)

	if err != nil {
		mostMissedStepID = ""
	}

	// determine letter mastery
	isMastered := false
	var masteryDate *time.Time

	if perfectAttempts >= 3 {
		isMastered = true
		now := time.Now()
		masteryDate = &now
	}

	// upsert the mastery record into database
	_, err = lm.DB.DB.Exec(
		ctx,
		`INSERT INTO letter_mastery (
		    student_id,
		    letter,
		    perfect_attempts_count,
		    total_attempts,
		    average_accuracy_percent,
		    total_time_spent_seconds,
		    most_missed_step_id,
		    is_mastered,
		    mastery_date,
		    updated_at
		)
		VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,NOW())
		ON CONFLICT (student_id, letter)
		DO UPDATE SET
		    perfect_attempts_count = EXCLUDED.perfect_attempts_count,
		    total_attempts = EXCLUDED.total_attempts,
		    average_accuracy_percent = EXCLUDED.average_accuracy_percent,
		    total_time_spent_seconds = EXCLUDED.total_time_spent_seconds,
		    most_missed_step_id = EXCLUDED.most_missed_step_id,
		    is_mastered = EXCLUDED.is_mastered,
		    mastery_date = EXCLUDED.mastery_date,
		    updated_at = NOW()`,
		studentID,
		letter,
		perfectAttempts,
		totalAttempts,
		avgAccuracy,
		totalTime,
		mostMissedStepID,
		isMastered,
		masteryDate,
	)

	return err
}
