import { NextRequest, NextResponse } from 'next/server';
import { users } from '@/lib/auth/users';
import { nanoid } from 'nanoid';
import db from '@/lib/db';
import { z } from 'zod';

const ForgotPasswordSchema = z.object({
  email: z.string().email(),
});

// Store password reset tokens
async function createResetToken(userId: number): Promise<string> {
  const token = nanoid(32);
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 1); // Token expires in 1 hour

  await db.prepare(`
    INSERT INTO password_reset_tokens (user_id, token, expires_at)
    VALUES (?, ?, ?)
  `).run(userId, token, expiresAt.toISOString());

  return token;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = ForgotPasswordSchema.parse(body);

    // Find user
    const user = await users.findByEmail(email);
    if (!user) {
      // Don't reveal if user exists (security best practice)
      return NextResponse.json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.',
      });
    }

    // Check if user is active
    if (user.status !== 'active') {
      return NextResponse.json({
        success: false,
        error: 'Account is not active. Please contact an administrator.',
      }, { status: 403 });
    }

    // Create reset token
    const resetToken = await createResetToken(user.id);

    // In production, you would send an email here
    // For now, we'll return the token (remove this in production!)
    // TODO: Send email with reset link: /auth/reset-password?token=...
    
    return NextResponse.json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.',
      // Remove this in production - only for development!
      resetToken: process.env.NODE_ENV === 'development' ? resetToken : undefined,
      resetUrl: process.env.NODE_ENV === 'development' 
        ? `${process.env.NEXTAUTH_URL || 'http://localhost:3001'}/auth/reset-password?token=${resetToken}`
        : undefined,
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
      { success: false, error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

