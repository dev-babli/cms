/**
 * User Permissions Utility
 * Handles role-based access control for CMS operations
 */

export type UserRole = 'admin' | 'editor' | 'author' | 'viewer';

export interface Permission {
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canPublish: boolean;
  canView: boolean;
  canExport: boolean;
}

/**
 * Get permissions for a user role
 */
export function getPermissions(role: UserRole): Permission {
  switch (role) {
    case 'admin':
      return {
        canCreate: true,
        canEdit: true,
        canDelete: true,
        canPublish: true,
        canView: true,
        canExport: true,
      };

    case 'editor':
      return {
        canCreate: true,
        canEdit: true,
        canDelete: false, // Editors cannot delete
        canPublish: true,
        canView: true,
        canExport: true,
      };

    case 'author':
      return {
        canCreate: true,
        canEdit: true, // Can only edit their own content
        canDelete: false,
        canPublish: false, // Requires approval
        canView: true,
        canExport: false,
      };

    case 'viewer':
      return {
        canCreate: false,
        canEdit: false,
        canDelete: false,
        canPublish: false,
        canView: true, // Read-only
        canExport: true, // Can export reports
      };

    default:
      return {
        canCreate: false,
        canEdit: false,
        canDelete: false,
        canPublish: false,
        canView: false,
        canExport: false,
      };
  }
}

/**
 * Check if user can perform an action
 */
export function canPerformAction(
  role: UserRole,
  action: keyof Permission
): boolean {
  const permissions = getPermissions(role);
  return permissions[action];
}

/**
 * Check if user can edit specific content (for authors, must own the content)
 */
export function canEditContent(
  role: UserRole,
  contentAuthorId?: string | number,
  currentUserId?: string | number
): boolean {
  const permissions = getPermissions(role);

  if (!permissions.canEdit) return false;

  // Authors can only edit their own content
  if (role === 'author') {
    return contentAuthorId?.toString() === currentUserId?.toString();
  }

  return true;
}

/**
 * Check if user can delete specific content
 */
export function canDeleteContent(
  role: UserRole,
  contentAuthorId?: string | number,
  currentUserId?: string | number
): boolean {
  const permissions = getPermissions(role);

  if (!permissions.canDelete) return false;

  // Editors and authors cannot delete
  if (role === 'editor' || role === 'author') {
    return false;
  }

  return true;
}

/**
 * Get user role from session/user object
 */
export function getUserRole(user: any): UserRole {
  if (!user) return 'viewer';

  // Check user_metadata first (Supabase default)
  if (user.user_metadata?.role) {
    return user.user_metadata.role as UserRole;
  }

  // Check app_metadata (custom role storage)
  if (user.app_metadata?.role) {
    return user.app_metadata.role as UserRole;
  }

  // Default to viewer if no role found
  return 'viewer';
}

/**
 * Require specific permission or throw error
 */
export function requirePermission(
  role: UserRole,
  action: keyof Permission,
  message?: string
): void {
  if (!canPerformAction(role, action)) {
    throw new Error(
      message ||
        `Permission denied: User role '${role}' cannot perform action '${action}'`
    );
  }
}

