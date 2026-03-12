-- ============================================
-- ADD COLORS AND ANIMALS LESSONS
-- ============================================

-- will need to run in supabase
lesson categories
INSERT INTO lesson_categories (id, name, description)
VALUES
  ('cat00001-0000-0000-0000-000000000001', 'colors', 'Lessons focused on color-themed words'),
  ('cat00001-0000-0000-0000-000000000002', 'animals', 'Lessons focused on animal-themed words')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- COLORS LESSON
-- ============================================
INSERT INTO lessons (
  id,
  category_id,
  letter,
  title,
  description,
  difficulty_level,
  estimated_duration_minutes,
  is_active
) VALUES (
  'lesson01-0000-0000-0000-colors000001',
  'cat00001-0000-0000-0000-000000000001',
  'C',
  'Colors',
  'Learn to write color words in cursive',
  1,
  10,
  true
) ON CONFLICT (id) DO NOTHING;

-- Colors Reading Step
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
  'step0001-0000-0000-colors-reading1',
  'lesson01-0000-0000-0000-colors000001',
  'tracing',
  1,
  'colors-reading',
  'Trace the letters C and D to learn cursive color words.',
  120,
  80
) ON CONFLICT (id) DO NOTHING;

-- Colors Writing Step
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
  'step0002-0000-0000-colors-writing1',
  'lesson01-0000-0000-0000-colors000001',
  'reading',
  2,
  'colors-writing-step',
  'Read the cursive letters and type what you see.',
  90,
  85
) ON CONFLICT (id) DO NOTHING;

-- Colors Checkpoint Step
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
  'step0003-0000-0000-colors-checkpt',
  'lesson01-0000-0000-0000-colors000001',
  'checkpoint',
  3,
  'colors-checkpoint',
  'Write the letter in cursive without looking at the example.',
  120,
  90
) ON CONFLICT (id) DO NOTHING;

-- ============================================
-- ANIMALS LESSON
-- ============================================
INSERT INTO lessons (
  id,
  category_id,
  letter,
  title,
  description,
  difficulty_level,
  estimated_duration_minutes,
  is_active
) VALUES (
  'lesson02-0000-0000-0000-animals0001',
  'cat00001-0000-0000-0000-000000000002',
  'A',
  'Animals',
  'Learn to write animal words in cursive',
  2,
  15,
  true
) ON CONFLICT (id) DO NOTHING;

-- Animals Reading Step
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
  'step0004-0000-0000-animals-reading',
  'lesson02-0000-0000-0000-animals0001',
  'reading',
  1,
  'animals-reading',
  'Read the cursive sentence and type what you see.',
  120,
  85
) ON CONFLICT (id) DO NOTHING;

-- Animals Writing Step
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
  'step0005-0000-0000-animals-writing',
  'lesson02-0000-0000-0000-animals0001',
  'listening',
  2,
  'animals-writing',
  'Listen to the animal sounds and write what you hear in cursive.',
  150,
  80
) ON CONFLICT (id) DO NOTHING;

-- Animals Checkpoint Step
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
  'step0006-0000-0000-animals-checkpt',
  'lesson02-0000-0000-0000-animals0001',
  'checkpoint',
  3,
  'animals-checkpoint',
  'Listen to the sound and write the sentence in cursive.',
  180,
  90
) ON CONFLICT (id) DO NOTHING;

-- ============================================
-- BADGES FOR COLORS AND ANIMALS
-- ============================================
INSERT INTO badges (
  id,
  name,
  description,
  icon_url,
  badge_type,
  points,
  criteria_type,
  criteria_value
) VALUES (
  'badge001-0000-0000-0000-colors000001',
  'Colors Master',
  'Completed the Colors lesson!',
  NULL,
  'colors',
  100,
  'lesson_complete',
  'lesson01-0000-0000-0000-colors000001'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO badges (
  id,
  name,
  description,
  icon_url,
  badge_type,
  points,
  criteria_type,
  criteria_value
) VALUES (
  'badge002-0000-0000-0000-animals0001',
  'Animals Master',
  'Completed the Animals lesson!',
  NULL,
  'animals',
  150,
  'lesson_complete',
  'lesson02-0000-0000-0000-animals0001'
) ON CONFLICT (id) DO NOTHING;
