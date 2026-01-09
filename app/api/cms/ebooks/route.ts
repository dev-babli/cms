import { NextRequest, NextResponse } from 'next/server';
import { ebooks } from '@/lib/cms/api';
import { EbookSchema } from '@/lib/cms/types';
import { z } from 'zod';
import { sanitizeArticleContent, sanitizeTitle, sanitizeTrackingScript } from '@/lib/utils/sanitize';
import { getCurrentUser } from '@/lib/auth/server';
import { applyCorsHeaders, handleCorsPreflight } from '@/lib/security/cors';
import { createSecureResponse, createErrorResponse, handleOptions } from '@/lib/security/api-helpers';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const published = searchParams.get('published') === 'true';
    
    const items = await ebooks.getAll(published);
    
    const response = NextResponse.json(
      { success: true, data: items },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );
    return applyCorsHeaders(response, request);
  } catch (error: any) {
    console.error('❌ eBooks API Error:', process.env.NODE_ENV === 'development' ? error : 'Error fetching eBooks');
    return createErrorResponse(error, request, 500);
  }
}

export async function OPTIONS(request: NextRequest) {
  return handleOptions(request);
}

export async function POST(request: NextRequest) {
  try {
    // SECURITY: Require authentication for creating eBooks
    const user = await getCurrentUser();
    if (!user) {
      return createErrorResponse('Authentication required', request, 401);
    }
    
    // SECURITY: Only admins, editors, and authors can create eBooks
    if (!['admin', 'editor', 'author'].includes(user.role)) {
      return createErrorResponse('Insufficient permissions', request, 403);
    }
    
    const body = await request.json();
    const validated = EbookSchema.parse(body);
    
    // SECURITY: Sanitize HTML content before storing
    const sanitized = {
      ...validated,
      title: sanitizeTitle(validated.title),
      excerpt: sanitizeArticleContent(validated.excerpt),
      description: sanitizeArticleContent(validated.description),
      content: sanitizeArticleContent(validated.content),
      meta_title: sanitizeTitle(validated.meta_title),
      meta_description: sanitizeArticleContent(validated.meta_description),
      og_title: sanitizeTitle(validated.og_title),
      og_description: sanitizeArticleContent(validated.og_description),
      // Note: custom_tracking_script should ideally be disabled, but if it exists, sanitize it
      custom_tracking_script: validated.custom_tracking_script 
        ? sanitizeTrackingScript(validated.custom_tracking_script) 
        : undefined,
    };
    
    if (!sanitized.slug && sanitized.title) {
      sanitized.slug = sanitizeTitle(sanitized.title)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
    }
    
    // Set created_by to current user ID for ownership tracking
    sanitized.created_by = user.id;
    
    const result = await ebooks.create(sanitized);
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

