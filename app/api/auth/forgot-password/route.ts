import { NextRequest, NextResponse } from 'next/server';
import { users } from '@/lib/auth/users';
import { createServerClient } from '@/lib/supabase';
import { z } from 'zod';

const ForgotPasswordSchema = z.object({
  email: z.string().email(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = ForgotPasswordSchema.parse(body);

    // Find user in database
    const user = await users.findByEmail(email);
    if (!user) {
      // Don't reveal if user exists (security best practice)
      return NextResponse.json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.',
      });
    }

    // ADMIN APPROVAL FEATURE - COMMENTED OUT
    // Check if user is active
    // if (user.status !== 'active') {
    //   return NextResponse.json({
    //     success: false,
    //     error: 'Account is not active. Please contact an administrator.',
    //   }, { status: 403 });
    // }
    
    // Auto-activate user if not active
    if (user.status !== 'active') {
      await users.update(user.id, { status: 'active' });
    }

    // Use Supabase Auth password reset
    const supabase = createServerClient();
    
    // If user has Supabase ID, use Supabase password reset
    if (user.supabase_user_id) {
      const { error: resetError } = await supabase.auth.admin.generateLink({
        type: 'recovery',
        email: email,
        options: {
          redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL || 'http://localhost:3001'}/auth/reset-password`,
        },
      });

      if (resetError) {
        console.error('Supabase password reset error:', resetError);
        // Fall through to generic success message for security
      }
    } else {
      // User doesn't have Supabase Auth account - create one and send reset
      try {
        const { data: authData, error: createError } = await supabase.auth.admin.createUser({
          email: email,
          password: 'temp-password-' + Date.now(), // Temporary password
          email_confirm: true,
        });

        if (!createError && authData?.user) {
          // Link Supabase user to database user
          await users.update(user.id, { supabase_user_id: authData.user.id });
          
          // Now send password reset
          await supabase.auth.admin.generateLink({
            type: 'recovery',
            email: email,
            options: {
              redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL || 'http://localhost:3001'}/auth/reset-password`,
            },
          });
        }
      } catch (error) {
        console.error('Error creating Supabase Auth user for password reset:', error);
      }
    }

    // Always return success message (security best practice)
    return NextResponse.json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid email address' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'If an account with that email exists, a password reset link has been sent.' },
      { status: 200 }
    );
  }
}

