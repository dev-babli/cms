/**
 * Database initialization
 * This file handles database setup and seeding
 */
import db from './db';
import { initializeDefaultAdmin } from './auth/users';

/**
 * Initialize the database and create default admin user
 */
export async function initializeDatabase() {
  console.log('🔧 Initializing database...');
  
  try {
    // Database tables are created by importing db
    console.log('✅ Database tables created');
    
    // Initialize default admin user
    await initializeDefaultAdmin();
    console.log('✅ Default admin user initialized');
    
    console.log('🎉 Database initialization complete!');
    return true;
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
}

/**
 * Run initialization if this file is executed directly
 */
if (require.main === module) {
  initializeDatabase()
    .then(() => {
      console.log('Database ready!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Initialization failed:', error);
      process.exit(1);
    });
}




