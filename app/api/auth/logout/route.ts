import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

// Helper function to perform logout and clear cookies
async function performLogout(request: NextRequest) {
  try {
    const supabase = createServerClient();
    
    // Sign out from Supabase Auth
    await supabase.auth.signOut();

    const isProduction = process.env.NODE_ENV === 'production';
    const loginUrl = new URL('/auth/login', request.url);

    // Create redirect response
    const response = NextResponse.redirect(loginUrl);
    
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

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    // Even on error, redirect to login page
    const loginUrl = new URL('/auth/login', request.url);
    return NextResponse.redirect(loginUrl);
  }
}

// Handle POST requests (form submissions)
export async function POST(request: NextRequest) {
  return performLogout(request);
}

// Handle GET requests (direct navigation to logout URL)
export async function GET(request: NextRequest) {
  return performLogout(request);
}
