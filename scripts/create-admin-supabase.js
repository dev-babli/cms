// Script to create admin user in Supabase Auth and link with database
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const { Pool } = require('pg');

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('supabase') 
    ? { rejectUnauthorized: false } 
    : false,
});

async function createAdminInSupabase() {
  try {
    console.log('🔍 Checking for admin user in Supabase Auth...\n');
    
    // List all users to check if admin exists
    const { data: users, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.error('❌ Error listing users:', listError.message);
      process.exit(1);
    }
    
    const adminUser = users.users.find(u => u.email === 'admin@emscale.com');
    
    if (adminUser) {
      console.log('✅ Admin user already exists in Supabase Auth');
      console.log(`   ID: ${adminUser.id}`);
      console.log(`   Email: ${adminUser.email}`);
      console.log(`   Email Confirmed: ${adminUser.email_confirmed_at ? 'Yes' : 'No'}`);
      
      // Link with database
      await linkUserToDatabase(adminUser.id, adminUser.email);
      return;
    }
    
    // Create admin user in Supabase Auth
    console.log('📝 Creating admin user in Supabase Auth...');
    
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email: 'admin@emscale.com',
      password: 'admin123',
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        name: 'System Administrator',
        role: 'admin',
      },
    });
    
    if (createError) {
      console.error('❌ Error creating user:', createError.message);
      process.exit(1);
    }
    
    if (!newUser.user) {
      console.error('❌ Failed to create user');
      process.exit(1);
    }
    
    console.log('✅ Admin user created in Supabase Auth');
    console.log(`   ID: ${newUser.user.id}`);
    console.log(`   Email: ${newUser.user.email}`);
    
    // Link with database
    await linkUserToDatabase(newUser.user.id, newUser.user.email);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

async function linkUserToDatabase(supabaseUserId, email) {
  try {
    console.log('\n🔗 Linking user to database...');
    
    // Check if user exists in database
    const checkResult = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    
    if (checkResult.rows.length === 0) {
      console.log('📝 Creating user in database...');
      
      // Create user in database
      const insertResult = await pool.query(
        `INSERT INTO users (email, name, role, status, email_verified, supabase_user_id)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [
          email,
          'System Administrator',
          'admin',
          'active',
          true,
          supabaseUserId,
        ]
      );
      
      console.log('✅ User created in database');
      console.log(`   Database ID: ${insertResult.rows[0].id}`);
    } else {
      console.log('✅ User already exists in database');
      
      // Update to link with Supabase
      const updateResult = await pool.query(
        `UPDATE users 
         SET supabase_user_id = $1, 
             status = 'active',
             email_verified = true
         WHERE email = $2
         RETURNING *`,
        [supabaseUserId, email]
      );
      
      console.log('✅ User linked with Supabase Auth');
      console.log(`   Database ID: ${updateResult.rows[0].id}`);
    }
    
    console.log('\n🎉 Admin user is ready!');
    console.log('   Email: admin@emscale.com');
    console.log('   Password: admin123');
    console.log('   Status: active');
    console.log('   Linked: Yes');
    
    await pool.end();
    
  } catch (error) {
    console.error('❌ Error linking user:', error.message);
    await pool.end();
    process.exit(1);
  }
}

createAdminInSupabase();


