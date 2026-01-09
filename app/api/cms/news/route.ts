import { NextRequest, NextResponse } from 'next/server';
import { news } from '@/lib/cms/api';
import { NewsSchema } from '@/lib/cms/types';
import { z } from 'zod';
import { sanitizeArticleContent, sanitizeTitle } from '@/lib/utils/sanitize';
import { getCurrentUser } from '@/lib/auth/server';
import { applyCorsHeaders, handleCorsPreflight } from '@/lib/security/cors';
import { createSecureResponse, createErrorResponse, handleOptions } from '@/lib/security/api-helpers';

// Route segment config - ensure this route is dynamic
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const published = searchParams.get('published') === 'true';
    
    const items = await news.getAll(published);
    
    // Parse tags from JSON string if needed
    const parsedItems = items.map((item: any) => {
      if (item.tags && typeof item.tags === 'string') {
        try {
          item.tags = JSON.parse(item.tags);
        } catch {
          item.tags = [];
        }
      }
      return item;
    });
    
    const response = NextResponse.json(
      { success: true, data: parsedItems },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );
    return applyCorsHeaders(response, request);
  } catch (error: any) {
    console.error('❌ News API Error:', process.env.NODE_ENV === 'development' ? error : 'Error fetching news');
    return createErrorResponse(error, request, 500);
  }
}

export async function OPTIONS(request: NextRequest) {
  return handleOptions(request);
}

export async function POST(request: NextRequest) {
  try {
    // SECURITY: Require authentication for creating news
    const user = await getCurrentUser();
    if (!user) {
      return createErrorResponse('Authentication required', request, 401);
    }
    
    // SECURITY: Only admins, editors, and authors can create news
    if (!['admin', 'editor', 'author'].includes(user.role)) {
      return createErrorResponse('Insufficient permissions', request, 403);
    }
    
    const body = await request.json();
    const validated = NewsSchema.parse(body);
    
    // SECURITY: Sanitize HTML content before storing
    const sanitized = {
      ...validated,
      title: sanitizeTitle(validated.title),
      excerpt: sanitizeArticleContent(validated.excerpt),
      content: sanitizeArticleContent(validated.content),
    };
    
    if (!sanitized.slug && sanitized.title) {
      sanitized.slug = sanitizeTitle(sanitized.title)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
    }
    
    // Set created_by to current user ID for ownership tracking
    sanitized.created_by = user.id;
    
    const result = await news.create(sanitized);
    const newId = (result as any).row?.id || (result as any).lastInsertRowid;
    const createdItem = (result as any).row || { id: newId, ...validated };
    
    return createSecureResponse({ success: true, data: createdItem }, request);
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







