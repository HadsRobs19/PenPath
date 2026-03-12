-- ============================================
-- Migration 000002: Student-Only System
-- ============================================
-- Run this in the Supabase SQL editor.
-- Safe to run even if auth tables do not exist yet.
-- ============================================


-- ============================================
-- STEP 1: Drop parent/teacher tables if they exist
-- ============================================

DROP TABLE IF EXISTS user_teacher_relations CASCADE;
DROP TABLE IF EXISTS teachers_parents CASCADE;


-- ============================================
-- STEP 2: Add username column to users
-- ============================================

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS username VARCHAR(20) UNIQUE;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'username_alphanumeric'
  ) THEN
    ALTER TABLE users
      ADD CONSTRAINT username_alphanumeric
      CHECK (username ~ '^[a-zA-Z0-9]{3,20}$');
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- Make email optional (students log in with username + PIN)
ALTER TABLE users
  ALTER COLUMN email DROP NOT NULL;


-- ============================================
-- STEP 3: Drop old auth tables if they exist
-- and recreate them cleanly without parent columns
-- ============================================

DROP TABLE IF EXISTS auth_logs       CASCADE;
DROP TABLE IF EXISTS device_sessions CASCADE;
DROP TABLE IF EXISTS student_pins    CASCADE;


-- STUDENT_PINS
CREATE TABLE student_pins (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,

  pin_hash VARCHAR(255) NOT NULL,

  failed_attempts     INT DEFAULT 0,
  last_failed_attempt TIMESTAMP,
  locked_until        TIMESTAMP,

  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_changed TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_student_pins_student_id ON student_pins(student_id);


-- DEVICE_SESSIONS
CREATE TABLE device_sessions (
  id         UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id  VARCHAR(255) NOT NULL,
  student_id UUID    NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  session_token TEXT      NOT NULL,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at    TIMESTAMP NOT NULL,
  last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_active     BOOLEAN   DEFAULT TRUE,

  ip_address  VARCHAR(45),
  user_agent  TEXT,
  device_name VARCHAR(255),
  device_type VARCHAR(50),
  os_name     VARCHAR(100),

  auto_logout_after_inactivity_minutes INT DEFAULT 480,

  revoked_at        TIMESTAMP,
  revocation_reason VARCHAR(255)
);

CREATE INDEX idx_device_sessions_device_id  ON device_sessions(device_id);
CREATE INDEX idx_device_sessions_student_id ON device_sessions(student_id);
CREATE INDEX idx_device_sessions_active     ON device_sessions(is_active, expires_at);
CREATE INDEX idx_device_sessions_token      ON device_sessions(session_token);


-- AUTH_LOGS
CREATE TABLE auth_logs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id    UUID REFERENCES users(id) ON DELETE CASCADE,
  username_tried VARCHAR(20),

  auth_method    VARCHAR(50) NOT NULL,
  device_id      VARCHAR(255),
  success        BOOLEAN     NOT NULL,
  failure_reason VARCHAR(255),
  attempt_number INT         DEFAULT 1,
  ip_address     VARCHAR(45),
  user_agent     TEXT,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_auth_logs_student_id ON auth_logs(student_id, created_at DESC);
CREATE INDEX idx_auth_logs_created_at ON auth_logs(created_at DESC);
CREATE INDEX idx_auth_logs_success    ON auth_logs(success, created_at DESC);


-- ============================================
-- STEP 4: Enable RLS on auth tables
-- ============================================

ALTER TABLE student_pins    ENABLE ROW LEVEL SECURITY;
ALTER TABLE device_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth_logs       ENABLE ROW LEVEL SECURITY;


-- ============================================
-- STEP 5: Student-only RLS policies
-- ============================================

CREATE POLICY "Students view own PIN record"
ON student_pins FOR SELECT
USING (auth.uid() = student_id);

CREATE POLICY "Students view own device sessions"
ON device_sessions FOR SELECT
USING (auth.uid() = student_id);

CREATE POLICY "Students view own auth logs"
ON auth_logs FOR SELECT
USING (auth.uid() = student_id);


-- ============================================
-- STEP 6: Verify
-- ============================================

-- Should show all 3 tables
SELECT tablename FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('student_pins', 'device_sessions', 'auth_logs')
ORDER BY tablename;

-- Should return 0 rows (parent tables are gone)
SELECT tablename FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('teachers_parents', 'user_teacher_relations');

-- Should show username column on users
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'users'
AND column_name IN ('username', 'email')
ORDER BY column_name;
