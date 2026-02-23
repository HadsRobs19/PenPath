package databases

import (
	"PenPath/backend/internal/config"
	"context"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

// This function checks whether the database is successfully connected to the backend by initializing a reusable connection pool, verifying connectivity at startup, and aims to fail if the postgres database can't be reached

type DBManager struct {
	DB *pgxpool.Pool
}

func InitDBPool(databaseConfig *config.DBConfig) (*DBManager, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	connString := databaseConfig.DSN()
	// how should connections be created and managed?
	dbConfig, err := pgxpool.ParseConfig(connString)
	if err != nil {
		return nil, err
	}

	// manual configuration of the maximum amount of connections allowed to avoid exhaustion and how long a connection will live in the pool
	dbConfig.MaxConns = 10
	dbConfig.MaxConnLifetime = time.Hour

	pool, err := pgxpool.NewWithConfig(ctx, dbConfig)
	if err != nil {
		return nil, err
	}

	// make sure the database can be reached
	if err := pool.Ping(ctx); err != nil {
		return nil, err
	}

	return &DBManager{DB: pool}, nil
}

// closing of connection pool
func (dbm *DBManager) Close() {
	dbm.DB.Close()
}
