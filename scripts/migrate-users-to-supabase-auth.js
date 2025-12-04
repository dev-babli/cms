// Script to migrate existing users to Supabase Auth
require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');
const { createClient } = require('@supabase/supabase-js');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('supabase') 
    ? { rejectUnauthorized: false } 
    : false,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY
);

async function migrateUsers() {
  try {
    console.log('🔍 Fetching existing users...');
    
    // Get all users from custom table
    const result = await pool.query('SELECT * FROM users ORDER BY id');
    const users = result.rows;
    
    console.log(`📊 Found ${users.length} users to migrate`);
    
    let migrated = 0;
    let skipped = 0;
    let errors = 0;
    
    for (const user of users) {
      try {
        // Skip if already has supabase_user_id
        if (user.supabase_user_id) {
          console.log(`⏭️  Skipping ${user.email} (already has Supabase ID)`);
          skipped++;
          continue;
        }
        
        console.log(`🔄 Migrating ${user.email}...`);
        
        // Check if user exists in Supabase Auth
        const { data: existingAuthUser } = await supabase.auth.admin.getUserByEmail(user.email);
        
        if (existingAuthUser?.user) {
          // User exists in Supabase Auth - just link them
          console.log(`   ✅ Found in Supabase Auth, linking...`);
          await pool.query(
            'UPDATE users SET supabase_user_id = $1 WHERE id = $2',
            [existingAuthUser.user.id, user.id]
          );
          migrated++;
        } else {
          // Create user in Supabase Auth
          // Note: We can't set password, so user will need to reset password
          console.log(`   ⚠️  User doesn't exist in Supabase Auth`);
          console.log(`   💡 User will need to use "Forgot Password" to set new password`);
          
          // For now, just mark that migration is needed
          // Admin can manually create or user can reset password
          skipped++;
        }
      } catch (error) {
        console.error(`   ❌ Error migrating ${user.email}:`, error.message);
        errors++;
      }
    }
    
    console.log('\n📊 Migration Summary:');
    console.log(`   ✅ Migrated: ${migrated}`);
    console.log(`   ⏭️  Skipped: ${skipped}`);
    console.log(`   ❌ Errors: ${errors}`);
    
    console.log('\n💡 Next Steps:');
    console.log('   1. Users without Supabase Auth accounts need to use "Forgot Password"');
    console.log('   2. Or admin can manually create accounts in Supabase Dashboard');
    console.log('   3. New registrations will automatically use Supabase Auth');
    
    await pool.end();
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrateUsers();


