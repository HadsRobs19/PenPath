-- ============================================
-- MS6-6: Authentication Schema Additions
-- ============================================
-- New tables for PIN-based student authentication,
-- device-bound sessions, and authentication logging.
--
-- WHO: Students (PIN), Parents (Email/Password), Devices
-- WHAT: PIN storage, device sessions, auth history
-- WHERE: Supabase PostgreSQL
-- WHEN: New tables for MS6-6
-- WHY: Support kid-friendly PIN auth + device sessions

-- ============================================
-- 1. STUDENT_PINS TABLE
-- ============================================
-- Stores hashed PIN codes for students
-- Parent controls PIN setting and changing
--
-- Example flow:
-- 1. Parent: "Set PIN for Vintage"
-- 2. Parent enters: 1234
-- 3. PIN hashed with bcrypt
-- 4. Hash stored in student_pins table
-- 5. Vintage enters PIN during login
-- 6. Backend hashes received PIN
-- 7. Compare with stored hash (match = login success)

CREATE TABLE student_pins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Link to student account
  student_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,

  -- Hashed PIN code (never store plain text!)
  -- Hash format: bcrypt (length 60 characters)
  -- Example: $2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeSmgf...
  pin_hash VARCHAR(255) NOT NULL,

  -- Brute force protection
  failed_attempts INT DEFAULT 0,
  last_failed_attempt TIMESTAMP,
  locked_until TIMESTAMP, -- Null if not locked, timestamp if locked

  -- Tracking
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_changed TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by_parent_id UUID NOT NULL REFERENCES teachers_parents(id),

  -- Audit trail
  updated_by_parent_id UUID REFERENCES teachers_parents(id),
  change_reason VARCHAR(255)
);

-- Index for fast PIN lookups during login
CREATE INDEX idx_student_pins_student_id ON student_pins(student_id);

-- ============================================
-- 2. DEVICE_SESSIONS TABLE
-- ============================================
-- Stores device-bound authentication sessions
-- Enables auto-login on registered devices (iPad, Raspberry Pi)
--
-- Example flow:
-- 1. Parent: "Register this iPad for Vintage"
-- 2. Parent enables: "Auto-login on this device"
-- 3. Session created in device_sessions table
-- 4. Session token (JWT) stored on device
-- 5. Vintage opens app on iPad
-- 6. App checks device_sessions table
-- 7. Valid session found? Yes → Auto-login (no PIN needed)
-- 8. Session expires after 8 hours
-- 9. Parent can revoke session anytime

CREATE TABLE device_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- References
  device_id UUID NOT NULL REFERENCES user_devices(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Session token (JWT)
  session_token TEXT NOT NULL,

  -- Session lifecycle
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- Session status
  is_active BOOLEAN DEFAULT TRUE,

  -- Security tracking
  ip_address VARCHAR(45), -- IPv4 or IPv6
  user_agent TEXT,

  -- Device info at session creation
  device_name VARCHAR(255),
  device_type VARCHAR(50), -- 'mobile', 'tablet', 'desktop', 'raspberry_pi'
  os_name VARCHAR(100), -- 'iOS', 'Android', 'Windows', 'Linux'

  -- Session configuration
  auto_logout_after_inactivity_minutes INT DEFAULT 480, -- 8 hours

  -- Who created this session
  created_by_parent_id UUID NOT NULL REFERENCES teachers_parents(id),

  -- Revocation info
  revoked_at TIMESTAMP,
  revoked_by_parent_id UUID REFERENCES teachers_parents(id),
  revocation_reason VARCHAR(255)
);

-- Indexes for fast lookups
CREATE INDEX idx_device_sessions_device_id ON device_sessions(device_id);
CREATE INDEX idx_device_sessions_student_id ON device_sessions(student_id);
CREATE INDEX idx_device_sessions_active ON device_sessions(is_active, expires_at);
CREATE INDEX idx_device_sessions_token ON device_sessions(session_token);

-- ============================================
-- 3. AUTH_LOGS TABLE
-- ============================================
-- Logs all authentication attempts for oversight
-- Parents can see when students login, from which devices, success/failure
--
-- Example flow:
-- 1. Vintage enters PIN on iPad
-- 2. PIN verified successfully
-- 3. Log entry created:
--    { student_id: Vintage, auth_method: 'pin', device_id: iPad, success: true }
-- 4. Parent can view auth_logs dashboard
-- 5. Parent sees: "Vintage logged in from iPad at 3:15 PM"
-- 6. Parent can spot unusual patterns (e.g., login at 3 AM!)

CREATE TABLE auth_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Who authenticated
  student_id UUID REFERENCES users(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES teachers_parents(id) ON DELETE CASCADE,
  -- One of student_id or parent_id will be set, not both

  -- Authentication details
  auth_method VARCHAR(50) NOT NULL,
  -- Options: 'pin', 'device_bound', 'email_password', 'password_reset'

  device_id UUID REFERENCES user_devices(id) ON DELETE SET NULL,

  -- Success/Failure tracking
  success BOOLEAN NOT NULL,
  failure_reason VARCHAR(255), -- e.g., 'Invalid PIN', 'Wrong password', 'Account disabled'

  -- Attempt details
  attempt_number INT DEFAULT 1, -- For brute force tracking
  ip_address VARCHAR(45), -- IPv4 or IPv6
  user_agent TEXT,

  -- Timestamp
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- Session info
  session_id UUID REFERENCES device_sessions(id) ON DELETE SET NULL
);

-- Indexes for fast queries
CREATE INDEX idx_auth_logs_student_id ON auth_logs(student_id, created_at DESC);
CREATE INDEX idx_auth_logs_parent_id ON auth_logs(parent_id, created_at DESC);
CREATE INDEX idx_auth_logs_device_id ON auth_logs(device_id, created_at DESC);
CREATE INDEX idx_auth_logs_created_at ON auth_logs(created_at DESC);
CREATE INDEX idx_auth_logs_success ON auth_logs(success, created_at DESC);

-- ============================================
-- 4. MODIFICATIONS TO EXISTING TABLES
-- ============================================

-- Modify users table to support kids (optional email)
-- Note: Run these only if you want to make email optional
--
-- ALTER TABLE users
-- ALTER COLUMN email DROP NOT NULL;
--
-- ALTER TABLE users
-- DROP COLUMN password_hash;
--
-- ALTER TABLE users
-- ADD COLUMN parent_id UUID REFERENCES teachers_parents(id) ON DELETE SET NULL;

-- ============================================
-- 5. ROW LEVEL SECURITY (RLS) FOR AUTH TABLES
-- ============================================

-- Enable RLS on new tables
ALTER TABLE student_pins ENABLE ROW LEVEL SECURITY;
ALTER TABLE device_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth_logs ENABLE ROW LEVEL SECURITY;

-- STUDENT_PINS RLS Policies
-- Students can see their own PIN was created (but not the hash!)
CREATE POLICY "Students can see their PIN metadata"
ON student_pins
FOR SELECT
USING (auth.uid() = student_id);

-- Parents can see/manage their students' PINs
CREATE POLICY "Parents can manage their students' PINs"
ON student_pins
FOR SELECT
USING (
  created_by_parent_id = auth.uid()
  OR
  updated_by_parent_id = auth.uid()
);

-- Parents can update PINs for their students
CREATE POLICY "Parents can update their students' PINs"
ON student_pins
FOR UPDATE
USING (created_by_parent_id = auth.uid())
WITH CHECK (created_by_parent_id = auth.uid());

-- Prevent users from inserting PINs (only admin/migration)
CREATE POLICY "Prevent user PIN insertion"
ON student_pins
FOR INSERT
WITH CHECK (false);

-- DEVICE_SESSIONS RLS Policies
-- Students can see their own device sessions
CREATE POLICY "Students can see their own device sessions"
ON device_sessions
FOR SELECT
USING (auth.uid() = student_id);

-- Parents can see their students' device sessions
CREATE POLICY "Parents can see their students' device sessions"
ON device_sessions
FOR SELECT
USING (
  created_by_parent_id = auth.uid()
  OR
  revoked_by_parent_id = auth.uid()
);

-- Parents can revoke device sessions
CREATE POLICY "Parents can revoke device sessions"
ON device_sessions
FOR UPDATE
USING (created_by_parent_id = auth.uid())
WITH CHECK (created_by_parent_id = auth.uid());

-- Prevent user insertion
CREATE POLICY "Prevent user device session insertion"
ON device_sessions
FOR INSERT
WITH CHECK (false);

-- AUTH_LOGS RLS Policies
-- Students can see their own login history
CREATE POLICY "Students can see their own auth logs"
ON auth_logs
FOR SELECT
USING (auth.uid() = student_id);

-- Parents can see their students' login history
CREATE POLICY "Parents can see their students' auth logs"
ON auth_logs
FOR SELECT
USING (
  created_by_parent_id = auth.uid() -- View logs for their students
  OR
  parent_id = auth.uid() -- Parents can see their own login logs
);

-- Prevent user insertion (only backend creates logs)
CREATE POLICY "Prevent user auth log insertion"
ON auth_logs
FOR INSERT
WITH CHECK (false);

-- ============================================
-- 6. VERIFICATION QUERIES
-- ============================================

-- After running all migrations, verify:

-- Check tables created
SELECT tablename FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('student_pins', 'device_sessions', 'auth_logs')
ORDER BY tablename;

-- Check indexes created
SELECT indexname FROM pg_indexes
WHERE schemaname = 'public'
AND tablename IN ('student_pins', 'device_sessions', 'auth_logs')
ORDER BY indexname;

-- Check RLS enabled
SELECT tablename, rowsecurity FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('student_pins', 'device_sessions', 'auth_logs')
ORDER BY tablename;

-- Check policies created
SELECT tablename, policyname FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('student_pins', 'device_sessions', 'auth_logs')
ORDER BY tablename, policyname;

-- ============================================
-- 7. SAMPLE DATA FOR TESTING
-- ============================================

-- Test PIN storage (hashed)
-- Pin: 1234 → Hash: $2b$10$N9qo8uLOickgx2ZMRZoMye...
-- (Use bcrypt to generate hash in production)

-- INSERT INTO student_pins (student_id, pin_hash, created_by_parent_id)
-- VALUES (
--   '550e8400-e29b-41d4-a716-446655440000', -- Vintage
--   '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeSmgf...', -- bcrypt hash
--   '660e8400-e29b-41d4-a716-446655440001' -- Mrs. Johnson
-- );

-- Test device session
-- INSERT INTO device_sessions (device_id, student_id, session_token, expires_at, created_by_parent_id, device_name, device_type, os_name)
-- VALUES (
--   (SELECT id FROM user_devices WHERE device_nickname = 'Vintage iPad'),
--   '550e8400-e29b-41d4-a716-446655440000',
--   'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
--   NOW() + INTERVAL '24 hours',
--   '660e8400-e29b-41d4-a716-446655440001',
--   'Vintage iPad',
--   'tablet',
--   'iOS'
-- );

-- ============================================
-- NOTES
-- ============================================
-- 1. PIN hashing: Use bcrypt in your application
--    - Never hash in SQL (too slow)
--    - Hash in backend before INSERT/UPDATE
--    - Example: bcrypt.hash(pinCode, 10)
--
-- 2. Session tokens: Use JWT
--    - Create in backend after PIN/password verification
--    - Store on device (localStorage, AsyncStorage)
--    - Include in all API requests
--    - Verify on backend with JWT.verify()
--
-- 3. RLS policies:
--    - auth.uid() returns user ID from JWT
--    - Policies applied automatically on SELECT/INSERT/UPDATE/DELETE
--    - Backend service role bypasses RLS
--
-- 4. Indexes:
--    - Optimize for common queries
--    - auth_logs queries by student_id + date
--    - device_sessions queries by active status + expiry
--
-- 5. Brute force protection:
--    - Track failed_attempts in student_pins
--    - Lock account after 3 failed attempts
--    - locked_until timestamp prevents login
--    - Parent can unlock anytime
--
-- 6. Cleanup job:
--    - Archive auth_logs older than 90 days (GDPR)
--    - Delete expired device_sessions
--    - Regular maintenance recommended
