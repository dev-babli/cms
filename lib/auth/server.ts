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
    
    // Decode JWT token to get user ID
    try {
      const tokenParts = accessToken.split('.');
      if (tokenParts.length !== 3) {
        console.error('Invalid JWT token format');
        return null;
      }
      
      // Decode the payload (second part of JWT)
      let payload;
      try {
        // Handle base64url encoding (Supabase uses base64url, not base64)
        const base64 = tokenParts[1].replace(/-/g, '+').replace(/_/g, '/');
        const padded = base64 + '='.repeat((4 - base64.length % 4) % 4);
        payload = JSON.parse(Buffer.from(padded, 'base64').toString());
      } catch (e) {
        // Fallback to regular base64
        payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
      }
      
      const userId = payload.sub;
      
      if (!userId) {
        console.error('No user ID in token payload');
        return null;
      }
      
      // Use admin API to get user by ID
      const { data: adminUser, error: adminError } = await supabase.auth.admin.getUserById(userId);
      
      if (adminError) {
        console.error('Error getting user from Supabase:', adminError.message);
        return null;
      }
      
      if (!adminUser?.user) {
        console.error('User not found in Supabase');
        return null;
      }
      
      // Get role from user_metadata (primary) or app_metadata (fallback)
      const role = adminUser.user.user_metadata?.role 
        || adminUser.user.app_metadata?.role 
        || 'author';
      
      // Log role detection for debugging (only in development)
      if (process.env.NODE_ENV === 'development') {
        console.log('🔍 User role detection:', {
          email: adminUser.user.email,
          user_metadata_role: adminUser.user.user_metadata?.role,
          app_metadata_role: adminUser.user.app_metadata?.role,
          final_role: role,
        });
      }
      
      return {
        id: adminUser.user.id,
        email: adminUser.user.email || '',
        name: adminUser.user.user_metadata?.name || adminUser.user.email?.split('@')[0] || 'User',
        role: role,
        status: 'active',
      };
    } catch (decodeError: any) {
      console.error('Error decoding/verifying token:', decodeError?.message || decodeError);
      return null;
    }
  } catch (error: any) {
    console.error('Error getting current user:', error?.message || error);
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
