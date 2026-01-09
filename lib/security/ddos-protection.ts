/**
 * DDoS Protection
 * 
 * Basic DDoS protection using request throttling and IP-based rate limiting.
 */

import { RateLimiter, getClientIdentifier } from './rate-limiter';

// Stricter rate limiter for DDoS protection
const ddosRateLimiter = new RateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 60, // 60 requests per minute
});

// Track suspicious IPs
const suspiciousIPs = new Map<string, { count: number; blockedUntil: number }>();

/**
 * Check if request should be blocked due to DDoS protection
 */
export function checkDDoSProtection(request: Request): {
  allowed: boolean;
  reason?: string;
  retryAfter?: number;
} {
  const identifier = getClientIdentifier(request);

  // Check if IP is temporarily blocked
  const suspicious = suspiciousIPs.get(identifier);
  if (suspicious && Date.now() < suspicious.blockedUntil) {
    return {
      allowed: false,
      reason: 'IP temporarily blocked due to suspicious activity',
      retryAfter: Math.ceil((suspicious.blockedUntil - Date.now()) / 1000),
    };
  }

  // Check rate limit
  const limitCheck = ddosRateLimiter.check(identifier);
  if (!limitCheck.allowed) {
    // Mark as suspicious
    const currentSuspicious = suspiciousIPs.get(identifier) || { count: 0, blockedUntil: 0 };
    currentSuspicious.count++;
    
    // Block for increasing duration based on violations
    const blockDuration = Math.min(currentSuspicious.count * 5 * 60 * 1000, 60 * 60 * 1000); // Max 1 hour
    currentSuspicious.blockedUntil = Date.now() + blockDuration;
    
    suspiciousIPs.set(identifier, currentSuspicious);

    return {
      allowed: false,
      reason: 'Rate limit exceeded',
      retryAfter: Math.ceil((limitCheck.resetTime - Date.now()) / 1000),
    };
  }

  // Reset suspicious count if no violations for 10 minutes
  if (suspicious) {
    const timeSinceLastViolation = Date.now() - suspicious.blockedUntil;
    if (timeSinceLastViolation > 10 * 60 * 1000) {
      suspiciousIPs.delete(identifier);
    }
  }

  return { allowed: true };
}

/**
 * Clean up old suspicious IP entries
 */
setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of suspiciousIPs.entries()) {
    if (now > data.blockedUntil + 10 * 60 * 1000) {
      suspiciousIPs.delete(ip);
    }
  }
}, 5 * 60 * 1000); // Clean up every 5 minutes







