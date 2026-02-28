-- ============================================
-- MS6-5: Enable Row Level Security (RLS)
-- Step 1: Enable RLS on user-specific tables
-- ============================================
-- RLS acts as a gatekeeper: users can only see rows
-- they're allowed to see based on policies

-- WHO: Supabase RLS engine
-- WHAT: Enable security on 6 tables
-- WHERE: In Supabase PostgreSQL
-- WHEN: Before creating policies
-- WHY: Foundation for row-level access control

-- ============================================
-- Enable RLS on USER table
-- ============================================
-- Students' personal data (email, password hash, preferences)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Enable RLS on USER_PROGRESS table
-- ============================================
-- Students' learning progress (attempts, accuracy, time spent)
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Enable RLS on LETTER_MASTERY table
-- ============================================
-- Students' mastery status (which letters they've mastered)
ALTER TABLE letter_mastery ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Enable RLS on USER_BADGES table
-- ============================================
-- Students' earned badges (achievements)
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Enable RLS on USER_DEVICES table
-- ============================================
-- Students' devices (iPad, Raspberry Pi, etc.)
ALTER TABLE user_devices ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Enable RLS on USER_TEACHER_RELATIONS table
-- ============================================
-- Links between students and their supervisors
ALTER TABLE user_teacher_relations ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Tables that DON'T need RLS (public/shared data)
-- ============================================
-- lessons - Everyone reads same lessons (public)
-- lesson_steps - Everyone reads same steps (public)
-- lesson_categories - Everyone reads same categories (public)
-- badges - Badge definitions are public (shared)
-- devices - Device specs are public (shared)
-- teachers_parents - Can be queried by teachers/system
-- Note: These tables can have RLS if you want, but
-- they don't need it since data is shared

-- ============================================
-- Verification
-- ============================================
-- To check if RLS is enabled, run:
-- SELECT tablename, rowsecurity FROM pg_tables
-- WHERE schemaname = 'public'
-- AND tablename IN ('users', 'user_progress', 'letter_mastery',
--                    'user_badges', 'user_devices', 'user_teacher_relations');
--
-- Output should show rowsecurity = true for all 6 tables
