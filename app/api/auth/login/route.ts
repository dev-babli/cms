import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { z } from 'zod';
import { applyCorsHeaders, handleCorsPreflight } from '@/lib/security/cors';

// SECURITY: Login validation - only validate format, not complexity
// Password complexity is enforced on registration/password change, not login
const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password is required'),
});

export async function OPTIONS(request: NextRequest) {
  const preflightResponse = handleCorsPreflight(request, {
    allowCredentials: true,
  });
  if (preflightResponse) {
    return preflightResponse;
  }
  return new NextResponse(null, { status: 403 });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = LoginSchema.parse(body);

    // Authenticate with Supabase Auth only
    let supabase;
    try {
      supabase = createServerClient();
    } catch (configError: any) {
      console.error('Supabase configuration error:', configError);
      const errorResponse = NextResponse.json(
        { 
          success: false, 
          error: process.env.NODE_ENV === 'development' 
            ? `Configuration error: ${configError.message}. Please check your .env.local file.`
            : 'Server configuration error. Please contact support.'
        },
        { status: 500 }
      );
      return applyCorsHeaders(errorResponse, request, { allowCredentials: true });
    }
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !authData.user) {
      console.error('Supabase Auth error:', {
        message: authError?.message,
        status: authError?.status,
        email: email,
      });
      
      let errorMessage = 'Invalid email or password';
      
      if (authError) {
        if (authError.message.includes('Invalid login credentials')) {
          errorMessage = 'Invalid email or password. Please check your credentials.';
        } else if (authError.message.includes('Email not confirmed')) {
          errorMessage = 'Please confirm your email address to log in.';
        } else if (authError.message.includes('User not found')) {
          errorMessage = 'User not found. Please create an account.';
        } else {
          errorMessage = process.env.NODE_ENV === 'development' 
            ? authError.message 
            : 'Invalid email or password';
        }
      }
      
      const errorResponse = NextResponse.json(
        { success: false, error: errorMessage },
        { status: 401 }
      );
      return applyCorsHeaders(errorResponse, request, { allowCredentials: true });
    }

    // Success - Supabase Auth handles everything
    const isProduction = process.env.NODE_ENV === 'production';
    
    const response = NextResponse.json({
      success: true,
      data: {
        user: {
          id: authData.user.id,
          email: authData.user.email,
          name: authData.user.user_metadata?.name || authData.user.email?.split('@')[0] || 'User',
          role: authData.user.user_metadata?.role || 'author',
        },
        session: {
          access_token: authData.session?.access_token,
          expires_at: authData.session?.expires_at,
        },
      },
    });
    
    // Apply CORS headers with credentials
    applyCorsHeaders(response, request, {
      allowCredentials: true,
    });

    // Set Supabase session cookie
    if (authData.session?.access_token) {
      response.cookies.set('sb-access-token', authData.session.access_token, {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'lax',
        maxAge: authData.session.expires_in || 3600,
        path: '/',
      });
    }

    // Also set refresh token if available
    if (authData.session?.refresh_token) {
      response.cookies.set('sb-refresh-token', authData.session.refresh_token, {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60, // 30 days
        path: '/',
      });
    }

    return response;
  } catch (error) {
    console.error('Login error:', error);
    
    if (error instanceof z.ZodError) {
      const errorResponse = NextResponse.json(
        { success: false, error: 'Invalid input data' },
        { status: 400 }
      );
      return applyCorsHeaders(errorResponse, request, { allowCredentials: true });
    }

    const errorResponse = NextResponse.json(
      { success: false, error: 'Login failed. Please try again.' },
      { status: 500 }
    );
    return applyCorsHeaders(errorResponse, request, { allowCredentials: true });
  }
}
