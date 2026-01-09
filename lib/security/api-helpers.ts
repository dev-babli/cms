/**
 * Security Helpers for API Routes
 * Provides common security utilities for all API endpoints
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/server';
import { applyCorsHeaders, handleCorsPreflight } from './cors';
import { applySecurityHeaders } from './security-middleware';


/**
 * Create a secure API response with CORS and security headers
 */
export function createSecureResponse(
  data: any,
  request: NextRequest,
  status: number = 200
): NextResponse {
  const response = NextResponse.json(data, { status });
  const corsResponse = applyCorsHeaders(response, request);
  return applySecurityHeaders(corsResponse);
}

/**
 * Create a secure error response
 */
export function createErrorResponse(
  error: string | Error,
  request: NextRequest,
  status: number = 500
): NextResponse {
  const errorMessage = error instanceof Error 
    ? (process.env.NODE_ENV === 'development' ? error.message : 'An error occurred')
    : (process.env.NODE_ENV === 'development' ? error : 'An error occurred');
  
  const response = NextResponse.json(
    { 
      success: false, 
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' && error instanceof Error
        ? { message: error.message, stack: error.stack }
        : undefined
    },
    { status }
  );
  
  return applyCorsHeaders(response, request);
}

/**
 * Handle OPTIONS request for CORS preflight
 */
export function handleOptions(request: NextRequest): NextResponse {
  const origin = request.headers.get('origin');
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 OPTIONS preflight request:', { origin, url: request.url });
  }
  
  const preflightResponse = handleCorsPreflight(request, {
    allowCredentials: true, // Allow credentials for authenticated requests
    allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });
  
  if (preflightResponse) {
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ OPTIONS preflight response:', {
        status: preflightResponse.status,
        headers: Object.fromEntries(preflightResponse.headers.entries()),
      });
    }
    return preflightResponse;
  }
  
  if (process.env.NODE_ENV === 'development') {
    console.warn('❌ OPTIONS preflight blocked:', { origin });
  }
  return new NextResponse(null, { status: 403 });
}

