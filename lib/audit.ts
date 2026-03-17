/**
 * Basic audit logging for content and user actions.
 * Logs to audit_log table (run supabase-audit-log-migration.sql first).
 */

import { query } from './db';

export interface AuditEntry {
  userId?: number;
  userEmail?: string;
  action: string;
  resourceType?: string;
  resourceId?: string | number;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
}

export async function logAudit(entry: AuditEntry): Promise<void> {
  try {
    await query(
      `INSERT INTO audit_log (user_id, user_email, action, resource_type, resource_id, metadata, ip_address)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        entry.userId ?? null,
        entry.userEmail ?? null,
        entry.action,
        entry.resourceType ?? null,
        entry.resourceId != null ? String(entry.resourceId) : null,
        entry.metadata ? JSON.stringify(entry.metadata) : null,
        entry.ipAddress ?? null,
      ]
    );
  } catch (err) {
    console.error('[audit] Failed to log:', err);
  }
}
