-- ============================================
-- MS6-5: RLS Policies for USER_PROGRESS table
-- ============================================
-- Students can see/edit their own progress
-- Teachers/Parents can see their students' progress

-- WHO: Students, Teachers, Parents
-- WHAT: Each person can only access allowed progress rows
-- WHERE: user_progress table
-- WHEN: When querying progress
-- WHY: Protect learning data (attempts, scores, time spent)

-- ============================================
-- Policy 1: SELECT - Students can read ONLY their progress
-- ============================================
-- Scenario: Vintage queries: SELECT * FROM user_progress
-- RLS checks: Does this progress belong to Vintage?
--   YES → Show it ✅
--   NO → Hide it ❌

CREATE POLICY "Students can read their own progress"
ON user_progress
FOR SELECT
USING (auth.uid() = student_id);

-- ============================================
-- Policy 2: SELECT - Teachers/Parents can read their students' progress
-- ============================================
-- Scenario: Mrs. Johnson queries: SELECT * FROM user_progress
-- RLS checks: Is Mrs. Johnson a teacher of this student?
--   YES → Show it ✅
--   NO → Hide it ❌

CREATE POLICY "Teachers can read their students' progress"
ON user_progress
FOR SELECT
USING (
  -- Check if current user is a teacher/parent of this student
  student_id IN (
    SELECT student_id
    FROM user_teacher_relations
    WHERE teacher_parent_id = auth.uid()
    AND is_active = true
  )
);

-- ============================================
-- Policy 3: INSERT - Students can create progress for themselves
-- ============================================
-- Scenario: Vintage completes a lesson step
-- Backend runs: INSERT INTO user_progress (student_id, lesson_step_id, ...)
--   VALUES (vintage_id, ...)
-- RLS checks: Is student_id = Vintage's ID?
--   YES → Allow insert ✅
--   NO → Block insert ❌

CREATE POLICY "Students can insert their own progress"
ON user_progress
FOR INSERT
WITH CHECK (auth.uid() = student_id);

-- ============================================
-- Policy 4: UPDATE - Students can update their own progress
-- ============================================
-- Scenario: Vintage retakes a step, updates accuracy
-- Backend runs: UPDATE user_progress SET accuracy_percent = 95
--   WHERE id = progress_id
-- RLS checks: Is this Vintage's progress?
--   YES → Allow update ✅
--   NO → Block update ❌

CREATE POLICY "Students can update their own progress"
ON user_progress
FOR UPDATE
USING (auth.uid() = student_id)
WITH CHECK (auth.uid() = student_id);

-- ============================================
-- Policy 5: DELETE - Students CANNOT delete progress
-- ============================================
-- Why? We want to keep learning history
-- Deleting progress would lose data

CREATE POLICY "Students cannot delete progress"
ON user_progress
FOR DELETE
USING (false);  -- Always deny DELETE

-- ============================================
-- Teachers/Parents: Cannot modify progress
-- ============================================
-- Why? Teachers can view but not change student data
-- Prevents teachers from cheating for students
-- (e.g., marking lessons complete when not done)
--
-- If teachers need to UPDATE progress, we'd add:
-- CREATE POLICY "Teachers can update student progress"
-- But we're NOT doing this for data integrity
