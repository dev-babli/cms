import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient();
    
    // Sign out from Supabase Auth
    await supabase.auth.signOut();

    const contentType = request.headers.get('content-type');
    const isFormSubmit = contentType?.includes('application/x-www-form-urlencoded') || 
                         contentType?.includes('multipart/form-data') ||
                         !contentType;

    const isProduction = process.env.NODE_ENV === 'production';

    const response = isFormSubmit 
      ? NextResponse.redirect(new URL('/auth/login', request.url))
      : NextResponse.json({ success: true, message: 'Logged out successfully' });
    
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

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { success: false, error: 'Logout failed' },
      { status: 500 }
    );
  }
}
