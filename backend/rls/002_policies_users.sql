-- ============================================
-- MS6-5: RLS Policies for USERS table
-- ============================================
-- Users should only see/edit their own profile

-- WHO: Students (authenticated users)
-- WHAT: Can only access their own user row
-- WHERE: users table
-- WHEN: When querying users table
-- WHY: Protect personal data (passwords, email, etc.)

-- ============================================
-- Policy 1: SELECT - Students can read ONLY their own row
-- ============================================
-- Scenario: Vintage logs in and runs: SELECT * FROM users
-- RLS checks: Is this row Vintage's?
--   YES → Show the row ✅
--   NO → Hide the row ❌

CREATE POLICY "Users can read their own profile"
ON users
FOR SELECT
USING (auth.uid() = id);

-- ============================================
-- Policy 2: UPDATE - Students can update ONLY their own row
-- ============================================
-- Scenario: Vintage wants to change theme_preference
-- RLS checks: Is this row Vintage's?
--   YES → Allow update ✅
--   NO → Block update ❌

CREATE POLICY "Users can update their own profile"
ON users
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- ============================================
-- Policy 3: INSERT - Students CANNOT insert into users table
-- ============================================
-- Why? Users are created by auth system, not by users themselves
-- This policy explicitly prevents manual inserts

CREATE POLICY "Users cannot insert into users table"
ON users
FOR INSERT
WITH CHECK (false);  -- Always deny INSERT

-- ============================================
-- Policy 4: DELETE - Students CANNOT delete their own profile
-- ============================================
-- Why? We don't want users deleting accounts through SQL
-- Account deletion should go through auth system

CREATE POLICY "Users cannot delete their profile"
ON users
FOR DELETE
USING (false);  -- Always deny DELETE

-- ============================================
-- Service Role Bypass
-- ============================================
-- The backend API uses SERVICE ROLE key
-- Service role BYPASSES all RLS policies
-- This allows the API to:
--   - Create users during signup
--   - Admin operations
--   - Batch updates
--   - Any operation needed by the app
--
-- Service role is NEVER exposed to frontend
-- Only used on secure backend server
