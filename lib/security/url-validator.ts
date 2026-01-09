/**
 * URL Validation Utilities - SSRF Prevention
 * 
 * Implements strict URL validation to prevent SSRF attacks
 * Whitelists allowed domains and blocks private/internal IPs
 */

/**
 * Check if an IP address is private/internal
 */
export function isPrivateIP(hostname: string): boolean {
  // Check for localhost variants
  if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1') {
    return true;
  }
  
  // Check for private IP ranges
  const privateRanges = [
    /^10\./,                    // 10.0.0.0/8
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./, // 172.16.0.0/12
    /^192\.168\./,              // 192.168.0.0/16
    /^169\.254\./,              // Link-local (169.254.0.0/16)
    /^127\./,                   // Loopback
    /^0\./,                     // Invalid
    /^224\./,                   // Multicast
    /^240\./,                   // Reserved
  ];
  
  for (const range of privateRanges) {
    if (range.test(hostname)) {
      return true;
    }
  }
  
  return false;
}

/**
 * Get allowed domains from environment
 */
function getAllowedDomains(): string[] {
  const envDomains = process.env.ALLOWED_DOWNLOAD_DOMAINS || process.env.ALLOWED_STORAGE_DOMAINS;
  
  if (!envDomains) {
    // Default: Supabase domains (including wildcard subdomains for Storage URLs)
    return [
      '*.supabase.co',
      '*.supabase.in',
      '*.supabase.io',
      'supabase.co',
      'supabase.in',
      'supabase.io',
    ];
  }
  
  return envDomains
    .split(',')
    .map(domain => domain.trim())
    .filter(domain => domain.length > 0);
}

/**
 * Validate and sanitize a download URL to prevent SSRF
 * 
 * @param url - URL to validate
 * @returns Validated URL or null if invalid
 */
export function validateDownloadUrl(url: string): { valid: boolean; url?: string; error?: string } {
  if (!url || typeof url !== 'string') {
    return { valid: false, error: 'URL is required' };
  }
  
  // Limit URL length
  if (url.length > 2000) {
    return { valid: false, error: 'URL too long' };
  }
  
  let urlObj: URL;
  try {
    urlObj = new URL(url);
  } catch (e) {
    return { valid: false, error: 'Invalid URL format' };
  }
  
  // Only allow http and https protocols
  if (!['http:', 'https:'].includes(urlObj.protocol)) {
    return { valid: false, error: 'Only HTTP and HTTPS protocols are allowed' };
  }
  
  // Block private IPs
  if (isPrivateIP(urlObj.hostname)) {
    return { valid: false, error: 'Private IP addresses are not allowed' };
  }
  
  // Check against whitelist of allowed domains
  const allowedDomains = getAllowedDomains();
  const hostname = urlObj.hostname.toLowerCase();
  
  let isAllowed = false;
  for (const allowedDomain of allowedDomains) {
    const domainLower = allowedDomain.toLowerCase();
    
    // Exact match
    if (hostname === domainLower) {
      isAllowed = true;
      break;
    }
    
    // Subdomain match (e.g., *.supabase.co matches xyz.supabase.co)
    if (domainLower.startsWith('*.')) {
      const baseDomain = domainLower.slice(2);
      if (hostname === baseDomain || hostname.endsWith('.' + baseDomain)) {
        isAllowed = true;
        break;
      }
    }
  }
  
  if (!isAllowed) {
    return { valid: false, error: 'Domain not in allowed list' };
  }
  
  // Block dangerous URL patterns
  const dangerousPatterns = [
    /^file:/i,
    /^ftp:/i,
    /^data:/i,
    /^javascript:/i,
    /^vbscript:/i,
  ];
  
  for (const pattern of dangerousPatterns) {
    if (pattern.test(url)) {
      return { valid: false, error: 'Dangerous URL pattern detected' };
    }
  }
  
  // Return validated URL (normalized)
  return { valid: true, url: urlObj.toString() };
}



