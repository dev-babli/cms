// Script to create a new user in Supabase
require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('supabase') 
    ? { rejectUnauthorized: false } 
    : false,
});

// Get email and password from command line arguments
const email = process.argv[2] || 'soumeet';
const password = process.argv[3] || 'soumeet';
const name = process.argv[4] || email.charAt(0).toUpperCase() + email.slice(1);
const role = process.argv[5] || 'author';

async function createUser() {
  try {
    console.log('🔍 Checking for user...');
    console.log(`   Email: ${email}`);
    
    // Check if user exists
    const checkResult = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    
    if (checkResult.rows.length > 0) {
      console.log('⚠️  User already exists!');
      console.log('   Email:', checkResult.rows[0].email);
      console.log('   Role:', checkResult.rows[0].role);
      console.log('   ID:', checkResult.rows[0].id);
      
      // Ask if we should update password
      const updatePassword = process.argv[6] === '--update-password';
      
      if (updatePassword) {
        console.log('🔄 Updating password...');
        const newHash = await bcrypt.hash(password, 12);
        await pool.query(
          'UPDATE users SET password_hash = $1 WHERE email = $2',
          [newHash, email]
        );
        console.log('✅ Password updated!');
      } else {
        console.log('💡 To update password, run with --update-password flag');
      }
      
      await pool.end();
      return;
    }
    
    console.log('📝 Creating user...');
    
    // Create user
    const passwordHash = await bcrypt.hash(password, 12);
    
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, name, role, status, email_verified)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, email, name, role`,
      [
        email,
        passwordHash,
        name,
        role,
        'active',
        true
      ]
    );
    
    console.log('✅ User created successfully!');
    console.log('   Email:', result.rows[0].email);
    console.log('   Password:', password);
    console.log('   Name:', result.rows[0].name);
    console.log('   Role:', result.rows[0].role);
    console.log('   ID:', result.rows[0].id);
    
    await pool.end();
  } catch (error) {
    console.error('❌ Error creating user:', error.message);
    console.error(error);
    process.exit(1);
  }
}

createUser();

