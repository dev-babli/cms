import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth/server';
import { z } from 'zod';
import { createErrorResponse, createSecureResponse } from '@/lib/security/api-helpers';

const PromoteToAdminSchema = z.object({
  userId: z.string().optional(), // If not provided, promotes current user
  email: z.string().email().optional(), // Alternative: promote by email
});

/**
 * Promote a user to admin role
 * 
 * Security rules:
 * 1. If no admins exist: Anyone authenticated can promote themselves or any user
 * 2. If admins exist: Only admins can promote users
 * 3. Can promote by userId or email
 */
export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return createErrorResponse('Authentication required', request, 401);
    }

    const body = await request.json();
    const validated = PromoteToAdminSchema.parse(body);

    const supabase = createServerClient();

    // Check if there are any existing admin users
    const { data: allUsers } = await supabase.auth.admin.listUsers();
    const hasExistingAdmin = allUsers?.users?.some((u: any) => 
      u.user_metadata?.role === 'admin' || u.app_metadata?.role === 'admin'
    );

    // If admins exist, require admin role
    if (hasExistingAdmin && currentUser.role !== 'admin') {
      return createErrorResponse(
        'Admin access required. Only existing admins can promote users.',
        request,
        403
      );
    }

    // Determine which user to promote
    let targetUserId: string | null = null;

    if (validated.userId) {
      targetUserId = validated.userId;
    } else if (validated.email) {
      // Find user by email
      const userByEmail = allUsers?.users?.find((u: any) => u.email === validated.email);
      if (!userByEmail) {
        return createErrorResponse('User not found with that email', request, 404);
      }
      targetUserId = userByEmail.id;
    } else {
      // Promote current user
      targetUserId = currentUser.id;
    }

    // Get target user data
    const { data: targetUserData, error: getUserError } = await supabase.auth.admin.getUserById(targetUserId);
    
    if (getUserError || !targetUserData.user) {
      return createErrorResponse('User not found', request, 404);
    }

    // Preserve existing metadata
    const existingMetadata = targetUserData.user.user_metadata || {};

    // Update user's role to admin
    const { data: updatedUser, error: updateError } = await supabase.auth.admin.updateUserById(
      targetUserId,
      {
        user_metadata: {
          ...existingMetadata,
          role: 'admin',
        },
      }
    );

    if (updateError || !updatedUser.user) {
      console.error('Error promoting user to admin:', updateError);
      return createErrorResponse(
        updateError?.message || 'Failed to promote user to admin',
        request,
        500
      );
    }

    return createSecureResponse(
      {
        success: true,
        message: `User ${updatedUser.user.email} has been promoted to admin. Please refresh the page and log in again.`,
        data: {
          user: {
            id: updatedUser.user.id,
            email: updatedUser.user.email,
            name: updatedUser.user.user_metadata?.name || updatedUser.user.email?.split('@')[0] || 'User',
            role: 'admin',
          },
        },
      },
      request
    );
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return createErrorResponse(
        `Validation failed: ${error.issues.map((i) => i.message).join(', ')}`,
        request,
        400
      );
    }
    console.error('Promote to admin error:', error);
    return createErrorResponse(error, request, 500);
  }
}





