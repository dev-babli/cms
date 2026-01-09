import { NextRequest, NextResponse } from 'next/server';
import { blogPosts } from '@/lib/cms/api';
import { BlogPostSchema } from '@/lib/cms/types';
import { sanitizeArticleContent, sanitizeTitle, sanitizeTrackingScript } from '@/lib/utils/sanitize';
import { getCurrentUser } from '@/lib/auth/server';
import { verifyOwnership, verifyDeletePermission } from '@/lib/auth/ownership';
import { applyCorsHeaders, handleCorsPreflight } from '@/lib/security/cors';
import { createSecureResponse, createErrorResponse, handleOptions } from '@/lib/security/api-helpers';
import { z } from 'zod';

// Handle CORS preflight
export async function OPTIONS(request: NextRequest) {
  return handleOptions(request);
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: paramId } = await params;
    
    // Try to parse as ID first, if it's a number
    const id = parseInt(paramId);
    let post;
    
    if (!isNaN(id) && id > 0) {
      // If it's a valid number, try to get by ID
      const allPosts = await blogPosts.getAll(false);
      post = allPosts.find((p: any) => p.id === id);
    }
    
    // If not found by ID or param is not a number, try by slug
    if (!post) {
      post = await blogPosts.getBySlug(paramId);
    }
    
    if (!post) {
      return createErrorResponse('Post not found', request, 404);
    }
    
    return createSecureResponse({ success: true, data: post }, request);
  } catch (error: any) {
    console.error('Error fetching blog post:', process.env.NODE_ENV === 'development' ? error : 'Error');
    return createErrorResponse(error, request, 500);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // SECURITY: Require authentication for updating blog posts
    const user = await getCurrentUser();
    if (!user) {
      return createErrorResponse('Authentication required', request, 401);
    }
    
    // SECURITY: Only admins, editors, and authors can update blog posts
    if (!['admin', 'editor', 'author'].includes(user.role)) {
      return createErrorResponse('Insufficient permissions', request, 403);
    }
    
    const { id: paramId } = await params;
    const id = parseInt(paramId);
    
    if (isNaN(id) || id <= 0) {
      return createErrorResponse('Invalid post ID', request, 400);
    }
    
    const body = await request.json();
    
    // Validate the request body
    let validated;
    try {
      validated = BlogPostSchema.partial().parse(body);
    } catch (validationError: any) {
      console.error('❌ [Update Blog] Validation error:', validationError);
      if (validationError instanceof z.ZodError) {
        const errorMessages = validationError.issues.map(err => 
          `${err.path.join('.')}: ${err.message}`
        ).join(', ');
        return createErrorResponse(`Validation failed: ${errorMessages}`, request, 400);
      }
      return createErrorResponse(`Validation failed: ${validationError.message || 'Invalid data'}`, request, 400);
    }
    
    // SECURITY: Sanitize HTML content before updating
    const sanitized: any = {};
    if (validated.title !== undefined) sanitized.title = sanitizeTitle(validated.title);
    if (validated.excerpt !== undefined) sanitized.excerpt = sanitizeArticleContent(validated.excerpt);
    if (validated.content !== undefined) sanitized.content = sanitizeArticleContent(validated.content);
    
    // Note: custom_tracking_script is not in BlogPostSchema, but if it exists in body, sanitize it
    if ((body as any).custom_tracking_script !== undefined) {
      sanitized.custom_tracking_script = (body as any).custom_tracking_script 
        ? sanitizeTrackingScript((body as any).custom_tracking_script) 
        : null;
    }
    
    // Copy other fields that don't need sanitization
    Object.keys(validated).forEach(key => {
      if (!['title', 'excerpt', 'content'].includes(key)) {
        sanitized[key] = (validated as any)[key];
      }
    });
    
    // Check if there are any fields to update
    if (Object.keys(sanitized).length === 0) {
      return createErrorResponse('No fields to update', request, 400);
    }
    
    // SECURITY: Verify ownership to prevent IDOR attacks
    const allPosts = await blogPosts.getAll(false);
    const existingPost = allPosts.find((p: any) => p.id === id);
    
    if (!existingPost) {
      return createErrorResponse('Post not found', request, 404);
    }
    
    try {
      verifyOwnership(user, existingPost);
    } catch (ownershipError: any) {
      return createErrorResponse(ownershipError.message || 'Permission denied', request, 403);
    }
    
    console.log('💾 [Update Blog] Updating post ID:', id);
    console.log('💾 [Update Blog] Fields to update:', Object.keys(sanitized));
    
    const result = await blogPosts.update(id, sanitized);
    
    if (!result || !result.row) {
      return createErrorResponse('Post not found or update failed', request, 404);
    }
    
    return createSecureResponse({ success: true, data: result.row }, request);
  } catch (error: any) {
    console.error('❌ [Update Blog] Error:', process.env.NODE_ENV === 'development' ? error : 'Error updating post');
    return createErrorResponse(error, request, 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // SECURITY: Require authentication for deleting blog posts
    const user = await getCurrentUser();
    if (!user) {
      return createErrorResponse('Authentication required', request, 401);
    }
    
    // SECURITY: Only admins and editors can delete blog posts
    if (!['admin', 'editor'].includes(user.role)) {
      return createErrorResponse('Insufficient permissions', request, 403);
    }
    
    const { id: paramId } = await params;
    const id = parseInt(paramId);
    
    if (isNaN(id) || id <= 0) {
      return createErrorResponse('Invalid post ID', request, 400);
    }
    
    // SECURITY: Verify delete permission
    try {
      verifyDeletePermission(user);
    } catch (permissionError: any) {
      return createErrorResponse(permissionError.message || 'Permission denied', request, 403);
    }
    
    // SECURITY: Verify ownership to prevent IDOR attacks
    const allPosts = await blogPosts.getAll(false);
    const existingPost = allPosts.find((p: any) => p.id === id);
    
    if (!existingPost) {
      return createErrorResponse('Post not found', request, 404);
    }
    
    try {
      verifyOwnership(user, existingPost);
    } catch (ownershipError: any) {
      return createErrorResponse(ownershipError.message || 'Permission denied', request, 403);
    }
    
    const result = await blogPosts.delete(id);
    return createSecureResponse({ success: true, data: result }, request);
  } catch (error: any) {
    return createErrorResponse(error, request, 500);
  }
}



