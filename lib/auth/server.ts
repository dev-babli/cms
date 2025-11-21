import { cookies } from 'next/headers';
import { createServerClient } from '@/lib/supabase';
import { redirect } from 'next/navigation';

/**
 * Get the current authenticated user from Supabase Auth
 * Returns null if not authenticated
 */
export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('sb-access-token')?.value;
    
    if (!accessToken) {
      return null;
    }
    
    const supabase = createServerClient();
    
    // For server-side with service role key, we can verify the JWT token
    // by using the admin API to get user info from the token
    // First, try to decode and get user ID from token (simplified approach)
    
    // Use admin API to verify token - get user by extracting info from token
    // Since we have service role key, we can use admin.listUsers and match by token
    // But simpler: verify token by calling getUser with the token
    
    // Create a client with the user's access token (not service role)
    // We need to use the anon key but with the user's access token
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    
    if (!anonKey || !supabaseUrl) {
      console.error('Missing Supabase anon key or URL for user verification');
      return null;
    }
    
    // Create a client with anon key and set the user's access token
    const { createClient } = await import('@supabase/supabase-js');
    const userSupabase = createClient(supabaseUrl, anonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
    
    // Verify the token by getting the user
    const { data: { user }, error: userError } = await userSupabase.auth.getUser();
    
    if (userError || !user) {
      // If that fails, try using admin API with service role key
      // Extract user ID from token payload (basic JWT decode)
      try {
        const tokenParts = accessToken.split('.');
        if (tokenParts.length === 3) {
          const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
          const userId = payload.sub;
          
          if (userId) {
            const { data: adminUser, error: adminError } = await supabase.auth.admin.getUserById(userId);
            if (!adminError && adminUser?.user) {
              return {
                id: adminUser.user.id,
                email: adminUser.user.email || '',
                name: adminUser.user.user_metadata?.name || adminUser.user.email?.split('@')[0] || 'User',
                role: adminUser.user.user_metadata?.role || 'author',
                status: 'active',
              };
            }
          }
        }
      } catch (decodeError) {
        console.error('Error decoding token:', decodeError);
      }
      
      return null;
    }
    
    return {
      id: user.id,
      email: user.email || '',
      name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
      role: user.user_metadata?.role || 'author',
      status: 'active',
    };
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

/**
 * Require authentication - redirects to login if not authenticated
 * Use this in server components that require authentication
 */
export async function requireAuth() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/auth/login');
  }
  
  return user;
}

/**
 * Require specific role - redirects if user doesn't have the role
 */
export async function requireRole(role: string | string[]) {
  const user = await requireAuth();
  
  const allowedRoles = Array.isArray(role) ? role : [role];
  
  if (!allowedRoles.includes(user.role)) {
    redirect('/admin'); // Redirect to admin home if insufficient permissions
  }
  
  return user;
}

/**
 * Check if user is authenticated (for client components via API)
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser();
  return user !== null;
}
