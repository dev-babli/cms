// Quick test script to verify database connection
require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL not found in .env.local');
  process.exit(1);
}

console.log('🔗 Connection string:', process.env.DATABASE_URL.replace(/:[^:@]+@/, ':****@'));

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('supabase') 
    ? { rejectUnauthorized: false } 
    : false,
  connectionTimeoutMillis: 10000,
});

async function testConnection() {
  try {
    console.log('🔌 Testing database connection...');
    const result = await pool.query('SELECT NOW() as current_time, version() as pg_version');
    console.log('✅ Connection successful!');
    console.log('📅 Current time:', result.rows[0].current_time);
    console.log('🐘 PostgreSQL version:', result.rows[0].pg_version.split(' ')[0] + ' ' + result.rows[0].pg_version.split(' ')[1]);
    
    // Check tables
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log('\n📊 Tables found:');
    tables.rows.forEach(row => {
      console.log('  ✅', row.table_name);
    });
    
    // Check if admin user exists
    const adminCheck = await pool.query('SELECT COUNT(*) as count FROM users WHERE email = $1', ['admin@emscale.com']);
    console.log('\n👤 Admin user exists:', adminCheck.rows[0].count > 0 ? 'Yes' : 'No');
    
    await pool.end();
    console.log('\n🎉 All tests passed!');
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    process.exit(1);
  }
}

testConnection();

