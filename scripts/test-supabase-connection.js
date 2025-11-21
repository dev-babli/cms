// Test Supabase connection and list users
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔍 Testing Supabase Connection...\n');

if (!supabaseUrl) {
  console.error('❌ SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL is not set!');
  process.exit(1);
}

if (!serviceRoleKey && !anonKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY is not set!');
  process.exit(1);
}

const key = serviceRoleKey || anonKey;
const supabase = createClient(supabaseUrl, key, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function testConnection() {
  try {
    console.log('✅ Supabase URL:', supabaseUrl);
    console.log('✅ Using:', serviceRoleKey ? 'Service Role Key' : 'Anon Key');
    console.log('');

    // Test 1: List users from Supabase Auth
    console.log('1️⃣ Listing users from Supabase Auth...');
    const { data: authUsers, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.error('❌ Error listing users:', listError.message);
      if (listError.message.includes('JWT')) {
        console.error('   💡 Make sure you\'re using SUPABASE_SERVICE_ROLE_KEY (not anon key)');
      }
    } else {
      console.log(`✅ Found ${authUsers?.users?.length || 0} users in Supabase Auth:`);
      if (authUsers?.users && authUsers.users.length > 0) {
        authUsers.users.forEach((user, index) => {
          console.log(`   ${index + 1}. ${user.email} (${user.id})`);
          console.log(`      Role: ${user.user_metadata?.role || 'not set'}`);
          console.log(`      Created: ${new Date(user.created_at).toLocaleString()}`);
        });
      } else {
        console.log('   No users found in Supabase Auth');
      }
    }

    // Test 2: Check database connection
    console.log('\n2️⃣ Testing database connection...');
    const { Pool } = require('pg');
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_URL?.includes('supabase') 
        ? { rejectUnauthorized: false } 
        : false,
    });

    const dbResult = await pool.query('SELECT COUNT(*) as count FROM users');
    console.log(`✅ Database connected. Found ${dbResult.rows[0].count} users in database.`);

    // Compare
    const authUserCount = authUsers?.users?.length || 0;
    const dbUserCount = parseInt(dbResult.rows[0].count);
    
    console.log('\n📊 Comparison:');
    console.log(`   Supabase Auth users: ${authUserCount}`);
    console.log(`   Database users: ${dbUserCount}`);
    
    if (authUserCount !== dbUserCount) {
      console.log('\n⚠️  WARNING: User counts don\'t match!');
      console.log('   This is expected if you just switched to pure Supabase Auth.');
      console.log('   The database users table is no longer used for authentication.');
    }

    await pool.end();
    
    console.log('\n✅ Supabase connection test complete!');
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

testConnection();
