import { NextRequest, NextResponse } from 'next/server';
import { users } from '@/lib/auth/users';
import db from '@/lib/db';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const ResetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(6),
});

// Verify and get reset token
async function getResetToken(token: string): Promise<{ userId: number } | null> {
  const result = await db.prepare(`
    SELECT user_id, expires_at 
    FROM password_reset_tokens 
    WHERE token = ? AND used = false
  `).get(token) as { user_id: number; expires_at: string } | null;

  if (!result) {
    return null;
  }

  // Check if token expired
  const expiresAt = new Date(result.expires_at);
  if (expiresAt < new Date()) {
    return null;
  }

  return { userId: result.user_id };
}

// Mark token as used
async function markTokenAsUsed(token: string): Promise<void> {
  await db.prepare(`
    UPDATE password_reset_tokens 
    SET used = true 
    WHERE token = ?
  `).run(token);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, password } = ResetPasswordSchema.parse(body);

    // Verify token
    const tokenData = await getResetToken(token);
    if (!tokenData) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired reset token' },
        { status: 400 }
      );
    }

    // Update password
    const passwordHash = await bcrypt.hash(password, 12);
    await db.prepare(`
      UPDATE users 
      SET password_hash = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `).run(passwordHash, tokenData.userId);

    // Mark token as used
    await markTokenAsUsed(token);

    return NextResponse.json({
      success: true,
      message: 'Password has been reset successfully. You can now log in with your new password.',
    });
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

