import { NextRequest, NextResponse } from 'next/server';
import { teamMembers } from '@/lib/cms/api';
import { TeamMemberSchema } from '@/lib/cms/types';
import { getCurrentUser } from '@/lib/auth/server';
import { applyCorsHeaders, handleCorsPreflight } from '@/lib/security/cors';
import { createSecureResponse, createErrorResponse, handleOptions } from '@/lib/security/api-helpers';
import { z } from 'zod';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const published = searchParams.get('published') === 'true';
    
    const data = await teamMembers.getAll(published);
    return createSecureResponse({ success: true, data }, request);
  } catch (error: any) {
    return createErrorResponse(error, request, 500);
  }
}

// Handle CORS preflight
export async function OPTIONS(request: NextRequest) {
  return handleOptions(request);
}

export async function POST(request: NextRequest) {
  try {
    // SECURITY: Require authentication for creating team members
    const user = await getCurrentUser();
    if (!user) {
      return createErrorResponse('Authentication required', request, 401);
    }
    
    // SECURITY: Only admins and editors can create team members
    if (!['admin', 'editor'].includes(user.role)) {
      return createErrorResponse('Insufficient permissions', request, 403);
    }
    
    const body = await request.json();
    
    // Clean up empty strings - convert to undefined for optional fields
    const cleanedBody = {
      ...body,
      position: body.position?.trim() || undefined,
      qualification: body.qualification?.trim() || undefined,
      bio: body.bio?.trim() || undefined,
      email: body.email?.trim() || undefined,
      linkedin: body.linkedin?.trim() || undefined,
      twitter: body.twitter?.trim() || undefined,
      image: body.image?.trim() || undefined,
    };
    
    const validated = TeamMemberSchema.parse(cleanedBody);
    
    const result = await teamMembers.create(validated);
    return createSecureResponse({ success: true, data: result }, request);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      const validationErrors = error.issues.map((issue: any) => 
        `${issue.path.join('.')}: ${issue.message}`
      ).join(', ');
      return createErrorResponse(`Validation failed: ${validationErrors}`, request, 400);
    }
    
    return createErrorResponse(error, request, 500);
  }
}





