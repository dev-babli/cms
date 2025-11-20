import { NextRequest, NextResponse } from 'next/server';
import { sessions } from '@/lib/auth/users';

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    
    if (token) {
      await sessions.delete(token);
    }

    // Check if this is a form submission (redirect) or API call (JSON)
    const contentType = request.headers.get('content-type');
    const isFormSubmit = contentType?.includes('application/x-www-form-urlencoded') || 
                         contentType?.includes('multipart/form-data') ||
                         !contentType; // Form submissions from HTML forms don't always set content-type

    if (isFormSubmit) {
      // Redirect to login page
      const response = NextResponse.redirect(new URL('/auth/login', request.url));
      
      // Cookie configuration optimized for Vercel production
      const isProduction = process.env.NODE_ENV === 'production';
      
      response.cookies.set('auth-token', '', {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'lax',
        maxAge: 0, // Delete cookie
        path: '/',
        // Don't set domain - allows Vercel subdomains to work
      });
      
      // Also clear Supabase session cookie if it exists
      response.cookies.set('sb-access-token', '', {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'lax',
        maxAge: 0,
        path: '/',
      });

      return response;
    }

    // Return JSON for API calls
    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully',
    });

    // Cookie configuration optimized for Vercel production
    const isProduction = process.env.NODE_ENV === 'production';
    
    response.cookies.set('auth-token', '', {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 0, // Delete cookie
      path: '/',
      // Don't set domain - allows Vercel subdomains to work
    });
    
    // Also clear Supabase session cookie if it exists
    response.cookies.set('sb-access-token', '', {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });

    return response;
  } catch (error) {
    // Log full error in development, generic in production
    if (process.env.NODE_ENV === 'development') {
      console.error('Logout error:', error);
    } else {
      console.error('Logout error:', error instanceof Error ? error.message : 'Unknown error');
    }
    
    // Even if logout fails, try to clear cookies
    const response = NextResponse.json(
      { 
        success: false, 
        error: process.env.NODE_ENV === 'development'
          ? (error instanceof Error ? error.message : 'Logout failed')
          : 'Logout failed. Cookies cleared.'
      },
      { status: 500 }
    );
    
    // Clear cookies anyway
    const isProduction = process.env.NODE_ENV === 'production';
    response.cookies.set('auth-token', '', {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });
    response.cookies.set('sb-access-token', '', {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });
    
    return response;
  }
}
