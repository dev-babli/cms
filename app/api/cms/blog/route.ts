import { NextRequest, NextResponse } from 'next/server';
import { blogPosts } from '@/lib/cms/api';
import { BlogPostSchema } from '@/lib/cms/types';
import { z } from 'zod';
import { sanitizeArticleContent, sanitizeTitle, sanitizeTrackingScript } from '@/lib/utils/sanitize';

// Route segment config - ensure this route is dynamic
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Ensure this route is always treated as an API route
export const revalidate = 0;

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const published = searchParams.get('published') === 'true';
    
    let posts;
    try {
      posts = await blogPosts.getAll(published);
    } catch (dbError: any) {
      console.error('❌ Database error in blogPosts.getAll:', dbError);
      // Return JSON error instead of crashing
      return NextResponse.json(
        { 
          success: false, 
          error: `Database error: ${dbError?.message || 'Failed to fetch blog posts'}`,
          details: process.env.NODE_ENV === 'development' ? {
            message: dbError?.message,
            code: dbError?.code,
            detail: dbError?.detail,
            hint: dbError?.hint
          } : undefined
        },
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );
    }
    
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
    // Always return JSON, never HTML
    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? {
          message: error?.message,
          code: error?.code,
          detail: error?.detail,
          hint: error?.hint
        } : undefined
      },
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
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
    // Parse request body with error handling
    let body;
    try {
      body = await request.json();
    } catch (parseError: any) {
      console.error('Failed to parse request body:', parseError);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid JSON in request body',
          details: process.env.NODE_ENV === 'development' ? parseError?.message : undefined
        },
        {
          status: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Content-Type': 'application/json',
          },
        }
      );
    }
    
    console.log('Creating blog post with data:', body);
    
    // Enhanced validation with better error handling
    let validated;
    try {
      validated = BlogPostSchema.parse(body);
      console.log('✅ Validation passed');
    } catch (validationError: any) {
      console.error('❌ Validation error:', validationError);
      if (validationError instanceof z.ZodError) {
        const errorMessages = validationError.issues.map(err => 
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
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
              'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            },
          }
        );
      }
      throw validationError;
    }
    
    // SECURITY: Sanitize HTML content before storing
    let sanitized: any;
    try {
      sanitized = {
        ...validated,
        title: sanitizeTitle(validated.title),
        excerpt: sanitizeArticleContent(validated.excerpt || ''),
        content: sanitizeArticleContent(validated.content || ''),
      };
      console.log('✅ Sanitization completed');
    } catch (sanitizeError: any) {
      console.error('❌ Sanitization error:', sanitizeError);
      return NextResponse.json(
        { 
          success: false, 
          error: `Sanitization failed: ${sanitizeError?.message || 'Unknown error'}`,
          details: process.env.NODE_ENV === 'development' ? sanitizeError?.message : undefined
        },
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },
        }
      );
    }
    
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
      console.log('📝 Attempting to create blog post in database...');
      console.log('📝 Sanitized data keys:', Object.keys(sanitized));
      const result = await blogPosts.create(sanitized);
      console.log('✅ Blog post created successfully:', result);
      
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
          status: 200,
          headers: {
            'Content-Type': 'application/json',
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
            'Content-Type': 'application/json',
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
            'Content-Type': 'application/json',
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
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      }
    );
  }
}


