// Test direct connection with better error handling
require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');
const dns = require('dns').promises;

async function testDNS(hostname) {
  try {
    console.log('🔍 Testing DNS resolution for:', hostname);
    const addresses = await dns.resolve4(hostname);
    console.log('✅ DNS resolved:', addresses);
    return true;
  } catch (error) {
    console.error('❌ DNS resolution failed:', error.message);
    return false;
  }
}

async function testConnection() {
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL not found');
    process.exit(1);
  }

  // Extract hostname from connection string
  const urlMatch = process.env.DATABASE_URL.match(/@([^:]+):(\d+)/);
  const hostname = urlMatch ? urlMatch[1] : 'unknown';
  const port = urlMatch ? urlMatch[2] : 'unknown';

  // Test DNS first
  const dnsOk = await testDNS(hostname);
  if (!dnsOk) {
    console.log('\n💡 DNS resolution failed, but trying connection anyway...');
    console.log('   (Some networks have DNS issues but connection still works)');
  }

  console.log('\n🔌 Testing PostgreSQL connection...');
  console.log('🔗 Host:', hostname);
  console.log('🔗 Port:', port);

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    },
    connectionTimeoutMillis: 10000,
  });

  try {
    const result = await pool.query('SELECT NOW() as current_time, version() as pg_version');
    console.log('✅ Connection successful!');
    console.log('📅 Current time:', result.rows[0].current_time);
    
    // Check tables
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log('\n📊 Tables found:', tables.rows.length);
    tables.rows.forEach(row => {
      console.log('  ✅', row.table_name);
    });
    
    console.log('\n🎉 All tests passed!');
    // Close pool gracefully
    await pool.end().catch(() => {}); // Ignore errors during shutdown
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.error('   Code:', error.code);
    
    if (error.code === 'ENOTFOUND') {
      console.log('\n💡 This means the hostname cannot be resolved.');
      console.log('   Possible solutions:');
      console.log('   1. Wait a few minutes (project might still be provisioning)');
      console.log('   2. Use pooled connection string instead');
      console.log('   3. Check project status in Supabase dashboard');
    } else if (error.code === 'ETIMEDOUT') {
      console.log('\n💡 Connection timed out.');
      console.log('   Check your firewall/network settings');
    } else if (error.code === '28P01') {
      console.log('\n💡 Authentication failed.');
      console.log('   Check your password in the connection string');
    }
    
    process.exit(1);
  }
}

testConnection();

