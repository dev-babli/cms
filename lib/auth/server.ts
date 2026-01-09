import { cookies } from 'next/headers';
import { createServerClient } from '@/lib/supabase';
import { redirect } from 'next/navigation';

/**
 * Get the current authenticated user from Supabase Auth
 * Returns null if not authenticated
 * 
 * SECURITY: Uses Supabase's built-in token verification with signature validation
 * This replaces the insecure manual JWT decoding that was vulnerable to token forgery
 */
export async function getCurrentUser() {
  try {
    let cookieStore;
    try {
      cookieStore = await cookies();
    } catch (cookieError: any) {
      // Cookies might not be available in some contexts
      if (process.env.NODE_ENV === 'development') {
        console.warn('⚠️ Could not access cookies:', cookieError?.message);
      }
      return null;
    }
    
    const accessToken = cookieStore.get('sb-access-token')?.value;
    
    if (!accessToken) {
      return null;
    }
    
    // SECURITY FIX: Use Supabase client with the access token for proper verification
    // This ensures the token signature is validated, preventing token forgery attacks
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !anonKey) {
      console.error('❌ Supabase configuration missing');
      return null;
    }
    
    // Create a Supabase client with the user's access token
    // Supabase will automatically verify the token signature
    let userSupabase;
    try {
      const { createClient } = await import('@supabase/supabase-js');
      userSupabase = createClient(supabaseUrl, anonKey, {
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
    } catch (importError: any) {
      if (process.env.NODE_ENV === 'development') {
        console.error('❌ Failed to import Supabase client:', importError?.message);
      }
      return null;
    }
    
    // SECURITY: Use Supabase's getUser() which verifies the token signature
    // This prevents token forgery attacks that were possible with manual decoding
    let user, verifyError;
    try {
      const result = await userSupabase.auth.getUser();
      user = result.data.user;
      verifyError = result.error;
    } catch (getUserError: any) {
      if (process.env.NODE_ENV === 'development') {
        console.error('❌ Failed to get user from Supabase:', getUserError?.message);
      }
      return null;
    }
    
    if (verifyError || !user) {
      // Token is invalid, expired, or signature verification failed
      if (process.env.NODE_ENV === 'development') {
        console.warn('⚠️ Token verification failed:', verifyError?.message);
      }
      return null;
    }
    
    // Verify token hasn't expired
    if (user.app_metadata?.exp && user.app_metadata.exp < Math.floor(Date.now() / 1000)) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('⚠️ Token has expired');
      }
      return null;
    }
    
    // Get role from user_metadata (primary) or app_metadata (fallback)
    const role = user.user_metadata?.role 
      || user.app_metadata?.role 
      || 'author';
    
    // Log role detection for debugging (only in development)
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 User authenticated:', {
        email: user.email,
        user_metadata_role: user.user_metadata?.role,
        app_metadata_role: user.app_metadata?.role,
        final_role: role,
      });
    }
    
    return {
      id: user.id,
      email: user.email || '',
      name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
      role: role,
      status: 'active',
    };
  } catch (error: any) {
    // Log error but don't expose details in production
    if (process.env.NODE_ENV === 'development') {
      console.error('Error getting current user:', error?.message || error);
    } else {
      console.error('Authentication error');
    }
    return null;
  }
}

/**
 * Require authentication - redirects to login if not authenticated
 * Use this in server components that require authentication
 * 
 * NOTE: redirect() throws a special NEXT_REDIRECT error that Next.js catches.
 * Do NOT catch this error - let it propagate.
 */
export async function requireAuth() {
  const user = await getCurrentUser();
  
  if (!user) {
    // redirect() throws a special error that Next.js catches - don't catch it
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
