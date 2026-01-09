import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth/server';
import { z } from 'zod';
import { applyCorsHeaders } from '@/lib/security/cors';
import { createSecureResponse, createErrorResponse } from '@/lib/security/api-helpers';

const UpdateUserSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  role: z.enum(['admin', 'editor', 'author', 'viewer']).optional(),
  status: z.enum(['active', 'inactive', 'suspended']).optional(),
});

// Update user in Supabase Auth (admin only)
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const userId = id;

    // Check authentication using Supabase Auth
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    if (user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validated = UpdateUserSchema.parse(body);

    const supabase = createServerClient();

    // Check if user exists
    const { data: userData, error: getUserError } = await supabase.auth.admin.getUserById(userId);
    
    if (getUserError || !userData.user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Check email uniqueness if email is being changed
    if (validated.email && validated.email !== userData.user.email) {
      const { data: allUsers } = await supabase.auth.admin.listUsers();
      const emailExists = allUsers?.users?.some((u: any) => u.email === validated.email && u.id !== userId);
      
      if (emailExists) {
        return NextResponse.json(
          { success: false, error: 'Email already in use' },
          { status: 409 }
        );
      }
    }

    // Update user in Supabase Auth
    const updateData: any = {};
    if (validated.email) updateData.email = validated.email;
    if (validated.name || validated.role) {
      updateData.user_metadata = {
        ...userData.user.user_metadata,
        ...(validated.name && { name: validated.name }),
        ...(validated.role && { role: validated.role }),
      };
    }

    const { data: updatedUser, error: updateError } = await supabase.auth.admin.updateUserById(
      userId,
      updateData
    );

    if (updateError || !updatedUser.user) {
      console.error('Error updating user in Supabase:', updateError);
      return NextResponse.json(
        { success: false, error: updateError?.message || 'Failed to update user' },
        { status: 500 }
      );
    }

    // Return updated user in our format
    const result = {
      id: updatedUser.user.id,
      email: updatedUser.user.email,
      name: updatedUser.user.user_metadata?.name || updatedUser.user.email?.split('@')[0] || 'User',
      role: updatedUser.user.user_metadata?.role || 'author',
      status: validated.status || (updatedUser.user.email_confirmed_at ? 'active' : 'pending'),
      email_verified: !!updatedUser.user.email_confirmed_at,
      last_login: updatedUser.user.last_sign_in_at || null,
      created_at: updatedUser.user.created_at,
      updated_at: updatedUser.user.updated_at || updatedUser.user.created_at,
    };

    return createSecureResponse({ success: true, data: result }, request);
  } catch (error: any) {
    console.error('Update user error:', process.env.NODE_ENV === 'development' ? error : 'Error');
    
    if (error instanceof z.ZodError) {
      return createErrorResponse('Invalid input data', request, 400);
    }

    return createErrorResponse(error, request, 500);
  }
}

// Delete user from Supabase Auth (admin only)
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const userId = id;

    // Check authentication using Supabase Auth
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    if (user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    // Prevent deleting yourself
    if (userId === user.id) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete your own account' },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    // Delete user from Supabase Auth
    const { error: deleteError } = await supabase.auth.admin.deleteUser(userId);

    if (deleteError) {
      console.error('Error deleting user from Supabase:', deleteError);
      return NextResponse.json(
        { success: false, error: deleteError.message || 'Failed to delete user' },
        { status: 500 }
      );
    }

    return createSecureResponse({ 
      success: true, 
      message: 'User deleted successfully' 
    }, request);
  } catch (error: any) {
    console.error('Delete user error:', process.env.NODE_ENV === 'development' ? error : 'Error');
    return createErrorResponse(error, request, 500);
  }
}
