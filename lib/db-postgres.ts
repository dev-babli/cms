// PostgreSQL database connection using Supabase
import { Pool } from 'pg';

if (!process.env.DATABASE_URL) {
  console.warn('⚠️ DATABASE_URL environment variable is not set');
}

// Create connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('supabase') 
    ? { rejectUnauthorized: false } 
    : false,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test connection
pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle client', err);
  process.exit(-1);
});

// Helper function to execute queries
export const query = async (text: string, params?: any[]) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    // Only log in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Executed query', { text: text.substring(0, 100), duration, rows: res.rowCount });
    }
    return res;
  } catch (error) {
    console.error('Query error', { text, error });
    throw error;
  }
};

// Helper function to get a single row
export const queryOne = async (text: string, params?: any[]) => {
  const result = await query(text, params);
  return result.rows[0] || null;
};

// Helper function to get all rows
export const queryAll = async (text: string, params?: any[]) => {
  const result = await query(text, params);
  return result.rows;
};

// Helper function to execute (INSERT/UPDATE/DELETE)
export const execute = async (text: string, params?: any[]) => {
  const result = await query(text, params);
  return {
    lastInsertRowid: result.rows[0]?.id || null,
    changes: result.rowCount || 0,
  };
};

// Compatibility wrapper to match SQLite API
const db = {
  prepare: (sql: string) => {
    return {
      get: async (...params: any[]) => {
        // Convert SQLite ? placeholders to PostgreSQL $1, $2, etc.
        let paramIndex = 1;
        const pgSql = sql.replace(/\?/g, () => `$${paramIndex++}`);
        return await queryOne(pgSql, params);
      },
      all: async (...params: any[]) => {
        let paramIndex = 1;
        const pgSql = sql.replace(/\?/g, () => `$${paramIndex++}`);
        return await queryAll(pgSql, params);
      },
      run: async (...params: any[]) => {
        let paramIndex = 1;
        const pgSql = sql.replace(/\?/g, () => `$${paramIndex++}`);
        return await execute(pgSql, params);
      },
    };
  },
  exec: async (sql: string) => {
    // Split multiple statements and execute
    const statements = sql.split(';').filter(s => s.trim());
    for (const statement of statements) {
      if (statement.trim()) {
        await query(statement.trim());
      }
    }
  },
};

export default db;

