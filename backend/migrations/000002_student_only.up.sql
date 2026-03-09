-- ============================================
-- Migration 000002: Student-Only System
-- ============================================
-- Run this in the Supabase SQL editor.
-- It modifies the live database to:
--   1. Remove parent/teacher tables and relations
--   2. Add username column to users
--   3. Clean up auth tables of parent references
--   4. Update RLS policies to student-only
-- ============================================

-- ============================================
-- STEP 1: Drop parent/teacher tables
-- (CASCADE removes foreign keys that depend on them)
-- ============================================

DROP TABLE IF EXISTS user_teacher_relations CASCADE;
DROP TABLE IF EXISTS teachers_parents CASCADE;

-- ============================================
-- STEP 2: Add username to users table
-- ============================================

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS username VARCHAR(20) UNIQUE;

-- Constraint: alphanumeric only
ALTER TABLE users
  ADD CONSTRAINT username_alphanumeric
  CHECK (username ~ '^[a-zA-Z0-9]{3,20}$');

-- Index for fast login lookups
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- Note: if you have existing rows, set a username for each one before
-- adding NOT NULL. Once all rows have a value, run:
--   ALTER TABLE users ALTER COLUMN username SET NOT NULL;

-- ============================================
-- STEP 3: Remove email requirement from users
-- Students log in with username + PIN, not email
-- ============================================

ALTER TABLE users
  ALTER COLUMN email DROP NOT NULL;

-- ============================================
-- STEP 4: Clean up student_pins table
-- Remove parent foreign key columns
-- ============================================

ALTER TABLE student_pins
  DROP COLUMN IF EXISTS created_by_parent_id,
  DROP COLUMN IF EXISTS updated_by_parent_id,
  DROP COLUMN IF EXISTS change_reason;

-- Add last_changed if it does not already exist
ALTER TABLE student_pins
  ADD COLUMN IF NOT EXISTS last_changed TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- ============================================
-- STEP 5: Clean up device_sessions table
-- Remove parent foreign key columns
-- ============================================

ALTER TABLE device_sessions
  DROP COLUMN IF EXISTS created_by_parent_id,
  DROP COLUMN IF EXISTS revoked_by_parent_id;

-- device_id was UUID referencing user_devices; change to VARCHAR
-- so a plain device identifier string can be used without a FK
ALTER TABLE device_sessions
  DROP CONSTRAINT IF EXISTS device_sessions_device_id_fkey;

-- ============================================
-- STEP 6: Clean up auth_logs table
-- Remove parent_id column and add username_tried
-- ============================================

ALTER TABLE auth_logs
  DROP COLUMN IF EXISTS parent_id;

ALTER TABLE auth_logs
  ADD COLUMN IF NOT EXISTS username_tried VARCHAR(20);

-- ============================================
-- STEP 7: Drop old RLS policies that reference parents
-- ============================================

DROP POLICY IF EXISTS "Parents can manage their students' PINs"     ON student_pins;
DROP POLICY IF EXISTS "Parents can update their students' PINs"     ON student_pins;
DROP POLICY IF EXISTS "Parents can see their students' device sessions" ON device_sessions;
DROP POLICY IF EXISTS "Parents can revoke device sessions"          ON device_sessions;
DROP POLICY IF EXISTS "Parents can see their students' auth logs"   ON auth_logs;
DROP POLICY IF EXISTS "Prevent user PIN insertion"                  ON student_pins;
DROP POLICY IF EXISTS "Prevent user device session insertion"       ON device_sessions;
DROP POLICY IF EXISTS "Prevent user auth log insertion"             ON auth_logs;

-- ============================================
-- STEP 8: Create student-only RLS policies
-- ============================================

-- student_pins
DROP POLICY IF EXISTS "Students view own PIN record" ON student_pins;
CREATE POLICY "Students view own PIN record"
ON student_pins FOR SELECT
USING (auth.uid() = student_id);

-- device_sessions
DROP POLICY IF EXISTS "Students view own device sessions" ON device_sessions;
CREATE POLICY "Students view own device sessions"
ON device_sessions FOR SELECT
USING (auth.uid() = student_id);

-- auth_logs
DROP POLICY IF EXISTS "Students view own auth logs" ON auth_logs;
CREATE POLICY "Students view own auth logs"
ON auth_logs FOR SELECT
USING (auth.uid() = student_id);

-- ============================================
-- STEP 9: Verify the migration worked
-- ============================================

-- Should return 0 rows (tables are gone)
SELECT tablename FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('teachers_parents', 'user_teacher_relations');

-- Should show username column exists on users
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'users'
AND column_name IN ('username', 'email')
ORDER BY column_name;

-- Should show only student policies remain
SELECT tablename, policyname FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('student_pins', 'device_sessions', 'auth_logs')
ORDER BY tablename, policyname;
