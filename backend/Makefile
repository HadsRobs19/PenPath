# ============================================
# PenPath Backend Makefile
# Database Migration Commands
# ============================================

.PHONY: help migrate-up migrate-down migrate-version migrate-force

# Default target
help:
	@echo "PenPath Backend - Migration Commands"
	@echo "====================================="
	@echo ""
	@echo "Available commands:"
	@echo "  make migrate-up       - Run all pending migrations"
	@echo "  make migrate-down     - Rollback last migration"
	@echo "  make migrate-version  - Show current migration version"
	@echo "  make migrate-force    - Force set migration version (dangerous!)"
	@echo ""
	@echo "Example usage:"
	@echo "  make migrate-up"
	@echo ""

# Migrate up - Apply all pending migrations
migrate-up:
	@echo "Running migrations UP..."
	migrate -path ./migrations -database $(DATABASE_URL) up
	@echo "✅ Migrations applied successfully"

# Migrate down - Rollback last migration
migrate-down:
	@echo "Rolling back last migration..."
	migrate -path ./migrations -database $(DATABASE_URL) down 1
	@echo "✅ Migration rolled back"

# Show current version
migrate-version:
	@echo "Current migration version:"
	migrate -path ./migrations -database $(DATABASE_URL) version

# Force set version (use carefully!)
migrate-force:
	@echo "⚠️  Forcing migration version (dangerous!)..."
	@read -p "Enter version number: " version; \
	migrate -path ./migrations -database $(DATABASE_URL) force $$version

# Install migrate tool
install-migrate:
	@echo "Installing golang-migrate..."
	go install -tags 'postgres' github.com/golang-migrate/migrate/v4/cmd/migrate@latest
	@echo "✅ golang-migrate installed"

# Create new migration
new-migration:
	@read -p "Enter migration name: " name; \
	migrate create -ext sql -dir ./migrations -seq $$name
	@echo "✅ Migration created: migrations/$$(printf '%06d' $$(ls migrations | wc -l))_$$name.up.sql"
