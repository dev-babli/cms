import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

// Route segment config - ensure this route is dynamic
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Helper function to perform logout and clear cookies
async function performLogout(request: NextRequest) {
  try {
    const supabase = createServerClient();
    
    // Sign out from Supabase Auth
    await supabase.auth.signOut();

    const isProduction = process.env.NODE_ENV === 'production';
    
    // Build absolute login URL to ensure proper redirect
    // Use the request URL to get the correct origin
    const baseUrl = request.nextUrl.origin;
    const loginUrl = new URL('/auth/login', baseUrl);
    
    // Ensure the URL is properly formatted
    const loginUrlString = loginUrl.toString();

    // Create redirect response with proper status code
    // Use 303 See Other to force GET redirect and prevent form resubmission
    const response = NextResponse.redirect(loginUrlString, { status: 303 });
    
    // Clear Supabase cookies
    response.cookies.set('sb-access-token', '', {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });
    
    response.cookies.set('sb-refresh-token', '', {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });

    // Also clear legacy auth-token if it exists
    response.cookies.set('auth-token', '', {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });

    // Set headers to prevent caching
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    // Even on error, redirect to login page
    const baseUrl = request.nextUrl.origin;
    const loginUrl = new URL('/auth/login', baseUrl);
    const loginUrlString = loginUrl.toString();
    const response = NextResponse.redirect(loginUrlString, { status: 303 });
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    return response;
  }
}

import { handleCorsPreflight } from '@/lib/security/cors';

// Handle CORS preflight
export async function OPTIONS(request: NextRequest) {
  return handleCorsPreflight(request) || new NextResponse(null, { status: 403 });
}

// Handle POST requests (form submissions and fetch calls)
export async function POST(request: NextRequest) {
  const contentType = request.headers.get('content-type');
  const isJsonRequest = contentType?.includes('application/json');
  
  // If it's a JSON request (from fetch), return JSON response instead of redirect
  if (isJsonRequest) {
    try {
      const supabase = createServerClient();
      await supabase.auth.signOut();
      
      const isProduction = process.env.NODE_ENV === 'production';
      
      // Return JSON response for fetch calls
      const response = NextResponse.json({ 
        success: true, 
        message: 'Logged out successfully' 
      });
      
      // Clear cookies
      response.cookies.set('sb-access-token', '', {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'lax',
        maxAge: 0,
        path: '/',
      });
      
      response.cookies.set('sb-refresh-token', '', {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'lax',
        maxAge: 0,
        path: '/',
      });
      
      response.cookies.set('auth-token', '', {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'lax',
        maxAge: 0,
        path: '/',
      });
      
      return response;
    } catch (error) {
      console.error('Logout error:', error);
      return NextResponse.json(
        { success: false, error: 'Logout failed' },
        { status: 500 }
      );
    }
  }
  
  // For form submissions, use redirect
  return performLogout(request);
}

// Handle GET requests (direct navigation to logout URL)
export async function GET(request: NextRequest) {
  return performLogout(request);
}
