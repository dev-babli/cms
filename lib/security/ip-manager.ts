/**
 * IP Manager - 2026 Enhanced Security
 * 
 * Manages IP whitelisting, blacklisting, and reputation tracking
 * with database persistence for production use.
 * 
 * Supports both PostgreSQL (Supabase) and SQLite databases.
 */

import { query } from '@/lib/db';

export interface IPRecord {
  ip: string;
  type: 'whitelist' | 'blacklist' | 'monitor';
  reason?: string;
  created_at: number;
  expires_at?: number;
  violation_count: number;
  last_violation?: number;
}

// In-memory cache for fast lookups
const ipCache = new Map<string, IPRecord>();
let cacheInitialized = false;

/**
 * Initialize IP cache from database
 */
async function initializeCache() {
  if (cacheInitialized) return;
  
  try {
    // Check if ip_management table exists, if not create it
    // PostgreSQL-compatible table creation
    try {
      await query(`
        CREATE TABLE IF NOT EXISTS ip_management (
          id SERIAL PRIMARY KEY,
          ip TEXT UNIQUE NOT NULL,
          type TEXT NOT NULL CHECK(type IN ('whitelist', 'blacklist', 'monitor')),
          reason TEXT,
          created_at BIGINT NOT NULL,
          expires_at BIGINT,
          violation_count INTEGER DEFAULT 0,
          last_violation BIGINT,
          updated_at BIGINT DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT
        )
      `);
      
      // Create indexes
      await query(`
        CREATE INDEX IF NOT EXISTS idx_ip_management_ip ON ip_management(ip)
      `).catch(() => {}); // Ignore if index already exists
      
      await query(`
        CREATE INDEX IF NOT EXISTS idx_ip_management_type ON ip_management(type)
      `).catch(() => {}); // Ignore if index already exists
    } catch (createError: any) {
      // Table might already exist, continue
      if (!createError.message?.includes('already exists') && !createError.message?.includes('duplicate')) {
        console.warn('⚠️ IP Manager: Table creation note:', createError.message);
      }
    }
    
    // Load all IPs from database
    const now = Date.now();
    const result = await query(`
      SELECT * FROM ip_management 
      WHERE expires_at IS NULL OR expires_at > $1
    `, [now]);
    
    const ips = result.rows || [];
    ips.forEach((ip: any) => {
      ipCache.set(ip.ip, {
        ip: ip.ip,
        type: ip.type,
        reason: ip.reason,
        created_at: ip.created_at,
        expires_at: ip.expires_at,
        violation_count: ip.violation_count || 0,
        last_violation: ip.last_violation,
      });
    });
    
    cacheInitialized = true;
    console.log(`✅ IP Manager: Loaded ${ipCache.size} IP records from database`);
  } catch (error: any) {
    console.error('❌ IP Manager: Failed to initialize cache:', error);
    // Continue with empty cache
    cacheInitialized = true;
  }
}

/**
 * Check if IP is whitelisted
 */
export async function isWhitelisted(ip: string): Promise<boolean> {
  await initializeCache();
  const record = ipCache.get(ip);
  return record?.type === 'whitelist' && (!record.expires_at || record.expires_at > Date.now());
}

/**
 * Check if IP is blacklisted
 */
export async function isBlacklisted(ip: string): Promise<boolean> {
  await initializeCache();
  const record = ipCache.get(ip);
  if (!record) return false;
  
  // Check if blacklist entry has expired
  if (record.type === 'blacklist' && record.expires_at && record.expires_at < Date.now()) {
    // Auto-remove expired blacklist
    await removeIP(ip);
    return false;
  }
  
  return record.type === 'blacklist';
}

/**
 * Add IP to whitelist
 */
export async function addToWhitelist(ip: string, reason?: string, expiresIn?: number): Promise<void> {
  await initializeCache();
  
  const expiresAt = expiresIn ? Date.now() + expiresIn : undefined;
  const record: IPRecord = {
    ip,
    type: 'whitelist',
    reason,
    created_at: Date.now(),
    expires_at: expiresAt,
    violation_count: 0,
  };
  
  try {
    await query(`
      INSERT INTO ip_management 
      (ip, type, reason, created_at, expires_at, violation_count, updated_at)
      VALUES ($1, $2, $3, $4, $5, 0, $6)
      ON CONFLICT (ip) 
      DO UPDATE SET 
        type = $2,
        reason = $3,
        expires_at = $5,
        updated_at = $6,
        violation_count = 0
    `, [ip, 'whitelist', reason || null, Date.now(), expiresAt || null, Date.now()]);
    
    ipCache.set(ip, record);
    console.log(`✅ IP Manager: Added ${ip} to whitelist`);
  } catch (error: any) {
    console.error(`❌ IP Manager: Failed to whitelist ${ip}:`, error);
    throw error;
  }
}

/**
 * Add IP to blacklist
 */
export async function addToBlacklist(ip: string, reason?: string, expiresIn?: number): Promise<void> {
  await initializeCache();
  
  const expiresAt = expiresIn ? Date.now() + expiresIn : undefined;
  const record: IPRecord = {
    ip,
    type: 'blacklist',
    reason,
    created_at: Date.now(),
    expires_at: expiresAt,
    violation_count: 0,
  };
  
  try {
    await query(`
      INSERT INTO ip_management 
      (ip, type, reason, created_at, expires_at, violation_count, updated_at)
      VALUES ($1, $2, $3, $4, $5, 0, $6)
      ON CONFLICT (ip) 
      DO UPDATE SET 
        type = $2,
        reason = $3,
        expires_at = $5,
        updated_at = $6,
        violation_count = 0
    `, [ip, 'blacklist', reason || null, Date.now(), expiresAt || null, Date.now()]);
    
    ipCache.set(ip, record);
    console.log(`✅ IP Manager: Added ${ip} to blacklist`);
  } catch (error: any) {
    console.error(`❌ IP Manager: Failed to blacklist ${ip}:`, error);
    throw error;
  }
}

/**
 * Record violation for IP
 */
export async function recordViolation(ip: string, violationType: string): Promise<void> {
  await initializeCache();
  
  try {
    const existingResult = await query('SELECT * FROM ip_management WHERE ip = $1', [ip]);
    const existing = existingResult.rows?.[0] as any;
    
    if (existing) {
      const violationCount = (existing.violation_count || 0) + 1;
      await query(`
        UPDATE ip_management 
        SET violation_count = $1, last_violation = $2, updated_at = $3
        WHERE ip = $4
      `, [violationCount, Date.now(), Date.now(), ip]);
      
      // Auto-blacklist after 5 violations
      if (violationCount >= 5 && existing.type !== 'blacklist') {
        await addToBlacklist(ip, `Auto-blacklisted after ${violationCount} violations: ${violationType}`, 24 * 60 * 60 * 1000); // 24 hours
      }
    } else {
      // Create monitor entry
      await query(`
        INSERT INTO ip_management 
        (ip, type, violation_count, last_violation, created_at, updated_at)
        VALUES ($1, 'monitor', 1, $2, $3, $4)
      `, [ip, Date.now(), Date.now(), Date.now()]);
    }
    
    // Update cache
    const updatedResult = await query('SELECT * FROM ip_management WHERE ip = $1', [ip]);
    const updated = updatedResult.rows?.[0] as any;
    if (updated) {
      ipCache.set(ip, {
        ip: updated.ip,
        type: updated.type,
        reason: updated.reason,
        created_at: updated.created_at,
        expires_at: updated.expires_at,
        violation_count: updated.violation_count,
        last_violation: updated.last_violation,
      });
    }
  } catch (error: any) {
    console.error(`❌ IP Manager: Failed to record violation for ${ip}:`, error);
  }
}

/**
 * Remove IP from management
 */
export async function removeIP(ip: string): Promise<void> {
  await initializeCache();
  
  try {
    await query('DELETE FROM ip_management WHERE ip = $1', [ip]);
    ipCache.delete(ip);
    console.log(`✅ IP Manager: Removed ${ip} from management`);
  } catch (error: any) {
    console.error(`❌ IP Manager: Failed to remove ${ip}:`, error);
  }
}

/**
 * Get IP record
 */
export async function getIPRecord(ip: string): Promise<IPRecord | null> {
  await initializeCache();
  return ipCache.get(ip) || null;
}

/**
 * Get all IPs by type
 */
export async function getIPsByType(type: 'whitelist' | 'blacklist' | 'monitor'): Promise<IPRecord[]> {
  await initializeCache();
  return Array.from(ipCache.values()).filter(record => record.type === type);
}

