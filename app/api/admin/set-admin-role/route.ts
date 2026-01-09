import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth/server';
import { cookies } from 'next/headers';

/**
 * TEMPORARY ENDPOINT: Set admin role for current user
 * 
 * This endpoint allows you to set your own role to 'admin' if:
 * 1. You are authenticated
 * 2. There are no existing admin users (first admin setup)
 * 
 * SECURITY: This is a one-time setup endpoint. After setting your role,
 * you should delete this file or restrict access to it.
 */
export async function POST(request: NextRequest) {
  try {
    // Get current user
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const supabase = createServerClient();

    // Check if there are any existing admin users
    const { data: allUsers } = await supabase.auth.admin.listUsers();
    const hasExistingAdmin = allUsers?.users?.some((u: any) => 
      u.user_metadata?.role === 'admin' || u.app_metadata?.role === 'admin'
    );

    // If there are existing admins, require admin role to use this endpoint
    if (hasExistingAdmin && user.role !== 'admin') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Admin users already exist. Please contact an existing admin to update your role.' 
        },
        { status: 403 }
      );
    }

    // Get current user data to preserve existing metadata
    const { data: currentUserData } = await supabase.auth.admin.getUserById(user.id);
    const existingMetadata = currentUserData?.user?.user_metadata || {};

    // Update current user's role to admin
    const { data: updatedUser, error: updateError } = await supabase.auth.admin.updateUserById(
      user.id,
      {
        user_metadata: {
          ...existingMetadata,
          role: 'admin',
        },
      }
    );

    if (updateError || !updatedUser.user) {
      console.error('Error updating user role:', updateError);
      return NextResponse.json(
        { 
          success: false, 
          error: updateError?.message || 'Failed to update role. Please check Supabase configuration.' 
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Your role has been updated to admin. Please refresh the page and log in again.',
      data: {
        user: {
          id: updatedUser.user.id,
          email: updatedUser.user.email,
          role: updatedUser.user.user_metadata?.role || 'admin',
        },
      },
    });
  } catch (error: any) {
    console.error('Set admin role error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: process.env.NODE_ENV === 'development' 
          ? error?.message || 'Failed to update role'
          : 'Failed to update role. Please check server logs.'
      },
      { status: 500 }
    );
  }
}

