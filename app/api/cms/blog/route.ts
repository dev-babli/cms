import { NextRequest, NextResponse } from 'next/server';
import { blogPosts } from '@/lib/cms/api';
import { BlogPostSchema } from '@/lib/cms/types';
import { z } from 'zod';
import { sanitizeArticleContent, sanitizeTitle, sanitizeTrackingScript } from '@/lib/utils/sanitize';

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
    
    // SECURITY: Sanitize HTML content before storing
    const sanitized: any = {
      ...validated,
      title: sanitizeTitle(validated.title),
      excerpt: sanitizeArticleContent(validated.excerpt),
      content: sanitizeArticleContent(validated.content),
    };
    
    // Note: custom_tracking_script is not in BlogPostSchema, but if it exists in body, sanitize it
    if ((body as any).custom_tracking_script) {
      sanitized.custom_tracking_script = sanitizeTrackingScript((body as any).custom_tracking_script);
    }
    
    // Ensure slug is generated if missing
    if (!sanitized.slug && sanitized.title) {
      sanitized.slug = sanitizeTitle(sanitized.title)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
    }
    
    // Set publish_date if not provided
    if (!sanitized.publish_date) {
      sanitized.publish_date = new Date().toISOString();
    }
    
    try {
      const result = await blogPosts.create(sanitized);
      console.log('Blog post created successfully:', result);
      
      // Handle different database response formats
      let createdPost: any;
      if (result && typeof result === 'object') {
        // PostgreSQL/Supabase format
        if ((result as any).rows && (result as any).rows.length > 0) {
          createdPost = (result as any).rows[0];
        } else if ((result as any).row) {
          createdPost = (result as any).row;
        } else if ((result as any).id) {
          createdPost = { ...sanitized, id: (result as any).id };
        } else {
          // SQLite format
          const newId = (result as any).lastInsertRowid || (result as any).id;
          createdPost = { ...sanitized, id: newId };
        }
      } else {
        // Fallback
        createdPost = { ...sanitized, id: null };
      }
      
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
    } catch (dbError: any) {
      console.error('Database error during blog post creation:', dbError);
      // Ensure we always return JSON, even on database errors
      return NextResponse.json(
        { 
          success: false, 
          error: `Database error: ${dbError?.message || 'Failed to create blog post'}`,
          details: process.env.NODE_ENV === 'development' ? dbError?.message : undefined
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


