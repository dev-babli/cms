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
    const customUser = await users.findByEmail(email);
    if (!customUser) {
      // User exists in Supabase Auth but not in custom table - create it automatically
      // This handles migration case
      try {
        const newUser = await users.create({
          email: email,
          password: 'temp-password', // Won't be used since Supabase Auth handles it
          name: authData.user.user_metadata?.name || email.split('@')[0],
          role: 'author',
        });
        
        // Link with Supabase Auth
        await users.update(newUser.id, {
          supabase_user_id: authData.user.id,
          status: 'active', // Auto-activate
          email_verified: true,
        });
        
        // Use the newly created user
        const updatedUser = await users.findByEmail(email);
        if (!updatedUser) {
          return NextResponse.json(
            { success: false, error: 'Account not found. Please contact administrator.' },
            { status: 404 }
          );
        }
        
        // Continue with login using updatedUser
        await users.updateLastLogin(updatedUser.id);
        const session = await sessions.create(updatedUser.id);
        
        const response = NextResponse.json({
          success: true,
          data: {
            user: {
              id: updatedUser.id,
              email: updatedUser.email,
              name: updatedUser.name,
              role: updatedUser.role,
              status: updatedUser.status,
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
        
        if (authData.session?.access_token) {
          response.cookies.set('sb-access-token', authData.session.access_token, {
            httpOnly: true,
            secure: isProduction,
            sameSite: 'lax',
            maxAge: authData.session.expires_in || 3600,
            path: '/',
          });
        }
        
        return response;
      } catch (createError) {
        console.error('Error creating user:', createError);
        return NextResponse.json(
          { success: false, error: 'Account not found. Please contact administrator.' },
          { status: 404 }
        );
      }
    }

    // ADMIN APPROVAL FEATURE - COMMENTED OUT
    // Check if user is pending approval (admin approval system)
    // if (customUser.status === 'pending') {
    //   return NextResponse.json(
    //     { success: false, error: 'Your account is pending admin approval. Please wait for an administrator to approve your account.' },
    //     { status: 403 }
    //   );
    // }

    // Check if user is active
    // if (customUser.status !== 'active') {
    //   return NextResponse.json(
    //     { success: false, error: 'Account is not active' },
    //     { status: 401 }
    //   );
    // }
    
    // Auto-activate user if not active (bypass admin approval)
    if (customUser.status !== 'active') {
      await users.update(customUser.id, { status: 'active' });
      customUser.status = 'active';
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
    // Cookie configuration optimized for Vercel production
    const isProduction = process.env.NODE_ENV === 'production';
    
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

