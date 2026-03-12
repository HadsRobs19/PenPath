-- ============================================
-- Authentication Schema
-- Student-only PIN auth and device sessions.
-- No parent or teacher references.
-- ============================================

-- ============================================
-- 1. STUDENT_PINS TABLE
-- ============================================
-- Stores a bcrypt-hashed PIN for each student.
-- The PIN is set during account creation.
-- Students use username + PIN to log in.

CREATE TABLE student_pins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  student_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,

  -- bcrypt hash of the PIN (never store plain text)
  -- Example hash: $2b$10$N9qo8uLOickgx2ZMRZoMye...
  pin_hash VARCHAR(255) NOT NULL,

  -- Brute force protection
  failed_attempts    INT DEFAULT 0,
  last_failed_attempt TIMESTAMP,
  locked_until       TIMESTAMP,
  -- NULL = not locked, timestamp = locked until that time

  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_changed TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_student_pins_student_id ON student_pins(student_id);

-- ============================================
-- 2. DEVICE_SESSIONS TABLE
-- ============================================
-- Stores active sessions for recognised devices.
-- Allows a student to resume a session without
-- re-entering their PIN on a trusted device.

CREATE TABLE device_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  device_id  VARCHAR(255) NOT NULL,
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  session_token TEXT NOT NULL,

  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at    TIMESTAMP NOT NULL,
  last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  is_active BOOLEAN DEFAULT TRUE,

  -- Security context
  ip_address VARCHAR(45),
  user_agent TEXT,

  -- Device info snapshot at session creation
  device_name VARCHAR(255),
  device_type VARCHAR(50),
  os_name     VARCHAR(100),

  auto_logout_after_inactivity_minutes INT DEFAULT 480,

  -- Revocation
  revoked_at        TIMESTAMP,
  revocation_reason VARCHAR(255)
);

CREATE INDEX idx_device_sessions_device_id  ON device_sessions(device_id);
CREATE INDEX idx_device_sessions_student_id ON device_sessions(student_id);
CREATE INDEX idx_device_sessions_active     ON device_sessions(is_active, expires_at);
CREATE INDEX idx_device_sessions_token      ON device_sessions(session_token);

-- ============================================
-- 3. AUTH_LOGS TABLE
-- ============================================
-- Logs every login attempt for security auditing.
-- Only student activity is recorded.

CREATE TABLE auth_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  student_id    UUID REFERENCES users(id) ON DELETE CASCADE,
  username_tried VARCHAR(20),
  -- Stores the username that was attempted even if login failed

  auth_method VARCHAR(50) NOT NULL,
  -- Options: 'pin', 'device_bound'

  device_id VARCHAR(255),

  success        BOOLEAN NOT NULL,
  failure_reason VARCHAR(255),
  attempt_number INT DEFAULT 1,

  ip_address VARCHAR(45),
  user_agent TEXT,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_auth_logs_student_id  ON auth_logs(student_id, created_at DESC);
CREATE INDEX idx_auth_logs_created_at  ON auth_logs(created_at DESC);
CREATE INDEX idx_auth_logs_success     ON auth_logs(success, created_at DESC);

-- ============================================
-- 4. ROW LEVEL SECURITY
-- ============================================

ALTER TABLE student_pins    ENABLE ROW LEVEL SECURITY;
ALTER TABLE device_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth_logs       ENABLE ROW LEVEL SECURITY;

-- STUDENT_PINS: students can only see their own record (not the hash)
CREATE POLICY "Students view own PIN record"
ON student_pins
FOR SELECT
USING (auth.uid() = student_id);

-- DEVICE_SESSIONS: students can only see their own sessions
CREATE POLICY "Students view own device sessions"
ON device_sessions
FOR SELECT
USING (auth.uid() = student_id);

-- AUTH_LOGS: students can only see their own login history
CREATE POLICY "Students view own auth logs"
ON auth_logs
FOR SELECT
USING (auth.uid() = student_id);

-- Insertion and updates are handled by the backend service role only.
-- The service role bypasses RLS so no insert policy is needed.

-- ============================================
-- 5. VERIFICATION QUERIES
-- ============================================
-- Run these in the Supabase SQL editor after applying migrations
-- to confirm everything was created correctly.

-- Tables exist
SELECT tablename FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('student_pins', 'device_sessions', 'auth_logs')
ORDER BY tablename;

-- RLS is enabled
SELECT tablename, rowsecurity FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('student_pins', 'device_sessions', 'auth_logs')
ORDER BY tablename;

-- Policies exist
SELECT tablename, policyname FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('student_pins', 'device_sessions', 'auth_logs')
ORDER BY tablename, policyname;
