import { NextRequest, NextResponse } from 'next/server';
import { blogPosts } from '@/lib/cms/api';
import { BlogPostSchema } from '@/lib/cms/types';
import { sanitizeArticleContent, sanitizeTitle, sanitizeTrackingScript } from '@/lib/utils/sanitize';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Handle CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  });
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
      return NextResponse.json(
        { success: false, error: 'Post not found' },
        {
          status: 404,
          headers: corsHeaders,
        }
      );
    }
    
    return NextResponse.json(
      { success: true, data: post },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error('Error fetching blog post:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch post' },
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: paramId } = await params;
    const id = parseInt(paramId);
    const body = await request.json();
    const validated = BlogPostSchema.partial().parse(body);
    
    // SECURITY: Sanitize HTML content before updating
    const sanitized: any = {};
    if (validated.title !== undefined) sanitized.title = sanitizeTitle(validated.title);
    if (validated.excerpt !== undefined) sanitized.excerpt = sanitizeArticleContent(validated.excerpt);
    if (validated.content !== undefined) sanitized.content = sanitizeArticleContent(validated.content);
    
    // Note: custom_tracking_script is not in BlogPostSchema, but if it exists in body, sanitize it
    if ((body as any).custom_tracking_script !== undefined) {
      sanitized.custom_tracking_script = (body as any).custom_tracking_script 
        ? sanitizeTrackingScript((body as any).custom_tracking_script) 
        : undefined;
    }
    
    // Copy other fields that don't need sanitization
    Object.keys(validated).forEach(key => {
      if (!['title', 'excerpt', 'content'].includes(key)) {
        sanitized[key] = (validated as any)[key];
      }
    });
    
    const result = await blogPosts.update(id, sanitized);
    return NextResponse.json(
      { success: true, data: result },
      { headers: corsHeaders }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to update post' },
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: paramId } = await params;
    const id = parseInt(paramId);
    const result = await blogPosts.delete(id);
    return NextResponse.json(
      { success: true, data: result },
      { headers: corsHeaders }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to delete post' },
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
}



