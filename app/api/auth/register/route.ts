import { NextRequest, NextResponse } from 'next/server';
import { users } from '@/lib/auth/users';
import { createServerClient } from '@/lib/supabase';
import db from '@/lib/db';
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

    // Check if user already exists in custom table
    const existingUser = await users.findByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Create user in Supabase Auth (secure authentication)
    const supabase = createServerClient();
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role,
        },
        emailRedirectTo: `${process.env.NEXTAUTH_URL || 'http://localhost:3001'}/auth/verify-email`,
      },
    });

    if (authError) {
      // If user exists in Supabase Auth but not in our table, handle it
      if (authError.message.includes('already registered')) {
        return NextResponse.json(
          { success: false, error: 'User with this email already exists' },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { success: false, error: authError.message },
        { status: 400 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { success: false, error: 'Failed to create user account' },
        { status: 500 }
      );
    }

    // Create custom user record with 'pending' status (admin approval required)
    // Link with Supabase Auth user via supabase_user_id
    const stmt = db.prepare(`
      INSERT INTO users (email, name, role, status, email_verified, supabase_user_id)
      VALUES (?, ?, ?, 'pending', ?, ?)
      RETURNING *
    `);
    
    const result = await stmt.run(
      email,
      name,
      role,
      authData.user.email_confirmed_at ? true : false,
      authData.user.id
    );

    // Get the created user from result
    const customUser = (result as any).row || (result as any).rows?.[0];

    // Don't create session - user must wait for admin approval
    return NextResponse.json({
      success: true,
      message: 'Registration successful. Your account is pending admin approval. You will be notified once approved.',
      data: {
        user: customUser ? {
          id: customUser.id,
          email: customUser.email,
          name: customUser.name,
          status: customUser.status,
        } : null,
        requiresApproval: true,
        // Supabase will send email verification if configured
        emailSent: !!authData.session,
      },
    });
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

