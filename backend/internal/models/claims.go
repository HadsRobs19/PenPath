package models

import (
	"github.com/golang-jwt/jwt/v5"
)

type SupabaseClaims struct {
	Role string `json:"role"`

	jwt.RegisteredClaims
}
