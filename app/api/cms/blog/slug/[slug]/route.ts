import { NextRequest, NextResponse } from 'next/server';
import { blogPosts } from '@/lib/cms/api';
import { applyCorsHeaders, handleCorsPreflight } from '@/lib/security/cors';
import { createSecureResponse, createErrorResponse, handleOptions } from '@/lib/security/api-helpers';

export async function OPTIONS(request: NextRequest) {
  return handleOptions(request);
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const post = await blogPosts.getBySlug(slug);
    
    if (!post) {
      return createErrorResponse('Post not found', request, 404);
    }
    
    return createSecureResponse({ success: true, data: post }, request);
  } catch (error: any) {
    console.error('Error fetching blog post by slug:', process.env.NODE_ENV === 'development' ? error : 'Error');
    return createErrorResponse(error, request, 500);
  }
}


