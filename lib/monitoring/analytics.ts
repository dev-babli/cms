// Analytics and monitoring system
import db from '../db';

// Initialize analytics table (if needed)
(async () => {
  await db.exec(`
    CREATE TABLE IF NOT EXISTS analytics_events (
      id SERIAL PRIMARY KEY,
      event_type TEXT NOT NULL,
      event_name TEXT NOT NULL,
      user_id INTEGER,
      metadata TEXT,
      session_id TEXT,
      ip_address TEXT,
      user_agent TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_analytics_type ON analytics_events(event_type);
    CREATE INDEX IF NOT EXISTS idx_analytics_created ON analytics_events(created_at);
  `);
})();

export const analytics = {
  // Track event
  track: async (eventType: string, eventName: string, metadata?: any, userId?: number) => {
    const stmt = db.prepare(`
      INSERT INTO analytics_events (event_type, event_name, user_id, metadata)
      VALUES (?, ?, ?, ?)
    `);
    return await stmt.run(
      eventType,
      eventName,
      userId || null,
      metadata ? JSON.stringify(metadata) : null
    );
  },

  // Get analytics for dashboard
  getDashboardStats: async () => {
    const totalPosts = await db.prepare('SELECT COUNT(*) as count FROM blog_posts').get() as { count: number };
    const publishedPosts = await db.prepare('SELECT COUNT(*) as count FROM blog_posts WHERE published = true').get() as { count: number };
    const totalServices = await db.prepare('SELECT COUNT(*) as count FROM services').get() as { count: number };
    const totalTeam = await db.prepare('SELECT COUNT(*) as count FROM team_members').get() as { count: number };
    
    const recentPosts = await db.prepare(`
      SELECT COUNT(*) as count FROM blog_posts 
      WHERE created_at > CURRENT_TIMESTAMP - INTERVAL '7 days'
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
  getPageViews: async (days: number = 30) => {
    return await db.prepare(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as views
      FROM analytics_events
      WHERE event_type = 'page_view'
        AND created_at > CURRENT_TIMESTAMP - INTERVAL '${days} days'
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `).all();
  },

  // Get popular content
  getPopularContent: async (limit: number = 10) => {
    return await db.prepare(`
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





