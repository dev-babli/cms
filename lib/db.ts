// PostgreSQL database connection using Supabase
import { Pool } from 'pg';

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is not set');
  console.error('   Please set DATABASE_URL in your .env file or environment variables');
  console.error('   Format: postgresql://user:password@host:port/database');
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

  // For Supabase, use smaller pool size to avoid connection limits
  // Free tier: 60 direct connections, 200 pooler connections
  // Use pooler (port 6543) for better connection management
  const isSupabase = connectionString.includes('supabase');
  const usePooler = isSupabase && connectionString.includes(':6543');
  
  return {
    connectionString,
    ssl: isSupabase 
      ? { rejectUnauthorized: false } 
      : false,
    // Reduce pool size to avoid "max connections" errors
    // Supabase free tier has connection limits
    max: usePooler ? 5 : 3, // Smaller pool for direct connections, slightly larger for pooler
    min: 0, // Don't keep idle connections
    idleTimeoutMillis: 10000, // Close idle connections faster (10 seconds)
    connectionTimeoutMillis: 10000, // 10 second connection timeout
    statement_timeout: 20000, // 20 second statement timeout
    query_timeout: 20000, // 20 second query timeout
    keepAlive: true,
    keepAliveInitialDelayMillis: 10000,
    allowExitOnIdle: true, // Allow pool to close when idle
  };
}

// Create connection pool lazily (only when needed)
// This prevents crashes during module initialization if DATABASE_URL is missing
let pool: Pool | null = null;

function setupPoolEventHandlers(poolInstance: Pool) {
  poolInstance.on('connect', (client) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ Connected to PostgreSQL database');
    }
  });

  poolInstance.on('error', (err) => {
    // Don't exit the process - just log the error
    // Supabase may terminate idle connections, which is normal
    // The pool will automatically reconnect when needed
    console.error('⚠️ Database pool error (will auto-reconnect):', err.message);
    
    // Only log full error in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Full error:', err);
    }
  });
}

function getPool(): Pool {
  if (!pool) {
    try {
      const poolConfig = getConnectionConfig();
      pool = new Pool(poolConfig);
      setupPoolEventHandlers(pool);
    } catch (error: any) {
      console.error('❌ Failed to initialize database pool:', error.message);
      throw error;
    }
  }
  return pool;
}

// Helper function to execute queries with retry logic
export const query = async (text: string, params?: any[], retries = 3): Promise<any> => {
  const start = Date.now();
  
  // Check if DATABASE_URL is set
  if (!process.env.DATABASE_URL) {
    const error = new Error('DATABASE_URL environment variable is not set. Please configure your database connection.');
    console.error('❌ Database Configuration Error:', error.message);
    throw error;
  }
  
  // Initialize pool if not already initialized (lazy initialization)
  let poolInstance: Pool;
  try {
    poolInstance = getPool();
  } catch (error: any) {
    console.error('❌ Failed to create database pool:', error.message);
    throw new Error(`Database connection failed: ${error.message}`);
  }
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await poolInstance.query(text, params);
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
      
      // Enhanced error logging
      const errorMessage = error?.message || 'Unknown database error';
      const errorCode = error?.code || 'UNKNOWN';
      const errorDetail = error?.detail || '';
      const errorHint = error?.hint || '';
      
      // Enhanced error logging for authentication issues
      if (errorMessage.includes('password authentication failed')) {
        console.error('❌ Database Authentication Failed!');
        console.error('   Error:', errorMessage);
        console.error('   💡 Check DATABASE_URL in Vercel environment variables');
        console.error('   💡 Verify password is correct');
        console.error('   💡 Connection string format: postgresql://postgres.xxx:password@host:port/db');
      }
      
      // Check for table not found errors
      if (errorMessage.includes('does not exist') || errorMessage.includes('relation') && errorMessage.includes('does not exist')) {
        console.error('❌ Database Table Not Found!');
        console.error('   Error:', errorMessage);
        console.error('   💡 The database tables may not be initialized');
        console.error('   💡 Run database migrations or initialization scripts');
      }
      
      // Check for max connections error
      if (errorMessage.includes('Max client connections') || 
          errorMessage.includes('too many clients') ||
          errorMessage.includes('connection limit') ||
          errorCode === '53300') {
        console.error('❌ Database Connection Pool Exhausted!');
        console.error('   Error:', errorMessage);
        console.error('   💡 Too many concurrent database connections');
        console.error('   💡 For Supabase: Use connection pooler (port 6543) instead of direct connection (port 5432)');
        console.error('   💡 Update DATABASE_URL to use port 6543 for better connection management');
        console.error('   💡 Example: postgresql://user:pass@host.xxx.supabase.co:6543/db');
        // Don't retry on connection limit errors - it will just make it worse
        throw new Error(`Database connection limit reached. Please use Supabase connection pooler (port 6543) or reduce concurrent requests. Original error: ${errorMessage}`);
      }
      
      // Log and throw the error with full details
      const connectionString = process.env.DATABASE_URL || '';
      const maskedConnection = connectionString.replace(/:([^@]+)@/, ':****@');
      
      console.error('Query error', { 
        text: text.substring(0, 200), 
        error: errorMessage,
        code: errorCode,
        detail: errorDetail,
        hint: errorHint,
        attempt: attempt + 1,
        connectionString: maskedConnection,
        fullError: process.env.NODE_ENV === 'development' ? error : undefined
      });
      
      // Provide more helpful error messages
      if (errorMessage.includes('timeout') || errorCode === 'ETIMEDOUT') {
        throw new Error(`Database connection timeout. Please check your DATABASE_URL and network connection. If using Supabase, try the pooler connection (port 6543). Original error: ${errorMessage}`);
      }
      
      // Create a more descriptive error
      const descriptiveError = new Error(
        `Database query failed: ${errorMessage}${errorDetail ? ` (${errorDetail})` : ''}${errorHint ? `. Hint: ${errorHint}` : ''}`
      );
      (descriptiveError as any).code = errorCode;
      (descriptiveError as any).originalError = error;
      throw descriptiveError;
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

