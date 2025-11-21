// Diagnostic script to check login issues on Vercel
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔍 Diagnosing Login Issues...\n');

// Check 1: Environment Variables
console.log('1️⃣ Checking Environment Variables...');
if (!supabaseUrl) {
  console.log('   ❌ SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL is missing!');
} else {
  console.log(`   ✅ Supabase URL: ${supabaseUrl}`);
}

if (!serviceRoleKey && !anonKey) {
  console.log('   ❌ SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY is missing!');
} else {
  const keyType = serviceRoleKey ? 'Service Role Key' : 'Anon Key';
  console.log(`   ✅ Using: ${keyType}`);
}

// Check 2: Supabase Connection
console.log('\n2️⃣ Testing Supabase Connection...');
if (!supabaseUrl || (!serviceRoleKey && !anonKey)) {
  console.log('   ⚠️  Skipping - missing environment variables');
} else {
  const key = serviceRoleKey || anonKey;
  const supabase = createClient(supabaseUrl, key);
  
  // Test connection
  supabase.auth.getSession()
    .then(({ data, error }) => {
      if (error) {
        console.log(`   ❌ Connection error: ${error.message}`);
      } else {
        console.log('   ✅ Supabase connection successful');
      }
    })
    .catch(err => {
      console.log(`   ❌ Error: ${err.message}`);
    });
}

// Check 3: Database Connection
console.log('\n3️⃣ Checking Database Connection...');
const { Pool } = require('pg');

if (!process.env.DATABASE_URL) {
  console.log('   ❌ DATABASE_URL is missing!');
} else {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL?.includes('supabase') 
      ? { rejectUnauthorized: false } 
      : false,
  });

  pool.query('SELECT 1')
    .then(() => {
      console.log('   ✅ Database connection successful');
      
      // Check for admin user
      return pool.query("SELECT * FROM users WHERE email = 'admin@emscale.com'");
    })
    .then((result) => {
      if (result.rows.length === 0) {
        console.log('   ⚠️  Admin user not found in database');
        console.log('   Run: node scripts/create-admin.js');
      } else {
        const admin = result.rows[0];
        console.log(`   ✅ Admin user found: ${admin.email}`);
        console.log(`      Status: ${admin.status}`);
        console.log(`      Role: ${admin.role}`);
        console.log(`      Has Supabase ID: ${admin.supabase_user_id ? 'Yes' : 'No'}`);
        
        // Check if user exists in Supabase Auth
        if (supabaseUrl && (serviceRoleKey || anonKey)) {
          const key = serviceRoleKey || anonKey;
          const supabase = createClient(supabaseUrl, key);
          
          if (admin.supabase_user_id) {
            supabase.auth.admin.getUserById(admin.supabase_user_id)
              .then(({ data, error }) => {
                if (error) {
                  console.log(`   ⚠️  User not found in Supabase Auth: ${error.message}`);
                  console.log('   Solution: Create user in Supabase Auth or run migration');
                } else {
                  console.log('   ✅ User exists in Supabase Auth');
                }
                pool.end();
              });
          } else {
            // Try to find by email
            supabase.auth.admin.listUsers()
              .then(({ data, error }) => {
                if (error) {
                  console.log(`   ⚠️  Cannot check Supabase Auth users: ${error.message}`);
                  if (!serviceRoleKey) {
                    console.log('   ⚠️  Need SUPABASE_SERVICE_ROLE_KEY to check users');
                  }
                } else {
                  const authUser = data.users.find(u => u.email === 'admin@emscale.com');
                  if (authUser) {
                    console.log('   ✅ User exists in Supabase Auth');
                    console.log(`      Supabase ID: ${authUser.id}`);
                    console.log('   ⚠️  But not linked in database!');
                    console.log(`   Run: UPDATE users SET supabase_user_id = '${authUser.id}' WHERE email = 'admin@emscale.com';`);
                  } else {
                    console.log('   ❌ User NOT found in Supabase Auth');
                    console.log('   Solution: Create user in Supabase Auth or use password reset');
                  }
                }
                pool.end();
              });
          }
        } else {
          pool.end();
        }
      }
    })
    .catch(err => {
      console.log(`   ❌ Database error: ${err.message}`);
      pool.end();
    });
}

// Check 4: Cookie Settings
console.log('\n4️⃣ Checking Cookie Configuration...');
const isProduction = process.env.NODE_ENV === 'production';
console.log(`   Environment: ${isProduction ? 'Production' : 'Development'}`);
console.log(`   Secure cookies: ${isProduction ? 'Required (HTTPS)' : 'Not required'}`);
console.log(`   SameSite: lax (configured)`);

// Summary
setTimeout(() => {
  console.log('\n📋 Summary:');
  console.log('   Check the issues above and fix them.');
  console.log('   Most common issues:');
  console.log('   1. Admin user not in Supabase Auth');
  console.log('   2. Missing environment variables');
  console.log('   3. Database connection issues');
  console.log('   4. Cookie settings in production');
}, 2000);

