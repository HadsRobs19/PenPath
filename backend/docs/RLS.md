# Row Level Security (RLS) Guide

## Overview

**Row Level Security (RLS)** is Supabase's built-in security feature that automatically restricts database access at the row level.

**Simple Analogy:**
- **Without RLS:** Like a door with one lock (user logged in or not)
- **With RLS:** Like a building with per-room locks (user logged in AND can access this data)

---

## The 5 W's of RLS

### WHO Uses RLS?
- **Students** - Access only their own learning data
- **Teachers/Parents** - Access their students' data
- **Backend API** - Uses service role (full access)
- **Frontend App** - Uses anon key (restricted by RLS)

### WHAT Is RLS?
RLS is a set of **policies** that say:
```
Query: SELECT * FROM user_progress
RLS: "Who are you?"
User: "I'm Vintage (ID: 550e...)"
RLS: "Are you in student_id column?"
      YES → Show rows ✅
      NO → Hide rows ❌
```

### WHERE Is RLS Applied?
```
✅ Protected tables (user data):
   - users (personal info)
   - user_progress (learning data)
   - letter_mastery (mastery status)
   - user_badges (achievements)
   - user_devices (device info)
   - user_teacher_relations (relationships)

❌ Public tables (shared data):
   - lessons (everyone reads)
   - lesson_steps (everyone reads)
   - badges (definitions, shared)
   - lesson_categories (shared)
   - devices (specs, shared)
```

### WHEN Does RLS Apply?
```
When a query is executed:
Query → Database receives it
  ↓
RLS Engine: "Does this user have permission?"
  ↓
If YES: Execute query ✅
If NO: Return empty/error ❌
```

### WHY Use RLS?

**Without RLS:**
```sql
SELECT * FROM user_progress;
-- Returns: ALL students' data (10,000 rows!)
-- Vulnerable to: Data breach, privacy violation
```

**With RLS:**
```sql
SELECT * FROM user_progress;
-- Returns: Only current user's progress
-- Protected: ✅ Secure by default
```

---

## How RLS Policies Work

### Policy Structure

```sql
CREATE POLICY "Policy Name"
ON table_name
FOR action  -- SELECT, INSERT, UPDATE, DELETE
USING (condition)  -- For SELECT, UPDATE, DELETE
WITH CHECK (condition);  -- For INSERT, UPDATE
```

### Example 1: Student Reading Their Own Progress

```sql
CREATE POLICY "Students can read their own progress"
ON user_progress
FOR SELECT
USING (auth.uid() = student_id);
```

**What happens:**
```
Vintage (ID: 550e...) runs:
SELECT * FROM user_progress

RLS checks each row:
- Row 1: student_id = 550e... ✅ Show it
- Row 2: student_id = 888f... ❌ Hide it
- Row 3: student_id = 550e... ✅ Show it

Result: Only Vintage's rows returned
```

### Example 2: Teacher Reading Student's Progress

```sql
CREATE POLICY "Teachers can read their students' progress"
ON user_progress
FOR SELECT
USING (
  -- Check: Is this student in my student list?
  student_id IN (
    SELECT student_id
    FROM user_teacher_relations
    WHERE teacher_parent_id = auth.uid()
  )
);
```

**What happens:**
```
Mrs. Johnson (teacher) runs:
SELECT * FROM user_progress

RLS checks each row:
1. "Is Vintage my student?"
   → Check user_teacher_relations
   → YES → Show Vintage's rows ✅

2. "Is Unknown_Student123 my student?"
   → Check user_teacher_relations
   → NO → Hide rows ❌

Result: Only her students' rows returned
```

---

## Policies By Table

### 1. USERS Table

**Policies:**
- ✅ `SELECT`: Users read their own profile
- ✅ `UPDATE`: Users update their own profile
- ❌ `INSERT`: Disabled (auth system creates users)
- ❌ `DELETE`: Disabled (account deletion via auth)

**Example:**
```
Vintage can see/edit only Vintage's row
Teacher123 cannot see Vintage's row
```

### 2. USER_PROGRESS Table

**Policies:**
- ✅ `SELECT`: Students read their own, teachers read students'
- ✅ `INSERT`: Students create their own progress
- ✅ `UPDATE`: Students update their own progress
- ❌ `DELETE`: Disabled (keep learning history)

**Example:**
```
Vintage completes a lesson:
  Backend INSERT into user_progress (student_id=Vintage)
  RLS: "Is student_id = Vintage?" YES → ✅

Hacker tries:
  INSERT into user_progress (student_id=SomeoneElse)
  RLS: "Is student_id = Hacker?" NO → ❌ Blocked!
```

### 3. LETTER_MASTERY Table

**Policies:**
- ✅ `SELECT`: Students read their own, teachers read students'
- ❌ `INSERT`: Disabled (backend creates)
- ❌ `UPDATE`: Disabled (backend updates)
- ❌ `DELETE`: Disabled

**Example:**
```
Vintage can see when she mastered Letter A
Mrs. Johnson can see when all her students mastered Letter A
```

### 4. USER_BADGES Table

**Policies:**
- ✅ `SELECT`: Students read their own, teachers read students'
- ❌ `INSERT`: Disabled (backend awards)
- ❌ `DELETE`: Disabled (keep badge history)

### 5. USER_DEVICES Table

**Policies:**
- ✅ `SELECT`: Students read their own, teachers read students'
- ✅ `INSERT`: Students register their own devices
- ✅ `UPDATE`: Students update their own devices
- ✅ `DELETE`: Students remove their own devices

**Example:**
```
Vintage can see her iPad and Raspberry Pi
She can change device nickname: "My iPad" → "School iPad"
She can remove a device

Mrs. Johnson can see what devices Vintage uses
```

### 6. USER_TEACHER_RELATIONS Table

**Policies:**
- ✅ `SELECT`: Students read their relations, teachers read theirs
- ❌ `INSERT`: Disabled (admin creates relationships)
- ❌ `DELETE`: Disabled (admin manages)

**Why not allow INSERT?**
```
If allowed:
  Hacker: "INSERT WHERE teacher_parent_id = AdminID"
  Result: Hacker poses as admin! ❌

Actual approach:
  Admin creates relationships
  System maintains integrity ✅
```

---

## Service Role Access

### What Is Service Role?

Service role is a **special key** for the backend API:
- **Bypasses all RLS policies**
- **Has full database access**
- **Never exposed to frontend**
- **Only used on secure backend server**

### Keys Comparison

```
┌─────────────────┬─────────────────┬────────────────┐
│ Key Type        │ What It Can Do   │ Where It Lives │
├─────────────────┼─────────────────┼────────────────┤
│ ANON KEY        │ Limited (RLS)    │ Frontend (OK)  │
│ SERVICE ROLE    │ Full access      │ Backend (🔒)   │
│ JWT Token       │ Identifies user  │ Frontend (OK)  │
└─────────────────┴─────────────────┴────────────────┘
```

### How Backend Uses Service Role

```
Frontend:
  User logs in
  ↓
Backend:
  Receives anon key + user info
  ↓
Backend API operation:
  Uses SERVICE ROLE key
  Bypasses RLS
  Performs business logic
  ↓
Example: User completes lesson
  - Create user_progress row (INSERT with service role)
  - Update letter_mastery row (UPDATE with service role)
  - Check if badge earned (queries with service role)
  - Return results to frontend
```

### Service Role Keys In Code

**Never do this:**
```javascript
// ❌ DANGER: Don't expose service key to frontend
const SUPABASE_SERVICE_KEY = "...";  // In frontend code
const client = supabase.createClient(url, SUPABASE_SERVICE_KEY);
```

**Always do this:**
```javascript
// ✅ SAFE: Service key only on backend
// backend/.env.local
SUPABASE_SERVICE_KEY = "..."

// backend/api/lesson.js
const adminClient = createClient(url, process.env.SUPABASE_SERVICE_KEY);
// Use this for business logic only
```

---

## Testing RLS Policies

### Test Setup

Three test users:
```
1. Vintage (Student)
   ID: 550e8400-e29b-41d4-a716-446655440000
   Can read/write: own progress, own badges, own devices

2. Mrs. Johnson (Teacher)
   ID: 660e8400-e29b-41d4-a716-446655440001
   Can read: Vintage's data (via teacher_relations)

3. Other_Student (Different student)
   ID: 888e8400-e29b-41d4-a716-446655440003
   Can read/write: own data ONLY
   Cannot read: Vintage's data
```

### Test Scenario 1: Student Reading Own Data

```sql
-- Logged in as: Vintage (550e...)
SELECT * FROM user_progress;

-- RLS Result: Returns only Vintage's progress ✅
```

### Test Scenario 2: Student Cannot Read Other's Data

```sql
-- Logged in as: Vintage (550e...)
-- Trying to read: Other_Student's progress

SELECT * FROM user_progress
WHERE student_id = '888e8400-e29b-41d4-a716-446655440003';

-- RLS Result: Returns 0 rows (hidden) ✅
```

### Test Scenario 3: Teacher Reads Student's Data

```sql
-- Logged in as: Mrs. Johnson (660e...)
SELECT * FROM user_progress;

-- RLS Result: Returns only her students' progress
-- Includes: Vintage's progress
-- Excludes: Other unrelated students ✅
```

### Test Scenario 4: Service Role Bypasses RLS

```javascript
// Using SERVICE ROLE key (backend only)
const { data, error } = await supabase
  .from('user_progress')
  .select('*')
  .eq('student_id', 'ANY_STUDENT_ID');

// Result: All data returned (all students)
// Why: Service role bypasses RLS ✅
```

---

## Implementing RLS in Your App

### Frontend: Use Anon Key

```javascript
// Supabase client for frontend
const SUPABASE_ANON_KEY = "eyJ...";
const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

// User logs in
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'vintage@penpath.com',
  password: 'password'
});

// Query (RLS applies automatically)
const { data: progress } = await supabase
  .from('user_progress')
  .select('*');
// Returns: Only user's progress (RLS filters) ✅
```

### Backend: Use Service Role

```javascript
// Supabase client for backend (Node.js)
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const adminClient = createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_KEY
);

// Backend function: Create progress record
async function recordProgress(studentId, stepId, accuracy) {
  // Using service role (bypasses RLS)
  const { data, error } = await adminClient
    .from('user_progress')
    .insert({
      student_id: studentId,
      lesson_step_id: stepId,
      accuracy_percent: accuracy,
      is_completed: true
    });

  // Backend handles all business logic
  // Frontend never needs to know about this
}
```

---

## Security Best Practices

### ✅ DO

- ✅ **Enable RLS** on all user-specific tables
- ✅ **Test policies** with real users
- ✅ **Keep service key** on backend only
- ✅ **Use anon key** in frontend
- ✅ **Verify policies** before production
- ✅ **Document policies** for team

### ❌ DON'T

- ❌ **Expose service key** to frontend
- ❌ **Forget RLS** on sensitive tables
- ❌ **Skip policy testing** with sample users
- ❌ **Trust client-side filtering** (always RLS)
- ❌ **Allow users to INSERT** relationships
- ❌ **Allow users to DELETE** learning history

---

## Verifying RLS Is Enabled

### Check in Supabase Dashboard

1. Go to **SQL Editor**
2. Run this query:

```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
```

**Expected output:**
```
users                   | t (true - RLS enabled)
user_progress          | t
letter_mastery         | t
user_badges            | t
user_devices           | t
user_teacher_relations | t
lessons                | f (false - public, no RLS needed)
lesson_steps           | f
badges                 | f
lesson_categories      | f
devices                | f
```

---

## Troubleshooting

### Problem: "Permission denied" Error

```
SELECT * FROM user_progress
Error: permission denied for schema public
```

**Solution:**
- RLS is enabled but no policies created yet
- Run policy SQL files (002-007)
- Or give your user access with a policy

### Problem: Service Role Bypasses RLS but Shouldn't

**Actually, this is expected!** Service role is meant to bypass RLS for backend operations.

**Solution:**
- Use ANON KEY for frontend queries (RLS applies)
- Use SERVICE ROLE for backend operations (RLS bypassed)

### Problem: Teacher Cannot See Student Data

**Solution:**
- Check `user_teacher_relations` table
- Verify teacher_parent_id is linked to student
- Verify relationship is active (`is_active = true`)
- Re-read policy for logic

---

## Files Overview

```
backend/rls/
├── 001_enable_rls.sql           ← Enable on 6 tables
├── 002_policies_users.sql       ← User table security
├── 003_policies_progress.sql    ← Progress table security
├── 004_policies_mastery.sql     ← Mastery table security
├── 005_policies_badges.sql      ← Badges table security
├── 006_policies_devices.sql     ← Devices table security
├── 007_policies_relations.sql   ← Relations table security
└── RLS.md                       ← This guide
```

---

## Applying RLS Policies

### In Supabase Dashboard

1. **Go to SQL Editor**
2. **Create a new query**
3. **Copy contents of 001_enable_rls.sql**
4. **Run query**
5. **Repeat for 002-007 policy files**

### Verify Success

```sql
-- Run this to check policies exist
SELECT schemaname, tablename, policyname, qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename;
```

---

## Next Steps

1. ✅ **Read this guide** - Understand RLS concepts
2. ✅ **Run RLS SQL files** - Enable RLS and create policies
3. ✅ **Test with sample users** - Verify policies work
4. ✅ **Document for team** - Share this guide
5. ✅ **Update backend code** - Use service role where needed

---

## Questions?

- **How do I test policies?** → See "Testing RLS Policies" section
- **How do I know if RLS is working?** → Run verification query
- **Can users bypass RLS?** → Only service role can bypass
- **What if a policy is wrong?** → Drop and recreate:
  ```sql
  DROP POLICY "Policy Name" ON table_name;
  -- Then recreate with correct logic
  ```

---

**RLS is security by default!** 🔒✨
