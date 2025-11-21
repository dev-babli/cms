import { NextRequest, NextResponse } from 'next/server';
import { blogPosts } from '@/lib/cms/api';
import { BlogPostSchema } from '@/lib/cms/types';
import { z } from 'zod';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const published = searchParams.get('published') === 'true';
    
    const posts = await blogPosts.getAll(published);
    
    // Log for debugging
    console.log(`📝 Blog API: Returning ${posts.length} ${published ? 'published' : 'all'} posts`);
    if (posts.length > 0) {
      console.log('📝 Post slugs:', posts.map((p: any) => ({ slug: p.slug, title: p.title, published: p.published })));
    }
    
    // Enable CORS for React app
    return NextResponse.json(
      { success: true, data: posts },
      {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Cache-Control': 'no-store, no-cache, must-revalidate', // Prevent caching
        },
      }
    );
  } catch (error: any) {
    console.error('❌ Blog API Error:', error);
    const errorMessage = error?.message || 'Failed to fetch blog posts';
    console.error('Error details:', {
      message: errorMessage,
      code: error?.code,
      stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined,
    });
    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error?.message : undefined
      },
      {
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      }
    );
  }
}

// Handle CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Creating blog post with data:', body);
    
    // Enhanced validation with better error handling
    const validated = BlogPostSchema.parse(body);
    
    // Ensure slug is generated if missing
    if (!validated.slug && validated.title) {
      validated.slug = validated.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
    }
    
    // Set publish_date if not provided
    if (!validated.publish_date) {
      validated.publish_date = new Date().toISOString();
    }
    
    const result = await blogPosts.create(validated);
    console.log('Blog post created successfully:', result);
    
    // Get the ID from the result (PostgreSQL returns the inserted row with RETURNING *)
    const newId = (result as any).row?.id || (result as any).lastInsertRowid || (result as any).id || null;
    const createdPost = (result as any).row || { id: newId, ...validated };
    
    // Trigger real-time updates
    if (typeof global !== 'undefined' && (global as any).io) {
      (global as any).io.emit('blog:created', createdPost);
    }
    
    return NextResponse.json(
      { 
        success: true, 
        data: createdPost
      },
      {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      }
    );
  } catch (error: any) {
    console.error('Blog post creation error:', error);
    console.error('Error details:', {
      message: error?.message,
      code: error?.code,
      stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined,
    });
    
    // Better error handling for Zod validation
    if (error instanceof z.ZodError) {
      const errorMessages = error.issues.map(err => 
        `${err.path.join('.')}: ${err.message}`
      ).join(', ');
      return NextResponse.json(
        { 
          success: false, 
          error: `Validation failed: ${errorMessages}` 
        },
        {
          status: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },
        }
      );
    }
    
    const errorMessage = error instanceof Error ? error.message : 'Failed to create blog post';
    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error?.message : undefined
      },
      {
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      }
    );
  }
}


