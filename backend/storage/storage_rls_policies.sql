-- ============================================
-- MS6-7: RLS Policies for Storage Buckets
-- ============================================
-- Secure access to student drawings using Row Level Security
-- Lesson audio is public (no RLS needed)
-- User drawings are private (RLS enforced)
--
-- WHO: Students (own drawings), Teachers (students' drawings)
-- WHAT: PNG drawings and JSON metadata for tracing activities
-- WHERE: user-drawings-{environment} bucket
-- WHEN: Student submits drawing, teacher reviews dashboard
-- WHY: Data isolation, privacy, access control

-- ============================================
-- STORAGE POLICIES FOR USER DRAWINGS
-- ============================================
-- Note: Storage RLS uses same system as database RLS
-- Policies are applied to storage.objects table
-- Bucket names: user-drawings-{local|staging|production}

-- ============================================
-- Policy 1: Students Can Upload Own Drawings
-- ============================================
-- Allow students to upload PNG and JSON files to their own folder
-- Path format: {student_uuid}/{lesson_uuid}/{step_uuid}/{attempt_num}.{ext}
-- Example: 550e8400-e29b-41d4-a716-446655440000/880e8400.../step-uuid/1.png
--
-- Verification:
-- - auth.uid() is student's UUID from JWT
-- - File path MUST start with student's UUID as folder prefix
-- - Prevents: Student from uploading to other student's folder
-- - Enforces: Path ownership before upload succeeds

CREATE POLICY "Students can upload their own drawings"
ON storage.objects
FOR INSERT
WITH CHECK (
  -- Must be uploading to user-drawings bucket
  bucket_id LIKE 'user-drawings-%'
  AND
  -- First path component (before first /) must be student's UUID
  auth.uid()::text = (string_to_array(name, '/'))[1]::text
);

-- ============================================
-- Policy 2: Students Can Read Own Drawings
-- ============================================
-- Allow students to list and download their own drawings
-- They can only see files where the first path component matches their UUID
--
-- Query Pattern:
-- SELECT * FROM storage.objects
-- WHERE bucket_id = 'user-drawings-production'
-- RLS: Only returns rows where path starts with auth.uid()
--
-- Example:
-- Student 550e8400... queries
-- ├─ Gets: 550e8400.../lesson/step/1.png ✅
-- ├─ Gets: 550e8400.../lesson/step/2.png ✅
-- └─ Doesn't get: 660e8400.../lesson/step/1.png ❌ (different student)

CREATE POLICY "Students can read their own drawings"
ON storage.objects
FOR SELECT
USING (
  bucket_id LIKE 'user-drawings-%'
  AND
  auth.uid()::text = (string_to_array(name, '/'))[1]::text
);

-- ============================================
-- Policy 3: Students Can Update Own Drawings
-- ============================================
-- Allow students to update/replace their own drawings
-- Use case: Resubmit a drawing if file corrupted
-- Restrictions: Only to their own folder paths
--
-- USING clause: Who can update (read check)
-- WITH CHECK clause: What can be updated (write check)
-- Both check: Path starts with student's UUID

CREATE POLICY "Students can update their own drawings"
ON storage.objects
FOR UPDATE
USING (
  bucket_id LIKE 'user-drawings-%'
  AND
  auth.uid()::text = (string_to_array(name, '/'))[1]::text
)
WITH CHECK (
  bucket_id LIKE 'user-drawings-%'
  AND
  auth.uid()::text = (string_to_array(name, '/'))[1]::text
);

-- ============================================
-- Policy 4: Teachers Can Read Students' Drawings
-- ============================================
-- Allow teachers/parents to view their assigned students' drawings
-- Access control: Check user_teacher_relations table
--
-- Flow:
-- 1. Teacher queries storage.objects
-- 2. Extract student_id from file path: (string_to_array(name, '/'))[1]
-- 3. Check: Is this student_id in user_teacher_relations where teacher is me?
-- 4. If YES: Return file ✅
-- 5. If NO: Block access ❌
--
-- Example:
-- Teacher Mrs. Johnson (660e8400...)
-- ├─ In DB: Has relation to Vintage (550e8400...) and Tommy (888e8400...)
-- ├─ Can read: 550e8400.../lesson/step/1.png ✅ (Vintage is in her class)
-- ├─ Can read: 888e8400.../lesson/step/1.png ✅ (Tommy is in her class)
-- └─ Cannot read: 999e8400.../lesson/step/1.png ❌ (Unknown student)

CREATE POLICY "Teachers can read their students' drawings"
ON storage.objects
FOR SELECT
USING (
  bucket_id LIKE 'user-drawings-%'
  AND
  -- Extract student_id from path and check if in my students list
  (string_to_array(name, '/'))[1]::uuid IN (
    SELECT student_id
    FROM user_teacher_relations
    WHERE teacher_parent_id = auth.uid()
      AND is_active = true
  )
);

-- ============================================
-- Policy 5: Prevent Unauthorized DELETE
-- ============================================
-- Students and teachers cannot delete drawings
-- Only backend service role (admin operations) can delete
-- Use case: Remove corrupted file, handle GDPR deletion requests
--
-- Implementation: WITH CHECK (false) = Block all deletes at storage level
-- Backend can still delete using service role key (bypasses RLS)

CREATE POLICY "Prevent user deletes on drawings"
ON storage.objects
FOR DELETE
USING (false);  -- Blocks all user-initiated deletes

-- ============================================
-- RLS POLICIES FOR LESSON AUDIO (NOT NEEDED)
-- ============================================
-- Lesson audio bucket is PUBLIC
-- No authentication required
-- No RLS policies needed (public content)
-- Anyone can read lesson audio files
-- Only backend can write (handled by app logic, not RLS)
--
-- To configure in Supabase:
-- 1. Go to Storage settings
-- 2. Select lesson-audio-{env} bucket
-- 3. Toggle: "Make this bucket public" = ON
-- 4. Save
--
-- Result: Files accessible at:
-- https://{project}.supabase.co/storage/v1/object/public/lesson-audio-{env}/{path}

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- After applying all policies, verify configuration:

-- Check storage RLS is enabled
-- SELECT schemaname, tablename, rowsecurity FROM pg_tables
-- WHERE tablename = 'objects' AND schemaname = 'storage';
-- Expected: rowsecurity = true

-- Check storage policies exist
-- SELECT * FROM pg_policies
-- WHERE tablename = 'objects' AND schemaname = 'storage'
-- ORDER BY policyname;
-- Expected: See all 5 policies listed above

-- ============================================
-- TESTING THE POLICIES
-- ============================================
-- Test 1: Student uploads own drawing
-- Scenario: Student 550e8400... submits drawing
-- Expected: ✅ Upload succeeds
-- Test: POST /storage/v1/object/user-drawings-production/550e8400.../lesson/step/1.png
--       (with JWT token from student login)

-- Test 2: Student tries to upload to other's folder
-- Scenario: Student 550e8400... tries to upload to 660e8400... folder
-- Expected: ❌ Upload fails (RLS blocks)
-- Test: POST /storage/v1/object/user-drawings-production/660e8400.../lesson/step/1.png
--       (with JWT token from student 550e8400...)
-- Error: "Bucket policy violation"

-- Test 3: Student reads own drawing
-- Scenario: Student 550e8400... queries their drawings
-- Expected: ✅ Returns own drawings only
-- Test: SELECT * FROM storage.objects
--       WHERE bucket_id = 'user-drawings-production'
--       AND auth.uid() = '550e8400...' (from JWT)
-- Result: [550e8400.../lesson/step/1.png, 550e8400.../lesson/step/2.png]

-- Test 4: Teacher reads student's drawing
-- Scenario: Teacher 660e8400... (Vintage's teacher) views drawing
-- Expected: ✅ Returns Vintage's drawings
-- Test: SELECT * FROM storage.objects
--       WHERE bucket_id = 'user-drawings-production'
--       AND (string_to_array(name, '/'))[1]::uuid = '550e8400...'
--       (with JWT token from teacher 660e8400...)
-- Result: [550e8400.../lesson/step/1.png, 550e8400.../lesson/step/2.png]

-- Test 5: Teacher tries to read unrelated student's drawing
-- Scenario: Teacher 660e8400... (Vintage's teacher) tries to view other student's drawings
-- Expected: ❌ Returns empty (RLS blocks)
-- Test: SELECT * FROM storage.objects
--       WHERE bucket_id = 'user-drawings-production'
--       AND (string_to_array(name, '/'))[1]::uuid = '999e8400...'
--       (with JWT token from teacher 660e8400...)
-- Result: [] (empty - user_teacher_relations has no link to 999e8400...)

-- Test 6: Backend service role can access all
-- Scenario: Backend service role queries all drawings
-- Expected: ✅ Returns all drawings (service role bypasses RLS)
-- Test: SELECT * FROM storage.objects
--       WHERE bucket_id = 'user-drawings-production'
--       (with SUPABASE_SERVICE_KEY auth)
-- Result: [All drawings from all students]

-- ============================================
-- NOTES FOR IMPLEMENTATION
-- ============================================
--
-- 1. Storage RLS applies to storage.objects table
--    └─ Similar to database table RLS
--    └─ Uses same auth.uid() function
--    └─ Respects JWT tokens from Supabase Auth
--
-- 2. Bucket naming convention
--    └─ lesson-audio-{env} for public content
--    └─ user-drawings-{env} for private content
--    └─ Same environment naming as database
--
-- 3. Path format is critical for RLS
--    └─ Must be: {student_uuid}/{lesson_uuid}/{step_uuid}/{attempt}.{ext}
--    └─ RLS checks: (string_to_array(name, '/'))[1]
--    └─ Must match auth.uid() for upload/read
--
-- 4. Service role key behavior
--    └─ Backend uses SUPABASE_SERVICE_KEY
--    └─ Service role automatically bypasses RLS
--    └─ No explicit policy needed for service role
--    └─ Never expose service key to frontend
--
-- 5. Public bucket (lesson audio)
--    └─ No RLS policies needed
--    └─ Marked as public in bucket settings
--    └─ Anyone can read without authentication
--    └─ Only backend can write
--
-- 6. File size limits
--    └─ Set in bucket settings, not in RLS
--    └─ lesson-audio: 50 MB max
--    └─ user-drawings: 10 MB max
--    └─ Enforced before RLS check
--
-- 7. MIME type validation
--    └─ Set in bucket settings, not in RLS
--    └─ lesson-audio: audio/mpeg, audio/wav, application/json
--    └─ user-drawings: image/png, application/json
--    └─ Enforced before RLS check
