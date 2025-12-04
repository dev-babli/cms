import { NextRequest, NextResponse } from 'next/server';
import { blogPosts } from '@/lib/cms/api';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const post = await blogPosts.getBySlug(slug);
    
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
    console.error('Error fetching blog post by slug:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch post' },
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
}


