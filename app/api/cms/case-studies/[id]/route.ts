import { NextRequest, NextResponse } from 'next/server';
import { caseStudies } from '@/lib/cms/api';
import { CaseStudySchema } from '@/lib/cms/types';
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
  try {
    const { id } = await params;
    const item = await caseStudies.getBySlug(id);
    if (!item) {
      return createErrorResponse('Case study not found', request, 404);
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
  try {
    // SECURITY: Require authentication for updating case studies
    const user = await getCurrentUser();
    if (!user) {
      return createErrorResponse('Authentication required', request, 401);
    }
    
    // SECURITY: Only admins, editors, and authors can update case studies
    if (!['admin', 'editor', 'author'].includes(user.role)) {
      return createErrorResponse('Insufficient permissions', request, 403);
    }
    
    const { id } = await params;
    const body = await request.json();
    const validated = CaseStudySchema.partial().parse(body);
    
    // SECURITY: Sanitize HTML content before updating
    const sanitized: any = {};
    if (validated.title !== undefined) sanitized.title = sanitizeTitle(validated.title);
    if (validated.excerpt !== undefined) sanitized.excerpt = sanitizeArticleContent(validated.excerpt);
    if (validated.description !== undefined) sanitized.description = sanitizeArticleContent(validated.description);
    if (validated.content !== undefined) sanitized.content = sanitizeArticleContent(validated.content);
    if (validated.challenge !== undefined) sanitized.challenge = sanitizeArticleContent(validated.challenge);
    if (validated.solution !== undefined) sanitized.solution = sanitizeArticleContent(validated.solution);
    if (validated.results !== undefined) sanitized.results = sanitizeArticleContent(validated.results);
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
      if (!['title', 'excerpt', 'description', 'content', 'challenge', 'solution', 'results', 'meta_title', 'meta_description', 'og_title', 'og_description', 'custom_tracking_script'].includes(key)) {
        sanitized[key] = (validated as any)[key];
      }
    });
    
    // SECURITY: Verify ownership to prevent IDOR attacks
    const allCaseStudies = await caseStudies.getAll(false);
    const existingCaseStudy = allCaseStudies.find((cs: any) => cs.id === parseInt(id));
    
    if (!existingCaseStudy) {
      return createErrorResponse('Case study not found', request, 404);
    }
    
    try {
      verifyOwnership(user, existingCaseStudy);
    } catch (ownershipError: any) {
      return createErrorResponse(ownershipError.message || 'Permission denied', request, 403);
    }
    
    const result = await caseStudies.update(parseInt(id), sanitized);
    
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
    // SECURITY: Require authentication for deleting case studies
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
    const caseStudyId = parseInt(id);
    
    // SECURITY: Verify ownership to prevent IDOR attacks
    const allCaseStudies = await caseStudies.getAll(false);
    const existingCaseStudy = allCaseStudies.find((cs: any) => cs.id === caseStudyId);
    
    if (!existingCaseStudy) {
      return createErrorResponse('Case study not found', request, 404);
    }
    
    try {
      verifyOwnership(user, existingCaseStudy);
    } catch (ownershipError: any) {
      return createErrorResponse(ownershipError.message || 'Permission denied', request, 403);
    }
    
    await caseStudies.delete(caseStudyId);
    return createSecureResponse({ success: true }, request);
  } catch (error: any) {
    return createErrorResponse(error, request, 500);
  }
}

export async function OPTIONS(request: NextRequest) {
  return handleOptions(request);
}


