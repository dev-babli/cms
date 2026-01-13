/**
 * Login Attempts Tracker - 2026 Enhanced Security
 * 
 * Tracks all login attempts with IP, email, success/failure, and timestamps
 * Used for security monitoring and IP management
 */

import { query, queryAll } from '@/lib/db';
import { getClientIdentifier } from './rate-limiter';

export interface LoginAttempt {
  id?: number;
  ip: string;
  email: string;
  success: boolean;
  user_id?: string | null;
  user_name?: string | null;
  user_role?: string | null;
  error_message?: string | null;
  user_agent?: string | null;
  created_at: number;
}

/**
 * Initialize login_attempts table
 */
async function initializeTable() {
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS login_attempts (
        id SERIAL PRIMARY KEY,
        ip TEXT NOT NULL,
        email TEXT NOT NULL,
        success BOOLEAN NOT NULL DEFAULT false,
        user_id TEXT,
        user_name TEXT,
        user_role TEXT,
        error_message TEXT,
        user_agent TEXT,
        created_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT
      )
    `);
    
    // Create indexes
    await query(`
      CREATE INDEX IF NOT EXISTS idx_login_attempts_ip ON login_attempts(ip)
    `).catch(() => {});
    
    await query(`
      CREATE INDEX IF NOT EXISTS idx_login_attempts_email ON login_attempts(email)
    `).catch(() => {});
    
    await query(`
      CREATE INDEX IF NOT EXISTS idx_login_attempts_created_at ON login_attempts(created_at)
    `).catch(() => {});
    
    await query(`
      CREATE INDEX IF NOT EXISTS idx_login_attempts_success ON login_attempts(success)
    `).catch(() => {});
  } catch (error: any) {
    if (!error.message?.includes('already exists') && !error.message?.includes('duplicate')) {
      console.warn('⚠️ Login Attempts: Table creation note:', error.message);
    }
  }
}

/**
 * Record a login attempt
 */
export async function recordLoginAttempt(
  request: Request,
  email: string,
  success: boolean,
  userData?: {
    id?: string;
    name?: string;
    role?: string;
  },
  errorMessage?: string
): Promise<void> {
  try {
    await initializeTable();
    
    const ip = getClientIdentifier(request as any);
    const userAgent = request.headers.get('user-agent') || null;
    
    const result = await query(`
      INSERT INTO login_attempts 
      (ip, email, success, user_id, user_name, user_role, error_message, user_agent, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id
    `, [
      ip,
      email,
      success,
      userData?.id || null,
      userData?.name || null,
      userData?.role || null,
      errorMessage || null,
      userAgent,
      Date.now(),
    ]);
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`📝 Login Attempt: ${success ? '✅' : '❌'} ${email} from ${ip}`);
    }
  } catch (error: any) {
    console.error('❌ Failed to record login attempt:', error);
    // Don't throw - login attempt logging shouldn't break authentication
  }
}

/**
 * Get login attempts with filters
 */
export async function getLoginAttempts(options: {
  ip?: string;
  email?: string;
  success?: boolean;
  limit?: number;
  offset?: number;
  startDate?: number;
  endDate?: number;
} = {}): Promise<LoginAttempt[]> {
  try {
    await initializeTable();
    
    let queryText = 'SELECT * FROM login_attempts WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;
    
    if (options.ip) {
      queryText += ` AND ip = $${paramIndex}`;
      params.push(options.ip);
      paramIndex++;
    }
    
    if (options.email) {
      queryText += ` AND email ILIKE $${paramIndex}`;
      params.push(`%${options.email}%`);
      paramIndex++;
    }
    
    if (options.success !== undefined) {
      queryText += ` AND success = $${paramIndex}`;
      params.push(options.success);
      paramIndex++;
    }
    
    if (options.startDate) {
      queryText += ` AND created_at >= $${paramIndex}`;
      params.push(options.startDate);
      paramIndex++;
    }
    
    if (options.endDate) {
      queryText += ` AND created_at <= $${paramIndex}`;
      params.push(options.endDate);
      paramIndex++;
    }
    
    queryText += ' ORDER BY created_at DESC';
    
    if (options.limit) {
      queryText += ` LIMIT $${paramIndex}`;
      params.push(options.limit);
      paramIndex++;
    }
    
    if (options.offset) {
      queryText += ` OFFSET $${paramIndex}`;
      params.push(options.offset);
      paramIndex++;
    }
    
    const result = await queryAll(queryText, params);
    return result.map((row: any) => ({
      id: row.id,
      ip: row.ip,
      email: row.email,
      success: row.success,
      user_id: row.user_id,
      user_name: row.user_name,
      user_role: row.user_role,
      error_message: row.error_message,
      user_agent: row.user_agent,
      created_at: row.created_at,
    }));
  } catch (error: any) {
    console.error('❌ Failed to get login attempts:', error);
    return [];
  }
}

/**
 * Get login attempt statistics
 */
export async function getLoginAttemptStats(ip?: string): Promise<{
  total: number;
  successful: number;
  failed: number;
  uniqueEmails: number;
  uniqueIPs: number;
  recentFailures: number;
}> {
  try {
    await initializeTable();
    
    let whereClause = '';
    const params: any[] = [];
    if (ip) {
      whereClause = 'WHERE ip = $1';
      params.push(ip);
    }
    
    const recentParams = ip ? [...params, Date.now() - 24 * 60 * 60 * 1000] : [Date.now() - 24 * 60 * 60 * 1000];
    const recentWhereClause = ip ? 'WHERE ip = $1 AND success = false AND created_at > $2' : 'WHERE success = false AND created_at > $1';
    
    const [totalResult, successResult, failedResult, emailsResult, ipsResult, recentResult] = await Promise.all([
      query(`SELECT COUNT(*) as count FROM login_attempts ${whereClause}`, params),
      query(`SELECT COUNT(*) as count FROM login_attempts ${whereClause} AND success = true`, params),
      query(`SELECT COUNT(*) as count FROM login_attempts ${whereClause} AND success = false`, params),
      query(`SELECT COUNT(DISTINCT email) as count FROM login_attempts ${whereClause}`, params),
      query(`SELECT COUNT(DISTINCT ip) as count FROM login_attempts ${whereClause}`, params),
      query(`SELECT COUNT(*) as count FROM login_attempts ${recentWhereClause}`, recentParams),
    ]);
    
    // PostgreSQL query returns { rows: [{ count: '123' }] }
    const getCount = (result: any) => {
      const count = result?.rows?.[0]?.count || result?.[0]?.count || '0';
      return parseInt(String(count), 10);
    };
    
    return {
      total: getCount(totalResult),
      successful: getCount(successResult),
      failed: getCount(failedResult),
      uniqueEmails: getCount(emailsResult),
      uniqueIPs: getCount(ipsResult),
      recentFailures: getCount(recentResult),
    };
  } catch (error: any) {
    console.error('❌ Failed to get login attempt stats:', error);
    return {
      total: 0,
      successful: 0,
      failed: 0,
      uniqueEmails: 0,
      uniqueIPs: 0,
      recentFailures: 0,
    };
  }
}

