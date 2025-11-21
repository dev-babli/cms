// Set admin role for existing user in Supabase Auth
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function setAdminRole() {
  try {
    console.log('🔍 Finding admin user...');
    
    // Find admin user
    const { data: users, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) {
      console.error('❌ Error:', listError.message);
      process.exit(1);
    }

    const adminUser = users?.users?.find((u) => u.email === 'admin@emscale.com');
    if (!adminUser) {
      console.error('❌ Admin user not found');
      process.exit(1);
    }

    console.log(`✅ Found admin user: ${adminUser.email} (${adminUser.id})`);
    console.log(`   Current role: ${adminUser.user_metadata?.role || 'not set'}`);

    // Update user metadata with admin role
    const { data: updatedUser, error: updateError } = await supabase.auth.admin.updateUserById(
      adminUser.id,
      {
        user_metadata: {
          name: 'System Administrator',
          role: 'admin',
        },
      }
    );

    if (updateError) {
      console.error('❌ Error updating user:', updateError.message);
      process.exit(1);
    }

    console.log('✅ Admin role set successfully!');
    console.log(`   New role: ${updatedUser.user.user_metadata?.role}`);
    console.log(`   Name: ${updatedUser.user.user_metadata?.name}`);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

setAdminRole();

