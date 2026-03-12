-- ============================================
-- MS6-5: RLS Policies for USER_BADGES table
-- ============================================
-- Students can see their earned badges
-- Teachers/Parents can see their students' badges

CREATE POLICY "Students can read their own badges"
ON user_badges
FOR SELECT
USING (auth.uid() = student_id);

CREATE POLICY "Teachers can read their students' badges"
ON user_badges
FOR SELECT
USING (
  student_id IN (
    SELECT student_id
    FROM user_teacher_relations
    WHERE teacher_parent_id = auth.uid()
    AND is_active = true
  )
);

-- Backend (service role) creates badges
-- No user policies for INSERT/UPDATE/DELETE
CREATE POLICY "Prevent user insert on user badges"
ON user_badges
FOR INSERT
WITH CHECK (false);

CREATE POLICY "Prevent user delete on user badges"
ON user_badges
FOR DELETE
USING (false);
