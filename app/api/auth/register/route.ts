import { NextRequest, NextResponse } from 'next/server';
import { users } from '@/lib/auth/users';
import { createServerClient } from '@/lib/supabase';
import db from '@/lib/db';
import { z } from 'zod';
import { applyCorsHeaders, handleCorsPreflight } from '@/lib/security/cors';

// SECURITY: Enhanced password policy (2026 best practices)
// Minimum 12 characters with complexity requirements
const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string()
    .min(12, 'Password must be at least 12 characters long')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  name: z.string().min(2),
  // SECURITY: Prevent role assignment during registration
  // Users should default to 'viewer' and require admin approval for higher roles
  role: z.enum(['viewer']).optional().default('viewer'),
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
    const { email, password, name, role = 'author' } = RegisterSchema.parse(body);

    // Check if user already exists in custom table
    const existingUser = await users.findByEmail(email);
    if (existingUser) {
      const response = NextResponse.json(
        { success: false, error: 'User with this email already exists' },
        { status: 409 }
      );
      return applyCorsHeaders(response, request, { allowCredentials: true });
    }

    // Create user in Supabase Auth (secure authentication)
    const supabase = createServerClient();
    
    // Check if Supabase client is properly configured
    if (!supabase) {
      console.error('Supabase client not initialized. Check SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
      const response = NextResponse.json(
        { success: false, error: 'Server configuration error. Please contact support.' },
        { status: 500 }
      );
      return applyCorsHeaders(response, request, { allowCredentials: true });
    }

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role,
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/auth/verify-email`,
      },
    });

    if (authError) {
      console.error('Supabase Auth error:', authError);
      // If user exists in Supabase Auth but not in our table, handle it
      if (authError.message.includes('already registered') || authError.message.includes('already exists')) {
        const response = NextResponse.json(
          { success: false, error: 'User with this email already exists' },
          { status: 409 }
        );
        return applyCorsHeaders(response, request, { allowCredentials: true });
      }
      // Provide more user-friendly error messages
      let errorMessage = authError.message;
      if (authError.message.includes('Invalid API key')) {
        errorMessage = 'Server configuration error. Please contact support.';
      } else if (authError.message.includes('Email rate limit')) {
        errorMessage = 'Too many registration attempts. Please try again later.';
      }
      const response = NextResponse.json(
        { success: false, error: errorMessage },
        { status: 400 }
      );
      return applyCorsHeaders(response, request, { allowCredentials: true });
    }

    if (!authData.user) {
      const response = NextResponse.json(
        { success: false, error: 'Failed to create user account' },
        { status: 500 }
      );
      return applyCorsHeaders(response, request, { allowCredentials: true });
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
    const response = NextResponse.json({
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
    return applyCorsHeaders(response, request, { allowCredentials: true });
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
      const response = NextResponse.json(
        { 
          success: false, 
          error: process.env.NODE_ENV === 'development' 
            ? `Validation failed: ${errorMessages}`
            : 'Invalid input data. Please check all fields and try again.'
        },
        { status: 400 }
      );
      return applyCorsHeaders(response, request, { allowCredentials: true });
    }

    // Check if it's a Supabase configuration error
    if (error instanceof Error && error.message.includes('Supabase')) {
      const response = NextResponse.json(
        { 
          success: false, 
          error: process.env.NODE_ENV === 'development'
            ? error.message
            : 'Server configuration error. Please contact support.'
        },
        { status: 500 }
      );
      return applyCorsHeaders(response, request, { allowCredentials: true });
    }

    // Check if it's a database connection error
    if (error instanceof Error && (
      error.message.includes('connection') || 
      error.message.includes('database') ||
      error.message.includes('timeout')
    )) {
      const response = NextResponse.json(
        { 
          success: false, 
          error: 'Database connection error. Please try again in a moment.'
        },
        { status: 503 }
      );
      return applyCorsHeaders(response, request, { allowCredentials: true });
    }

    // Generic error
    const response = NextResponse.json(
      { 
        success: false, 
        error: process.env.NODE_ENV === 'development'
          ? (error instanceof Error ? error.message : 'Registration failed')
          : 'Registration failed. Please try again.'
      },
      { status: 500 }
    );
    return applyCorsHeaders(response, request, { allowCredentials: true });
  }
}

