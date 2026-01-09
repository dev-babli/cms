/**
 * Security Middleware - 2026 Enhanced Security
 * 
 * Comprehensive security middleware that combines:
 * - IP blocking/whitelisting
 * - Rate limiting
 * - DDoS protection
 * - Security scanning
 * - CSRF protection
 */

import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, getClientIdentifier, leadSubmissionRateLimiter } from './rate-limiter';
import { checkDDoSProtection } from './ddos-protection';
import { isBlacklisted, isWhitelisted, recordViolation } from './ip-manager';
import { scanRequest, scanRequestBody } from './security-scanner';

export interface SecurityCheckResult {
  allowed: boolean;
  statusCode?: number;
  message?: string;
  headers?: Record<string, string>;
  reason?: string;
}

/**
 * Comprehensive security check for API requests
 */
export async function securityCheck(
  request: NextRequest,
  options: {
    requireAuth?: boolean;
    scanBody?: boolean;
    rateLimitType?: 'api' | 'lead' | 'auth';
    customRateLimiter?: any;
  } = {}
): Promise<SecurityCheckResult> {
  const ip = getClientIdentifier(request);
  
  // 1. Check IP whitelist (bypasses all other checks)
  const whitelisted = await isWhitelisted(ip);
  if (whitelisted) {
    return { allowed: true };
  }
  
  // 2. Check IP blacklist
  const blacklisted = await isBlacklisted(ip);
  if (blacklisted) {
    await recordViolation(ip, 'blacklisted_ip_attempt');
    return {
      allowed: false,
      statusCode: 403,
      message: 'Access denied',
      reason: 'IP address is blacklisted',
    };
  }
  
  // 3. DDoS Protection
  const ddosCheck = checkDDoSProtection(request);
  if (!ddosCheck.allowed) {
    await recordViolation(ip, 'ddos_protection_triggered');
    return {
      allowed: false,
      statusCode: 429,
      message: ddosCheck.reason || 'Too many requests',
      headers: ddosCheck.retryAfter ? {
        'Retry-After': String(ddosCheck.retryAfter),
      } : undefined,
      reason: 'DDoS protection triggered',
    };
  }
  
  // 4. Rate Limiting
  const rateLimiter = options.customRateLimiter || 
    (options.rateLimitType === 'lead' ? leadSubmissionRateLimiter : null);
  
  if (rateLimiter) {
    const rateCheck = checkRateLimit(request, rateLimiter);
    if (rateCheck && !rateCheck.allowed) {
      await recordViolation(ip, 'rate_limit_exceeded');
      return {
        allowed: false,
        statusCode: 429,
        message: 'Too many requests. Please try again later.',
        headers: {
          'Retry-After': String(Math.ceil((rateCheck.resetTime - Date.now()) / 1000)),
          'X-RateLimit-Limit': String(rateLimiter.config?.maxRequests || 100),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(rateCheck.resetTime),
        },
        reason: 'Rate limit exceeded',
      };
    }
  }
  
  // 5. Security Scanning (skip for lead submissions to avoid false positives)
  // Lead submissions come from form data that might contain legitimate special characters
  if (options.rateLimitType !== 'lead') {
    const securityScan = scanRequest(request);
    if (!securityScan.isSafe) {
      // Log the threat
      if (process.env.NODE_ENV === 'development') {
        console.warn(`🚨 Security Threat Detected from ${ip}:`, {
          threats: securityScan.threats || [],
          riskLevel: securityScan.riskLevel,
          url: request.url,
          firstThreat: securityScan.threats?.[0],
        });
      } else {
        console.warn(`🚨 Security Threat Detected from ${ip}:`, {
          threats: (securityScan.threats || []).map(t => ({ type: t.type, severity: t.severity })),
          riskLevel: securityScan.riskLevel,
        });
      }
      
      await recordViolation(ip, `security_scan_${securityScan.riskLevel}`);
      
      // Block critical and high-risk threats
      if (securityScan.riskLevel === 'critical' || securityScan.riskLevel === 'high') {
        return {
          allowed: false,
          statusCode: 400,
          message: 'Invalid request detected',
          reason: `Security threat detected: ${securityScan.threats?.[0]?.type || 'unknown'}`,
        };
      }
    }
  } else {
    // For lead submissions, completely skip URL scanning
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ Skipping URL security scan for lead submission');
    }
  }
  
  // 6. Scan request body if enabled (skip for lead submissions)
  if (options.scanBody && request.method !== 'GET' && options.rateLimitType !== 'lead') {
    try {
      const body = await request.clone().json().catch(() => ({}));
      const bodyScan = scanRequestBody(body, 'request_body');
      
      if (!bodyScan.isSafe) {
        // Log detailed information in development
        if (process.env.NODE_ENV === 'development') {
          console.warn(`🚨 Security Threat in Request Body from ${ip}:`, {
            threats: bodyScan.threats || [],
            riskLevel: bodyScan.riskLevel,
            bodyKeys: Object.keys(body),
            firstThreat: bodyScan.threats?.[0],
          });
        } else {
          console.warn(`🚨 Security Threat in Request Body from ${ip}:`, {
            threats: (bodyScan.threats || []).map(t => ({ type: t.type, severity: t.severity })),
            riskLevel: bodyScan.riskLevel,
          });
        }
        
        await recordViolation(ip, `body_scan_${bodyScan.riskLevel}`);
        
        // Block critical and high-risk threats for non-lead submissions
        if (bodyScan.riskLevel === 'critical' || bodyScan.riskLevel === 'high') {
          return {
            allowed: false,
            statusCode: 400,
            message: 'Invalid request data detected',
            reason: `Security threat in request body: ${bodyScan.threats?.[0]?.type || 'unknown'}`,
          };
        }
      }
    } catch (error) {
      // If body parsing fails, it's not necessarily a security issue
      // Continue with the request
    }
  } else if (options.rateLimitType === 'lead') {
    // For lead submissions, completely skip body scanning
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ Skipping body security scan for lead submission');
    }
  }
  
  // 7. CSRF Protection (for state-changing requests)
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
    const origin = request.headers.get('origin');
    const referer = request.headers.get('referer');
    const host = request.headers.get('host');
    
    // Check if origin/referer matches host
    if (origin && host && !origin.includes(host) && !host.includes(new URL(origin).hostname)) {
      // Allow if it's from the same domain or whitelisted
      const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];
      if (!allowedOrigins.some(allowed => origin.includes(allowed))) {
        await recordViolation(ip, 'csrf_attempt');
        return {
          allowed: false,
          statusCode: 403,
          message: 'CSRF protection: Invalid origin',
          reason: 'CSRF protection triggered',
        };
      }
    }
  }
  
  return { allowed: true };
}

/**
 * Apply security headers to response
 * 
 * SECURITY: 2026 OWASP and ISO 27001 compliant headers
 * - Removed 'unsafe-inline' and 'unsafe-eval' from CSP (XSS protection)
 * - Uses nonce-based CSP for inline scripts when needed
 * - Strict security headers per latest standards
 */
export function applySecurityHeaders(response: NextResponse, nonce?: string): NextResponse {
  // Content Security Policy (CSP) - 2026 hardened version
  // SECURITY FIX: Removed 'unsafe-inline' and 'unsafe-eval' to prevent XSS attacks
  // Use nonces for inline scripts when necessary
  const scriptSrc = [
    "'self'",
    "https://www.googletagmanager.com",
    "https://www.google-analytics.com",
    "https://*.supabase.co",
    ...(nonce ? [`'nonce-${nonce}'`] : []),
  ].join(' ');
  
  const styleSrc = [
    "'self'",
    "https://fonts.googleapis.com",
    // Note: 'unsafe-inline' may be needed for some CSS frameworks
    // Consider using nonces or hashes for production
    ...(process.env.NODE_ENV === 'development' ? ["'unsafe-inline'"] : []),
  ].join(' ');
  
  const csp = [
    "default-src 'self'",
    `script-src ${scriptSrc}`,
    `style-src ${styleSrc}`,
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://www.google-analytics.com https://*.supabase.co https://*.supabase.in",
    "frame-src 'self' https://www.youtube.com https://www.google.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
    "block-all-mixed-content",
  ].join('; ');
  
  response.headers.set('Content-Security-Policy', csp);
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=(), payment=(), usb=(), serial=(), bluetooth=()');
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  
  // Remove server information
  response.headers.delete('X-Powered-By');
  response.headers.delete('Server');
  
  return response;
}

