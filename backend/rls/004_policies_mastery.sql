-- ============================================
-- MS6-5: RLS Policies for LETTER_MASTERY table
-- ============================================
-- Students can see their mastery status
-- Teachers/Parents can see their students' mastery

CREATE POLICY "Students can read their own letter mastery"
ON letter_mastery
FOR SELECT
USING (auth.uid() = student_id);

CREATE POLICY "Teachers can read their students' letter mastery"
ON letter_mastery
FOR SELECT
USING (
  student_id IN (
    SELECT student_id
    FROM user_teacher_relations
    WHERE teacher_parent_id = auth.uid()
    AND is_active = true
  )
);

-- Backend (service role) creates/updates mastery
-- No user policies for INSERT/UPDATE needed
CREATE POLICY "Prevent user insert on letter mastery"
ON letter_mastery
FOR INSERT
WITH CHECK (false);

CREATE POLICY "Prevent user delete on letter mastery"
ON letter_mastery
FOR DELETE
USING (false);
