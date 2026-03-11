-- ============================================
-- PenPath Example Data Script
-- MS6-3: Example Data for Vintage Student
-- ============================================
-- This script populates the database with example data
-- showing Vintage's learning journey through the PenPath app

-- ============================================
-- INSERT USERS (Students)
-- ============================================
INSERT INTO users (
  id,
  email,
  password_hash,
  first_name,
  last_name,
  age,
  grade_level,
  theme_preference,
  sound_enabled,
  created_at
) VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  'vintage@penpath.com',
  '$2b$10$hashed_password_here',
  'Vintage',
  'Student',
  7,
  '2nd',
  'colorful',
  true,
  '2024-01-15 08:00:00'
);

-- ============================================
-- INSERT TEACHERS_PARENTS (Supervisors)
-- ============================================
INSERT INTO teachers_parents (
  id,
  email,
  password_hash,
  first_name,
  last_name,
  role,
  school_name,
  class_name
) VALUES (
  '660e8400-e29b-41d4-a716-446655440001',
  'mrs.johnson@school.edu',
  '$2b$10$hashed_password_here',
  'Mrs.',
  'Johnson',
  'teacher',
  'Lincoln Elementary',
  '2nd Grade A'
);

INSERT INTO teachers_parents (
  id,
  email,
  password_hash,
  first_name,
  last_name,
  role
) VALUES (
  '660e8400-e29b-41d4-a716-446655440002',
  'vintage.mom@email.com',
  '$2b$10$hashed_password_here',
  'Vintage''s',
  'Mom',
  'parent'
);

-- ============================================
-- INSERT USER_TEACHER_RELATIONS
-- ============================================
INSERT INTO user_teacher_relations (
  student_id,
  teacher_parent_id,
  relationship_type
) VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  '660e8400-e29b-41d4-a716-446655440001',
  'teacher'
);

INSERT INTO user_teacher_relations (
  student_id,
  teacher_parent_id,
  relationship_type
) VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  '660e8400-e29b-41d4-a716-446655440002',
  'parent'
);

-- ============================================
-- INSERT LESSON_CATEGORIES
-- ============================================
INSERT INTO lesson_categories (
  id,
  name,
  description,
  color_code,
  sequence_order
) VALUES (
  '770e8400-e29b-41d4-a716-446655440002',
  'Animals',
  'Learn letters through animal characters and sounds',
  '#FF6B6B',
  1
);

INSERT INTO lesson_categories (
  id,
  name,
  description,
  color_code,
  sequence_order
) VALUES (
  '770e8400-e29b-41d4-a716-446655440003',
  'Shapes',
  'Learn letters by tracing shapes',
  '#4ECDC4',
  2
);

-- ============================================
-- INSERT LESSONS
-- ============================================
INSERT INTO lessons (
  id,
  letter,
  title,
  description,
  category_id,
  difficulty_level,
  estimated_duration_minutes
) VALUES (
  '880e8400-e29b-41d4-a716-446655440004',
  'A',
  'Learn Letter A with Apple',
  'Meet Apple the Apple! Learn to trace and write the letter A.',
  '770e8400-e29b-41d4-a716-446655440002',
  1,
  5
);

INSERT INTO lessons (
  id,
  letter,
  title,
  description,
  category_id,
  difficulty_level,
  estimated_duration_minutes
) VALUES (
  '880e8400-e29b-41d4-a716-446655440005',
  'B',
  'Learn Letter B with Bear',
  'Meet Bear the Bear! Learn to trace and write the letter B.',
  '770e8400-e29b-41d4-a716-446655440002',
  1,
  5
);

-- ============================================
-- INSERT LESSON_STEPS
-- ============================================
-- Letter A Steps
INSERT INTO lesson_steps (
  id,
  lesson_id,
  step_type,
  sequence_order,
  title,
  instruction_text,
  expected_duration_seconds,
  target_accuracy_percent
) VALUES (
  '990e8400-e29b-41d4-a716-446655440006',
  '880e8400-e29b-41d4-a716-446655440004',
  'tracing',
  1,
  'Trace the Letter A',
  'Use your stylus to trace the letter A. Follow the blue line carefully.',
  60,
  85
);

INSERT INTO lesson_steps (
  id,
  lesson_id,
  step_type,
  sequence_order,
  title,
  instruction_text,
  expected_duration_seconds,
  target_accuracy_percent
) VALUES (
  '990e8400-e29b-41d4-a716-446655440007',
  '880e8400-e29b-41d4-a716-446655440004',
  'reading',
  2,
  'Read Words with A',
  'Tap the words that start with A. Choose from: Apple, Banana, Ant, Dog',
  45,
  90
);

INSERT INTO lesson_steps (
  id,
  lesson_id,
  step_type,
  sequence_order,
  title,
  instruction_text,
  audio_url,
  expected_duration_seconds,
  target_accuracy_percent
) VALUES (
  '990e8400-e29b-41d4-a716-446655440008',
  '880e8400-e29b-41d4-a716-446655440004',
  'listening',
  3,
  'Hear the Letter A Sound',
  'Listen to the sound of the letter A and repeat it out loud.',
  's3://penpath-audio/letter-a-sound.mp3',
  30,
  80
);

INSERT INTO lesson_steps (
  id,
  lesson_id,
  step_type,
  sequence_order,
  title,
  instruction_text,
  expected_duration_seconds,
  target_accuracy_percent
) VALUES (
  '990e8400-e29b-41d4-a716-446655440009',
  '880e8400-e29b-41d4-a716-446655440004',
  'checkpoint',
  4,
  'Write Letter A from Memory',
  'Now write the letter A without looking at the example. Show what you learned!',
  90,
  95
);

-- ============================================
-- INSERT USER_PROGRESS
-- ============================================
-- Vintage's Attempt 1 on Letter A Tracing (Feb 27)
INSERT INTO user_progress (
  id,
  student_id,
  lesson_step_id,
  attempt_number,
  accuracy_percent,
  time_spent_seconds,
  is_completed,
  completion_timestamp
) VALUES (
  'aa0e8400-e29b-41d4-a716-446655440010',
  '550e8400-e29b-41d4-a716-446655440000',
  '990e8400-e29b-41d4-a716-446655440006',
  1,
  75.5,
  45,
  true,
  '2024-02-27 14:30:00'
);

-- Vintage's Attempt 2 on Letter A Tracing (Feb 28)
INSERT INTO user_progress (
  id,
  student_id,
  lesson_step_id,
  attempt_number,
  accuracy_percent,
  time_spent_seconds,
  is_completed,
  completion_timestamp
) VALUES (
  'aa0e8400-e29b-41d4-a716-446655440011',
  '550e8400-e29b-41d4-a716-446655440000',
  '990e8400-e29b-41d4-a716-446655440006',
  2,
  88.0,
  38,
  true,
  '2024-02-28 14:25:00'
);

-- Vintage's Attempt 3 on Letter A Tracing (Mar 6) - PERFECT!
INSERT INTO user_progress (
  id,
  student_id,
  lesson_step_id,
  attempt_number,
  accuracy_percent,
  time_spent_seconds,
  is_completed,
  completion_timestamp
) VALUES (
  'aa0e8400-e29b-41d4-a716-446655440012',
  '550e8400-e29b-41d4-a716-446655440000',
  '990e8400-e29b-41d4-a716-446655440006',
  3,
  95.0,
  35,
  true,
  '2024-03-06 14:20:00'
);

-- Vintage's Reading Step (All Perfect)
INSERT INTO user_progress (
  id,
  student_id,
  lesson_step_id,
  attempt_number,
  accuracy_percent,
  time_spent_seconds,
  is_completed,
  completion_timestamp
) VALUES (
  'aa0e8400-e29b-41d4-a716-446655440100',
  '550e8400-e29b-41d4-a716-446655440000',
  '990e8400-e29b-41d4-a716-446655440007',
  1,
  92.0,
  42,
  true,
  '2024-02-27 14:35:00'
);

-- Vintage's Listening Step
INSERT INTO user_progress (
  id,
  student_id,
  lesson_step_id,
  attempt_number,
  accuracy_percent,
  time_spent_seconds,
  is_completed,
  completion_timestamp
) VALUES (
  'aa0e8400-e29b-41d4-a716-446655440101',
  '550e8400-e29b-41d4-a716-446655440000',
  '990e8400-e29b-41d4-a716-446655440008',
  1,
  88.0,
  28,
  true,
  '2024-02-27 14:38:00'
);

-- Vintage's Checkpoint Step
INSERT INTO user_progress (
  id,
  student_id,
  lesson_step_id,
  attempt_number,
  accuracy_percent,
  time_spent_seconds,
  is_completed,
  completion_timestamp
) VALUES (
  'aa0e8400-e29b-41d4-a716-446655440102',
  '550e8400-e29b-41d4-a716-446655440000',
  '990e8400-e29b-41d4-a716-446655440009',
  1,
  85.0,
  75,
  true,
  '2024-02-27 15:00:00'
);

-- ============================================
-- INSERT LETTER_MASTERY
-- ============================================
INSERT INTO letter_mastery (
  id,
  student_id,
  letter,
  perfect_attempts_count,
  is_mastered,
  mastery_date,
  total_attempts,
  average_accuracy_percent,
  total_time_spent_seconds
) VALUES (
  'bb0e8400-e29b-41d4-a716-446655440013',
  '550e8400-e29b-41d4-a716-446655440000',
  'A',
  3,
  true,
  '2024-03-06',
  3,
  86.17,
  450
);

-- ============================================
-- INSERT BADGES
-- ============================================
INSERT INTO badges (
  id,
  name,
  description,
  badge_type,
  unlock_condition,
  points
) VALUES (
  'cc0e8400-e29b-41d4-a716-446655440014',
  'Letter Master A',
  'You mastered the letter A!',
  'achievement',
  'Perfect all steps of Letter A three times',
  50
);

INSERT INTO badges (
  id,
  name,
  description,
  badge_type,
  unlock_condition,
  points
) VALUES (
  'cc0e8400-e29b-41d4-a716-446655440015',
  'Perfect Score',
  'You got 100% accuracy on a lesson!',
  'bonus',
  'Score 100% accuracy on any complete lesson',
  25
);

INSERT INTO badges (
  id,
  name,
  description,
  badge_type,
  unlock_condition,
  points
) VALUES (
  'cc0e8400-e29b-41d4-a716-446655440016',
  '7-Day Streak',
  'You practiced every day for a week!',
  'streak',
  'Complete at least one lesson every day for 7 days',
  75
);

INSERT INTO badges (
  id,
  name,
  description,
  badge_type,
  unlock_condition,
  points
) VALUES (
  'cc0e8400-e29b-41d4-a716-446655440017',
  'Speed Demon',
  'You completed a lesson in under 3 minutes!',
  'bonus',
  'Finish all steps of a lesson in less than 3 minutes',
  30
);

-- ============================================
-- INSERT USER_BADGES
-- ============================================
INSERT INTO user_badges (
  id,
  student_id,
  badge_id,
  earned_at,
  progress_count
) VALUES (
  'dd0e8400-e29b-41d4-a716-446655440018',
  '550e8400-e29b-41d4-a716-446655440000',
  'cc0e8400-e29b-41d4-a716-446655440014',
  '2024-03-06 15:30:00',
  1
);

INSERT INTO user_badges (
  id,
  student_id,
  badge_id,
  earned_at,
  progress_count
) VALUES (
  'dd0e8400-e29b-41d4-a716-446655440019',
  '550e8400-e29b-41d4-a716-446655440000',
  'cc0e8400-e29b-41d4-a716-446655440015',
  '2024-03-08 14:45:00',
  3
);

INSERT INTO user_badges (
  id,
  student_id,
  badge_id,
  earned_at,
  progress_count
) VALUES (
  'dd0e8400-e29b-41d4-a716-446655440020',
  '550e8400-e29b-41d4-a716-446655440000',
  'cc0e8400-e29b-41d4-a716-446655440016',
  '2024-03-14 20:00:00',
  1
);

-- ============================================
-- INSERT DEVICES
-- ============================================
INSERT INTO devices (
  id,
  device_identifier,
  device_type,
  os_name,
  os_version,
  screen_size_inches,
  browser_name,
  browser_version,
  processor_info,
  ram_gb,
  storage_gb,
  supports_wifi,
  supports_offline,
  last_sync_timestamp
) VALUES (
  'ee0e8400-e29b-41d4-a716-446655440021',
  'RPi-PENPATH-001',
  'raspberry_pi',
  'Raspberry Pi OS (Linux)',
  '11',
  7.0,
  'Chromium',
  '120',
  'Raspberry Pi 4 Model B',
  4,
  64,
  true,
  true,
  '2024-02-27 14:35:00'
);

INSERT INTO devices (
  id,
  device_identifier,
  device_type,
  os_name,
  os_version,
  screen_size_inches,
  browser_name,
  browser_version,
  processor_info,
  ram_gb,
  storage_gb,
  supports_wifi,
  supports_offline,
  last_sync_timestamp
) VALUES (
  'ee0e8400-e29b-41d4-a716-446655440022',
  'iPad-7TH-GEN-001',
  'tablet',
  'iOS',
  '17.2',
  10.2,
  'Safari',
  '17.2',
  'Apple A13 Bionic',
  3,
  64,
  true,
  false,
  '2024-02-28 20:45:00'
);

-- ============================================
-- INSERT USER_DEVICES
-- ============================================
INSERT INTO user_devices (
  id,
  student_id,
  device_id,
  device_nickname,
  is_primary_device,
  last_used
) VALUES (
  'ff0e8400-e29b-41d4-a716-446655440023',
  '550e8400-e29b-41d4-a716-446655440000',
  'ee0e8400-e29b-41d4-a716-446655440021',
  'School Tablet',
  true,
  '2024-02-27 14:35:00'
);

INSERT INTO user_devices (
  id,
  student_id,
  device_id,
  device_nickname,
  is_primary_device,
  last_used
) VALUES (
  'ff0e8400-e29b-41d4-a716-446655440024',
  '550e8400-e29b-41d4-a716-446655440000',
  'ee0e8400-e29b-41d4-a716-446655440022',
  'Vintage''s iPad',
  false,
  '2024-02-28 20:45:00'
);

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Run these to verify the data was inserted correctly

-- Check Vintage's basic info
-- SELECT * FROM users WHERE first_name = 'Vintage';

-- Check Vintage's progress
-- SELECT * FROM user_progress
-- WHERE student_id = '550e8400-e29b-41d4-a716-446655440000'
-- ORDER BY created_at;

-- Check Vintage's badges
-- SELECT b.name, ub.earned_at
-- FROM user_badges ub
-- JOIN badges b ON ub.badge_id = b.id
-- WHERE ub.student_id = '550e8400-e29b-41d4-a716-446655440000'
-- ORDER BY ub.earned_at DESC;

-- Check letter mastery
-- SELECT * FROM letter_mastery
-- WHERE student_id = '550e8400-e29b-41d4-a716-446655440000';

-- ============================================
-- END OF EXAMPLE DATA
-- ============================================