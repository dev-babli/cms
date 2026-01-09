/**
 * Ownership Verification Utilities
 * 
 * Prevents IDOR (Insecure Direct Object Reference) attacks by verifying
 * that users can only modify/delete content they own or have permission for
 */

import { getCurrentUser } from './server';
import type { BlogPost, CaseStudy, Ebook } from '@/lib/cms/types';

export interface User {
  id: string;
  email: string;
  role: string;
}

/**
 * Check if user can edit/delete content
 * 
 * Rules:
 * - Admins can edit/delete any content
 * - Editors can edit/delete any content
 * - Authors can only edit/delete their own content
 * 
 * @param user - Current authenticated user
 * @param content - Content item to check
 * @returns true if user has permission
 */
export function canModifyContent(
  user: User,
  content: { created_by?: string | number | null; [key: string]: any }
): boolean {
  // Admins and editors can modify any content
  if (user.role === 'admin' || user.role === 'editor') {
    return true;
  }
  
  // Authors can only modify their own content
  if (user.role === 'author') {
    // If created_by is null/undefined (legacy content), allow modification
    // This handles content created before ownership tracking was implemented
    if (!content.created_by) {
      return true;
    }
    const contentAuthorId = content.created_by?.toString();
    const userId = user.id.toString();
    return contentAuthorId === userId;
  }
  
  // Other roles cannot modify content
  return false;
}

/**
 * Check if user can delete content
 * 
 * Rules:
 * - Only admins and editors can delete content
 * - Authors cannot delete content (even their own)
 * 
 * @param user - Current authenticated user
 * @returns true if user can delete
 */
export function canDeleteContent(user: User): boolean {
  return user.role === 'admin' || user.role === 'editor';
}

/**
 * Verify ownership and throw error if not allowed
 * 
 * @param user - Current authenticated user
 * @param content - Content item to check
 * @throws Error if user doesn't have permission
 */
export function verifyOwnership(
  user: User,
  content: { created_by?: string | number | null; [key: string]: any }
): void {
  if (!canModifyContent(user, content)) {
    throw new Error('You do not have permission to modify this content');
  }
}

/**
 * Verify delete permission and throw error if not allowed
 * 
 * @param user - Current authenticated user
 * @throws Error if user doesn't have permission
 */
export function verifyDeletePermission(user: User): void {
  if (!canDeleteContent(user)) {
    throw new Error('You do not have permission to delete content');
  }
}

