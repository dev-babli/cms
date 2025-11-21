// Test database connection
require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ DATABASE_URL is not set!');
  console.error('   Set it in .env.local or Vercel environment variables');
  process.exit(1);
}

console.log('🔍 Testing database connection...');
console.log('   Connection string:', connectionString.replace(/:[^:@]+@/, ':****@')); // Hide password

const pool = new Pool({
  connectionString: connectionString,
  ssl: connectionString.includes('supabase') 
    ? { rejectUnauthorized: false } 
    : false,
  connectionTimeoutMillis: 10000,
});

async function testConnection() {
  try {
    console.log('\n1️⃣ Testing basic connection...');
    const result = await pool.query('SELECT NOW() as current_time, version() as version');
    console.log('   ✅ Connected successfully!');
    console.log('   Current time:', result.rows[0].current_time);
    console.log('   PostgreSQL version:', result.rows[0].version.split(' ')[0] + ' ' + result.rows[0].version.split(' ')[1]);

    console.log('\n2️⃣ Testing table access...');
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    console.log(`   ✅ Found ${tablesResult.rows.length} tables:`);
    tablesResult.rows.forEach(row => {
      console.log(`      - ${row.table_name}`);
    });

    console.log('\n3️⃣ Testing blog_posts table...');
    const blogCount = await pool.query('SELECT COUNT(*) as count FROM blog_posts');
    console.log(`   ✅ blog_posts table accessible (${blogCount.rows[0].count} posts)`);

    console.log('\n✅ All tests passed! Database connection is working.');
    await pool.end();
  } catch (error) {
    console.error('\n❌ Connection failed!');
    console.error('   Error:', error.message);
    
    if (error.message.includes('password authentication failed')) {
      console.error('\n💡 Password authentication failed. Check:');
      console.error('  1. Password in connection string is correct');
      console.error('  2. Special characters are URL-encoded (@ = %40, # = %23, etc.)');
      console.error('  3. You\'re using the correct database password from Supabase');
      console.error('\n   To fix:');
      console.error('  1. Go to Supabase Dashboard → Settings → Database');
      console.error('  2. Copy the connection string');
      console.error('  3. If password has special chars, URL-encode them');
      console.error('  4. Update DATABASE_URL in Vercel or .env.local');
    } else if (error.message.includes('ENOTFOUND') || error.message.includes('getaddrinfo')) {
      console.error('\n💡 DNS/Network error. Check:');
      console.error('  1. Connection string hostname is correct');
      console.error('  2. Internet connection is working');
      console.error('  3. Supabase database is accessible');
    } else if (error.message.includes('timeout')) {
      console.error('\n💡 Connection timeout. Check:');
      console.error('  1. Database is not paused (Supabase free tier pauses after inactivity)');
      console.error('  2. Network connection is stable');
      console.error('  3. Try using connection pooler (port 5432) instead of direct (port 6543)');
    } else {
      console.error('\n💡 General error. Check:');
      console.error('  1. Connection string format is correct');
      console.error('  2. Database exists and is accessible');
      console.error('  3. User has proper permissions');
    }
    
    await pool.end();
    process.exit(1);
  }
}

testConnection();

