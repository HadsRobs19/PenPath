-- ============================================
-- MS6-5: Test RLS Policies
-- ============================================
-- This script tests RLS policies with sample users
-- Ensure you have test data: Vintage (student), Mrs. Johnson (teacher)

-- WHO: Testers
-- WHAT: Verify RLS policies work correctly
-- WHERE: SQL Editor in Supabase
-- WHEN: After applying RLS policies
-- WHY: Ensure security works before production

-- ============================================
-- IMPORTANT: HOW TO USE THIS SCRIPT
-- ============================================
-- 1. This script uses JWT tokens to simulate different users
-- 2. In Supabase SQL Editor, you CANNOT directly test RLS
--    because SQL runs as authenticated role (not your JWT)
-- 3. Instead, use Supabase's testing approach below
--
-- Better way to test:
-- - Use frontend code with anon key
-- - Use API with JWT tokens
-- - Check policy logic manually

-- ============================================
-- Manual RLS Policy Testing Guide
-- ============================================

-- TEST 1: Student Can Read Own Data
-- ============================================
-- Scenario: Vintage logs in and queries her progress
-- Expected: Returns only Vintage's rows
--
-- Test Method (in frontend code):
-- await supabase
--   .from('user_progress')
--   .select('*')
--   .eq('student_id', vintage_id)
-- Expected Result: ✅ Rows returned (Vintage's only)
--
-- Test Opposite (hacker tries):
-- await supabase
--   .from('user_progress')
--   .select('*')
--   .eq('student_id', 'other_student_id')
-- Expected Result: ❌ No rows returned (RLS blocks)

-- TEST 2: Student Cannot Read Other's Data
-- ============================================
-- Scenario: Vintage tries to peek at Other_Student's progress
-- Expected: RLS blocks the query
--
-- Test Method (in frontend code):
-- const otherStudentId = '888e8400-e29b-41d4-a716-446655440003';
-- await supabase
--   .from('user_progress')
--   .select('*')
--   .eq('student_id', otherStudentId)
-- Expected Result: ❌ No rows returned

-- TEST 3: Teacher Can Read Student's Data
-- ============================================
-- Scenario: Mrs. Johnson queries and sees Vintage's data
-- Expected: Returns Vintage's data (her student)
--
-- Prerequisites:
-- - Mrs. Johnson must be in user_teacher_relations
-- - student_id = Vintage
-- - teacher_parent_id = Mrs. Johnson
-- - is_active = true
--
-- Test Method (in frontend code as Mrs. Johnson):
-- await supabase
--   .from('user_progress')
--   .select('*')
-- Expected Result: ✅ Returns only her students' progress

-- TEST 4: Teacher Cannot Read Unrelated Student's Data
-- ============================================
-- Scenario: Mrs. Johnson tries to see unrelated student's data
-- Expected: RLS blocks it
--
-- Test Method (in frontend code as Mrs. Johnson):
-- const unrelatedStudentId = '999e8400-e29b-41d4-a716-446655440004';
-- await supabase
--   .from('user_progress')
--   .select('*')
--   .eq('student_id', unrelatedStudentId)
-- Expected Result: ❌ No rows returned

-- TEST 5: Student Can Insert Own Progress
-- ============================================
-- Scenario: Vintage completes a lesson, creates progress record
-- Expected: INSERT succeeds
--
-- Test Method (backend code with JWT):
-- const client = supabase.createClient(url, anonKey);
-- client.auth.setSession({ access_token: vintageJWT, ... });
// await client
--   .from('user_progress')
--   .insert({
--     student_id: vintage_id,
--     lesson_step_id: '...',
--     accuracy_percent: 95,
--     is_completed: true
--   })
-- Expected Result: ✅ Row inserted

-- TEST 6: Student Cannot Insert Other's Progress
-- ============================================
-- Scenario: Hacker tries to INSERT progress for another student
-- Expected: RLS blocks it
--
-- Test Method (in frontend code):
-- await supabase
--   .from('user_progress')
--   .insert({
--     student_id: 'other_student_id',  // Not current user!
--     lesson_step_id: '...',
--     accuracy_percent: 100,
--     is_completed: true
--   })
-- Expected Result: ❌ INSERT blocked by RLS

-- TEST 7: Service Role Bypasses RLS
-- ============================================
-- Scenario: Backend API (service role) can access all data
-- Expected: Returns all students' progress
--
-- Test Method (backend code with service role):
// const adminClient = createClient(url, serviceRoleKey);
// const { data } = await adminClient
--   .from('user_progress')
--   .select('*')
-- Expected Result: ✅ All rows returned (service role bypass)

-- ============================================
-- Database Verification Queries
-- ============================================

-- Check RLS is enabled on all tables
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('users', 'user_progress', 'letter_mastery',
                   'user_badges', 'user_devices', 'user_teacher_relations')
ORDER BY tablename;
-- Expected: All should show rowsecurity = true

-- Check policies are created
SELECT schemaname, tablename, policyname, qual
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('users', 'user_progress', 'letter_mastery',
                   'user_badges', 'user_devices', 'user_teacher_relations')
ORDER BY tablename, policyname;
-- Expected: Should see all 30+ policies

-- ============================================
-- Sample Data for Testing
-- ============================================
-- Ensure you have these test users:

-- 1. Vintage (Student)
-- SELECT * FROM users WHERE id = '550e8400-e29b-41d4-a716-446655440000';
-- Expected: One row with name='Vintage'

-- 2. Mrs. Johnson (Teacher)
-- SELECT * FROM teachers_parents WHERE id = '660e8400-e29b-41d4-a716-446655440001';
-- Expected: One row with name='Mrs. Johnson', role='teacher'

-- 3. Teacher-Student Link
-- SELECT * FROM user_teacher_relations
-- WHERE student_id = '550e8400-e29b-41d4-a716-446655440000'
-- AND teacher_parent_id = '660e8400-e29b-41d4-a716-446655440001';
-- Expected: One row linking Vintage to Mrs. Johnson

-- ============================================
-- Summary: How to Actually Test RLS
-- ============================================
-- 1. Use Supabase frontend SDK with anon key
-- 2. Log in as different users
-- 3. Query tables and observe what data is returned
-- 4. Verify:
--    ✅ Students see only their data
--    ✅ Teachers see their students' data
--    ✅ Unrelated parties see nothing
--    ✅ Anon key is restricted
--    ✅ Service role has full access
--
-- Example test flow:
-- 1. Login as Vintage (anon key)
-- 2. Query user_progress → Should get Vintage's rows only
-- 3. Logout, login as Mrs. Johnson
-- 4. Query user_progress → Should get her students' rows
-- 5. Logout, login as unrelated user
-- 6. Query user_progress → Should get empty (no data)
