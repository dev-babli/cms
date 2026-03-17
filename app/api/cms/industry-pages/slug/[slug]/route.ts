import { NextRequest, NextResponse } from 'next/server';
import { industryPages } from '@/lib/cms/api';
import { applyCorsHeaders, handleCorsPreflight } from '@/lib/security/cors';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const revalidate = 0;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    if (!slug || typeof slug !== 'string') {
      const res = NextResponse.json(
        { success: false, error: 'Invalid slug' },
        { status: 400 }
      );
      return applyCorsHeaders(res, request);
    }

    const item = await industryPages.getBySlug(slug);
    // Only return published items to the public frontend
    if (!item || item.published !== true) {
      const res = NextResponse.json({ success: true, data: null });
      return applyCorsHeaders(res, request);
    }

    const res = NextResponse.json(
      { success: true, data: item },
      { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' } }
    );
    return applyCorsHeaders(res, request);
  } catch (error: any) {
    console.error('❌ Industry Pages slug API Error:', error);
    const res = NextResponse.json(
      { success: false, error: 'Failed to fetch industry page' },
      { status: 500 }
    );
    return applyCorsHeaders(res, request);
  }
}

export async function OPTIONS(request: NextRequest) {
  const preflightResponse = handleCorsPreflight(request);
  if (preflightResponse) return preflightResponse;
  return new NextResponse(null, { status: 403 });
}

