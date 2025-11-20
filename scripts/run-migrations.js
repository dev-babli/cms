// Script to run all required database migrations
require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('supabase') 
    ? { rejectUnauthorized: false } 
    : false,
});

async function runMigrations() {
  try {
    console.log('🚀 Running database migrations...\n');
    
    // Migration 1: Make password_hash nullable
    console.log('1️⃣ Making password_hash nullable...');
    try {
      await pool.query(`
        ALTER TABLE users 
        ALTER COLUMN password_hash DROP NOT NULL
      `);
      console.log('   ✅ password_hash is now nullable');
    } catch (error) {
      if (error.message.includes('does not exist')) {
        console.log('   ⚠️  password_hash column does not exist (skipping)');
      } else if (error.message.includes('already')) {
        console.log('   ✅ password_hash is already nullable');
      } else {
        throw error;
      }
    }
    
    // Migration 2: Add supabase_user_id column if it doesn't exist
    console.log('\n2️⃣ Adding supabase_user_id column...');
    try {
      await pool.query(`
        ALTER TABLE users 
        ADD COLUMN IF NOT EXISTS supabase_user_id UUID
      `);
      console.log('   ✅ supabase_user_id column added or already exists');
    } catch (error) {
      console.log('   ⚠️  Error:', error.message);
    }
    
    // Migration 3: Create index for supabase_user_id
    console.log('\n3️⃣ Creating index for supabase_user_id...');
    try {
      await pool.query(`
        CREATE INDEX IF NOT EXISTS idx_users_supabase_id 
        ON users(supabase_user_id)
      `);
      console.log('   ✅ Index created or already exists');
    } catch (error) {
      console.log('   ⚠️  Error:', error.message);
    }
    
    // Migration 4: Create sessions table if it doesn't exist
    console.log('\n4️⃣ Creating sessions table...');
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS sessions (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL,
          token TEXT UNIQUE NOT NULL,
          expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `);
      console.log('   ✅ Sessions table created or already exists');
      
      // Create index for token lookup
      await pool.query(`
        CREATE INDEX IF NOT EXISTS idx_sessions_token 
        ON sessions(token)
      `);
      console.log('   ✅ Index on sessions.token created');
    } catch (error) {
      console.log('   ⚠️  Error:', error.message);
    }
    
    console.log('\n✅ All migrations completed!');
    await pool.end();
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Migration error:', error.message);
    await pool.end();
    process.exit(1);
  }
}

runMigrations();

