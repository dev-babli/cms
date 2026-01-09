import { NextRequest, NextResponse } from 'next/server';
import { jobPostings } from '@/lib/cms/api';
import { JobPostingSchema } from '@/lib/cms/types';
import { getCurrentUser } from '@/lib/auth/server';
import { applyCorsHeaders, handleCorsPreflight } from '@/lib/security/cors';
import { createSecureResponse, createErrorResponse, handleOptions } from '@/lib/security/api-helpers';
import { z } from 'zod';

export async function OPTIONS(request: NextRequest) {
  return handleOptions(request);
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const jobId = parseInt(id);
    const allJobs = await jobPostings.getAll(false);
    const job = allJobs.find((item: any) => item.id === jobId);

    if (!job) {
      return createErrorResponse('Job posting not found', request, 404);
    }

    return createSecureResponse({ success: true, data: job }, request);
  } catch (error: any) {
    return createErrorResponse(error, request, 500);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // SECURITY: Require authentication for updating jobs
    const user = await getCurrentUser();
    if (!user) {
      return createErrorResponse('Authentication required', request, 401);
    }
    
    // SECURITY: Only admins, editors, and authors can update jobs
    if (!['admin', 'editor', 'author'].includes(user.role)) {
      return createErrorResponse('Insufficient permissions', request, 403);
    }
    
    const { id } = await params;
    const jobId = parseInt(id);
    const body = await request.json();
    const validated = JobPostingSchema.partial().parse(body);

    const result = await jobPostings.update(jobId, validated);
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // SECURITY: Require authentication for deleting jobs
    const user = await getCurrentUser();
    if (!user) {
      return createErrorResponse('Authentication required', request, 401);
    }
    
    // SECURITY: Only admins and editors can delete jobs
    if (!['admin', 'editor'].includes(user.role)) {
      return createErrorResponse('Insufficient permissions', request, 403);
    }
    
    const { id } = await params;
    const jobId = parseInt(id);
    const result = await jobPostings.delete(jobId);
    return createSecureResponse({ success: true, data: result }, request);
  } catch (error: any) {
    return createErrorResponse(error, request, 500);
  }
}

