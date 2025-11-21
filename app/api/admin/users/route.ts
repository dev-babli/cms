import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth/server';
import { z } from 'zod';

const CreateUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['admin', 'editor', 'author', 'viewer']),
});

// Get all users from Supabase Auth (admin only)
export async function GET(request: NextRequest) {
  try {
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

    // Get users from Supabase Auth
    const supabase = createServerClient();
    const { data: authUsers, error: listError } = await supabase.auth.admin.listUsers();

    if (listError) {
      console.error('Error listing users from Supabase:', listError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch users from Supabase' },
        { status: 500 }
      );
    }

    // Transform Supabase Auth users to match our User interface
    const users = (authUsers?.users || []).map((authUser: any) => ({
      id: authUser.id, // Use Supabase UUID as ID
      email: authUser.email,
      name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User',
      role: authUser.user_metadata?.role || 'author',
      status: authUser.email_confirmed_at ? 'active' : 'pending',
      email_verified: !!authUser.email_confirmed_at,
      last_login: authUser.last_sign_in_at || null,
      created_at: authUser.created_at,
      updated_at: authUser.updated_at || authUser.created_at,
    }));

    return NextResponse.json({ success: true, data: users });
  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

// Create new user in Supabase Auth (admin only)
export async function POST(request: NextRequest) {
  try {
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
    const validated = CreateUserSchema.parse(body);

    // Check if user already exists in Supabase Auth
    const supabase = createServerClient();
    const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.error('Error checking existing users:', listError);
      return NextResponse.json(
        { success: false, error: 'Failed to check existing users' },
        { status: 500 }
      );
    }

    const existingUser = existingUsers?.users?.find((u: any) => u.email === validated.email);
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Create user in Supabase Auth
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email: validated.email,
      password: validated.password,
      email_confirm: true, // Auto-confirm email for admin-created users
      user_metadata: {
        name: validated.name,
        role: validated.role,
      },
    });

    if (createError || !newUser.user) {
      console.error('Error creating user in Supabase:', createError);
      return NextResponse.json(
        { success: false, error: createError?.message || 'Failed to create user' },
        { status: 500 }
      );
    }

    // Return the created user in our format
    const createdUser = {
      id: newUser.user.id,
      email: newUser.user.email,
      name: newUser.user.user_metadata?.name || validated.name,
      role: newUser.user.user_metadata?.role || validated.role,
      status: 'active',
      email_verified: true,
      created_at: newUser.user.created_at,
      updated_at: newUser.user.updated_at || newUser.user.created_at,
    };

    return NextResponse.json({ success: true, data: createdUser });
  } catch (error) {
    console.error('Create user error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid input data' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to create user' },
      { status: 500 }
    );
  }
}
