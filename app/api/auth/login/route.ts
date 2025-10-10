import { NextRequest, NextResponse } from 'next/server';
import { users, sessions, initializeDefaultAdmin } from '@/lib/auth/users';
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

    // Find user with password
    const userWithPassword = users.findByEmailWithPassword(email);
    if (!userWithPassword) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check if user is active
    if (userWithPassword.status !== 'active') {
      return NextResponse.json(
        { success: false, error: 'Account is not active' },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await users.verifyPassword(password, userWithPassword.password_hash);
    if (!isValidPassword) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Update last login
    users.updateLastLogin(userWithPassword.id);

    // Create session
    const session = sessions.create(userWithPassword.id);

    // Remove password from response
    const { password_hash, ...user } = userWithPassword;

    // Set cookie
    const response = NextResponse.json({
      success: true,
      data: {
        user,
        session: {
          token: session.token,
          expires_at: session.expires_at,
        },
      },
    });

    response.cookies.set('auth-token', session.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/',
    });

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
