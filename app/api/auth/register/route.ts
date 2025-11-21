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
    
    // Check if Supabase client is properly configured
    if (!supabase) {
      console.error('Supabase client not initialized. Check SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
      return NextResponse.json(
        { success: false, error: 'Server configuration error. Please contact support.' },
        { status: 500 }
      );
    }

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
      console.error('Supabase Auth error:', authError);
      // If user exists in Supabase Auth but not in our table, handle it
      if (authError.message.includes('already registered') || authError.message.includes('already exists')) {
        return NextResponse.json(
          { success: false, error: 'User with this email already exists' },
          { status: 409 }
        );
      }
      // Provide more user-friendly error messages
      let errorMessage = authError.message;
      if (authError.message.includes('Invalid API key')) {
        errorMessage = 'Server configuration error. Please contact support.';
      } else if (authError.message.includes('Email rate limit')) {
        errorMessage = 'Too many registration attempts. Please try again later.';
      }
      return NextResponse.json(
        { success: false, error: errorMessage },
        { status: 400 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { success: false, error: 'Failed to create user account' },
        { status: 500 }
      );
    }

    // ADMIN APPROVAL FEATURE - COMMENTED OUT
    // Create custom user record with 'pending' status (admin approval required)
    // Link with Supabase Auth user via supabase_user_id
    // Note: password_hash is NULL for Supabase Auth users (authentication handled by Supabase)
    // const stmt = db.prepare(`
    //   INSERT INTO users (email, name, role, status, email_verified, supabase_user_id, password_hash)
    //   VALUES (?, ?, ?, 'pending', ?, ?, NULL)
    //   RETURNING *
    // `);
    
    // AUTO-ACTIVATE USERS (admin approval disabled)
    const stmt = db.prepare(`
      INSERT INTO users (email, name, role, status, email_verified, supabase_user_id, password_hash)
      VALUES (?, ?, ?, 'active', ?, ?, NULL)
      RETURNING *
    `);
    
    const result = await stmt.run(
      email,
      name,
      role,
      authData.user.email_confirmed_at ? true : false,
      authData.user.id
    );

    // Get the created user from result (PostgreSQL returns rows in result.rows)
    const customUser = (result as any)?.row || (result as any)?.rows?.[0];
    
    if (!customUser) {
      console.error('Failed to retrieve created user from database');
      // User was created in Supabase Auth, but we couldn't retrieve the custom record
      // This is not ideal, but we should still return success
      // The user can be manually linked later if needed
    }

    // ADMIN APPROVAL FEATURE - COMMENTED OUT
    // Don't create session - user must wait for admin approval
    // return NextResponse.json({
    //   success: true,
    //   message: 'Registration successful. Your account is pending admin approval. You will be notified once approved.',
    //   data: {
    //     user: customUser ? {
    //       id: customUser.id,
    //       email: customUser.email,
    //       name: customUser.name,
    //       status: customUser.status,
    //     } : null,
    //     requiresApproval: true,
    //     emailSent: !!authData.session,
    //   },
    // });
    
    // AUTO-ACTIVATE: User is immediately active, can login right away
    return NextResponse.json({
      success: true,
      message: 'Registration successful. You can now log in.',
      data: {
        user: customUser ? {
          id: customUser.id,
          email: customUser.email,
          name: customUser.name,
          status: customUser.status,
        } : null,
        requiresApproval: false,
        // Supabase will send email verification if configured
        emailSent: !!authData.session,
      },
    });
  } catch (error) {
    // Log full error in development, generic in production
    if (process.env.NODE_ENV === 'development') {
      console.error('Registration error:', error);
    } else {
      console.error('Registration error:', error instanceof Error ? error.message : 'Unknown error');
    }
    
    if (error instanceof z.ZodError) {
      const errorMessages = error.issues.map(err => 
        `${err.path.join('.')}: ${err.message}`
      ).join(', ');
      return NextResponse.json(
        { 
          success: false, 
          error: process.env.NODE_ENV === 'development' 
            ? `Validation failed: ${errorMessages}`
            : 'Invalid input data. Please check all fields and try again.'
        },
        { status: 400 }
      );
    }

    // Check if it's a Supabase configuration error
    if (error instanceof Error && error.message.includes('Supabase')) {
      return NextResponse.json(
        { 
          success: false, 
          error: process.env.NODE_ENV === 'development'
            ? error.message
            : 'Server configuration error. Please contact support.'
        },
        { status: 500 }
      );
    }

    // Check if it's a database connection error
    if (error instanceof Error && (
      error.message.includes('connection') || 
      error.message.includes('database') ||
      error.message.includes('timeout')
    )) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Database connection error. Please try again in a moment.'
        },
        { status: 503 }
      );
    }

    // Generic error
    return NextResponse.json(
      { 
        success: false, 
        error: process.env.NODE_ENV === 'development'
          ? (error instanceof Error ? error.message : 'Registration failed')
          : 'Registration failed. Please try again.'
      },
      { status: 500 }
    );
  }
}

