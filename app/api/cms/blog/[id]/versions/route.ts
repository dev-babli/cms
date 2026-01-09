import { NextRequest, NextResponse } from 'next/server';
import { versioning } from '@/lib/cms/versioning';
import { getCurrentUser } from '@/lib/auth/server';
import { applyCorsHeaders } from '@/lib/security/cors';
import { createSecureResponse, createErrorResponse } from '@/lib/security/api-helpers';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // SECURITY: Require authentication for viewing versions
    const user = await getCurrentUser();
    if (!user) {
      return createErrorResponse('Authentication required', request, 401);
    }
    
    const { id: paramId } = await params;
    const id = parseInt(paramId);
    const versions = await versioning.getVersions('blog_post', id);
    
    return createSecureResponse({ success: true, data: versions }, request);
  } catch (error: any) {
    return createErrorResponse(error, request, 500);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // SECURITY: Require authentication for saving versions
    const user = await getCurrentUser();
    if (!user) {
      return createErrorResponse('Authentication required', request, 401);
    }
    
    const { id: paramId } = await params;
    const id = parseInt(paramId);
    const body = await request.json();
    
    const result = await versioning.saveVersion(
      'blog_post',
      id,
      body.content,
      body.changedBy || user.id,
      body.description
    );
    
    return createSecureResponse({ success: true, data: result }, request);
  } catch (error: any) {
    return createErrorResponse(error, request, 500);
  }
}



