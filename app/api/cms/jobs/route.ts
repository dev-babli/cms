import { NextRequest, NextResponse } from 'next/server';
import { jobPostings } from '@/lib/cms/api';
import { JobPostingSchema } from '@/lib/cms/types';
import { getCurrentUser } from '@/lib/auth/server';
import { applyCorsHeaders, handleCorsPreflight } from '@/lib/security/cors';
import { createSecureResponse, createErrorResponse, handleOptions } from '@/lib/security/api-helpers';
import { z } from 'zod';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const published = searchParams.get('published') === 'true';

    const data = await jobPostings.getAll(published);
    return createSecureResponse({ success: true, data }, request);
  } catch (error: any) {
    return createErrorResponse(error, request, 500);
  }
}

export async function OPTIONS(request: NextRequest) {
  return handleOptions(request);
}

export async function POST(request: NextRequest) {
  try {
    // SECURITY: Require authentication for creating jobs
    const user = await getCurrentUser();
    if (!user) {
      return createErrorResponse('Authentication required', request, 401);
    }
    
    // SECURITY: Only admins, editors, and authors can create jobs
    if (!['admin', 'editor', 'author'].includes(user.role)) {
      return createErrorResponse('Insufficient permissions', request, 403);
    }
    
    const body = await request.json();
    const validated = JobPostingSchema.parse(body);

    const result = await jobPostings.create(validated);
    return createSecureResponse({ success: true, data: result }, request);
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

