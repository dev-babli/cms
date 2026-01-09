import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const supabase = createServerClient();
    
    // Exchange code for session
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error || !data.session) {
      console.error('OAuth callback error:', error);
      return NextResponse.redirect(new URL('/auth/signin?error=oauth_error', requestUrl.origin));
    }

    // Set session cookies
    const response = NextResponse.redirect(new URL('/admin', requestUrl.origin));
    
    const isProduction = process.env.NODE_ENV === 'production';
    
    if (data.session.access_token) {
      response.cookies.set('sb-access-token', data.session.access_token, {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'lax',
        maxAge: data.session.expires_in || 3600,
        path: '/',
      });
    }

    if (data.session.refresh_token) {
      response.cookies.set('sb-refresh-token', data.session.refresh_token, {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60, // 30 days
        path: '/',
      });
    }

    return response;
  }

  // No code parameter - redirect to signin
  return NextResponse.redirect(new URL('/auth/signin', requestUrl.origin));
}





