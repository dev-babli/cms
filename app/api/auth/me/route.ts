import { NextRequest, NextResponse } from 'next/server';
import { sessions } from '@/lib/auth/users';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const session = await sessions.findByToken(token);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired session' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        user: session.user,
        session: {
          token: session.token,
          expires_at: session.expires_at,
        },
      },
    });
  } catch (error) {
    // Log full error in development, generic in production
    if (process.env.NODE_ENV === 'development') {
      console.error('Auth check error:', error);
    } else {
      console.error('Auth check error:', error instanceof Error ? error.message : 'Unknown error');
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: process.env.NODE_ENV === 'development'
          ? (error instanceof Error ? error.message : 'Authentication check failed')
          : 'Authentication check failed. Please try logging in again.'
      },
      { status: 500 }
    );
  }
}



