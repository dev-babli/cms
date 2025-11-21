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
    const body = await request.json();
    const { email, password } = LoginSchema.parse(body);

    // Initialize default admin on first login attempt (lazy initialization)
    // Only initialize if trying to login as admin
    if (!adminInitialized && email === 'admin@emscale.com') {
      try {
        await initializeDefaultAdmin();
      } catch (initError) {
        console.error('Failed to initialize admin user:', initError);
        // Continue with login attempt - might already exist
      }
      adminInitialized = true;
    }

    // Authenticate with Supabase Auth (secure)
    const supabase = createServerClient();
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !authData.user) {
      // Log error for debugging (always log in production for troubleshooting)
      console.error('Supabase Auth error:', {
        message: authError?.message,
        status: authError?.status,
        email: email,
        hasUser: !!authData.user,
      });
      
      // If admin user login fails, try to create it again
      if (email === 'admin@emscale.com' && (authError?.message?.includes('Invalid login credentials') || authError?.message?.includes('User not found'))) {
        console.log('Admin user not found in Supabase Auth, attempting to create...');
        try {
          // Try to create admin in Supabase Auth directly
          const { data: createData, error: createError } = await supabase.auth.admin.createUser({
            email: 'admin@emscale.com',
            password: 'admin123',
            email_confirm: true,
            user_metadata: {
              name: 'System Administrator',
              role: 'admin',
            },
          });
          
          if (!createError && createData?.user) {
            // Update database user with Supabase ID
            const dbUser = await users.findByEmail('admin@emscale.com');
            if (dbUser) {
              await users.update(dbUser.id, { 
                supabase_user_id: createData.user.id,
                status: 'active',
                email_verified: true,
              });
            }
            
            // Retry login
            const { data: retryAuth, error: retryError } = await supabase.auth.signInWithPassword({
              email: 'admin@emscale.com',
              password: 'admin123',
            });
            
            if (!retryError && retryAuth?.user) {
              // Continue with successful login flow below
              const customUser = await users.findByEmail('admin@emscale.com');
              if (customUser && customUser.status === 'active') {
                await users.updateLastLogin(customUser.id);
                const session = await sessions.create(customUser.id);
                
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
                
                const isProduction = process.env.NODE_ENV === 'production';
                response.cookies.set('auth-token', session.token, {
                  httpOnly: true,
                  secure: isProduction,
                  sameSite: 'lax',
                  maxAge: 30 * 24 * 60 * 60,
                  path: '/',
                });
                
                if (retryAuth.session?.access_token) {
                  response.cookies.set('sb-access-token', retryAuth.session.access_token, {
                    httpOnly: true,
                    secure: isProduction,
                    sameSite: 'lax',
                    maxAge: retryAuth.session.expires_in || 3600,
                    path: '/',
                  });
                }
                
                return response;
              }
            }
          } else {
            console.error('Failed to create admin in Supabase Auth:', createError);
          }
        } catch (createErr) {
          console.error('Error creating admin user:', createErr);
        }
      }
      
      // Provide more specific error messages
      let errorMessage = 'Invalid email or password';
      
      if (authError) {
        if (authError.message.includes('Invalid login credentials')) {
          errorMessage = 'Invalid email or password. Please check your credentials.';
        } else if (authError.message.includes('Email not confirmed')) {
          errorMessage = 'Please confirm your email address to log in.';
        } else if (authError.message.includes('User not found')) {
          errorMessage = 'User not found. Please create an account or contact administrator.';
        } else {
          // In production, show generic message; in dev, show actual error
          errorMessage = process.env.NODE_ENV === 'development' 
            ? authError.message 
            : 'Invalid email or password';
        }
      }
      
      return NextResponse.json(
        { success: false, error: errorMessage },
        { status: 401 }
      );
    }

    // Find user in custom table (for admin approval check)
    let customUser = await users.findByEmail(email);
    if (!customUser) {
      // User exists in Supabase Auth but not in custom table - create it automatically with ACTIVE status
      // This handles migration case
      try {
        const db = await import('@/lib/db');
        const bcrypt = await import('bcryptjs');
        
        // Create user directly with 'active' status (admin approval disabled)
        const passwordHash = await bcrypt.default.hash('temp-' + Date.now(), 12);
        const stmt = db.default.prepare(`
          INSERT INTO users (email, password_hash, name, role, status, email_verified, supabase_user_id)
          VALUES (?, ?, ?, ?, 'active', true, ?)
          RETURNING *
        `);
        
        const userName = authData.user.user_metadata?.name || email.split('@')[0];
        const userRole = authData.user.user_metadata?.role || 'author';
        
        const result = await stmt.run(
          email,
          passwordHash,
          userName,
          userRole,
          authData.user.id
        );
        
        // Get the created user
        customUser = await users.findByEmail(email);
        if (!customUser) {
          console.error('Failed to retrieve created user');
          return NextResponse.json(
            { success: false, error: 'Failed to create user account. Please try again.' },
            { status: 500 }
          );
        }
      } catch (createError: any) {
        console.error('Error creating user:', createError);
        return NextResponse.json(
          { success: false, error: 'Failed to create user account. Please contact administrator.' },
          { status: 500 }
        );
      }
    } else {
      // User exists - ensure it's linked to Supabase Auth and active
      if (!customUser.supabase_user_id) {
        await users.update(customUser.id, {
          supabase_user_id: authData.user.id,
          status: 'active',
          email_verified: true,
        });
        customUser = await users.findByEmail(email);
      }
    }

    // Ensure customUser exists (should always be true at this point, but TypeScript check)
    if (!customUser) {
      console.error('User not found after creation attempt');
      return NextResponse.json(
        { success: false, error: 'Account not found. Please contact administrator.' },
        { status: 404 }
      );
    }

    // ADMIN APPROVAL FEATURE - COMMENTED OUT
    // All status checks disabled - if Supabase Auth succeeds, allow login
    
    // Auto-activate user if not active (bypass admin approval)
    if (customUser.status !== 'active') {
      try {
        await users.update(customUser.id, { status: 'active' });
        customUser.status = 'active';
      } catch (updateError) {
        console.error('Error updating user status:', updateError);
        // Continue anyway - don't block login
      }
    }

    // Update last login (don't fail if this errors)
    try {
      await users.updateLastLogin(customUser.id);
    } catch (updateError) {
      console.error('Error updating last login:', updateError);
      // Continue anyway
    }

    // Create session (using custom session system for compatibility)
    let session;
    try {
      session = await sessions.create(customUser.id);
    } catch (sessionError) {
      console.error('Error creating session:', sessionError);
      return NextResponse.json(
        { success: false, error: 'Failed to create session. Please try again.' },
        { status: 500 }
      );
    }
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Failed to create session. Please try again.' },
        { status: 500 }
      );
    }

    // Set cookie with Supabase session token (for Supabase Auth)
    const isProduction = process.env.NODE_ENV === 'production';
    
    const response = NextResponse.json({
      success: true,
      data: {
        user: {
          id: customUser.id,
          email: customUser.email,
          name: customUser.name,
          role: customUser.role,
          status: customUser.status || 'active',
        },
        session: {
          token: session.token,
          expires_at: session.expires_at,
        },
      },
    });

    // Set both cookies for compatibility
    // Cookie configuration optimized for Vercel production
    try {
      // Custom session cookie
      response.cookies.set('auth-token', session.token, {
        httpOnly: true,
        secure: isProduction, // HTTPS required in production
        sameSite: 'lax', // Allows cross-site navigation while protecting against CSRF
        maxAge: 30 * 24 * 60 * 60, // 30 days
        path: '/',
        // Don't set domain - allows Vercel subdomains to work
      });

      // Supabase session cookie (if available)
      if (authData.session?.access_token) {
        response.cookies.set('sb-access-token', authData.session.access_token, {
          httpOnly: true,
          secure: isProduction,
          sameSite: 'lax',
          maxAge: authData.session.expires_in || 3600,
          path: '/',
          // Don't set domain - allows Vercel subdomains to work
        });
      }
    } catch (cookieError) {
      console.error('Error setting cookies:', cookieError);
      // Continue anyway - cookies might still work
    }

    return response;
  } catch (error) {
    // Log full error in development, generic in production
    if (process.env.NODE_ENV === 'development') {
      console.error('Login error:', error);
    } else {
      console.error('Login error:', error instanceof Error ? error.message : 'Unknown error');
    }
    
    if (error instanceof z.ZodError) {
      const errorMessages = error.issues.map(issue => 
        `${issue.path.join('.')}: ${issue.message}`
      ).join(', ');
      
      return NextResponse.json(
        { 
          success: false, 
          error: process.env.NODE_ENV === 'development' 
            ? `Invalid input: ${errorMessages}`
            : 'Invalid input data'
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

    return NextResponse.json(
      { 
        success: false, 
        error: process.env.NODE_ENV === 'development'
          ? (error instanceof Error ? error.message : 'Login failed')
          : 'Login failed. Please try again.'
      },
      { status: 500 }
    );
  }
}

