# PenPath Database Schema Documentation

## Overview

This document explains the PostgreSQL database schema for PenPath, a cursive learning application for K-5 students. The schema supports:

- Student learning and progress tracking
- Multi-step lessons organized by letter and category
- Detailed metrics (time, accuracy, attempts)
- Letter mastery tracking
- Achievement badge system
- Multi-device support (phones, tablets, Raspberry Pi)
- Teacher/Parent supervision and progress viewing

---

## Table of Contents

1. [Core Concepts](#core-concepts)
2. [Table Descriptions](#table-descriptions)
3. [Relationships](#relationships)
4. [Example Data](#example-data)
5. [Common Queries](#common-queries)
6. [Performance Considerations](#performance-considerations)

---

## Core Concepts

### Users (Students)

Students are the primary users learning cursive. Each student has:
- Account credentials (email/password)
- Profile info (name, age, grade level)
- Preferences (theme, sound settings)

### Lessons & Lesson Steps

Lessons are organized by:
- **Letter** (A, B, C, ..., Z)
- **Category** (Animals, Shapes, Numbers, Food, etc.)

Each lesson contains **sequential steps**:
1. Tracing - Draw the letter
2. Reading - Recognize the letter in words
3. Listening - Hear the letter sound
4. Checkpoint - Assessment/reinforcement

Steps must be completed in order.

### Progress Tracking

Every time a student completes a lesson step, we record:
- **Accuracy** (0-100%)
- **Time spent** (in seconds)
- **Attempt number** (1st, 2nd, 3rd attempt, etc.)
- **Completion status**

### Letter Mastery

A letter is **mastered** when:
- Student completes ALL steps with high accuracy
- They achieve X perfect attempts (e.g., 3 times)

### Badges

Two types of badges:
- **Achievements**: "Master Letter A", "Complete 10 lessons"
- **Bonuses**: "Perfect Score", "Speed Bonus", "Streak Bonus"

### Devices

Track device information for:
- Syncing progress across devices
- Optimizing UI for device type
- Supporting Raspberry Pi tablets
- Collecting device analytics

---

## Table Descriptions

### 1. `users` (Students)

**Purpose**: Store student account information and preferences

**Key Fields**:
- `id` - Unique identifier (UUID)
- `email` - Login email (unique)
- `first_name` / `last_name` - Student name
- `age` - Age in years (3-12)
- `grade_level` - K, 1st, 2nd, etc.
- `theme_preference` - UI theme choice
- `sound_enabled` - Whether to play audio
- `created_at` / `updated_at` - Timestamps

**Example**:
```
id: 550e8400-e29b-41d4-a716-446655440000
email: vintage@penpath.com
first_name: Vintage
last_name: Student
age: 7
grade_level: 2nd
theme_preference: colorful
sound_enabled: true
```

---

### 2. `teachers_parents` (Supervisors)

**Purpose**: Store teacher and parent accounts for progress supervision

**Key Fields**:
- `id` - Unique identifier
- `email` - Login email
- `role` - 'teacher', 'parent', 'guardian', 'admin'
- `school_name` - School/organization
- `class_name` - Classroom name

**Example**:
```
id: 660e8400-e29b-41d4-a716-446655440001
email: mrs.johnson@school.edu
first_name: Mrs.
last_name: Johnson
role: teacher
school_name: Lincoln Elementary
class_name: 2nd Grade A
```

---

### 3. `user_teacher_relations` (Student-Supervisor Links)

**Purpose**: Link students to their teachers/parents with relationship type

**Key Fields**:
- `student_id` - Which student
- `teacher_parent_id` - Which supervisor
- `relationship_type` - 'teacher', 'parent', 'guardian'

**Example**:
```
student_id: 550e8400-e29b-41d4-a716-446655440000 (Vintage)
teacher_parent_id: 660e8400-e29b-41d4-a716-446655440001 (Mrs. Johnson)
relationship_type: teacher
```

Vintage has TWO supervisors:
- Mrs. Johnson (teacher at school)
- Vintage's Mom (parent at home)

---

### 4. `lesson_categories` (Content Categories)

**Purpose**: Organize lessons by theme/category

**Key Fields**:
- `name` - Category name (unique)
- `description` - What the category covers
- `color_code` - Hex color for UI (#FF6B6B)
- `sequence_order` - Display order

**Examples**:
```
id: 770e8400-e29b-41d4-a716-446655440002
name: Animals
description: Learn letters through animal characters and sounds
color_code: #FF6B6B
sequence_order: 1

id: 770e8400-e29b-41d4-a716-446655440003
name: Shapes
description: Learn letters by tracing shapes
color_code: #4ECDC4
sequence_order: 2
```

---

### 5. `lessons` (Individual Lessons)

**Purpose**: Define individual lessons (Letter A with Animals, Letter A with Shapes, etc.)

**Key Fields**:
- `letter` - Single letter (A-Z)
- `title` - Lesson title
- `category_id` - Which category
- `difficulty_level` - 1 (easy) to 5 (hard)
- `estimated_duration_minutes` - How long it should take

**Examples**:
```
id: 880e8400-e29b-41d4-a716-446655440004
letter: A
title: Learn Letter A with Apple
category_id: 770e8400-e29b-41d4-a716-446655440002 (Animals)
difficulty_level: 1
estimated_duration_minutes: 5

id: 880e8400-e29b-41d4-a716-446655440005
letter: B
title: Learn Letter B with Bear
category_id: 770e8400-e29b-41d4-a716-446655440002 (Animals)
difficulty_level: 1
estimated_duration_minutes: 5
```

---

### 6. `lesson_steps` (Activities Within Lessons)

**Purpose**: Define the steps within each lesson (tracing, reading, listening, checkpoint)

**Key Fields**:
- `lesson_id` - Which lesson
- `step_type` - 'tracing', 'reading', 'listening', 'checkpoint'
- `sequence_order` - Must be done 1, 2, 3, 4...
- `title` - Step name
- `instruction_text` - What to do
- `audio_url` - Audio file (for listening steps)
- `image_url` - Reference image
- `expected_duration_seconds` - How long it should take
- `target_accuracy_percent` - Goal accuracy (default 80%)

**Example** (Letter A lesson steps):
```
Step 1:
  id: 990e8400-e29b-41d4-a716-446655440006
  lesson_id: 880e8400-e29b-41d4-a716-446655440004 (Letter A)
  step_type: tracing
  sequence_order: 1
  title: Trace the Letter A
  instruction_text: Trace the letter A using your stylus
  expected_duration_seconds: 60
  target_accuracy_percent: 85

Step 2:
  id: 990e8400-e29b-41d4-a716-446655440007
  lesson_id: 880e8400-e29b-41d4-a716-446655440004 (Letter A)
  step_type: reading
  sequence_order: 2
  title: Read Words with A
  instruction_text: Tap the words that start with A: Apple, Banana, Ant
  expected_duration_seconds: 45
  target_accuracy_percent: 90

Step 3:
  id: 990e8400-e29b-41d4-a716-446655440008
  lesson_id: 880e8400-e29b-41d4-a716-446655440004 (Letter A)
  step_type: listening
  sequence_order: 3
  title: Hear the Letter A Sound
  instruction_text: Listen to the sound and repeat
  audio_url: s3://penpath-audio/letter-a-sound.mp3
  expected_duration_seconds: 30
  target_accuracy_percent: 80

Step 4:
  id: 990e8400-e29b-41d4-a716-446655440009
  lesson_id: 880e8400-e29b-41d4-a716-446655440004 (Letter A)
  step_type: checkpoint
  sequence_order: 4
  title: Write Letter A from Memory
  instruction_text: Write the letter A without looking at the example
  expected_duration_seconds: 90
  target_accuracy_percent: 95
```

---

### 7. `user_progress` (Step-by-Step Progress)

**Purpose**: Track every attempt a student makes on every lesson step

**Key Fields**:
- `student_id` - Which student
- `lesson_step_id` - Which step they did
- `attempt_number` - 1st, 2nd, 3rd attempt
- `accuracy_percent` - How accurate (0-100%)
- `time_spent_seconds` - How long it took
- `is_completed` - Did they finish it?
- `completion_timestamp` - When did they complete it?

**Example** (Vintage doing Letter A Tracing):
```
Attempt 1:
  id: aa0e8400-e29b-41d4-a716-446655440010
  student_id: 550e8400-e29b-41d4-a716-446655440000 (Vintage)
  lesson_step_id: 990e8400-e29b-41d4-a716-446655440006 (Trace Letter A)
  attempt_number: 1
  accuracy_percent: 75.5
  time_spent_seconds: 45
  is_completed: true
  completion_timestamp: 2024-02-27 14:30:00

Attempt 2 (next day):
  id: aa0e8400-e29b-41d4-a716-446655440011
  student_id: 550e8400-e29b-41d4-a716-446655440000 (Vintage)
  lesson_step_id: 990e8400-e29b-41d4-a716-446655440006 (Trace Letter A)
  attempt_number: 2
  accuracy_percent: 88.0
  time_spent_seconds: 38
  is_completed: true
  completion_timestamp: 2024-02-28 14:25:00

Attempt 3 (next week):
  id: aa0e8400-e29b-41d4-a716-446655440012
  student_id: 550e8400-e29b-41d4-a716-446655440000 (Vintage)
  lesson_step_id: 990e8400-e29b-41d4-a716-446655440006 (Trace Letter A)
  attempt_number: 3
  accuracy_percent: 95.0 ← Perfect attempt!
  time_spent_seconds: 35
  is_completed: true
  completion_timestamp: 2024-03-06 14:20:00
```

---

### 8. `letter_mastery` (Letter Mastery Status)

**Purpose**: Track overall mastery of each letter

**Key Fields**:
- `student_id` - Which student
- `letter` - Which letter (A-Z)
- `perfect_attempts_count` - How many times they got 100% on ALL steps
- `is_mastered` - TRUE when they've mastered it
- `mastery_date` - When they achieved mastery
- `average_accuracy_percent` - Average across all attempts
- `most_missed_step_id` - Which step do they struggle with?

**Example** (Vintage's Letter A mastery):
```
id: bb0e8400-e29b-41d4-a716-446655440013
student_id: 550e8400-e29b-41d4-a716-446655440000 (Vintage)
letter: A
perfect_attempts_count: 3
is_mastered: true
mastery_date: 2024-03-06
total_attempts: 3
average_accuracy_percent: 86.17
total_time_spent_seconds: 450
most_missed_step_id: 990e8400-e29b-41d4-a716-446655440006 (Tracing - hardest for Vintage)
```

---

### 9. `badges` (Badge Definitions)

**Purpose**: Define what badges exist and how to earn them

**Key Fields**:
- `name` - Badge name (unique)
- `description` - What it means
- `badge_type` - 'achievement', 'milestone', 'bonus', 'streak'
- `unlock_condition` - How to earn it
- `points` - Optional gamification points

**Examples**:
```
Badge 1:
  id: cc0e8400-e29b-41d4-a716-446655440014
  name: Letter Master A
  description: Master the letter A
  badge_type: achievement
  unlock_condition: Perfect all steps of Letter A three times
  points: 50

Badge 2:
  id: cc0e8400-e29b-41d4-a716-446655440015
  name: Perfect Score
  description: Get 100% on any lesson
  badge_type: bonus
  unlock_condition: Score 100% accuracy on any complete lesson
  points: 25

Badge 3:
  id: cc0e8400-e29b-41d4-a716-446655440016
  name: 7-Day Streak
  description: Practice every day for a week
  badge_type: streak
  unlock_condition: Complete at least one lesson every day for 7 days
  points: 75

Badge 4:
  id: cc0e8400-e29b-41d4-a716-446655440017
  name: Speed Demon
  description: Complete a lesson in under 3 minutes
  badge_type: bonus
  unlock_condition: Finish all steps of a lesson in less than 3 minutes
  points: 30
```

---

### 10. `user_badges` (Badges Earned)

**Purpose**: Track which badges each student has earned

**Key Fields**:
- `student_id` - Which student
- `badge_id` - Which badge
- `earned_at` - When they earned it
- `progress_count` - For repeatable badges (e.g., 2 streaks of 7 days)

**Example** (Vintage's badges):
```
Badge 1:
  id: dd0e8400-e29b-41d4-a716-446655440018
  student_id: 550e8400-e29b-41d4-a716-446655440000 (Vintage)
  badge_id: cc0e8400-e29b-41d4-a716-446655440014 (Letter Master A)
  earned_at: 2024-03-06 15:30:00

Badge 2:
  id: dd0e8400-e29b-41d4-a716-446655440019
  student_id: 550e8400-e29b-41d4-a716-446655440000 (Vintage)
  badge_id: cc0e8400-e29b-41d4-a716-446655440015 (Perfect Score)
  earned_at: 2024-03-08 14:45:00
  progress_count: 3 ← Earned this badge 3 times

Badge 3:
  id: dd0e8400-e29b-41d4-a716-446655440020
  student_id: 550e8400-e29b-41d4-a716-446655440000 (Vintage)
  badge_id: cc0e8400-e29b-41d4-a716-446655440016 (7-Day Streak)
  earned_at: 2024-03-14 20:00:00
```

---

### 11. `devices` (Device Specifications)

**Purpose**: Store device information for syncing and analytics

**Key Fields**:
- `device_identifier` - Unique ID from device
- `device_type` - 'mobile', 'tablet', 'raspberry_pi', 'desktop'
- `os_name` / `os_version` - Operating system
- `screen_size_inches` - Screen size
- `processor_info` - CPU details
- `ram_gb` / `storage_gb` - Hardware specs
- `last_sync_timestamp` - Last time synced to cloud

**Example 1** (Vintage's Raspberry Pi tablet at school):
```
id: ee0e8400-e29b-41d4-a716-446655440021
device_identifier: RPi-PENPATH-001
device_type: raspberry_pi
os_name: Raspberry Pi OS (Linux)
os_version: 11
screen_size_inches: 7.0
browser_name: Chromium
browser_version: 120
processor_info: Raspberry Pi 4 Model B
ram_gb: 4
storage_gb: 64
supports_wifi: true
supports_offline: true
last_sync_timestamp: 2024-02-27 14:35:00
```

**Example 2** (Vintage's iPad at home):
```
id: ee0e8400-e29b-41d4-a716-446655440022
device_identifier: iPad-7TH-GEN-001
device_type: tablet
os_name: iOS
os_version: 17.2
screen_size_inches: 10.2
browser_name: Safari
browser_version: 17.2
processor_info: Apple A13 Bionic
ram_gb: 3
storage_gb: 64
supports_wifi: true
supports_offline: false
last_sync_timestamp: 2024-02-28 20:45:00
```

---

### 12. `user_devices` (User-Device Links)

**Purpose**: Link users to their devices with usage info

**Key Fields**:
- `student_id` - Which student
- `device_id` - Which device
- `device_nickname` - User-friendly name
- `is_primary_device` - Main device for this student?
- `last_used` - When last used

**Example** (Vintage's devices):
```
Link 1:
  id: ff0e8400-e29b-41d4-a716-446655440023
  student_id: 550e8400-e29b-41d4-a716-446655440000 (Vintage)
  device_id: ee0e8400-e29b-41d4-a716-446655440021 (School Raspberry Pi)
  device_nickname: School Tablet
  is_primary_device: true
  last_used: 2024-02-27 14:35:00

Link 2:
  id: ff0e8400-e29b-41d4-a716-446655440024
  student_id: 550e8400-e29b-41d4-a716-446655440000 (Vintage)
  device_id: ee0e8400-e29b-41d4-a716-446655440022 (iPad)
  device_nickname: Vintage's iPad
  is_primary_device: false
  last_used: 2024-02-28 20:45:00
```

---

## Relationships

### Entity Relationship Diagram (Text Format)

```
┌──────────────────────────────────────────────────────────────┐
│                        USERS (Students)                       │
├──────────────────────────────────────────────────────────────┤
│ id, email, first_name, last_name, age, grade_level, ...      │
└──────────────────────────────────────────────────────────────┘
        ↓ (one-to-many)        ↓                ↓
    (1:many)             (1:many)          (1:many)
        ↓                      ↓                ↓

┌──────────────────────┐  ┌──────────────┐  ┌──────────────────┐
│  USER_PROGRESS       │  │ LETTER_      │  │ USER_TEACHER_    │
│                      │  │ MASTERY      │  │ RELATIONS        │
│ Tracks every step    │  │              │  │                  │
│ attempt with metrics │  │ Tracks       │  │ Links students   │
└──────────────────────┘  │ mastery of   │  │ to teachers/     │
        ↑                 │ each letter  │  │ parents          │
        │                 └──────────────┘  └──────────────────┘
        │
        └─→ LESSON_STEPS ─→ LESSONS ─→ LESSON_CATEGORIES
            (Activities)   (Letter+   (Theme/Category)
            (Tracing,      Category)
             Reading,
             Listening)

┌──────────────────┐    ┌──────────────────┐
│ USER_BADGES      │    │ TEACHERS_PARENTS │
│                  │    │                  │
│ Track badges     │    │ Teacher/Parent   │
│ earned by        │    │ accounts         │
│ students         │    └──────────────────┘
└──────────────────┘
        ↑
        │
┌──────────────────┐
│ BADGES           │
│ Badge definitions│
│ (Achievement,    │
│  Bonus, Streak)  │
└──────────────────┘

┌──────────────────┐    ┌──────────────────┐
│ USER_DEVICES     │    │ DEVICES          │
│                  │    │                  │
│ Link users to    │    │ Device specs     │
│ devices          │    │ (mobile, tablet, │
└──────────────────┘    │ raspberry_pi)    │
                        └──────────────────┘
```

### Key Relationships

**One-to-Many** (1:∞):
- One user → many user_progress records
- One user → many letter_mastery records
- One user → many user_badges
- One user → many user_devices
- One lesson → many lesson_steps
- One lesson_step → many user_progress records
- One badge → many user_badges
- One device → many user_devices

**Many-to-Many** (∞:∞):
- users ↔ teachers_parents (via user_teacher_relations)
  - A student can have multiple teachers/parents
  - A teacher can supervise multiple students

---

## Example Data

### Scenario: Vintage's Learning Journey

**Student Profile**:
- Name: Vintage Student
- Age: 7
- Grade: 2nd
- Enrolled on: 2024-01-15

**Supervisors**:
- Mrs. Johnson (Teacher at Lincoln Elementary)
- Vintage's Mom (Parent)

**Learning Path**:
- Started with "Letter A with Animals" category
- Practiced 3 times over one week
- Achieved mastery on 2024-03-06
- Earned badges: "Letter Master A", "Perfect Score" (3x), "7-Day Streak"

**Devices**:
- School Raspberry Pi Tablet (primary)
- Home iPad (secondary)

**Progress Example** (Letter A, Step 1: Tracing):
```
Feb 27: Attempt 1 → 75.5% accuracy, 45 seconds
Feb 28: Attempt 2 → 88.0% accuracy, 38 seconds
Mar 06: Attempt 3 → 95.0% accuracy, 35 seconds ← Perfect!
```

**Letter Mastery**:
- Perfect Attempts: 3
- Mastered: Yes (as of 2024-03-06)
- Average Accuracy: 86.17%

**Badges Earned**:
1. Letter Master A (2024-03-06)
2. Perfect Score (2024-03-08, 3 times)
3. 7-Day Streak (2024-03-14)

---

## Common Queries

### Query 1: Get Vintage's Progress on Letter A

```sql
SELECT
  ls.title,
  ls.step_type,
  up.attempt_number,
  up.accuracy_percent,
  up.time_spent_seconds,
  up.completion_timestamp
FROM user_progress up
JOIN lesson_steps ls ON up.lesson_step_id = ls.id
JOIN lessons l ON ls.lesson_id = l.id
JOIN users u ON up.student_id = u.id
WHERE u.first_name = 'Vintage'
  AND l.letter = 'A'
ORDER BY ls.sequence_order, up.attempt_number;
```

**Result**: Shows all of Vintage's attempts on each step of Letter A

---

### Query 2: Check Which Letters Vintage Has Mastered

```sql
SELECT
  letter,
  perfect_attempts_count,
  mastery_date,
  average_accuracy_percent
FROM letter_mastery
WHERE student_id = (
  SELECT id FROM users WHERE first_name = 'Vintage'
)
AND is_mastered = TRUE
ORDER BY mastery_date DESC;
```

**Result**: Shows letters Vintage has mastered and when

---

### Query 3: Get Vintage's Badges

```sql
SELECT
  b.name,
  b.description,
  b.badge_type,
  ub.earned_at,
  ub.progress_count
FROM user_badges ub
JOIN badges b ON ub.badge_id = b.id
JOIN users u ON ub.student_id = u.id
WHERE u.first_name = 'Vintage'
ORDER BY ub.earned_at DESC;
```

**Result**: All badges Vintage has earned with dates

---

### Query 4: Find Vintage's Most Difficult Step

```sql
SELECT
  l.letter,
  l.title,
  ls.step_type,
  ls.title as step_title,
  AVG(up.accuracy_percent) as avg_accuracy,
  COUNT(*) as total_attempts
FROM user_progress up
JOIN lesson_steps ls ON up.lesson_step_id = ls.id
JOIN lessons l ON ls.lesson_id = l.id
JOIN users u ON up.student_id = u.id
WHERE u.first_name = 'Vintage'
GROUP BY l.letter, l.title, ls.step_type, ls.title
ORDER BY avg_accuracy ASC
LIMIT 5;
```

**Result**: Steps where Vintage struggles most (lowest accuracy)

---

### Query 5: Get Vintage's Teacher's Progress Dashboard

```sql
SELECT
  u.first_name,
  COUNT(DISTINCT lm.letter) as letters_mastered,
  COUNT(DISTINCT ub.badge_id) as badges_earned,
  AVG(up.accuracy_percent) as average_accuracy,
  MAX(up.completion_timestamp) as last_activity
FROM users u
LEFT JOIN letter_mastery lm ON u.id = lm.student_id AND lm.is_mastered = TRUE
LEFT JOIN user_badges ub ON u.id = ub.student_id
LEFT JOIN user_progress up ON u.id = up.student_id
WHERE u.id IN (
  SELECT student_id FROM user_teacher_relations
  WHERE teacher_parent_id = (
    SELECT id FROM teachers_parents WHERE email = 'mrs.johnson@school.edu'
  )
)
GROUP BY u.id, u.first_name;
```

**Result**: Dashboard showing each student's overall progress for the teacher

---

### Query 6: Find Which Steps Need Improvement

```sql
SELECT
  ls.title,
  ls.step_type,
  COUNT(*) as times_attempted,
  AVG(up.accuracy_percent) as average_accuracy,
  MIN(up.accuracy_percent) as lowest_score
FROM user_progress up
JOIN lesson_steps ls ON up.lesson_step_id = ls.id
JOIN users u ON up.student_id = u.id
WHERE u.first_name = 'Vintage'
GROUP BY ls.id, ls.title, ls.step_type
HAVING AVG(up.accuracy_percent) < 80
ORDER BY average_accuracy ASC;
```

**Result**: Steps where Vintage scores below 80% (needs help)

---

### Query 7: Get Vintage's Recent Activity (Last 7 Days)

```sql
SELECT
  u.first_name,
  l.letter,
  l.title,
  ls.step_type,
  up.accuracy_percent,
  up.completion_timestamp,
  ud.device_nickname
FROM user_progress up
JOIN users u ON up.student_id = u.id
JOIN lesson_steps ls ON up.lesson_step_id = ls.id
JOIN lessons l ON ls.lesson_id = l.id
LEFT JOIN devices d ON up.device_id = d.id
LEFT JOIN user_devices ud ON d.id = ud.device_id AND u.id = ud.student_id
WHERE u.first_name = 'Vintage'
  AND up.completion_timestamp >= CURRENT_DATE - INTERVAL '7 days'
ORDER BY up.completion_timestamp DESC;
```

**Result**: What Vintage did in the last 7 days, on which devices

---

### Query 8: Calculate Vintage's Current Streak

```sql
WITH daily_lessons AS (
  SELECT DISTINCT DATE(up.completion_timestamp) as lesson_date
  FROM user_progress up
  JOIN users u ON up.student_id = u.id
  WHERE u.first_name = 'Vintage'
  ORDER BY lesson_date DESC
)
SELECT
  COUNT(*) as current_streak_days
FROM daily_lessons dl
WHERE DATE(CURRENT_DATE) - dl.lesson_date <
  (SELECT COUNT(*) FROM daily_lessons);
```

**Result**: How many days in a row has Vintage practiced?

---

## Performance Considerations

### Indexes

The schema includes strategic indexes for common queries:

1. **Student lookups**: `idx_users_email`, `idx_user_progress_student_id`
2. **Lesson queries**: `idx_lessons_letter`, `idx_lesson_steps_lesson_id`
3. **Time-based queries**: `idx_user_progress_created_at`, `idx_user_badges_earned_at`
4. **Badge lookups**: `idx_user_badges_student_id`
5. **Device tracking**: `idx_user_devices_student_id`

### Query Optimization Tips

1. **Always filter by student_id first** - Reduces data set quickly
2. **Use lesson_id to find steps** - Don't search across all lessons
3. **Cache badge definitions** - Badges don't change frequently
4. **Batch progress inserts** - Multiple attempts at once
5. **Archive old progress** - Move data older than 6 months to archive table

### Recommended Materialized Views (Future)

```sql
-- Student summary view
CREATE MATERIALIZED VIEW student_summary AS
SELECT ...
REFRESH MATERIALIZED VIEW student_summary;

-- Teacher dashboard view
CREATE MATERIALIZED VIEW teacher_dashboard AS
SELECT ...
```

---

## Constraints & Data Integrity

### Foreign Key Constraints

All relationships enforce referential integrity:
- Delete user → all progress records deleted
- Delete lesson → all steps deleted
- Delete badge → user_badges records handle deletion

### Check Constraints

- `accuracy_percent` must be 0-100
- `age` must be 3-12
- `difficulty_level` must be 1-5
- `attempt_number` must be >= 1

### Unique Constraints

- One user per email
- One teacher/parent per email
- One mastery record per student+letter
- One badge per student+badge

---

## Future Enhancements

1. **Lesson Content Versioning** - Track lesson updates over time
2. **Custom Lesson Creation** - Teachers create custom lessons
3. **Peer Comparison** - Aggregate anonymized stats
4. **AI-Powered Recommendations** - Suggest next lessons
5. **Accessibility Metrics** - Track user needs & accommodations
6. **Offline Sync Queue** - Handle offline progress
7. **Achievement Levels** - Bronze/Silver/Gold for badges
8. **Time Zone Awareness** - Store timezone with timestamps

---

## Summary

This schema supports a comprehensive cursive learning platform with:

✅ Multi-step lessons organized by letter and category
✅ Detailed progress tracking with accuracy, time, and attempts
✅ Letter mastery system
✅ Achievement badge system
✅ Multi-device support
✅ Teacher/parent supervision
✅ Performance optimization via indexes

The design prioritizes **data integrity**, **query performance**, and **extensibility** for future features.
