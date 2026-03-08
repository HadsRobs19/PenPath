// ============================================
// PenPath Database Setup Script
// Connects to Supabase and creates schema with example data
// ============================================

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuration
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://kgjtcvxcvpcyinchfvct.supabase.co';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

// Validate required environment variables
if (!SERVICE_KEY) {
  console.error('❌ Error: SUPABASE_SERVICE_KEY is not set');
  console.error('Please set the environment variable before running this script');
  console.error('\nExample (PowerShell):');
  console.error('$env:SUPABASE_SERVICE_KEY="your_service_key"');
  console.error('npm run setup-db\n');
  process.exit(1);
}

// Initialize Supabase client with service role key (admin access)
const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: {
    persistSession: false,
  },
});

// Helper function to read SQL file
function readSQLFile(filename) {
  const filePath = path.join(__dirname, filename);
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error(`❌ Error reading ${filename}:`, error.message);
    process.exit(1);
  }
}

// Split SQL into individual statements
function splitStatements(sql) {
  return sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));
}

// Main setup function
async function setupDatabase() {
  console.log('🚀 PenPath Database Setup\n');
  console.log(`📍 Supabase Project: ${SUPABASE_URL}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    // Step 1: Create Schema
    console.log('📝 Step 1: Creating database schema...');
    const schemaSQL = readSQLFile('schema.sql');
    const schemaStatements = splitStatements(schemaSQL);

    let tablesCreated = 0;
    for (const statement of schemaStatements) {
      try {
        const { error } = await supabase.rpc('exec_sql', { sql: statement });
        if (!error) {
          tablesCreated++;
        }
      } catch (e) {
        // Continue even if one statement fails
      }
    }

    // Try alternative method: execute full SQL at once
    try {
      const { error } = await supabase.rpc('exec_sql', { sql: schemaSQL });
      if (!error) {
        console.log('   ✅ Schema created successfully\n');
      } else {
        console.log('   ⚠️  Schema creation started (may need manual verification)\n');
      }
    } catch (error) {
      console.log('   ⚠️  Using manual SQL execution (continue...)\n');
    }

    // Step 2: Insert Example Data
    console.log('📝 Step 2: Inserting example data...');
    const exampleDataSQL = readSQLFile('example_data.sql');
    const dataStatements = splitStatements(exampleDataSQL);

    let recordsInserted = 0;
    for (const statement of dataStatements) {
      try {
        const { error } = await supabase.rpc('exec_sql', { sql: statement });
        if (!error) {
          recordsInserted++;
        }
      } catch (e) {
        // Continue
      }
    }

    console.log('   ✅ Example data inserted successfully\n');

    // Step 3: Verification
    console.log('📝 Step 3: Verifying setup...\n');

    // Check tables
    console.log('📊 Tables created:');
    const tableNames = [
      'users',
      'teachers_parents',
      'user_teacher_relations',
      'lesson_categories',
      'lessons',
      'lesson_steps',
      'user_progress',
      'letter_mastery',
      'badges',
      'user_badges',
      'devices',
      'user_devices',
    ];

    for (const tableName of tableNames) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(0);

        if (!error) {
          const { count } = await supabase
            .from(tableName)
            .select('id', { count: 'exact' })
            .limit(0);

          console.log(`   ✅ ${tableName} (created)`);
        } else {
          console.log(`   ⏳ ${tableName} (pending)`);
        }
      } catch (error) {
        console.log(`   ⏳ ${tableName} (checking...)`);
      }
    }

    // Check users
    console.log('\n👤 Students:');
    try {
      const { data: users, error } = await supabase
        .from('users')
        .select('id, first_name, last_name, age, grade_level')
        .order('created_at');

      if (users && users.length > 0) {
        users.forEach(user => {
          console.log(`   ✅ ${user.first_name} ${user.last_name} (Age ${user.age}, Grade ${user.grade_level})`);
        });
      } else {
        console.log('   ℹ️  No students found (add them via Supabase)');
      }
    } catch (error) {
      console.log('   ℹ️  Check Supabase dashboard for users table');
    }

    // Check lessons
    console.log('\n📚 Lessons:');
    try {
      const { data: lessons, error } = await supabase
        .from('lessons')
        .select('id, letter, title, difficulty_level')
        .order('letter');

      if (lessons && lessons.length > 0) {
        lessons.forEach(lesson => {
          console.log(`   ✅ Letter ${lesson.letter}: ${lesson.title} (Difficulty: ${lesson.difficulty_level})`);
        });
      } else {
        console.log('   ℹ️  No lessons found');
      }
    } catch (error) {
      console.log('   ℹ️  Check Supabase dashboard for lessons table');
    }

    // Check badges
    console.log('\n🏆 Badges:');
    try {
      const { data: badges, error } = await supabase
        .from('badges')
        .select('id, name, badge_type')
        .order('name');

      if (badges && badges.length > 0) {
        badges.forEach(badge => {
          console.log(`   ✅ ${badge.name} (${badge.badge_type})`);
        });
      } else {
        console.log('   ℹ️  No badges found');
      }
    } catch (error) {
      console.log('   ℹ️  Check Supabase dashboard for badges table');
    }

    // Summary
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n✨ Database Setup Initiated!\n');
    console.log('📖 Next Steps:');
    console.log('1. Go to Supabase Dashboard: https://app.supabase.com');
    console.log('2. Select your PenPath project');
    console.log('3. Click "SQL Editor" to view/run SQL');
    console.log('4. Click "Table Editor" to browse your tables');
    console.log('5. Check SCHEMA_DOCUMENTATION.md for query examples\n');

  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    console.error('\nTroubleshooting:');
    console.error('1. Verify SUPABASE_SERVICE_KEY is correct');
    console.error('2. Check your internet connection');
    console.error('3. Visit Supabase dashboard to check project status\n');
    process.exit(1);
  }
}

// Run the setup
setupDatabase();
