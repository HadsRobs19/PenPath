package databases

import (
	"PenPath/backend"
	"PenPath/backend/internal/config"
	"context"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

// This function checks whether the database is successfully connected to the backend by initializing a reusable connection pool, verifying connectivity at startup, and aims to fail if the postgres database can't be reached

type DBManager struct {
	DB *pgxpool.Pool //TODO: make db private and create a DBManager method to call Ping() to avoid a public database field (unexported)
}

const (
	maxRetries     = 5
	initialBackoff = 2 * time.Second
	maxBackoff     = 30 * time.Second
)

func InitDBPool(databaseConfig *config.DBConfig) (*DBManager, error) {
	connString := databaseConfig.DSN()

	dbConfig, err := pgxpool.ParseConfig(connString)
	if err != nil {
		return nil, err
	}

	// manual configuration of the maximum amount of connections allowed to avoid exhaustion and how long a connection will live in the pool
	dbConfig.MaxConns = 10
	dbConfig.MaxConnLifetime = time.Hour

	var pool *pgxpool.Pool
	backoff := initialBackoff

	for attempt := 1; attempt <= maxRetries; attempt++ {
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)

		pool, err = pgxpool.NewWithConfig(ctx, dbConfig)
		if err == nil {
			// verify connection with a ping
			if pingErr := pool.Ping(ctx); pingErr == nil {
				cancel()
				backend.PrintInfo(fmt.Sprintf("Database connection established on attempt %d", attempt))
				return &DBManager{DB: pool}, nil
			} else {
				err = pingErr
				pool.Close()
			}
		}
		cancel()

		if attempt < maxRetries {
			backend.PrintError(fmt.Sprintf("Database connection attempt %d/%d failed: %v. Retrying in %v...", attempt, maxRetries, err, backoff))
			time.Sleep(backoff)
			backoff = min(backoff*2, maxBackoff)
		}
	}

	return nil, fmt.Errorf("failed to connect to database after %d attempts: %w", maxRetries, err)
}

// closing of connection pool
func (dbm *DBManager) Close() {
	dbm.DB.Close()
}
