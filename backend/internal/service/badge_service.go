package services

import (
	"PenPath/backend/internal/databases"
	"context"
)

type BadgeService struct {
	DB *databases.DBManager
}

func NewBadgeService(db *databases.DBManager) *BadgeService {
	return &BadgeService{DB: db}
}

func (b *BadgeService) CheckBadgeCriteria(ctx context.Context, studentID string, lessonStepID string) error {
	var lessonID, badgeID string
	var lessonCompleted bool

	err := b.DB.DB.QueryRow(
		ctx,
		`SELECT lesson_id FROM lesson_steps WHERE id = $1`,
		lessonStepID,
	).Scan(&lessonID)

	if err != nil {
		return err
	}

	err = b.DB.DB.QueryRow(
		ctx,
		`SELECT
			(SELECT COUNT(*)
			FROM lesson_steps
			WHERE lesson_id = $1) =
		(SELECT COUNT(DISTINCT up.lesson_step_id)
		FROM user_progress up
		JOIN lesson_steps ls ON up.lesson_step_id = ls.id
		WHERE up.student_id = $2
		AND ls.lesson_id = $1
		AND up.is_completed = true)`,
		lessonID,
		studentID,
	).Scan(&lessonCompleted)

	if err != nil {
		return err
	}

	if !lessonCompleted {
		return nil
	}

	err = b.DB.DB.QueryRow(
		ctx,
		`SELECT id 
		FROM badges 
		WHERE unlock_condition = CONCAT('lesson_complete:', $1)
		AND is_active = true`,
		lessonID,
	).Scan(&badgeID)

	if err != nil {
		return err
	}

	_, err = b.DB.DB.Exec(
		ctx,
		`INSERT INTO user_badges (student_id, badge_id)
		VALUES ($1,$2)
		ON CONFLICT (student_id, badge_id) DO NOTHING`,
		studentID,
		badgeID,
	)
	return err
}
