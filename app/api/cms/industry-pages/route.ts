import { NextRequest, NextResponse } from 'next/server';
import { industryPages } from '@/lib/cms/api';
import { applyCorsHeaders, handleCorsPreflight } from '@/lib/security/cors';
import { IndustryPageSchema } from '@/lib/cms/types';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const published = searchParams.get('published') === 'true';
    const items = await industryPages.getAll(published);
    const res = NextResponse.json(
      { success: true, data: items },
      { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' } }
    );
    return applyCorsHeaders(res, request);
  } catch (error: any) {
    console.error('❌ Industry Pages API Error:', error);
    const res = NextResponse.json(
      { success: false, error: 'Failed to fetch industry pages' },
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = IndustryPageSchema.parse(body);
    const created = await industryPages.create(parsed as any);
    const res = NextResponse.json({ success: true, data: created }, { status: 201 });
    return applyCorsHeaders(res, request);
  } catch (error: any) {
    console.error('❌ Industry Pages POST Error:', error);
    const res = NextResponse.json(
      { success: false, error: 'Failed to create industry page' },
      { status: 400 }
    );
    return applyCorsHeaders(res, request);
  }
}

