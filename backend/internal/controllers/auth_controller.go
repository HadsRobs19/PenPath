package controllers

import "penpath-backend/internal/databases"

type AuthController struct {
	DB *databases.DBManager
}

// constructor
func NewAuthController(db *databases.DBManager) *AuthController {
	return &AuthController{DB: db}
}
