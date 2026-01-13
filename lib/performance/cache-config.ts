/**
 * Cache Configuration for Performance
 * Defines cache strategies for different content types
 */

export const CACHE_CONFIG = {
  // Dashboard stats - cache for 30 seconds (frequently updated)
  dashboardStats: {
    revalidate: 30,
    tags: ['dashboard-stats'],
  },
  
  // Content lists - cache for 5 minutes (less frequently updated)
  contentList: {
    revalidate: 300,
    tags: ['content-list'],
  },
  
  // Individual content items - cache for 10 minutes
  contentItem: {
    revalidate: 600,
    tags: ['content-item'],
  },
  
  // Analytics - cache for 1 minute (real-time data)
  analytics: {
    revalidate: 60,
    tags: ['analytics'],
  },
  
  // User data - cache for 5 minutes
  user: {
    revalidate: 300,
    tags: ['user'],
  },
};

/**
 * Get cache headers for Next.js responses
 */
export function getCacheHeaders(config: typeof CACHE_CONFIG[keyof typeof CACHE_CONFIG]) {
  return {
    'Cache-Control': `public, s-maxage=${config.revalidate}, stale-while-revalidate=${config.revalidate * 2}`,
  };
}

