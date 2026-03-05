# Database Migrations Guide

## Overview

This guide explains how PenPath uses **golang-migrate** for version-controlled database schema changes.

**Why migrations?**
- ✅ Track all schema changes in Git
- ✅ Team members stay in sync
- ✅ Easy rollback if something breaks
- ✅ Production deployments are safe and reversible

---

## Installation

### Prerequisites
- Go 1.26+
- PostgreSQL (via Supabase)

### Install golang-migrate

```bash
# Using make
make install-migrate

# Or manually
go install -tags 'postgres' github.com/golang-migrate/migrate/v4/cmd/migrate@latest

# Verify installation
migrate -version
```

---

## Migration Files Structure

```
backend/
├── migrations/
│   ├── 000001_initial_schema.up.sql      ← Create 12 tables
│   ├── 000001_initial_schema.down.sql    ← Drop 12 tables
│   ├── 000002_add_features.up.sql        ← Future migrations
│   ├── 000002_add_features.down.sql      ← Future rollbacks
│   └── ...
├── Makefile                   ← Easy commands
└── go.mod                     ← Dependency tracking
```

---

## File Naming Convention

```
[SEQUENCE]_[DESCRIPTION].up.sql
[SEQUENCE]_[DESCRIPTION].down.sql
```

**Example:**
```
000001_initial_schema.up.sql      ← First migration, UP (apply)
000001_initial_schema.down.sql    ← First migration, DOWN (rollback)
000002_add_email_column.up.sql    ← Second migration, UP
000002_add_email_column.down.sql  ← Second migration, DOWN
```

**Rules:**
- ✅ Sequence: 000001, 000002, 000003...
- ✅ Description: snake_case, descriptive
- ✅ Each migration MUST have UP and DOWN

---

## How Migrations Work

### UP Migration (Apply)

```
migrate up
    ↓
Reads 000001_initial_schema.up.sql
    ↓
Executes SQL (CREATE TABLE...)
    ↓
Records version 1 in schema_migrations table
    ↓
Database is updated! ✅
```

### DOWN Migration (Rollback)

```
migrate down
    ↓
Reads 000001_initial_schema.down.sql
    ↓
Executes SQL (DROP TABLE...)
    ↓
Removes version 1 from schema_migrations
    ↓
Database reverts to previous state ✅
```

---

## Using Migrations

### Set DATABASE_URL

First, set your database connection string:

**Local (Supabase):**
```bash
export DATABASE_URL="postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres"
```

**Windows PowerShell:**
```powershell
$env:DATABASE_URL = "postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres"
```

### Common Commands

#### Apply All Pending Migrations

```bash
# Using make
make migrate-up

# Or directly
migrate -path ./migrations -database $DATABASE_URL up
```

**What happens:**
1. Checks which migrations have been applied (in `schema_migrations` table)
2. Runs all pending migrations (UP files)
3. Records them in database

#### Rollback Last Migration

```bash
# Using make
make migrate-down

# Or directly
migrate -path ./migrations -database $DATABASE_URL down 1
```

**What happens:**
1. Finds the last applied migration
2. Runs its DOWN file
3. Removes record from `schema_migrations`

#### Rollback Multiple Migrations

```bash
# Rollback 2 migrations
migrate -path ./migrations -database $DATABASE_URL down 2

# Rollback to specific version
migrate -path ./migrations -database $DATABASE_URL goto 1
```

#### Check Current Version

```bash
# Using make
make migrate-version

# Or directly
migrate -path ./migrations -database $DATABASE_URL version
```

Shows which version your database is at.

#### Create New Migration

```bash
# Using make
make new-migration

# Or directly
migrate create -ext sql -dir ./migrations -seq add_user_settings

# Output:
# migrations/000002_add_user_settings.up.sql
# migrations/000002_add_user_settings.down.sql
```

---

## Current Migrations

### Migration 000001: Initial Schema

**File:** `000001_initial_schema.up.sql`

**What it does:**
- Creates 12 tables: users, lessons, lesson_steps, user_progress, etc.
- Creates 18 indexes for performance
- Defines all foreign keys and constraints
- Sets up full PenPath data structure

**When applied:** First time you run `migrate up`

**Tables created:**
1. users - Student accounts
2. teachers_parents - Teacher/parent accounts
3. user_teacher_relations - Links students to supervisors
4. lesson_categories - Content categories (Animals, Shapes, etc.)
5. lessons - Individual letter lessons
6. lesson_steps - Activities (tracing, reading, listening, checkpoint)
7. user_progress - Progress on each step
8. letter_mastery - Letter mastery tracking
9. badges - Achievement definitions
10. user_badges - Badges earned
11. devices - Device information
12. user_devices - User-device relationships

---

## Development Workflow

### 1. Make a Schema Change

**Scenario:** You want to add an `email_verified` column to users

### 2. Create Migration

```bash
make new-migration
# Enter: "add_email_verified_to_users"

# Creates:
# migrations/000002_add_email_verified_to_users.up.sql
# migrations/000002_add_email_verified_to_users.down.sql
```

### 3. Write UP Migration

**File:** `000002_add_email_verified_to_users.up.sql`

```sql
ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT FALSE;
CREATE INDEX idx_users_email_verified ON users(email_verified);
```

### 4. Write DOWN Migration

**File:** `000002_add_email_verified_to_users.down.sql`

```sql
DROP INDEX IF EXISTS idx_users_email_verified;
ALTER TABLE users DROP COLUMN email_verified;
```

### 5. Test Locally

```bash
# Apply migration
make migrate-up

# Test your code...

# Rollback to test DOWN
make migrate-down

# Apply again to verify UP works
make migrate-up
```

### 6. Commit to Git

```bash
git add backend/migrations/000002_*.sql
git commit -m "Migration: Add email_verified column to users"
git push
```

### 7. Deploy to Staging/Production

```bash
# Pull latest code
git pull

# Apply migrations
make migrate-up

# Done! Schema is updated
```

---

## Schema Migrations Table

golang-migrate creates a table called `schema_migrations` to track applied migrations:

```
schema_version | dirty
---------------|-------
1              | false
2              | false
```

**Fields:**
- `schema_version` - Migration number
- `dirty` - TRUE if migration failed mid-way (needs manual fix)

---

## Common Scenarios

### Scenario 1: Deploy New Migration to Production

```bash
# 1. Create migration locally
make new-migration

# 2. Write UP and DOWN
# (edit migration files)

# 3. Test locally
make migrate-up
# ... test code ...
make migrate-down
make migrate-up

# 4. Commit
git add backend/migrations/
git commit -m "Migration: [description]"
git push origin back-end

# 5. On production server
git pull
make migrate-up
# ✅ New schema applied!
```

### Scenario 2: Oops! Migration Failed

```bash
# Check status
make migrate-version

# If dirty flag is TRUE, manually fix or:
# Option 1: Rollback manually
psql -d $DATABASE_URL -c "DELETE FROM schema_migrations WHERE version = 2;"

# Option 2: Force fix (dangerous!)
make migrate-force
# Enter: 1
```

### Scenario 3: Rollback in Production

```bash
# Rollback last migration
make migrate-down

# Or go to specific version
migrate -path ./migrations -database $DATABASE_URL goto 1
```

---

## Best Practices

### ✅ DO

- ✅ **Write both UP and DOWN** - Always test rollbacks
- ✅ **Test migrations locally** - Before pushing to Git
- ✅ **Use descriptive names** - `add_email_to_users` not `fix_bug`
- ✅ **Commit migrations with code** - If code needs schema, commit both
- ✅ **Small, focused migrations** - One change per migration
- ✅ **Document complex migrations** - Comments in SQL
- ✅ **Backup before production** - Always backup before running UP

### ❌ DON'T

- ❌ **Modify existing migrations** - Rewrite history if needed
- ❌ **Skip testing DOWN** - Always test rollback
- ❌ **Run migrations manually** - Use make commands
- ❌ **Store secrets in migrations** - Never commit passwords
- ❌ **Make breaking changes** - Rename columns carefully
- ❌ **Mix major changes** - Keep migrations small

---

## Troubleshooting

### Error: "connection refused"

```
Solution: Check DATABASE_URL is correct
$env:DATABASE_URL = "postgresql://user:pass@host:5432/db"
```

### Error: "relation does not exist"

```
Solution: Migrations haven't been applied yet
Run: make migrate-up
```

### Error: "dirty database"

```
Solution: Migration failed halfway
Option 1: Fix manually then reset
Option 2: make migrate-force
Option 3: Rollback to previous version
```

### Error: "no migrations found"

```
Solution: Make sure you're in backend/ directory
cd backend
make migrate-up
```

---

## Next Steps

1. ✅ **Install golang-migrate** - `make install-migrate`
2. ✅ **Set DATABASE_URL** - With your Supabase credentials
3. ✅ **Apply migrations** - `make migrate-up`
4. ✅ **Verify success** - `make migrate-version`
5. ✅ **Test rollback** - `make migrate-down` then `make migrate-up`

---

## Resources

- [golang-migrate Documentation](https://github.com/golang-migrate/migrate)
- [Database Migration Patterns](https://www.liquibase.org/get-started/best-practices)
- PenPath SCHEMA_DOCUMENTATION.md - Database design

---

## Questions?

Contact team lead or check golang-migrate docs!
