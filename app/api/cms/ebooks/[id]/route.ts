import { NextRequest, NextResponse } from 'next/server';
import { ebooks } from '@/lib/cms/api';
import { EbookSchema } from '@/lib/cms/types';
import { z } from 'zod';
import { sanitizeArticleContent, sanitizeTitle, sanitizeTrackingScript } from '@/lib/utils/sanitize';
import { getCurrentUser } from '@/lib/auth/server';
import { verifyOwnership, verifyDeletePermission } from '@/lib/auth/ownership';
import { applyCorsHeaders, handleCorsPreflight } from '@/lib/security/cors';
import { createSecureResponse, createErrorResponse, handleOptions } from '@/lib/security/api-helpers';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const item = await ebooks.getBySlug(id);
    if (!item) {
      return createErrorResponse('eBook not found', request, 404);
    }
    return createSecureResponse({ success: true, data: item }, request);
  } catch (error: any) {
    return createErrorResponse(error, request, 500);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    // SECURITY: Require authentication for updating eBooks
    const user = await getCurrentUser();
    if (!user) {
      return createErrorResponse('Authentication required', request, 401);
    }
    
    // SECURITY: Only admins, editors, and authors can update eBooks
    if (!['admin', 'editor', 'author'].includes(user.role)) {
      return createErrorResponse('Insufficient permissions', request, 403);
    }
    
    const body = await request.json();
    const validated = EbookSchema.partial().parse(body);
    
    // SECURITY: Sanitize HTML content before updating
    const sanitized: any = {};
    if (validated.title !== undefined) sanitized.title = sanitizeTitle(validated.title);
    if (validated.excerpt !== undefined) sanitized.excerpt = sanitizeArticleContent(validated.excerpt);
    if (validated.description !== undefined) sanitized.description = sanitizeArticleContent(validated.description);
    if (validated.content !== undefined) sanitized.content = sanitizeArticleContent(validated.content);
    if (validated.meta_title !== undefined) sanitized.meta_title = sanitizeTitle(validated.meta_title);
    if (validated.meta_description !== undefined) sanitized.meta_description = sanitizeArticleContent(validated.meta_description);
    if (validated.og_title !== undefined) sanitized.og_title = sanitizeTitle(validated.og_title);
    if (validated.og_description !== undefined) sanitized.og_description = sanitizeArticleContent(validated.og_description);
    if (validated.custom_tracking_script !== undefined) {
      sanitized.custom_tracking_script = validated.custom_tracking_script 
        ? sanitizeTrackingScript(validated.custom_tracking_script) 
        : undefined;
    }
    // Copy other fields that don't need sanitization
    Object.keys(validated).forEach(key => {
      if (!['title', 'excerpt', 'description', 'content', 'meta_title', 'meta_description', 'og_title', 'og_description', 'custom_tracking_script'].includes(key)) {
        sanitized[key] = (validated as any)[key];
      }
    });
    
    // SECURITY: Verify ownership to prevent IDOR attacks
    const allEbooks = await ebooks.getAll(false);
    const existingEbook = allEbooks.find((ebook: any) => ebook.id === parseInt(id));
    
    if (!existingEbook) {
      return createErrorResponse('eBook not found', request, 404);
    }
    
    try {
      verifyOwnership(user, existingEbook);
    } catch (ownershipError: any) {
      return createErrorResponse(ownershipError.message || 'Permission denied', request, 403);
    }
    
    const result = await ebooks.update(parseInt(id), sanitized);
    
    return createSecureResponse({ success: true, data: (result as any).row || result }, request);
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
    // SECURITY: Require authentication for deleting eBooks
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
    const ebookId = parseInt(id);
    
    // SECURITY: Verify ownership to prevent IDOR attacks
    const allEbooks = await ebooks.getAll(false);
    const existingEbook = allEbooks.find((ebook: any) => ebook.id === ebookId);
    
    if (!existingEbook) {
      return createErrorResponse('eBook not found', request, 404);
    }
    
    try {
      verifyOwnership(user, existingEbook);
    } catch (ownershipError: any) {
      return createErrorResponse(ownershipError.message || 'Permission denied', request, 403);
    }
    
    await ebooks.delete(ebookId);
    return createSecureResponse({ success: true }, request);
  } catch (error: any) {
    return createErrorResponse(error, request, 500);
  }
}

export async function OPTIONS(request: NextRequest) {
  return handleOptions(request);
}


