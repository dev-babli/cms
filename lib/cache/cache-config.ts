/**
 * Cache Configuration for CMS API Routes
 * Implements CDN-friendly caching with revalidation
 */

export const CACHE_CONFIG = {
  // Hero Slides - Cache for 5 minutes, revalidate in background
  HERO_SLIDES: {
    maxAge: 300, // 5 minutes
    staleWhileRevalidate: 3600, // 1 hour - serve stale while revalidating
    tags: ['hero-slides'],
  },
  
  // Office Addresses - Cache for 1 hour (addresses don't change often)
  OFFICE_ADDRESSES: {
    maxAge: 3600, // 1 hour
    staleWhileRevalidate: 86400, // 24 hours
    tags: ['office-addresses'],
  },
  
  // Pages - Cache for 10 minutes
  PAGES: {
    maxAge: 600, // 10 minutes
    staleWhileRevalidate: 3600, // 1 hour
    tags: ['pages'],
  },
  
  // General content - Cache for 5 minutes
  CONTENT: {
    maxAge: 300, // 5 minutes
    staleWhileRevalidate: 1800, // 30 minutes
    tags: ['content'],
  },
};

/**
 * Get cache headers for CDN and browser caching
 */
export function getCacheHeaders(config: typeof CACHE_CONFIG[keyof typeof CACHE_CONFIG]) {
  return {
    'Cache-Control': `public, s-maxage=${config.maxAge}, stale-while-revalidate=${config.staleWhileRevalidate}, max-age=${config.maxAge}`,
    'CDN-Cache-Control': `public, s-maxage=${config.maxAge}, stale-while-revalidate=${config.staleWhileRevalidate}`,
    'Vercel-CDN-Cache-Control': `public, s-maxage=${config.maxAge}, stale-while-revalidate=${config.staleWhileRevalidate}`,
  };
}

/**
 * Revalidate cache by tag (for on-demand revalidation)
 */
export async function revalidateCache(tags: string[]) {
  try {
    // Vercel on-demand revalidation
    if (process.env.VERCEL) {
      for (const tag of tags) {
        await fetch(`${process.env.VERCEL_URL || process.env.NEXT_PUBLIC_APP_URL}/api/revalidate?tag=${tag}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.REVALIDATE_SECRET}`,
          },
        }).catch(() => {
          // Silently fail if revalidation endpoint doesn't exist
        });
      }
    }
  } catch (error) {
    console.error('Cache revalidation error:', error);
  }
}





