// Script to create admin user in Supabase
require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('supabase') 
    ? { rejectUnauthorized: false } 
    : false,
});

async function createAdmin() {
  try {
    console.log('🔍 Checking for admin user...');
    
    // Check if admin exists
    const checkResult = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      ['admin@emscale.com']
    );
    
    if (checkResult.rows.length > 0) {
      console.log('✅ Admin user already exists!');
      console.log('   Email:', checkResult.rows[0].email);
      console.log('   Role:', checkResult.rows[0].role);
      console.log('   ID:', checkResult.rows[0].id);
      
      // Test password
      const isValid = await bcrypt.compare('admin123', checkResult.rows[0].password_hash);
      if (isValid) {
        console.log('✅ Password is correct!');
      } else {
        console.log('⚠️  Password hash doesn\'t match. Updating password...');
        const newHash = await bcrypt.hash('admin123', 12);
        await pool.query(
          'UPDATE users SET password_hash = $1 WHERE email = $2',
          [newHash, 'admin@emscale.com']
        );
        console.log('✅ Password updated!');
      }
      await pool.end();
      return;
    }
    
    console.log('📝 Creating admin user...');
    
    // Create admin user
    const passwordHash = await bcrypt.hash('admin123', 12);
    
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, name, role, status, email_verified)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, email, name, role`,
      [
        'admin@emscale.com',
        passwordHash,
        'System Administrator',
        'admin',
        'active',
        true
      ]
    );
    
    console.log('✅ Admin user created successfully!');
    console.log('   Email: admin@emscale.com');
    console.log('   Password: admin123');
    console.log('   Role: admin');
    console.log('   ID:', result.rows[0].id);
    
    await pool.end();
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    console.error(error);
    process.exit(1);
  }
}

createAdmin();

