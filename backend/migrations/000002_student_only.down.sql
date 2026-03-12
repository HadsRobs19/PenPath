-- ============================================
-- Migration 000002 ROLLBACK
-- Run this only if you need to undo the student-only migration.
-- ============================================

-- Remove username from users
ALTER TABLE users DROP COLUMN IF EXISTS username;
ALTER TABLE users ALTER COLUMN email SET NOT NULL;

-- Restore parent/teacher tables
-- (You will need to re-run the original schema.sql to restore
--  teachers_parents and user_teacher_relations fully)
