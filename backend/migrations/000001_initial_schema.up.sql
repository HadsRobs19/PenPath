-- ============================================
-- Migration 000001: Initial Schema
-- Up: Create all 12 tables with relationships
-- ============================================

-- ============================================
-- 1. USERS TABLE (Students)
-- ============================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  age INT CHECK (age >= 3 AND age <= 12),
  grade_level VARCHAR(20),
  avatar_url TEXT,
  theme_preference VARCHAR(20) DEFAULT 'light',
  sound_enabled BOOLEAN DEFAULT TRUE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);

-- ============================================
-- 2. TEACHERS_PARENTS TABLE (Supervisors)
-- ============================================
CREATE TABLE teachers_parents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'parent',
  school_name VARCHAR(255),
  class_name VARCHAR(100),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_teachers_parents_email ON teachers_parents(email);
CREATE INDEX idx_teachers_parents_role ON teachers_parents(role);

-- ============================================
-- 3. USER_TEACHER_RELATIONS TABLE
-- ============================================
CREATE TABLE user_teacher_relations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  teacher_parent_id UUID NOT NULL REFERENCES teachers_parents(id) ON DELETE CASCADE,
  relationship_type VARCHAR(50) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(student_id, teacher_parent_id)
);

CREATE INDEX idx_user_teacher_relations_student_id ON user_teacher_relations(student_id);
CREATE INDEX idx_user_teacher_relations_teacher_id ON user_teacher_relations(teacher_parent_id);

-- ============================================
-- 4. LESSON_CATEGORIES TABLE
-- ============================================
CREATE TABLE lesson_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  color_code VARCHAR(7),
  icon_url TEXT,
  sequence_order INT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_lesson_categories_name ON lesson_categories(name);

-- ============================================
-- 5. LESSONS TABLE
-- ============================================
CREATE TABLE lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  letter CHAR(1) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category_id UUID NOT NULL REFERENCES lesson_categories(id) ON DELETE RESTRICT,
  difficulty_level INT DEFAULT 1 CHECK (difficulty_level >= 1 AND difficulty_level <= 5),
  estimated_duration_minutes INT,
  cover_image_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  version INT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(letter, category_id)
);

CREATE INDEX idx_lessons_letter ON lessons(letter);
CREATE INDEX idx_lessons_category_id ON lessons(category_id);
CREATE INDEX idx_lessons_difficulty_level ON lessons(difficulty_level);

-- ============================================
-- 6. LESSON_STEPS TABLE
-- ============================================
CREATE TABLE lesson_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  step_type VARCHAR(50) NOT NULL,
  sequence_order INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  instruction_text TEXT,
  audio_url TEXT,
  image_url TEXT,
  expected_duration_seconds INT,
  target_accuracy_percent INT DEFAULT 80 CHECK (target_accuracy_percent >= 0 AND target_accuracy_percent <= 100),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(lesson_id, sequence_order)
);

CREATE INDEX idx_lesson_steps_lesson_id ON lesson_steps(lesson_id);
CREATE INDEX idx_lesson_steps_step_type ON lesson_steps(step_type);

-- ============================================
-- 7. USER_PROGRESS TABLE
-- ============================================
CREATE TABLE user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lesson_step_id UUID NOT NULL REFERENCES lesson_steps(id) ON DELETE CASCADE,
  attempt_number INT NOT NULL DEFAULT 1,
  accuracy_percent DECIMAL(5,2) CHECK (accuracy_percent >= 0 AND accuracy_percent <= 100),
  time_spent_seconds INT,
  is_completed BOOLEAN DEFAULT FALSE,
  completion_timestamp TIMESTAMP,
  notes TEXT,
  device_id UUID,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_progress_student_id ON user_progress(student_id);
CREATE INDEX idx_user_progress_lesson_step_id ON user_progress(lesson_step_id);
CREATE INDEX idx_user_progress_created_at ON user_progress(created_at);
CREATE INDEX idx_user_progress_student_lesson ON user_progress(student_id, lesson_step_id);

-- ============================================
-- 8. LETTER_MASTERY TABLE
-- ============================================
CREATE TABLE letter_mastery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  letter CHAR(1) NOT NULL,
  perfect_attempts_count INT DEFAULT 0,
  is_mastered BOOLEAN DEFAULT FALSE,
  mastery_date TIMESTAMP,
  total_attempts INT DEFAULT 0,
  average_accuracy_percent DECIMAL(5,2),
  total_time_spent_seconds INT,
  most_missed_step_id UUID REFERENCES lesson_steps(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(student_id, letter)
);

CREATE INDEX idx_letter_mastery_student_id ON letter_mastery(student_id);
CREATE INDEX idx_letter_mastery_letter ON letter_mastery(letter);
CREATE INDEX idx_letter_mastery_is_mastered ON letter_mastery(is_mastered);

-- ============================================
-- 9. BADGES TABLE
-- ============================================
CREATE TABLE badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  icon_url TEXT,
  badge_type VARCHAR(50) NOT NULL,
  unlock_condition TEXT NOT NULL,
  points INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_badges_badge_type ON badges(badge_type);

-- ============================================
-- 10. USER_BADGES TABLE
-- ============================================
CREATE TABLE user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  progress_count INT DEFAULT 1,
  UNIQUE(student_id, badge_id)
);

CREATE INDEX idx_user_badges_student_id ON user_badges(student_id);
CREATE INDEX idx_user_badges_badge_id ON user_badges(badge_id);
CREATE INDEX idx_user_badges_earned_at ON user_badges(earned_at);

-- ============================================
-- 11. DEVICES TABLE
-- ============================================
CREATE TABLE devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_identifier VARCHAR(255) UNIQUE NOT NULL,
  device_type VARCHAR(50) NOT NULL,
  os_name VARCHAR(100),
  os_version VARCHAR(50),
  screen_size_inches DECIMAL(4,2),
  browser_name VARCHAR(100),
  browser_version VARCHAR(50),
  processor_info VARCHAR(255),
  ram_gb INT,
  storage_gb INT,
  supports_wifi BOOLEAN DEFAULT TRUE,
  supports_offline BOOLEAN DEFAULT FALSE,
  last_sync_timestamp TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_devices_device_type ON devices(device_type);
CREATE INDEX idx_devices_device_identifier ON devices(device_identifier);

-- ============================================
-- 12. USER_DEVICES TABLE
-- ============================================
CREATE TABLE user_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  device_id UUID NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
  device_nickname VARCHAR(255),
  is_primary_device BOOLEAN DEFAULT FALSE,
  last_used TIMESTAMP,
  pairing_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(student_id, device_id)
);

CREATE INDEX idx_user_devices_student_id ON user_devices(student_id);
CREATE INDEX idx_user_devices_device_id ON user_devices(device_id);
