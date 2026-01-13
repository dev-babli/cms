import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/server';
import { query, execute } from '@/lib/db';
import { applyCorsHeaders, handleCorsPreflight } from '@/lib/security/cors';
import { createSecureResponse, createErrorResponse, handleOptions } from '@/lib/security/api-helpers';

// Handle CORS preflight
export async function OPTIONS(request: NextRequest) {
  return handleOptions(request);
}

// GET - Fetch all media files
export async function GET(request: NextRequest) {
  try {
    // SECURITY: Require authentication
    const user = await getCurrentUser();
    if (!user) {
      return createErrorResponse('Authentication required', request, 401, { allowCredentials: true });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'all', 'image', 'video'
    const size = searchParams.get('size'); // 'all', 'small', 'medium', 'large'
    const dateRange = searchParams.get('dateRange'); // 'all', 'today', 'week', 'month'
    const search = searchParams.get('search');

    // Build query
    let sql = 'SELECT * FROM media WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;

    // Filter by type
    if (type && type !== 'all') {
      if (type === 'image') {
        sql += ` AND mime_type LIKE $${paramIndex}`;
        params.push('image/%');
        paramIndex++;
      } else if (type === 'video') {
        sql += ` AND mime_type LIKE $${paramIndex}`;
        params.push('video/%');
        paramIndex++;
      }
    }

    // Filter by date range
    if (dateRange && dateRange !== 'all') {
      const now = new Date();
      let dateFilter: Date;
      
      if (dateRange === 'today') {
        dateFilter = new Date(now.setHours(0, 0, 0, 0));
      } else if (dateRange === 'week') {
        dateFilter = new Date(now.setDate(now.getDate() - 7));
      } else if (dateRange === 'month') {
        dateFilter = new Date(now.setMonth(now.getMonth() - 1));
      } else {
        dateFilter = new Date(0); // All time
      }
      
      if (dateRange !== 'all') {
        sql += ` AND created_at >= $${paramIndex}`;
        params.push(dateFilter.toISOString());
        paramIndex++;
      }
    }

    // Search filter
    if (search) {
      sql += ` AND (original_name ILIKE $${paramIndex} OR alt_text ILIKE $${paramIndex + 1})`;
      params.push(`%${search}%`, `%${search}%`);
      paramIndex += 2;
    }

    // Order by created_at descending
    sql += ' ORDER BY created_at DESC';

    // Execute query
    const result = await query(sql, params.length > 0 ? params : undefined);
    
    // Filter by size if needed (client-side filtering for size ranges)
    let media = result.rows || [];
    
    if (size && size !== 'all') {
      const sizeRanges: Record<string, { min: number; max: number }> = {
        small: { min: 0, max: 100 * 1024 }, // 0-100KB
        medium: { min: 100 * 1024, max: 1024 * 1024 }, // 100KB-1MB
        large: { min: 1024 * 1024, max: Infinity }, // 1MB+
      };
      
      const range = sizeRanges[size];
      if (range) {
        media = media.filter((file: any) => {
          const fileSize = file.size || 0;
          return fileSize >= range.min && fileSize < range.max;
        });
      }
    }

    return createSecureResponse(
      { success: true, data: media },
      request
    );
  } catch (error: any) {
    console.error('Error fetching media:', error);
    return createErrorResponse(error?.message || 'Failed to fetch media', request, 500, { allowCredentials: true });
  }
}

// POST - Upload media files
// This endpoint accepts multiple files and processes them
// For now, redirect to use /api/upload endpoint which handles single file uploads
// The media page should upload files one by one or we can enhance this later
export async function POST(request: NextRequest) {
  try {
    // SECURITY: Require authentication
    const user = await getCurrentUser();
    if (!user) {
      return createErrorResponse('Authentication required', request, 401, { allowCredentials: true });
    }

    // For multi-file uploads, the client should use /api/upload for each file
    // Or we can enhance this endpoint later to handle multiple files
    return createErrorResponse(
      'Please use /api/upload endpoint for file uploads. This endpoint is for fetching media only.',
      request,
      400,
      { allowCredentials: true }
    );
  } catch (error: any) {
    console.error('Error in media POST:', error);
    return createErrorResponse(error?.message || 'Failed to process request', request, 500, { allowCredentials: true });
  }
}

