#!/usr/bin/env node

/**
 * Database initialization script
 * Run this to set up the database and create default admin user
 */

const path = require('path');

// Set up paths for ESM modules
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

console.log('🚀 Starting database initialization...\n');

async function main() {
  try {
    // Import the initialization function
    const { initializeDatabase } = require('../lib/init.ts');
    
    // Run initialization
    await initializeDatabase();
    
    console.log('\n✅ Database initialization complete!');
    console.log('\n📝 Default admin credentials:');
    console.log('   Email: admin@emscale.com');
    console.log('   Password: admin123');
    console.log('\n⚠️  Change these credentials in production!');
    console.log('\nYou can now run: npm run dev');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Initialization failed:', error);
    process.exit(1);
  }
}

main();
