import { NextRequest, NextResponse } from 'next/server';
import { blogPosts } from '@/lib/cms/api';
import { BlogPostSchema } from '@/lib/cms/types';
import { z } from 'zod';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const published = searchParams.get('published') === 'true';
    
    const posts = blogPosts.getAll(published);
    return NextResponse.json({ success: true, data: posts });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch blog posts' }, { status: 500 });
  }
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
    
    const result = blogPosts.create(validated);
    console.log('Blog post created successfully:', result);
    
    // Trigger real-time updates
    if (typeof global !== 'undefined' && global.io) {
      global.io.emit('blog:created', {
        id: result.lastInsertRowid,
        ...validated,
      });
    }
    
    return NextResponse.json({ 
      success: true, 
      data: {
        id: result.lastInsertRowid,
        ...validated,
      }
    });
  } catch (error) {
    console.error('Blog post creation error:', error);
    
    // Better error handling for Zod validation
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map(err => 
        `${err.path.join('.')}: ${err.message}`
      ).join(', ');
      return NextResponse.json({ 
        success: false, 
        error: `Validation failed: ${errorMessages}` 
      }, { status: 400 });
    }
    
    const errorMessage = error instanceof Error ? error.message : 'Failed to create blog post';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}


