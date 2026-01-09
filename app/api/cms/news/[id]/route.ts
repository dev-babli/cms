import { NextRequest, NextResponse } from 'next/server';
import { news } from '@/lib/cms/api';
import { NewsSchema } from '@/lib/cms/types';
import { z } from 'zod';
import { sanitizeArticleContent, sanitizeTitle } from '@/lib/utils/sanitize';
import { getCurrentUser } from '@/lib/auth/server';
import { verifyOwnership, verifyDeletePermission } from '@/lib/auth/ownership';
import { applyCorsHeaders, handleCorsPreflight } from '@/lib/security/cors';
import { createSecureResponse, createErrorResponse, handleOptions } from '@/lib/security/api-helpers';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const item = await news.getById(parseInt(id));
    
    if (!item) {
      return createErrorResponse('News item not found', request, 404);
    }
    
    // Parse tags from JSON string if needed
    if (item.tags && typeof item.tags === 'string') {
      try {
        item.tags = JSON.parse(item.tags);
      } catch {
        item.tags = [];
      }
    }
    
    return createSecureResponse({ success: true, data: item }, request);
  } catch (error: any) {
    console.error('❌ News API Error:', process.env.NODE_ENV === 'development' ? error : 'Error fetching news item');
    return createErrorResponse(error, request, 500);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // SECURITY: Require authentication for updating news
    const user = await getCurrentUser();
    if (!user) {
      return createErrorResponse('Authentication required', request, 401);
    }
    
    // SECURITY: Only admins, editors, and authors can update news
    if (!['admin', 'editor', 'author'].includes(user.role)) {
      return createErrorResponse('Insufficient permissions', request, 403);
    }
    
    const { id } = await params;
    const body = await request.json();
    const validated = NewsSchema.partial().parse(body);
    
    // SECURITY: Sanitize HTML content before storing
    const sanitized: any = {};
    if (validated.title) sanitized.title = sanitizeTitle(validated.title);
    if (validated.excerpt) sanitized.excerpt = sanitizeArticleContent(validated.excerpt);
    if (validated.content) sanitized.content = sanitizeArticleContent(validated.content);
    if (validated.slug) sanitized.slug = sanitizeTitle(validated.slug);
    if (validated.featured_image !== undefined) sanitized.featured_image = validated.featured_image;
    if (validated.published !== undefined) sanitized.published = validated.published;
    if (validated.publish_date !== undefined) sanitized.publish_date = validated.publish_date;
    if (validated.author !== undefined) sanitized.author = validated.author;
    if (validated.category !== undefined) sanitized.category = validated.category;
    if (validated.tags !== undefined) sanitized.tags = validated.tags;
    
    // SECURITY: Verify ownership to prevent IDOR attacks
    const allNews = await news.getAll(false);
    const existingNews = allNews.find((n: any) => n.id === parseInt(id));
    
    if (!existingNews) {
      return createErrorResponse('News item not found', request, 404);
    }
    
    try {
      verifyOwnership(user, existingNews);
    } catch (ownershipError: any) {
      return createErrorResponse(ownershipError.message || 'Permission denied', request, 403);
    }
    
    const result = await news.update(parseInt(id), sanitized);
    const updatedItem = (result as any).row || { id: parseInt(id), ...sanitized };
    
    return createSecureResponse({ success: true, data: updatedItem }, request);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.issues.map(err => 
        `${err.path.join('.')}: ${err.message}`
      ).join(', ');
      return createErrorResponse(`Validation failed: ${errorMessages}`, request, 400);
    }
    
    return createErrorResponse(error, request, 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // SECURITY: Require authentication for deleting news
    const user = await getCurrentUser();
    if (!user) {
      return createErrorResponse('Authentication required', request, 401);
    }
    
    // SECURITY: Verify delete permission
    try {
      verifyDeletePermission(user);
    } catch (permissionError: any) {
      return createErrorResponse(permissionError.message || 'Permission denied', request, 403);
    }
    
    const { id } = await params;
    const newsId = parseInt(id);
    
    // SECURITY: Verify ownership to prevent IDOR attacks
    const allNews = await news.getAll(false);
    const existingNews = allNews.find((n: any) => n.id === newsId);
    
    if (!existingNews) {
      return createErrorResponse('News item not found', request, 404);
    }
    
    try {
      verifyOwnership(user, existingNews);
    } catch (ownershipError: any) {
      return createErrorResponse(ownershipError.message || 'Permission denied', request, 403);
    }
    
    await news.delete(newsId);
    
    return createSecureResponse({ success: true, message: 'News item deleted successfully' }, request);
  } catch (error: any) {
    console.error('❌ News API Error:', process.env.NODE_ENV === 'development' ? error : 'Error deleting news item');
    return createErrorResponse(error, request, 500);
  }
}

export async function OPTIONS(request: NextRequest) {
  return handleOptions(request);
}







