import { NextRequest, NextResponse } from 'next/server';
import { users, sessions } from '@/lib/auth/users';
import { z } from 'zod';

const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
  role: z.enum(['admin', 'editor', 'author', 'viewer']).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name, role = 'author' } = RegisterSchema.parse(body);

    // Check if user already exists
    const existingUser = users.findByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Create new user
    const newUser = await users.create({
      email,
      password,
      name,
      role,
    });

    // Create session
    const session = sessions.create(newUser.id);

    // Set cookie
    const response = NextResponse.json({
      success: true,
      data: {
        user: newUser,
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
    console.error('Registration error:', error);
    
    if (error instanceof z.ZodError) {
      const errorMessages = error.issues.map(err => 
        `${err.path.join('.')}: ${err.message}`
      ).join(', ');
      return NextResponse.json(
        { success: false, error: `Validation failed: ${errorMessages}` },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Registration failed' },
      { status: 500 }
    );
  }
}

