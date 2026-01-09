import { NextRequest, NextResponse } from 'next/server';
import { caseStudies } from '@/lib/cms/api';
import { CaseStudySchema } from '@/lib/cms/types';
import { z } from 'zod';
import { sanitizeArticleContent, sanitizeTitle, sanitizeTrackingScript } from '@/lib/utils/sanitize';
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
    
    console.log(`📊 [Case Studies API] Fetching case studies (published=${published})`);
    
    const items = await caseStudies.getAll(published);
    
    // Normalize published field in response and filter by publish_date
    const now = new Date();
    const normalizedItems = Array.isArray(items) ? items
      .map(item => ({
        ...item,
        published: item.published === true || item.published === 'true' || item.published === 1 || item.published === '1',
      }))
      .filter(item => {
        // If published is true, also check publish_date
        if (item.published && item.publish_date) {
          const publishDate = new Date(item.publish_date);
          return publishDate <= now;
        }
        return item.published;
      }) : [];
    
    console.log(`✅ [Case Studies API] Found ${normalizedItems.length} published items (from ${items?.length || 0} total)`);
    
    const response = NextResponse.json(
      { success: true, data: normalizedItems },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );
    return applyCorsHeaders(response, request);
  } catch (error: any) {
    console.error('❌ [Case Studies API] Error:', process.env.NODE_ENV === 'development' ? error : 'Error fetching case studies');
    return createErrorResponse(error, request, 500);
  }
}

export async function OPTIONS(request: NextRequest) {
  return handleOptions(request);
}

export async function POST(request: NextRequest) {
  try {
    // SECURITY: Require authentication for creating case studies
    const user = await getCurrentUser();
    if (!user) {
      return createErrorResponse('Authentication required', request, 401);
    }
    
    // SECURITY: Only admins, editors, and authors can create case studies
    if (!['admin', 'editor', 'author'].includes(user.role)) {
      return createErrorResponse('Insufficient permissions', request, 403);
    }
    
    const body = await request.json();
    const validated = CaseStudySchema.parse(body);
    
    // SECURITY: Sanitize HTML content before storing
    const sanitized = {
      ...validated,
      title: sanitizeTitle(validated.title),
      excerpt: sanitizeArticleContent(validated.excerpt),
      description: sanitizeArticleContent(validated.description),
      content: sanitizeArticleContent(validated.content),
      challenge: sanitizeArticleContent(validated.challenge),
      solution: sanitizeArticleContent(validated.solution),
      results: sanitizeArticleContent(validated.results),
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
    
    const result = await caseStudies.create(sanitized);
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

