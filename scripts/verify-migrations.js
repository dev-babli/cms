// Script to verify all database migrations are complete
require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('supabase') 
    ? { rejectUnauthorized: false } 
    : false,
});

async function verifyMigrations() {
  try {
    console.log('🔍 Verifying database migrations...\n');
    
    const checks = [];
    
    // Check 1: password_hash column is nullable
    console.log('1️⃣ Checking password_hash column...');
    const passwordHashCheck = await pool.query(`
      SELECT column_name, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name = 'password_hash'
    `);
    
    if (passwordHashCheck.rows.length === 0) {
      checks.push({ name: 'password_hash column', status: 'missing', required: true });
      console.log('   ❌ password_hash column does not exist');
    } else {
      const isNullable = passwordHashCheck.rows[0].is_nullable === 'YES';
      if (isNullable) {
        checks.push({ name: 'password_hash nullable', status: 'ok', required: true });
        console.log('   ✅ password_hash is nullable');
      } else {
        checks.push({ name: 'password_hash nullable', status: 'needs-fix', required: true });
        console.log('   ⚠️  password_hash is NOT NULL (needs to be nullable)');
        console.log('   Run: ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;');
      }
    }
    
    // Check 2: supabase_user_id column exists
    console.log('\n2️⃣ Checking supabase_user_id column...');
    const supabaseIdCheck = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name = 'supabase_user_id'
    `);
    
    if (supabaseIdCheck.rows.length === 0) {
      checks.push({ name: 'supabase_user_id column', status: 'missing', required: true });
      console.log('   ❌ supabase_user_id column does not exist');
      console.log('   Run: ALTER TABLE users ADD COLUMN supabase_user_id UUID;');
    } else {
      checks.push({ name: 'supabase_user_id column', status: 'ok', required: true });
      console.log('   ✅ supabase_user_id column exists');
      console.log('   Type:', supabaseIdCheck.rows[0].data_type);
    }
    
    // Check 3: supabase_user_id index exists
    console.log('\n3️⃣ Checking supabase_user_id index...');
    const indexCheck = await pool.query(`
      SELECT indexname 
      FROM pg_indexes 
      WHERE tablename = 'users' 
      AND indexname = 'idx_users_supabase_id'
    `);
    
    if (indexCheck.rows.length === 0) {
      checks.push({ name: 'supabase_user_id index', status: 'missing', required: false });
      console.log('   ⚠️  Index idx_users_supabase_id does not exist (recommended)');
      console.log('   Run: CREATE INDEX idx_users_supabase_id ON users(supabase_user_id);');
    } else {
      checks.push({ name: 'supabase_user_id index', status: 'ok', required: false });
      console.log('   ✅ Index idx_users_supabase_id exists');
    }
    
    // Check 4: All required tables exist
    console.log('\n4️⃣ Checking required tables...');
    const requiredTables = ['users', 'sessions', 'blog_posts', 'services', 'team_members', 'job_postings'];
    const tablesCheck = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
    `);
    
    const existingTables = tablesCheck.rows.map(r => r.table_name);
    const missingTables = requiredTables.filter(t => !existingTables.includes(t));
    
    if (missingTables.length === 0) {
      checks.push({ name: 'Required tables', status: 'ok', required: true });
      console.log('   ✅ All required tables exist');
    } else {
      checks.push({ name: 'Required tables', status: 'missing', required: true });
      console.log('   ❌ Missing tables:', missingTables.join(', '));
    }
    
    // Summary
    console.log('\n📊 Migration Status Summary:');
    const requiredChecks = checks.filter(c => c.required);
    const passedRequired = requiredChecks.filter(c => c.status === 'ok').length;
    const totalRequired = requiredChecks.length;
    
    console.log(`   Required checks: ${passedRequired}/${totalRequired} passed`);
    
    if (passedRequired === totalRequired) {
      console.log('\n✅ All required migrations are complete!');
      await pool.end();
      process.exit(0);
    } else {
      console.log('\n❌ Some required migrations are missing or incomplete.');
      console.log('   Please run the missing migrations before proceeding.');
      await pool.end();
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Error verifying migrations:', error.message);
    await pool.end();
    process.exit(1);
  }
}

verifyMigrations();


