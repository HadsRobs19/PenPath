-- ============================================
-- MS6-5: RLS Policies for USER_TEACHER_RELATIONS table
-- ============================================
-- Students can see their teacher/parent relationships
-- Teachers/Parents can see their student relationships

CREATE POLICY "Students can read their own teacher relations"
ON user_teacher_relations
FOR SELECT
USING (auth.uid() = student_id);

CREATE POLICY "Teachers can read their students' relations"
ON user_teacher_relations
FOR SELECT
USING (
  -- Teachers can see relations where they're the teacher
  auth.uid() = teacher_parent_id
  OR
  -- Students can see relations where they're the student
  auth.uid() = student_id
);

-- Backend (service role) creates/manages relationships
-- No user policies for INSERT/UPDATE/DELETE
-- Teachers/Parents cannot create their own relationships
-- (Prevents someone claiming to be a teacher)

CREATE POLICY "Prevent user insert on teacher relations"
ON user_teacher_relations
FOR INSERT
WITH CHECK (false);

CREATE POLICY "Prevent user delete on teacher relations"
ON user_teacher_relations
FOR DELETE
USING (false);

-- ============================================
-- Why we restrict INSERT/UPDATE/DELETE:
-- ============================================
-- If we allowed users to INSERT:
--   A hacker could: INSERT relations claiming to be a teacher
--   Result: Unauthorized access to student data!
--
-- Instead:
--   - Admin creates teacher accounts
--   - Admin links teachers to students
--   - System maintains integrity ✅
