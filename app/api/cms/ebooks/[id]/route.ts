import { NextRequest, NextResponse } from 'next/server';
import { ebooks } from '@/lib/cms/api';
import { EbookSchema } from '@/lib/cms/types';
import { z } from 'zod';
import { sanitizeArticleContent, sanitizeTitle, sanitizeTrackingScript } from '@/lib/utils/sanitize';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const item = await ebooks.getBySlug(id);
    if (!item) {
      return NextResponse.json(
        { success: false, error: 'eBook not found' },
        { status: 404, headers: { 'Access-Control-Allow-Origin': '*' } }
      );
    }
    return NextResponse.json(
      { success: true, data: item },
      { headers: { 'Access-Control-Allow-Origin': '*' } }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch eBook' },
      { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await request.json();
    const validated = EbookSchema.partial().parse(body);
    
    // SECURITY: Sanitize HTML content before updating
    const sanitized: any = {};
    if (validated.title !== undefined) sanitized.title = sanitizeTitle(validated.title);
    if (validated.excerpt !== undefined) sanitized.excerpt = sanitizeArticleContent(validated.excerpt);
    if (validated.description !== undefined) sanitized.description = sanitizeArticleContent(validated.description);
    if (validated.content !== undefined) sanitized.content = sanitizeArticleContent(validated.content);
    if (validated.meta_title !== undefined) sanitized.meta_title = sanitizeTitle(validated.meta_title);
    if (validated.meta_description !== undefined) sanitized.meta_description = sanitizeArticleContent(validated.meta_description);
    if (validated.og_title !== undefined) sanitized.og_title = sanitizeTitle(validated.og_title);
    if (validated.og_description !== undefined) sanitized.og_description = sanitizeArticleContent(validated.og_description);
    if (validated.custom_tracking_script !== undefined) {
      sanitized.custom_tracking_script = validated.custom_tracking_script 
        ? sanitizeTrackingScript(validated.custom_tracking_script) 
        : undefined;
    }
    // Copy other fields that don't need sanitization
    Object.keys(validated).forEach(key => {
      if (!['title', 'excerpt', 'description', 'content', 'meta_title', 'meta_description', 'og_title', 'og_description', 'custom_tracking_script'].includes(key)) {
        sanitized[key] = (validated as any)[key];
      }
    });
    
    const result = await ebooks.update(parseInt(id), sanitized);
    
    return NextResponse.json(
      { success: true, data: (result as any).row || result },
      { headers: { 'Access-Control-Allow-Origin': '*' } }
    );
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation failed' },
        { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } }
      );
    }
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to update eBook' },
      { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await ebooks.delete(parseInt(id));
    return NextResponse.json(
      { success: true },
      { headers: { 'Access-Control-Allow-Origin': '*' } }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to delete eBook' },
      { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } }
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

