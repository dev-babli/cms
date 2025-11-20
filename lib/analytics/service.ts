import db from '@/lib/db';

export interface AnalyticsEvent {
  id: string;
  event_type: string;
  user_id?: number;
  tenant_id?: string;
  resource_type?: string;
  resource_id?: string;
  metadata?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  timestamp: string;
}

export interface PageView {
  id: string;
  url: string;
  title?: string;
  referrer?: string;
  user_id?: number;
  tenant_id?: string;
  ip_address?: string;
  user_agent?: string;
  session_id?: string;
  duration?: number;
  timestamp: string;
}

export interface ContentPerformance {
  resource_id: string;
  resource_type: string;
  views: number;
  unique_visitors: number;
  avg_duration: number;
  bounce_rate: number;
  conversion_rate: number;
}

export class AnalyticsService {
  private static instance: AnalyticsService;

  static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
      AnalyticsService.instance.initializeDatabase();
    }
    return AnalyticsService.instance;
  }

  private initializeDatabase() {
    db.exec(`
      CREATE TABLE IF NOT EXISTS analytics_events (
        id TEXT PRIMARY KEY,
        event_type TEXT NOT NULL,
        user_id INTEGER,
        tenant_id TEXT,
        resource_type TEXT,
        resource_id TEXT,
        metadata TEXT,
        ip_address TEXT,
        user_agent TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS page_views (
        id TEXT PRIMARY KEY,
        url TEXT NOT NULL,
        title TEXT,
        referrer TEXT,
        user_id INTEGER,
        tenant_id TEXT,
        ip_address TEXT,
        user_agent TEXT,
        session_id TEXT,
        duration INTEGER,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON analytics_events (event_type);
      CREATE INDEX IF NOT EXISTS idx_analytics_events_timestamp ON analytics_events (timestamp);
      CREATE INDEX IF NOT EXISTS idx_analytics_events_resource ON analytics_events (resource_type, resource_id);
      CREATE INDEX IF NOT EXISTS idx_page_views_url ON page_views (url);
      CREATE INDEX IF NOT EXISTS idx_page_views_timestamp ON page_views (timestamp);
    `);
  }

  // Track an event
  trackEvent(event: Omit<AnalyticsEvent, 'id' | 'timestamp'>): void {
    const stmt = db.prepare(`
      INSERT INTO analytics_events (id, event_type, user_id, tenant_id, resource_type, resource_id, metadata, ip_address, user_agent)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const id = `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    stmt.run(
      id,
      event.event_type,
      event.user_id || null,
      event.tenant_id || null,
      event.resource_type || null,
      event.resource_id || null,
      event.metadata ? JSON.stringify(event.metadata) : null,
      event.ip_address || null,
      event.user_agent || null
    );
  }

  // Track a page view
  trackPageView(pageView: Omit<PageView, 'id' | 'timestamp'>): void {
    const stmt = db.prepare(`
      INSERT INTO page_views (id, url, title, referrer, user_id, tenant_id, ip_address, user_agent, session_id, duration)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const id = `pv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    stmt.run(
      id,
      pageView.url,
      pageView.title || null,
      pageView.referrer || null,
      pageView.user_id || null,
      pageView.tenant_id || null,
      pageView.ip_address || null,
      pageView.user_agent || null,
      pageView.session_id || null,
      pageView.duration || null
    );
  }

  // Get analytics for date range
  async getAnalytics(options: {
    tenant_id?: string;
    start_date?: string;
    end_date?: string;
  }): Promise<{
    totalEvents: number;
    totalPageViews: number;
    uniqueVisitors: number;
    topEvents: Array<{ event_type: string; count: number }>;
    topPages: Array<{ url: string; views: number }>;
  }> {
    const { tenant_id, start_date, end_date } = options;

    let whereClause = '1=1';
    const params: any[] = [];

    if (tenant_id) {
      whereClause += ' AND tenant_id = ?';
      params.push(tenant_id);
    }

    if (start_date) {
      whereClause += ' AND timestamp >= ?';
      params.push(start_date);
    }

    if (end_date) {
      whereClause += ' AND timestamp <= ?';
      params.push(end_date);
    }

    // Total events
    const totalEvents = await db.prepare(`
      SELECT COUNT(*) as count FROM analytics_events WHERE ${whereClause}
    `).get(...params) as any;

    // Total page views
    const totalPageViews = await db.prepare(`
      SELECT COUNT(*) as count FROM page_views WHERE ${whereClause}
    `).get(...params) as any;

    // Unique visitors (by IP address)
    const uniqueVisitors = await db.prepare(`
      SELECT COUNT(DISTINCT ip_address) as count FROM page_views WHERE ${whereClause}
    `).get(...params) as any;

    // Top events
    const topEvents = await db.prepare(`
      SELECT event_type, COUNT(*) as count
      FROM analytics_events
      WHERE ${whereClause}
      GROUP BY event_type
      ORDER BY count DESC
      LIMIT 10
    `).all(...params) as any[];

    // Top pages
    const topPages = await db.prepare(`
      SELECT url, COUNT(*) as views
      FROM page_views
      WHERE ${whereClause}
      GROUP BY url
      ORDER BY views DESC
      LIMIT 10
    `).all(...params) as any[];

    return {
      totalEvents: totalEvents.count,
      totalPageViews: totalPageViews.count,
      uniqueVisitors: uniqueVisitors.count,
      topEvents,
      topPages,
    };
  }

  // Get content performance
  async getContentPerformance(resourceType: string, resourceId: string): Promise<ContentPerformance> {
    const views = await db.prepare(`
      SELECT COUNT(*) as count
      FROM page_views
      WHERE url LIKE ?
    `).get(`%/${resourceId}%`) as any;

    const uniqueVisitors = await db.prepare(`
      SELECT COUNT(DISTINCT ip_address) as count
      FROM page_views
      WHERE url LIKE ?
    `).get(`%/${resourceId}%`) as any;

    const avgDuration = await db.prepare(`
      SELECT AVG(duration) as avg
      FROM page_views
      WHERE url LIKE ? AND duration IS NOT NULL
    `).get(`%/${resourceId}%`) as any;

    return {
      resource_id: resourceId,
      resource_type: resourceType,
      views: views.count,
      unique_visitors: uniqueVisitors.count,
      avg_duration: avgDuration.avg || 0,
      bounce_rate: 0, // Calculate based on your logic
      conversion_rate: 0, // Calculate based on your logic
    };
  }

  // Get real-time metrics (last 5 minutes)
  getRealTimeMetrics(tenantId?: string): {
    activeUsers: number;
    recentEvents: number;
    recentPageViews: number;
  } {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();

    let whereClause = 'timestamp >= ?';
    const params: any[] = [fiveMinutesAgo];

    if (tenantId) {
      whereClause += ' AND tenant_id = ?';
      params.push(tenantId);
    }

    const activeUsers = db.prepare(`
      SELECT COUNT(DISTINCT ip_address) as count
      FROM page_views
      WHERE ${whereClause}
    `).get(...params) as any;

    const recentEvents = db.prepare(`
      SELECT COUNT(*) as count
      FROM analytics_events
      WHERE ${whereClause}
    `).get(...params) as any;

    const recentPageViews = db.prepare(`
      SELECT COUNT(*) as count
      FROM page_views
      WHERE ${whereClause}
    `).get(...params) as any;

    return {
      activeUsers: activeUsers.count,
      recentEvents: recentEvents.count,
      recentPageViews: recentPageViews.count,
    };
  }

  // Get user behavior funnel
  async getUserFunnel(steps: string[], tenantId?: string): Promise<Array<{
    step: string;
    users: number;
    dropoffRate: number;
  }>> {
    const results: Array<{ step: string; users: number; dropoffRate: number }> = [];
    let previousCount = 0;

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      
      let query = `
        SELECT COUNT(DISTINCT user_id) as count
        FROM analytics_events
        WHERE event_type = ?
      `;
      const params: any[] = [step];

      if (tenantId) {
        query += ' AND tenant_id = ?';
        params.push(tenantId);
      }

      const result = await db.prepare(query).get(...params) as any;
      const count = result.count;

      const dropoffRate = i > 0 && previousCount > 0
        ? ((previousCount - count) / previousCount) * 100
        : 0;

      results.push({
        step,
        users: count,
        dropoffRate,
      });

      previousCount = count;
    }

    return results;
  }

  // Get time series data
  async getTimeSeries(options: {
    metric: 'events' | 'pageviews' | 'users';
    interval: 'hour' | 'day' | 'week' | 'month';
    start_date: string;
    end_date: string;
    tenant_id?: string;
  }): Promise<Array<{ date: string; value: number }>> {
    const { metric, interval, start_date, end_date, tenant_id } = options;

    let table = metric === 'events' ? 'analytics_events' : 'page_views';
    let selectClause = 'COUNT(*) as value';
    
    if (metric === 'users') {
      selectClause = 'COUNT(DISTINCT ip_address) as value';
    }

    let dateFormat: string;
    switch (interval) {
      case 'hour':
        dateFormat = '%Y-%m-%d %H:00:00';
        break;
      case 'day':
        dateFormat = '%Y-%m-%d';
        break;
      case 'week':
        dateFormat = '%Y-W%W';
        break;
      case 'month':
        dateFormat = '%Y-%m';
        break;
    }

    let whereClause = 'timestamp BETWEEN ? AND ?';
    const params: any[] = [start_date, end_date];

    if (tenant_id) {
      whereClause += ' AND tenant_id = ?';
      params.push(tenant_id);
    }

    const results = await db.prepare(`
      SELECT strftime('${dateFormat}', timestamp) as date, ${selectClause}
      FROM ${table}
      WHERE ${whereClause}
      GROUP BY date
      ORDER BY date
    `).all(...params) as any[];

    return results;
  }

  // Clean up old analytics data
  async cleanupOldData(daysToKeep: number = 90): Promise<number> {
    const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000).toISOString();

    const eventsDeleted = await db.prepare(`
      DELETE FROM analytics_events WHERE timestamp < ?
    `).run(cutoffDate);

    const pageViewsDeleted = await db.prepare(`
      DELETE FROM page_views WHERE timestamp < ?
    `).run(cutoffDate);

    console.log(`Cleaned up ${eventsDeleted.changes + pageViewsDeleted.changes} analytics records`);
    return eventsDeleted.changes + pageViewsDeleted.changes;
  }

  // Export analytics data
  async exportData(options: {
    start_date: string;
    end_date: string;
    tenant_id?: string;
    format: 'json' | 'csv';
  }): Promise<string> {
    const { start_date, end_date, tenant_id, format } = options;

    let whereClause = 'timestamp BETWEEN ? AND ?';
    const params: any[] = [start_date, end_date];

    if (tenant_id) {
      whereClause += ' AND tenant_id = ?';
      params.push(tenant_id);
    }

    const events = await db.prepare(`
      SELECT * FROM analytics_events WHERE ${whereClause}
    `).all(...params) as any[];

    if (format === 'json') {
      return JSON.stringify(events, null, 2);
    } else {
      // CSV format
      if (events.length === 0) return '';

      const headers = Object.keys(events[0]).join(',');
      const rows = events.map(event =>
        Object.values(event).map(v => `"${v}"`).join(',')
      );

      return [headers, ...rows].join('\n');
    }
  }
}

export const analyticsService = AnalyticsService.getInstance();




