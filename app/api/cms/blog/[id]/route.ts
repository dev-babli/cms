import { NextRequest, NextResponse } from 'next/server';
import { blogPosts } from '@/lib/cms/api';
import { BlogPostSchema } from '@/lib/cms/types';

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
    const id = parseInt(paramId);
    const post = await blogPosts.getBySlug(paramId);
    
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
    
    const result = await blogPosts.update(id, validated);
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



