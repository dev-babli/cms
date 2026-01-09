import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { checkRateLimit, getClientIdentifier, apiRateLimiter, authRateLimiter } from "@/lib/security/rate-limiter";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();
  
  // Security Headers (2026 Best Practices)
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  // Content Security Policy
  // Note: 'unsafe-inline' needed for React, but should be minimized
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://vercel.live",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self' https://www.google-analytics.com https://*.supabase.co https://vercel.live",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ');
  response.headers.set('Content-Security-Policy', csp);
  
  // Strict Transport Security (HSTS) - only in production with HTTPS
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }
  
  // Additional security headers
  response.headers.set('X-Permitted-Cross-Domain-Policies', 'none');
  
  // Rate limiting for API routes
  if (pathname.startsWith('/api/')) {
    // Different rate limits for different endpoints
    if (pathname.startsWith('/api/auth/')) {
      const limitCheck = checkRateLimit(request, authRateLimiter);
      if (limitCheck && !limitCheck.allowed) {
        return NextResponse.json(
          { error: 'Too many requests. Please try again later.' },
          { 
            status: 429,
            headers: {
              'Retry-After': String(Math.ceil((limitCheck.resetTime - Date.now()) / 1000)),
              'X-RateLimit-Limit': '5',
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': String(limitCheck.resetTime),
            }
          }
        );
      }
    } else {
      const limitCheck = checkRateLimit(request, apiRateLimiter);
      if (limitCheck && !limitCheck.allowed) {
        return NextResponse.json(
          { error: 'Too many requests. Please try again later.' },
          { 
            status: 429,
            headers: {
              'Retry-After': String(Math.ceil((limitCheck.resetTime - Date.now()) / 1000)),
              'X-RateLimit-Limit': '100',
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': String(limitCheck.resetTime),
            }
          }
        );
      }
      
      // Add rate limit headers
      if (limitCheck) {
        response.headers.set('X-RateLimit-Limit', '100');
        response.headers.set('X-RateLimit-Remaining', String(limitCheck.remaining));
        response.headers.set('X-RateLimit-Reset', String(limitCheck.resetTime));
      }
    }
  }
  
  // Allow auth pages and API routes to pass through
  if (pathname.startsWith('/auth/') || pathname.startsWith('/api/')) {
    return response;
  }
  
  // Check authentication for admin routes
  if (pathname.startsWith('/admin/')) {
    // SECURITY FIX: Check for token existence
    // Note: Full JWT validation happens in route handlers via getCurrentUser()
    // which uses Supabase's getUser() to verify signature
    // This middleware check is a first line of defense
    const supabaseToken = request.cookies.get('sb-access-token')?.value;
    const legacyToken = request.cookies.get('auth-token')?.value;
    
    // If no token exists, redirect to login
    // This prevents obvious unauthorized access attempts
    if (!supabaseToken && !legacyToken) {
      const loginUrl = new URL('/auth/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
    
    // Token exists - let through for validation in route handlers
    // Route handlers will use getCurrentUser() which properly validates JWT signature
    // This is acceptable because:
    // 1. Middleware runs at edge (limited runtime capabilities)
    // 2. Full validation happens in route handlers (Node.js runtime)
    // 3. Invalid tokens will be rejected by getCurrentUser()
    return response;
  }
  
  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};


