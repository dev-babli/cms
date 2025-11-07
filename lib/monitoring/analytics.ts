// Analytics and monitoring system
import db from '../db';

db.exec(`
  CREATE TABLE IF NOT EXISTS analytics_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_type TEXT NOT NULL,
    event_name TEXT NOT NULL,
    user_id INTEGER,
    metadata TEXT,
    session_id TEXT,
    ip_address TEXT,
    user_agent TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_analytics_type ON analytics_events(event_type);
  CREATE INDEX IF NOT EXISTS idx_analytics_created ON analytics_events(created_at);
`);

export const analytics = {
  // Track event
  track: (eventType: string, eventName: string, metadata?: any, userId?: number) => {
    const stmt = db.prepare(`
      INSERT INTO analytics_events (event_type, event_name, user_id, metadata)
      VALUES (?, ?, ?, ?)
    `);
    return stmt.run(
      eventType,
      eventName,
      userId || null,
      metadata ? JSON.stringify(metadata) : null
    );
  },

  // Get analytics for dashboard
  getDashboardStats: () => {
    const totalPosts = db.prepare('SELECT COUNT(*) as count FROM blog_posts').get() as { count: number };
    const publishedPosts = db.prepare('SELECT COUNT(*) as count FROM blog_posts WHERE published = 1').get() as { count: number };
    const totalServices = db.prepare('SELECT COUNT(*) as count FROM services').get() as { count: number };
    const totalTeam = db.prepare('SELECT COUNT(*) as count FROM team_members').get() as { count: number };
    
    const recentPosts = db.prepare(`
      SELECT COUNT(*) as count FROM blog_posts 
      WHERE created_at > datetime('now', '-7 days')
    `).get() as { count: number };

    return {
      totalPosts: totalPosts.count,
      publishedPosts: publishedPosts.count,
      draftPosts: totalPosts.count - publishedPosts.count,
      totalServices: totalServices.count,
      totalTeam: totalTeam.count,
      postsThisWeek: recentPosts.count,
    };
  },

  // Get page views
  getPageViews: (days: number = 30) => {
    return db.prepare(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as views
      FROM analytics_events
      WHERE event_type = 'page_view'
        AND created_at > datetime('now', '-${days} days')
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `).all();
  },

  // Get popular content
  getPopularContent: (limit: number = 10) => {
    return db.prepare(`
      SELECT 
        event_name as slug,
        COUNT(*) as views
      FROM analytics_events
      WHERE event_type = 'page_view'
      GROUP BY event_name
      ORDER BY views DESC
      LIMIT ?
    `).all(limit);
  },
};





