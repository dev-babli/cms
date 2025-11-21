// PostgreSQL database connection using Supabase
import { Pool } from 'pg';

if (!process.env.DATABASE_URL) {
  console.warn('⚠️ DATABASE_URL environment variable is not set');
}

// Helper function to automatically encode password in connection string
function encodeConnectionString(connectionString: string): string {
  if (!connectionString) return connectionString;
  
  // Parse the connection string
  try {
    const url = new URL(connectionString);
    
    // If password exists and contains special characters, encode it
    if (url.password) {
      // Check if password needs encoding (contains unencoded special chars)
      const decodedPassword = decodeURIComponent(url.password);
      if (decodedPassword !== url.password || /[@#%&+=\/?]/.test(url.password)) {
        // Password might need encoding - encode it properly
        const encodedPassword = encodeURIComponent(decodedPassword);
        url.password = encodedPassword;
        return url.toString();
      }
    }
    
    return connectionString;
  } catch (e) {
    // If URL parsing fails, try manual encoding of common patterns
    // Pattern: postgresql://user:password@host:port/db
    const match = connectionString.match(/^postgresql:\/\/([^:]+):([^@]+)@(.+)$/);
    if (match) {
      const [, user, password, rest] = match;
      // Check if password needs encoding
      if (/[@#%&+=\/?]/.test(password) && !password.includes('%')) {
        const encodedPassword = encodeURIComponent(password);
        return `postgresql://${user}:${encodedPassword}@${rest}`;
      }
    }
    
    return connectionString;
  }
}

// Get and encode connection string
const rawConnectionString = process.env.DATABASE_URL || '';
const encodedConnectionString = encodeConnectionString(rawConnectionString);

// Create connection pool
const pool = new Pool({
  connectionString: encodedConnectionString,
  ssl: encodedConnectionString.includes('supabase') 
    ? { rejectUnauthorized: false } 
    : false,
  max: 10, // Reduced for Supabase connection limits
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000, // Increased timeout for Supabase
  // Supabase connection pooler settings
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
});

// Test connection
pool.on('connect', (client) => {
  if (process.env.NODE_ENV === 'development') {
    console.log('✅ Connected to PostgreSQL database');
  }
});

pool.on('error', (err) => {
  // Don't exit the process - just log the error
  // Supabase may terminate idle connections, which is normal
  // The pool will automatically reconnect when needed
  console.error('⚠️ Database pool error (will auto-reconnect):', err.message);
  
  // Only log full error in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Full error:', err);
  }
});

// Helper function to execute queries with retry logic
export const query = async (text: string, params?: any[], retries = 2): Promise<any> => {
  const start = Date.now();
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await pool.query(text, params);
      const duration = Date.now() - start;
      // Only log in development
      if (process.env.NODE_ENV === 'development') {
        console.log('Executed query', { text: text.substring(0, 100), duration, rows: res.rowCount });
      }
      return res;
    } catch (error: any) {
      // Check if it's a connection error that we should retry
      const isConnectionError = error.code === 'ECONNREFUSED' || 
                                 error.code === 'ETIMEDOUT' ||
                                 error.message?.includes('terminated') ||
                                 error.message?.includes('shutdown');
      
      if (isConnectionError && attempt < retries) {
        // Wait a bit before retrying
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
        continue;
      }
      
      // Log and throw the error
      console.error('Query error', { 
        text: text.substring(0, 100), 
        error: error.message,
        code: error.code,
        attempt: attempt + 1 
      });
      throw error;
    }
  }
  
  throw new Error('Query failed after retries');
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
    rows: result.rows, // Include rows for RETURNING clauses
    row: result.rows[0] || null, // Convenience accessor for first row
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

