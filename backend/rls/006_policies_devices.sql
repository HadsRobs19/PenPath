-- ============================================
-- MS6-5: RLS Policies for USER_DEVICES table
-- ============================================
-- Students can see their own devices
-- Teachers/Parents can see their students' devices

CREATE POLICY "Students can read their own devices"
ON user_devices
FOR SELECT
USING (auth.uid() = student_id);

CREATE POLICY "Teachers can read their students' devices"
ON user_devices
FOR SELECT
USING (
  student_id IN (
    SELECT student_id
    FROM user_teacher_relations
    WHERE teacher_parent_id = auth.uid()
    AND is_active = true
  )
);

-- Students can manage their own devices
CREATE POLICY "Students can insert their own devices"
ON user_devices
FOR INSERT
WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can update their own devices"
ON user_devices
FOR UPDATE
USING (auth.uid() = student_id)
WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can delete their own devices"
ON user_devices
FOR DELETE
USING (auth.uid() = student_id);
