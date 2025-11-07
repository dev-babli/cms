import db from '@/lib/db';
import crypto from 'crypto';

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  domain?: string;
  subdomain?: string;
  status: 'active' | 'suspended' | 'pending';
  plan: 'free' | 'pro' | 'enterprise';
  settings: TenantSettings;
  limits: TenantLimits;
  created_at: string;
  updated_at: string;
}

export interface TenantSettings {
  branding?: {
    logo?: string;
    primaryColor?: string;
    secondaryColor?: string;
  };
  features?: string[];
  customDomain?: boolean;
  allowedOrigins?: string[];
}

export interface TenantLimits {
  maxUsers: number;
  maxPosts: number;
  maxStorage: number; // in MB
  maxApiCalls: number; // per day
}

export interface TenantUsage {
  users: number;
  posts: number;
  storage: number; // in MB
  apiCalls: number; // today
}

export class TenancyManager {
  private static instance: TenancyManager;
  private currentTenant?: Tenant;

  static getInstance(): TenancyManager {
    if (!TenancyManager.instance) {
      TenancyManager.instance = new TenancyManager();
      TenancyManager.instance.initializeDatabase();
    }
    return TenancyManager.instance;
  }

  private initializeDatabase() {
    db.exec(`
      CREATE TABLE IF NOT EXISTS tenants (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        domain TEXT UNIQUE,
        subdomain TEXT UNIQUE,
        status TEXT DEFAULT 'active',
        plan TEXT DEFAULT 'free',
        settings TEXT,
        limits TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS tenant_usage (
        tenant_id TEXT PRIMARY KEY,
        users INTEGER DEFAULT 0,
        posts INTEGER DEFAULT 0,
        storage INTEGER DEFAULT 0,
        api_calls INTEGER DEFAULT 0,
        api_calls_date DATE,
        FOREIGN KEY (tenant_id) REFERENCES tenants (id) ON DELETE CASCADE
      );

      -- Add tenant_id to existing tables
      -- Note: In production, you'd use proper migrations
      ALTER TABLE blog_posts ADD COLUMN tenant_id TEXT;
      ALTER TABLE services ADD COLUMN tenant_id TEXT;
      ALTER TABLE team_members ADD COLUMN tenant_id TEXT;
      ALTER TABLE media ADD COLUMN tenant_id TEXT;
      ALTER TABLE users ADD COLUMN tenant_id TEXT;
    `);
  }

  // Create a new tenant
  createTenant(data: {
    name: string;
    slug: string;
    domain?: string;
    subdomain?: string;
    plan?: 'free' | 'pro' | 'enterprise';
  }): Tenant {
    const id = crypto.randomUUID();
    
    const limits = this.getLimitsForPlan(data.plan || 'free');
    
    const tenant: Tenant = {
      id,
      name: data.name,
      slug: data.slug,
      domain: data.domain,
      subdomain: data.subdomain,
      status: 'active',
      plan: data.plan || 'free',
      settings: {},
      limits,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const stmt = db.prepare(`
      INSERT INTO tenants (id, name, slug, domain, subdomain, status, plan, settings, limits)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      tenant.id,
      tenant.name,
      tenant.slug,
      tenant.domain || null,
      tenant.subdomain || null,
      tenant.status,
      tenant.plan,
      JSON.stringify(tenant.settings),
      JSON.stringify(tenant.limits)
    );

    // Initialize usage tracking
    db.prepare(`
      INSERT INTO tenant_usage (tenant_id, api_calls_date)
      VALUES (?, date('now'))
    `).run(tenant.id);

    console.log(`Tenant created: ${tenant.name} (${tenant.id})`);
    return tenant;
  }

  // Get tenant by ID
  getTenant(id: string): Tenant | null {
    const stmt = db.prepare('SELECT * FROM tenants WHERE id = ?');
    const row = stmt.get(id) as any;

    if (!row) return null;

    return this.parseTenant(row);
  }

  // Get tenant by slug
  getTenantBySlug(slug: string): Tenant | null {
    const stmt = db.prepare('SELECT * FROM tenants WHERE slug = ?');
    const row = stmt.get(slug) as any;

    if (!row) return null;

    return this.parseTenant(row);
  }

  // Get tenant by domain
  getTenantByDomain(domain: string): Tenant | null {
    const stmt = db.prepare('SELECT * FROM tenants WHERE domain = ? OR subdomain = ?');
    const row = stmt.get(domain, domain) as any;

    if (!row) return null;

    return this.parseTenant(row);
  }

  // Get all tenants
  getAllTenants(status?: 'active' | 'suspended' | 'pending'): Tenant[] {
    let query = 'SELECT * FROM tenants';
    const params: any[] = [];

    if (status) {
      query += ' WHERE status = ?';
      params.push(status);
    }

    query += ' ORDER BY created_at DESC';

    const stmt = db.prepare(query);
    const rows = stmt.all(...params) as any[];

    return rows.map(row => this.parseTenant(row));
  }

  // Update tenant
  updateTenant(id: string, updates: Partial<Tenant>): Tenant | null {
    const fields: string[] = [];
    const values: any[] = [];

    if (updates.name !== undefined) {
      fields.push('name = ?');
      values.push(updates.name);
    }
    if (updates.slug !== undefined) {
      fields.push('slug = ?');
      values.push(updates.slug);
    }
    if (updates.domain !== undefined) {
      fields.push('domain = ?');
      values.push(updates.domain);
    }
    if (updates.subdomain !== undefined) {
      fields.push('subdomain = ?');
      values.push(updates.subdomain);
    }
    if (updates.status !== undefined) {
      fields.push('status = ?');
      values.push(updates.status);
    }
    if (updates.plan !== undefined) {
      fields.push('plan = ?');
      values.push(updates.plan);
      
      // Update limits based on new plan
      const limits = this.getLimitsForPlan(updates.plan);
      fields.push('limits = ?');
      values.push(JSON.stringify(limits));
    }
    if (updates.settings !== undefined) {
      fields.push('settings = ?');
      values.push(JSON.stringify(updates.settings));
    }

    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    const stmt = db.prepare(`UPDATE tenants SET ${fields.join(', ')} WHERE id = ?`);
    stmt.run(...values);

    return this.getTenant(id);
  }

  // Delete tenant
  deleteTenant(id: string): boolean {
    // Delete all tenant data
    db.prepare('DELETE FROM blog_posts WHERE tenant_id = ?').run(id);
    db.prepare('DELETE FROM services WHERE tenant_id = ?').run(id);
    db.prepare('DELETE FROM team_members WHERE tenant_id = ?').run(id);
    db.prepare('DELETE FROM media WHERE tenant_id = ?').run(id);
    db.prepare('DELETE FROM users WHERE tenant_id = ?').run(id);
    db.prepare('DELETE FROM tenant_usage WHERE tenant_id = ?').run(id);
    
    const stmt = db.prepare('DELETE FROM tenants WHERE id = ?');
    const result = stmt.run(id);

    console.log(`Tenant deleted: ${id}`);
    return result.changes > 0;
  }

  // Get tenant usage
  getTenantUsage(tenantId: string): TenantUsage {
    const stmt = db.prepare('SELECT * FROM tenant_usage WHERE tenant_id = ?');
    const row = stmt.get(tenantId) as any;

    if (!row) {
      return {
        users: 0,
        posts: 0,
        storage: 0,
        apiCalls: 0,
      };
    }

    // Reset API calls if it's a new day
    const today = new Date().toISOString().split('T')[0];
    if (row.api_calls_date !== today) {
      db.prepare(`
        UPDATE tenant_usage
        SET api_calls = 0, api_calls_date = date('now')
        WHERE tenant_id = ?
      `).run(tenantId);
      row.api_calls = 0;
    }

    return {
      users: row.users,
      posts: row.posts,
      storage: row.storage,
      apiCalls: row.api_calls,
    };
  }

  // Update tenant usage
  updateTenantUsage(tenantId: string, updates: Partial<TenantUsage>): void {
    const fields: string[] = [];
    const values: any[] = [];

    if (updates.users !== undefined) {
      fields.push('users = ?');
      values.push(updates.users);
    }
    if (updates.posts !== undefined) {
      fields.push('posts = ?');
      values.push(updates.posts);
    }
    if (updates.storage !== undefined) {
      fields.push('storage = ?');
      values.push(updates.storage);
    }
    if (updates.apiCalls !== undefined) {
      fields.push('api_calls = ?');
      values.push(updates.apiCalls);
    }

    values.push(tenantId);

    const stmt = db.prepare(`UPDATE tenant_usage SET ${fields.join(', ')} WHERE tenant_id = ?`);
    stmt.run(...values);
  }

  // Increment API call count
  incrementApiCalls(tenantId: string): void {
    db.prepare(`
      UPDATE tenant_usage
      SET api_calls = api_calls + 1
      WHERE tenant_id = ?
    `).run(tenantId);
  }

  // Check if tenant has reached limit
  hasReachedLimit(tenantId: string, limitType: keyof TenantLimits): boolean {
    const tenant = this.getTenant(tenantId);
    if (!tenant) return true;

    const usage = this.getTenantUsage(tenantId);
    const limit = tenant.limits[limitType];

    switch (limitType) {
      case 'maxUsers':
        return usage.users >= limit;
      case 'maxPosts':
        return usage.posts >= limit;
      case 'maxStorage':
        return usage.storage >= limit;
      case 'maxApiCalls':
        return usage.apiCalls >= limit;
      default:
        return false;
    }
  }

  // Set current tenant context
  setCurrentTenant(tenant: Tenant): void {
    this.currentTenant = tenant;
  }

  // Get current tenant
  getCurrentTenant(): Tenant | undefined {
    return this.currentTenant;
  }

  // Clear tenant context
  clearTenantContext(): void {
    this.currentTenant = undefined;
  }

  // Get limits for plan
  private getLimitsForPlan(plan: 'free' | 'pro' | 'enterprise'): TenantLimits {
    switch (plan) {
      case 'free':
        return {
          maxUsers: 3,
          maxPosts: 50,
          maxStorage: 1024, // 1 GB
          maxApiCalls: 1000,
        };
      case 'pro':
        return {
          maxUsers: 20,
          maxPosts: 1000,
          maxStorage: 10240, // 10 GB
          maxApiCalls: 10000,
        };
      case 'enterprise':
        return {
          maxUsers: -1, // unlimited
          maxPosts: -1, // unlimited
          maxStorage: -1, // unlimited
          maxApiCalls: -1, // unlimited
        };
      default:
        return this.getLimitsForPlan('free');
    }
  }

  // Parse tenant row
  private parseTenant(row: any): Tenant {
    return {
      ...row,
      settings: row.settings ? JSON.parse(row.settings) : {},
      limits: row.limits ? JSON.parse(row.limits) : this.getLimitsForPlan(row.plan),
    };
  }

  // Get tenant statistics
  getTenantStats(): {
    total: number;
    active: number;
    suspended: number;
    pending: number;
    byPlan: Record<string, number>;
  } {
    const allTenants = this.getAllTenants();
    
    const byPlan: Record<string, number> = {};
    for (const tenant of allTenants) {
      byPlan[tenant.plan] = (byPlan[tenant.plan] || 0) + 1;
    }

    return {
      total: allTenants.length,
      active: allTenants.filter(t => t.status === 'active').length,
      suspended: allTenants.filter(t => t.status === 'suspended').length,
      pending: allTenants.filter(t => t.status === 'pending').length,
      byPlan,
    };
  }
}

export const tenancyManager = TenancyManager.getInstance();




