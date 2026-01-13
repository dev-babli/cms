/**
 * URL Shortener Utility
 * 
 * Provides URL shortening functionality using a simple hash-based approach
 * or integration with external services like bit.ly, tinyurl, etc.
 */

/**
 * Generate a short hash from a URL
 * Uses a simple base62 encoding of a hash
 */
function generateShortHash(url: string): string {
  // Simple hash function
  let hash = 0;
  for (let i = 0; i < url.length; i++) {
    const char = url.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  // Convert to positive number
  const positiveHash = Math.abs(hash);
  
  // Base62 encoding (0-9, a-z, A-Z)
  const base62 = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let encoded = '';
  let num = positiveHash;
  
  do {
    encoded = base62[num % 62] + encoded;
    num = Math.floor(num / 62);
  } while (num > 0);
  
  // Return first 8 characters (adjustable)
  return encoded.substring(0, 8);
}

/**
 * Create a short URL using hash-based approach
 * Stores mapping in localStorage (client-side) or database (server-side)
 */
export function createShortUrl(longUrl: string, baseUrl?: string): string {
  const base = baseUrl || (typeof window !== 'undefined' 
    ? window.location.origin 
    : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001');
  
  const hash = generateShortHash(longUrl + Date.now().toString());
  const shortUrl = `${base}/s/${hash}`;
  
  // Store mapping in localStorage for client-side
  if (typeof window !== 'undefined') {
    try {
      const mappings = JSON.parse(localStorage.getItem('url_mappings') || '{}');
      mappings[hash] = {
        url: longUrl,
        createdAt: new Date().toISOString(),
        clicks: 0
      };
      localStorage.setItem('url_mappings', JSON.stringify(mappings));
    } catch (error) {
      console.error('Failed to store URL mapping:', error);
    }
  }
  
  return shortUrl;
}

/**
 * Resolve a short URL to the original URL
 */
export function resolveShortUrl(shortHash: string): string | null {
  if (typeof window !== 'undefined') {
    try {
      const mappings = JSON.parse(localStorage.getItem('url_mappings') || '{}');
      const mapping = mappings[shortHash];
      if (mapping) {
        // Increment click count
        mapping.clicks = (mapping.clicks || 0) + 1;
        mapping.lastAccessed = new Date().toISOString();
        localStorage.setItem('url_mappings', JSON.stringify(mappings));
        return mapping.url;
      }
    } catch (error) {
      console.error('Failed to resolve short URL:', error);
    }
  }
  return null;
}

/**
 * Get analytics for a short URL
 */
export function getShortUrlStats(shortHash: string): { clicks: number; createdAt: string; lastAccessed?: string } | null {
  if (typeof window !== 'undefined') {
    try {
      const mappings = JSON.parse(localStorage.getItem('url_mappings') || '{}');
      const mapping = mappings[shortHash];
      if (mapping) {
        return {
          clicks: mapping.clicks || 0,
          createdAt: mapping.createdAt,
          lastAccessed: mapping.lastAccessed
        };
      }
    } catch (error) {
      console.error('Failed to get URL stats:', error);
    }
  }
  return null;
}

/**
 * Server-side URL shortening using database
 * This should be used for persistent, shareable short URLs
 */
export async function createShortUrlServer(longUrl: string, userId?: number): Promise<string> {
  try {
    const response = await fetch('/api/url/shorten', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: longUrl,
        userId: userId
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to create short URL');
    }
    
    const data = await response.json();
    return data.shortUrl || longUrl;
  } catch (error) {
    console.error('Error creating short URL:', error);
    // Fallback to original URL
    return longUrl;
  }
}

/**
 * Format URL for display (truncate if too long)
 */
export function formatUrlForDisplay(url: string, maxLength: number = 50): string {
  if (url.length <= maxLength) {
    return url;
  }
  
  const start = url.substring(0, Math.floor(maxLength / 2) - 3);
  const end = url.substring(url.length - Math.floor(maxLength / 2) + 3);
  return `${start}...${end}`;
}

/**
 * Copy URL to clipboard with shortening option
 */
export async function copyUrlToClipboard(url: string, shorten: boolean = false): Promise<boolean> {
  try {
    const urlToCopy = shorten ? await createShortUrlServer(url) : url;
    await navigator.clipboard.writeText(urlToCopy);
    return true;
  } catch (error) {
    console.error('Failed to copy URL:', error);
    return false;
  }
}

