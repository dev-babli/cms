import { NextRequest, NextResponse } from 'next/server';
import { users } from '@/lib/auth/users';
import { createServerClient } from '@/lib/supabase';
import { z } from 'zod';

const ResetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(6),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, password } = ResetPasswordSchema.parse(body);

    const supabase = createServerClient();

    // Supabase password reset uses exchangeCodeForSession
    // The token from email is actually a code that needs to be exchanged
    try {
      // Try to exchange the token for a session
      const { data: sessionData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(token);

      if (exchangeError || !sessionData?.session) {
        // If exchange fails, try verifyOtp method
        const { data: verifyData, error: verifyError } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: 'recovery',
        });

        if (verifyError || !verifyData?.user) {
          return NextResponse.json(
            { success: false, error: 'Invalid or expired reset token. Please request a new password reset link.' },
            { status: 400 }
          );
        }

        // Update password for verified user
        const { error: updateError } = await supabase.auth.updateUser({
          password: password,
        });

        if (updateError) {
          console.error('Password update error:', updateError);
          return NextResponse.json(
            { success: false, error: 'Failed to reset password. Please try again.' },
            { status: 400 }
          );
        }

        // Update database password hash for legacy compatibility
        const user = await users.findByEmail(verifyData.user.email!);
        if (user) {
          const bcrypt = await import('bcryptjs');
          const passwordHash = await bcrypt.default.hash(password, 12);
          await users.update(user.id, { password_hash: passwordHash } as any);
        }
      } else {
        // Session created from code, update password
        const { error: updateError } = await supabase.auth.updateUser({
          password: password,
        });

        if (updateError) {
          console.error('Password update error:', updateError);
          return NextResponse.json(
            { success: false, error: 'Failed to reset password. Please try again.' },
            { status: 400 }
          );
        }

        // Update database password hash
        if (sessionData.user?.email) {
          const user = await users.findByEmail(sessionData.user.email);
          if (user) {
            const bcrypt = await import('bcryptjs');
            const passwordHash = await bcrypt.default.hash(password, 12);
            await users.update(user.id, { password_hash: passwordHash } as any);
          }
        }
      }

      return NextResponse.json({
        success: true,
        message: 'Password has been reset successfully. You can now log in with your new password.',
      });
    } catch (error: any) {
      console.error('Reset password error:', error);
      return NextResponse.json(
        { success: false, error: 'Invalid or expired reset token. Please request a new password reset link.' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Reset password error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid input. Password must be at least 6 characters.' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to reset password' },
      { status: 500 }
    );
  }
}

