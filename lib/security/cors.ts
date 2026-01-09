/**
 * Secure CORS Configuration - 2026 Production Grade
 * 
 * Implements proper origin validation per OWASP and ISO 27001 standards
 * Replaces insecure wildcard (*) CORS with whitelist-based validation
 */

import { NextRequest, NextResponse } from 'next/server';

/**
 * Get allowed origins from environment variable
 * Format: ALLOWED_ORIGINS=https://example.com,https://www.example.com,http://localhost:3000
 */
function getAllowedOrigins(): string[] {
  const envOrigins = process.env.ALLOWED_ORIGINS || process.env.NEXT_PUBLIC_ALLOWED_ORIGINS;
  
  if (!envOrigins) {
    // In production, use default production origins
    if (process.env.NODE_ENV === 'production') {
      console.warn('⚠️ ALLOWED_ORIGINS not configured, using default production origins');
      return [
        'https://intellectt.com',
        'https://www.intellectt.com',
        'http://intellectt.com',
        'http://www.intellectt.com',
        'https://cms-intellectt-final.vercel.app',
      ];
    }
    
    // In development, allow localhost origins
    return [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001',
    ];
  }
  
  // Parse comma-separated origins and trim whitespace
  const parsedOrigins = envOrigins
    .split(',')
    .map(origin => origin.trim())
    .filter(origin => origin.length > 0);
  
  // Always include default production origins if in production
  if (process.env.NODE_ENV === 'production') {
    const defaultOrigins = [
      'https://intellectt.com',
      'https://www.intellectt.com',
      'https://cms-intellectt-final.vercel.app',
    ];
    
    // Merge and deduplicate
    const allOrigins = [...new Set([...defaultOrigins, ...parsedOrigins])];
    return allOrigins;
  }
  
  return parsedOrigins;
}

/**
 * Validate if an origin is allowed
 */
function isOriginAllowed(origin: string | null, allowedOrigins: string[]): boolean {
  if (!origin) {
    return false;
  }
  
  // Exact match
  if (allowedOrigins.includes(origin)) {
    return true;
  }
  
  // Check for subdomain matches (e.g., *.example.com)
  for (const allowed of allowedOrigins) {
    if (allowed.startsWith('*.')) {
      const domain = allowed.slice(2); // Remove '*.' prefix
      try {
        const originUrl = new URL(origin);
        const originHost = originUrl.hostname;
        
        // Match subdomains: *.example.com matches app.example.com, api.example.com
        if (originHost === domain || originHost.endsWith('.' + domain)) {
          return true;
        }
      } catch (e) {
        // Invalid URL, skip
        continue;
      }
    }
  }
  
  return false;
}

/**
 * Get CORS headers for a request
 * Returns null if origin is not allowed
 */
export function getCorsHeaders(
  request: NextRequest,
  options: {
    allowCredentials?: boolean;
    allowedMethods?: string[];
    allowedHeaders?: string[];
  } = {}
): Record<string, string> | null {
  const origin = request.headers.get('origin');
  const allowedOrigins = getAllowedOrigins();
  
  // If no origin header (same-origin request), allow it
  if (!origin) {
    // For same-origin requests, we can be more permissive
    // But still set proper headers
    return {
      'Access-Control-Allow-Methods': (options.allowedMethods || ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']).join(', '),
      'Access-Control-Allow-Headers': (options.allowedHeaders || ['Content-Type', 'Authorization']).join(', '),
      ...(options.allowCredentials ? { 'Access-Control-Allow-Credentials': 'true' } : {}),
    };
  }
  
  // Validate origin
  if (!isOriginAllowed(origin, allowedOrigins)) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`🚨 CORS: Blocked request from unauthorized origin: ${origin}`);
      console.warn(`   Allowed origins:`, allowedOrigins);
    }
    return null; // Origin not allowed
  }
  
  if (process.env.NODE_ENV === 'development') {
    console.log(`✅ CORS: Allowed origin: ${origin}`);
  }
  
  // Build CORS headers
  const headers: Record<string, string> = {
    'Access-Control-Allow-Origin': origin, // Use specific origin, not wildcard
    'Access-Control-Allow-Methods': (options.allowedMethods || ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']).join(', '),
    'Access-Control-Allow-Headers': (options.allowedHeaders || ['Content-Type', 'Authorization']).join(', '),
    'Access-Control-Max-Age': '86400', // 24 hours
    'Vary': 'Origin', // Important: tells browser to cache per-origin
  };
  
  if (options.allowCredentials) {
    headers['Access-Control-Allow-Credentials'] = 'true';
  }
  
  return headers;
}

/**
 * Handle CORS preflight (OPTIONS) request
 */
export function handleCorsPreflight(
  request: NextRequest,
  options: {
    allowCredentials?: boolean;
    allowedMethods?: string[];
    allowedHeaders?: string[];
  } = {}
): NextResponse | null {
  const corsHeaders = getCorsHeaders(request, options);
  
  if (!corsHeaders) {
    // Origin not allowed
    return new NextResponse(null, { status: 403 });
  }
  
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  });
}

/**
 * Apply CORS headers to a response
 */
export function applyCorsHeaders(
  response: NextResponse,
  request: NextRequest,
  options: {
    allowCredentials?: boolean;
    allowedMethods?: string[];
    allowedHeaders?: string[];
  } = {}
): NextResponse {
  const corsHeaders = getCorsHeaders(request, options);
  
  if (corsHeaders) {
    Object.entries(corsHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
  }
  
  return response;
}

