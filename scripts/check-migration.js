// Script to check if supabase_user_id column exists
require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('supabase') 
    ? { rejectUnauthorized: false } 
    : false,
});

async function checkMigration() {
  try {
    console.log('🔍 Checking database migration status...\n');
    
    // Check if supabase_user_id column exists
    const columnCheck = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name = 'supabase_user_id'
    `);
    
    if (columnCheck.rows.length > 0) {
      console.log('✅ Step 3 COMPLETE!');
      console.log('   Column "supabase_user_id" exists');
      console.log('   Type:', columnCheck.rows[0].data_type);
      
      // Check if index exists
      const indexCheck = await pool.query(`
        SELECT indexname 
        FROM pg_indexes 
        WHERE tablename = 'users' 
        AND indexname = 'idx_users_supabase_id'
      `);
      
      if (indexCheck.rows.length > 0) {
        console.log('✅ Index "idx_users_supabase_id" exists');
      } else {
        console.log('⚠️  Index "idx_users_supabase_id" missing');
        console.log('   Run: CREATE INDEX IF NOT EXISTS idx_users_supabase_id ON users(supabase_user_id);');
      }
      
      // Check existing users
      const usersCheck = await pool.query(`
        SELECT 
          COUNT(*) as total,
          COUNT(supabase_user_id) as with_supabase_id,
          COUNT(*) - COUNT(supabase_user_id) as without_supabase_id
        FROM users
      `);
      
      const stats = usersCheck.rows[0];
      console.log('\n📊 User Statistics:');
      console.log(`   Total users: ${stats.total}`);
      console.log(`   With Supabase ID: ${stats.with_supabase_id}`);
      console.log(`   Without Supabase ID: ${stats.without_supabase_id}`);
      
      if (stats.without_supabase_id > 0) {
        console.log('\n💡 Note: Some users don\'t have supabase_user_id yet.');
        console.log('   They can use "Forgot Password" to create Supabase Auth account.');
      }
      
    } else {
      console.log('❌ Step 3 NOT COMPLETE!');
      console.log('   Column "supabase_user_id" does NOT exist');
      console.log('\n📝 To complete Step 3:');
      console.log('   1. Go to Supabase Dashboard → SQL Editor');
      console.log('   2. Run:');
      console.log('      ALTER TABLE users ADD COLUMN IF NOT EXISTS supabase_user_id UUID;');
      console.log('      CREATE INDEX IF NOT EXISTS idx_users_supabase_id ON users(supabase_user_id);');
    }
    
    await pool.end();
  } catch (error) {
    console.error('❌ Error checking migration:', error.message);
    process.exit(1);
  }
}

checkMigration();

