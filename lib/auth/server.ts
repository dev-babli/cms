import { cookies } from 'next/headers';
import { sessions } from './users';
import { redirect } from 'next/navigation';

/**
 * Get the current authenticated user from server components
 * Returns null if not authenticated
 */
export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;
  
  if (!token) {
    return null;
  }
  
  const session = sessions.findByToken(token);
  
  if (!session) {
    return null;
  }
  
  return session.user;
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




