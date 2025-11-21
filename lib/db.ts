// PostgreSQL database connection using Supabase
import { Pool } from 'pg';

if (!process.env.DATABASE_URL) {
  console.warn('⚠️ DATABASE_URL environment variable is not set');
}

// Helper to parse and validate connection string
function getConnectionConfig() {
  const connectionString = process.env.DATABASE_URL || '';
  
  if (!connectionString) {
    throw new Error('DATABASE_URL is not set');
  }

  // Log connection info (without password) for debugging
  try {
    const url = new URL(connectionString);
    const maskedUrl = `${url.protocol}//${url.username}:****@${url.hostname}${url.pathname}`;
    if (process.env.NODE_ENV === 'development') {
      console.log('🔗 Database connection:', maskedUrl);
    }
  } catch (e) {
    // Invalid URL format
    console.error('❌ Invalid DATABASE_URL format');
  }

  return {
    connectionString,
    ssl: connectionString.includes('supabase') 
      ? { rejectUnauthorized: false } 
      : false,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 30000, // Increased to 30 seconds for Supabase
    statement_timeout: 30000, // 30 second statement timeout
    query_timeout: 30000, // 30 second query timeout
    keepAlive: true,
    keepAliveInitialDelayMillis: 10000,
    allowExitOnIdle: false, // Keep pool alive
  };
}

// Create connection pool
const poolConfig = getConnectionConfig();
const pool = new Pool(poolConfig);

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
export const query = async (text: string, params?: any[], retries = 3): Promise<any> => {
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
                                 error.code === 'ENOTFOUND' ||
                                 error.message?.includes('timeout') ||
                                 error.message?.includes('timeout exceeded') ||
                                 error.message?.includes('terminated') ||
                                 error.message?.includes('shutdown') ||
                                 error.message?.includes('Connection terminated');
      
      if (isConnectionError && attempt < retries) {
        // Exponential backoff: 1s, 2s, 4s
        const delay = Math.min(1000 * Math.pow(2, attempt), 5000);
        console.warn(`⚠️ Connection error (attempt ${attempt + 1}/${retries + 1}), retrying in ${delay}ms...`, error.message);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      // Enhanced error logging for authentication issues
      if (error.message?.includes('password authentication failed')) {
        console.error('❌ Database Authentication Failed!');
        console.error('   Error:', error.message);
        console.error('   💡 Check DATABASE_URL in Vercel environment variables');
        console.error('   💡 Verify password is correct');
        console.error('   💡 Connection string format: postgresql://postgres.xxx:password@host:port/db');
      }
      
      // Log and throw the error
      const connectionString = process.env.DATABASE_URL || '';
      const maskedConnection = connectionString.replace(/:([^@]+)@/, ':****@');
      console.error('Query error', { 
        text: text.substring(0, 100), 
        error: error.message,
        code: error.code,
        attempt: attempt + 1,
        connectionString: maskedConnection
      });
      
      // Provide more helpful error messages
      if (error.message?.includes('timeout') || error.code === 'ETIMEDOUT') {
        throw new Error(`Database connection timeout. Please check your DATABASE_URL and network connection. If using Supabase, try the pooler connection (port 6543). Original error: ${error.message}`);
      }
      
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
  // If using RETURNING *, return the row data
  if (text.toUpperCase().includes('RETURNING')) {
    return {
      lastInsertRowid: result.rows[0]?.id || null,
      changes: result.rowCount || 0,
      row: result.rows[0] || null,
      rows: result.rows || [],
    };
  }
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

