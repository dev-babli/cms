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
      
      response.cookies.set('auth-token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
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

    response.cookies.set('auth-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
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
