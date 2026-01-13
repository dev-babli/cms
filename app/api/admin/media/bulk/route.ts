import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/server';
import { execute } from '@/lib/db';
import { applyCorsHeaders, handleCorsPreflight } from '@/lib/security/cors';
import { createSecureResponse, createErrorResponse, handleOptions } from '@/lib/security/api-helpers';

// Handle CORS preflight
export async function OPTIONS(request: NextRequest) {
  return handleOptions(request);
}

// DELETE - Bulk delete media files
export async function DELETE(request: NextRequest) {
  try {
    // SECURITY: Require authentication
    const user = await getCurrentUser();
    if (!user) {
      return createErrorResponse('Authentication required', request, 401, { allowCredentials: true });
    }

    // SECURITY: Only admins and editors can delete media
    if (!['admin', 'editor'].includes(user.role)) {
      return createErrorResponse('Insufficient permissions', request, 403, { allowCredentials: true });
    }

    // Parse request body
    const body = await request.json();
    const { ids } = body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return createErrorResponse('Invalid request: ids array required', request, 400, { allowCredentials: true });
    }

    // Validate all IDs are numbers
    const validIds = ids.filter((id: any) => typeof id === 'number' && id > 0);
    if (validIds.length === 0) {
      return createErrorResponse('Invalid request: no valid IDs provided', request, 400, { allowCredentials: true });
    }

    // Delete media files
    // Note: This only deletes database records, not the actual files in storage
    // You may want to add logic to delete files from Supabase Storage as well
    const placeholders = validIds.map((_, index) => `$${index + 1}`).join(', ');
    const sql = `DELETE FROM media WHERE id IN (${placeholders})`;
    
    const result = await execute(sql, validIds);

    return createSecureResponse(
      {
        success: true,
        message: `Deleted ${result.changes || validIds.length} media file(s)`,
        deletedCount: result.changes || validIds.length,
      },
      request
    );
  } catch (error: any) {
    console.error('Error deleting media:', error);
    return createErrorResponse(error?.message || 'Failed to delete media', request, 500, { allowCredentials: true });
  }
}





