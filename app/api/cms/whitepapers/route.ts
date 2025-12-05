import { NextRequest, NextResponse } from 'next/server';

// Route segment config - ensure this route is dynamic
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
import { whitepapers } from '@/lib/cms/api';
import { WhitepaperSchema } from '@/lib/cms/types';
import { z } from 'zod';
import { sanitizeArticleContent, sanitizeTitle, sanitizeTrackingScript } from '@/lib/utils/sanitize';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const published = searchParams.get('published') === 'true';
    
    const items = await whitepapers.getAll(published);
    
    return NextResponse.json(
      { success: true, data: items },
      {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );
  } catch (error: any) {
    console.error('❌ Whitepapers API Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error?.message || 'Failed to fetch whitepapers',
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
          'Access-Control-Allow-Origin': '*' 
        } 
      }
    );
  }
}

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
    const validated = WhitepaperSchema.parse(body);
    
    // SECURITY: Sanitize HTML content before storing
    const sanitized = {
      ...validated,
      title: sanitizeTitle(validated.title),
      excerpt: sanitizeArticleContent(validated.excerpt),
      description: sanitizeArticleContent(validated.description),
      content: sanitizeArticleContent(validated.content),
      meta_title: sanitizeTitle(validated.meta_title),
      meta_description: sanitizeArticleContent(validated.meta_description),
      og_title: sanitizeTitle(validated.og_title),
      og_description: sanitizeArticleContent(validated.og_description),
      // Note: custom_tracking_script should ideally be disabled, but if it exists, sanitize it
      custom_tracking_script: validated.custom_tracking_script 
        ? sanitizeTrackingScript(validated.custom_tracking_script) 
        : undefined,
    };
    
    if (!sanitized.slug && sanitized.title) {
      sanitized.slug = sanitizeTitle(sanitized.title)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
    }
    
    const result = await whitepapers.create(sanitized);
    const newId = (result as any).row?.id || (result as any).lastInsertRowid;
    const createdItem = (result as any).row || { id: newId, ...validated };
    
    return NextResponse.json(
      { success: true, data: createdItem },
      { headers: { 'Access-Control-Allow-Origin': '*' } }
    );
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.issues.map(err => 
        `${err.path.join('.')}: ${err.message}`
      ).join(', ');
      return NextResponse.json(
        { success: false, error: `Validation failed: ${errorMessages}` },
        { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } }
      );
    }
    
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to create whitepaper' },
      { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } }
    );
  }
}

