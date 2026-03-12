-- ============================================
-- Migration 000001: Initial Schema
-- Down: Drop all 12 tables (CAREFUL - DESTRUCTIVE!)
-- ============================================

-- Drop tables in reverse order (respecting foreign key constraints)

DROP TABLE IF EXISTS user_devices CASCADE;
DROP TABLE IF EXISTS user_badges CASCADE;
DROP TABLE IF EXISTS user_progress CASCADE;
DROP TABLE IF EXISTS letter_mastery CASCADE;
DROP TABLE IF EXISTS user_teacher_relations CASCADE;
DROP TABLE IF EXISTS lesson_steps CASCADE;
DROP TABLE IF EXISTS devices CASCADE;
DROP TABLE IF EXISTS lessons CASCADE;
DROP TABLE IF EXISTS badges CASCADE;
DROP TABLE IF EXISTS lesson_categories CASCADE;
DROP TABLE IF EXISTS teachers_parents CASCADE;
DROP TABLE IF EXISTS users CASCADE;
