# Database Setup Guide

## Quick Start: Set Up Your Database in 3 Steps

This guide will help you create the PenPath database schema in Supabase and populate it with example data.

---

## Prerequisites

✅ Node.js installed
✅ PostgreSQL installed locally (optional, for local testing)
✅ Supabase account and project created
✅ Your Supabase credentials:
   - Project URL: `https://kgjtcvxcvpcyinchfvct.supabase.co`
   - Service Role Key: (from Settings → API)

---

## Step 1: Install Dependencies

```bash
cd backend
npm install
```

This installs the `pg` (PostgreSQL) client needed to connect to Supabase.

---

## Step 2: Get Your Service Role Key

1. Go to https://app.supabase.com
2. Select your **PenPath** project
3. Click **Settings** in the sidebar
4. Click **API**
5. Copy the **service_role secret** (labeled "Service role secret")
   - ⚠️ Keep this secret! Never commit it to Git.

---

## Step 3: Run the Setup Script

### **Option A: Using Command Line (Recommended)**

**On Windows PowerShell:**
```powershell
$env:SUPABASE_SERVICE_KEY="paste_your_service_key_here"
npm run setup-db
```

**On Windows CMD:**
```cmd
set SUPABASE_SERVICE_KEY=paste_your_service_key_here
npm run setup-db
```

**On Mac/Linux:**
```bash
export SUPABASE_SERVICE_KEY="paste_your_service_key_here"
npm run setup-db
```

### **Option B: Using .env.local File**

1. Add your service key to `backend/.env.local`:
```env
SUPABASE_SERVICE_KEY=your_service_role_key_here
```

2. Run:
```bash
npm run setup-db
```

---

## What the Script Does

The `setup-database.js` script:

1. **Creates all 12 tables** from `schema.sql`
   - users
   - teachers_parents
   - user_teacher_relations
   - lesson_categories
   - lessons
   - lesson_steps
   - user_progress
   - letter_mastery
   - badges
   - user_badges
   - devices
   - user_devices

2. **Inserts example data** from `example_data.sql`
   - Vintage Student (example)
   - Mrs. Johnson (teacher)
   - Vintage's Mom (parent)
   - Letter A lesson with all steps
   - Vintage's progress data
   - Badges earned

3. **Verifies everything** by checking:
   - Tables exist
   - Records count
   - Data integrity

---

## Expected Output

```
🚀 PenPath Database Setup

📍 Supabase Project: https://kgjtcvxcvpcyinchfvct.supabase.co
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📝 Step 1: Creating database schema...
   ✅ Schema created successfully

📝 Step 2: Inserting example data...
   ✅ Example data inserted successfully

📝 Step 3: Verifying setup...

📊 Tables created:
   ✅ users (1 records)
   ✅ teachers_parents (2 records)
   ✅ lessons (2 records)
   ✅ badges (4 records)
   ... (more tables)

👤 Students:
   ✅ Vintage Student (Age 7, Grade 2nd)

📚 Lessons:
   ✅ Letter A: Learn Letter A with Apple (Difficulty: 1)

🏆 Badges:
   ✅ Letter Master A (achievement)
   ✅ Perfect Score (bonus)
   ✅ 7-Day Streak (streak)
   ✅ Speed Demon (bonus)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✨ Database Setup Complete!

📖 Next Steps:
1. View your tables in Supabase Dashboard
2. Check SCHEMA_DOCUMENTATION.md for query examples
3. Review example data to understand the schema
4. Start building your backend API

🔗 View in Supabase: https://app.supabase.com/project/kgjtcvxcvpcyinchfvct
```

---

## View Your Database

### In Supabase Dashboard

1. Go to https://app.supabase.com
2. Select your PenPath project
3. Click **SQL Editor** → Select `schema.sql` from the sidebar to view
4. Click **Table Editor** to browse tables visually

### Run Queries in Supabase

Go to **SQL Editor** and try these:

```sql
-- See all users
SELECT * FROM users;

-- See all lessons
SELECT * FROM lessons ORDER BY letter;

-- See Vintage's progress
SELECT
  up.*,
  ls.title as step_title
FROM user_progress up
JOIN lesson_steps ls ON up.lesson_step_id = ls.id
WHERE up.student_id = '550e8400-e29b-41d4-a716-446655440000'
ORDER BY up.created_at DESC;

-- See all badges
SELECT * FROM badges ORDER BY name;
```

---

## Troubleshooting

### Error: "SUPABASE_SERVICE_KEY is not set"

Make sure you set the environment variable before running the script:

**PowerShell:**
```powershell
$env:SUPABASE_SERVICE_KEY="your_key"
npm run setup-db
```

**Or add to `.env.local`:**
```env
SUPABASE_SERVICE_KEY=your_key
```

### Error: "Connection refused"

- Check your internet connection
- Verify your service role key is valid
- Check that your Supabase project is active

### Error: "Tables already exist"

This is normal! The script will skip existing tables and continue. You can:

1. **Delete and recreate** - Go to Supabase dashboard, delete the database, and run setup again
2. **Continue as-is** - The data is there, just proceed with development

### Error: "Duplicate key value violates unique constraint"

The example data (Vintage) already exists. You can:

1. Clear the database and rerun
2. Skip example data insertion and add your own users

---

## Next Steps

Once your database is set up:

1. **Review the schema**: Check `SCHEMA_DOCUMENTATION.md` for table descriptions
2. **Understand example data**: See how Vintage's learning journey flows through the system
3. **Run example queries**: Try the queries in `SCHEMA_DOCUMENTATION.md`
4. **Build your API**: Start creating endpoints that interact with these tables

---

## Important Notes

⚠️ **Security:**
- Never commit `.env.local` with your service key
- Never share your service role key
- Use this key only in secure, private environments

📚 **Documentation:**
- See `SCHEMA_DOCUMENTATION.md` for detailed table info and query examples
- See `schema.sql` for the complete schema with comments
- See `example_data.sql` for how data flows through the system

🔗 **Useful Links:**
- Supabase Dashboard: https://app.supabase.com
- PostgreSQL Docs: https://www.postgresql.org/docs/
- Schema Documentation: See `SCHEMA_DOCUMENTATION.md`
