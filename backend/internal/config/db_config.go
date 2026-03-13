package config

import (
	"fmt"
	"strings"
)

type DBConfig struct {
	Host       string `json:"host"`
	Port       int    `json:"port"`
	User       string `json:"user"`
	Password   string `json:"password"`
	DBName     string `json:"db_name"`
	SSLMode    string `json:"ssl_mode"`
	ConnString string `json:"conn_string"` // Full connection string (takes priority if set)
}

func (c *DBConfig) DSN() string {
	// If a full connection string is provided, use it directly
	if c.ConnString != "" {
		return c.ConnString
	}

	// Check if Password is actually a full connection URL
	if strings.HasPrefix(c.Password, "postgresql://") || strings.HasPrefix(c.Password, "postgres://") {
		return c.Password
	}

	// Otherwise construct DSN from individual fields
	return fmt.Sprintf(
		"host=%s port=%d user=%s password=%s dbname=%s sslmode=%s",
		c.Host, c.Port, c.User, c.Password, c.DBName, c.SSLMode,
	)
}
