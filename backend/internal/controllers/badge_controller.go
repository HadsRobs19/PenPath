package controllers

import (
	"context"
	"penpath-backend/internal/databases"
	"time"

	"github.com/gofiber/fiber/v3"
)

type BadgeController struct {
	DB *databases.DBManager
}

func NewBadgeController(db *databases.DBManager) *BadgeController {
	return &BadgeController{DB: db}
}

func (b *BadgeController) GetUserBadges(c fiber.Ctx) error {
	ctx, cancel := context.WithoutTimeout(context.Background(), 3*time.Second)
	defer cancel()
}
