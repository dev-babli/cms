import { NextRequest, NextResponse } from 'next/server';
import { users, sessions, initializeDefaultAdmin } from '@/lib/auth/users';
import { createServerClient } from '@/lib/supabase';
import { z } from 'zod';

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

// Lazy initialization flag
let adminInitialized = false;

export async function POST(request: NextRequest) {
  try {
    // Initialize default admin on first login attempt (lazy initialization)
    if (!adminInitialized) {
      await initializeDefaultAdmin();
      adminInitialized = true;
    }

    const body = await request.json();
    const { email, password } = LoginSchema.parse(body);

    // Authenticate with Supabase Auth (secure)
    const supabase = createServerClient();
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !authData.user) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Find user in custom table (for admin approval check)
    const customUser = await users.findByEmail(email);
    if (!customUser) {
      // User exists in Supabase Auth but not in custom table - sync it
      // This handles migration case
      return NextResponse.json(
        { success: false, error: 'Account not found. Please contact administrator.' },
        { status: 404 }
      );
    }

    // Check if user is pending approval (admin approval system)
    if (customUser.status === 'pending') {
      return NextResponse.json(
        { success: false, error: 'Your account is pending admin approval. Please wait for an administrator to approve your account.' },
        { status: 403 }
      );
    }

    // Check if user is active
    if (customUser.status !== 'active') {
      return NextResponse.json(
        { success: false, error: 'Account is not active' },
        { status: 401 }
      );
    }

    // Update last login
    await users.updateLastLogin(customUser.id);

    // Create session (using custom session system for compatibility)
    const session = await sessions.create(customUser.id);

    // Set cookie with Supabase session token (for Supabase Auth)
    const response = NextResponse.json({
      success: true,
      data: {
        user: {
          id: customUser.id,
          email: customUser.email,
          name: customUser.name,
          role: customUser.role,
          status: customUser.status,
        },
        session: {
          token: session.token,
          expires_at: session.expires_at,
        },
      },
    });

    // Set both cookies for compatibility
    // Custom session cookie
    response.cookies.set('auth-token', session.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/',
    });

    // Supabase session cookie (if available)
    if (authData.session?.access_token) {
      response.cookies.set('sb-access-token', authData.session.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: authData.session.expires_in || 3600,
        path: '/',
      });
    }

    return response;
  } catch (error) {
    console.error('Login error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid input data' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Login failed' },
      { status: 500 }
    );
  }
}
