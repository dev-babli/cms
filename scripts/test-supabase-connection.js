// Script to test Supabase connection and Auth
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
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY is not set!');
  process.exit(1);
}

const key = serviceRoleKey || anonKey;
const keyType = serviceRoleKey ? 'Service Role Key' : 'Anon Key';

console.log(`✅ Supabase URL: ${supabaseUrl}`);
console.log(`✅ Using: ${keyType}`);
console.log('\n🧪 Testing connection...\n');

const supabase = createClient(supabaseUrl, key, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function testConnection() {
  try {
    // Test 1: Check if we can reach Supabase
    console.log('1️⃣ Testing basic connection...');
    const { data: healthCheck, error: healthError } = await supabase
      .from('users')
      .select('count')
      .limit(0);
    
    if (healthError && !healthError.message.includes('permission denied')) {
      console.error('❌ Connection failed:', healthError.message);
      return false;
    }
    console.log('✅ Connection successful!\n');

    // Test 2: Check Auth service
    console.log('2️⃣ Testing Auth service...');
    // Try to get auth session (this will fail but tells us if auth is enabled)
    const { data: authData, error: authError } = await supabase.auth.getSession();
    
    // If we get a specific error about auth not being available, that's the issue
    if (authError && authError.message.includes('Invalid API key')) {
      console.error('❌ Invalid API key!');
      console.error('   Check your SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY');
      return false;
    }
    
    console.log('✅ Auth service is accessible!\n');

    // Test 3: Try to sign up a test user (will fail if email exists, but that's ok)
    console.log('3️⃣ Testing signUp functionality...');
    const testEmail = `test-${Date.now()}@example.com`;
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: 'TestPassword123!',
    });

    if (signUpError) {
      if (signUpError.message.includes('Email signups are disabled')) {
        console.error('❌ Email signups are DISABLED in Supabase!');
        console.error('   Go to Supabase Dashboard → Authentication → Settings');
        console.error('   Enable "Enable email signup"');
        return false;
      }
      console.error('❌ SignUp test failed:', signUpError.message);
      return false;
    }

    if (signUpData.user) {
      console.log('✅ SignUp test successful!');
      console.log(`   Test user created: ${testEmail}`);
      console.log('   (You can delete this user from Supabase Dashboard)\n');
    }

    console.log('✅ All tests passed! Supabase is properly configured.\n');
    return true;

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error);
    return false;
  }
}

testConnection().then(success => {
  if (success) {
    console.log('🎉 Supabase is ready to use!');
    process.exit(0);
  } else {
    console.log('\n❌ Supabase configuration needs attention.');
    console.log('   Check the errors above and fix them.');
    process.exit(1);
  }
});

