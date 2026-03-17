import { NextRequest, NextResponse } from 'next/server';
import { industryPages } from '@/lib/cms/api';
import { applyCorsHeaders, handleCorsPreflight } from '@/lib/security/cors';
import { IndustryPageSchema } from '@/lib/cms/types';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const revalidate = 0;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: paramId } = await params;
    const id = Number(paramId);
    if (!id || Number.isNaN(id)) {
      const res = NextResponse.json({ success: false, error: 'Invalid id' }, { status: 400 });
      return applyCorsHeaders(res, request);
    }
    const items = await industryPages.getAll(false);
    const found = items.find((i: any) => i.id === id) || null;
    const res = NextResponse.json({ success: true, data: found });
    return applyCorsHeaders(res, request);
  } catch (error: any) {
    console.error('❌ Industry Pages GET by id Error:', error);
    const res = NextResponse.json(
      { success: false, error: 'Failed to fetch industry page' },
      { status: 500 }
    );
    return applyCorsHeaders(res, request);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: paramId } = await params;
    const id = Number(paramId);
    if (!id || Number.isNaN(id)) {
      const res = NextResponse.json({ success: false, error: 'Invalid id' }, { status: 400 });
      return applyCorsHeaders(res, request);
    }
    const body = await request.json();
    const parsed = IndustryPageSchema.partial().parse(body);
    const updated = await industryPages.update(id, parsed as any);
    const res = NextResponse.json({ success: true, data: updated });
    return applyCorsHeaders(res, request);
  } catch (error: any) {
    console.error('❌ Industry Pages PUT Error:', error);
    const res = NextResponse.json(
      { success: false, error: 'Failed to update industry page' },
      { status: 400 }
    );
    return applyCorsHeaders(res, request);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: paramId } = await params;
    const id = Number(paramId);
    if (!id || Number.isNaN(id)) {
      const res = NextResponse.json({ success: false, error: 'Invalid id' }, { status: 400 });
      return applyCorsHeaders(res, request);
    }
    await industryPages.delete(id);
    const res = NextResponse.json({ success: true });
    return applyCorsHeaders(res, request);
  } catch (error: any) {
    console.error('❌ Industry Pages DELETE Error:', error);
    const res = NextResponse.json(
      { success: false, error: 'Failed to delete industry page' },
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

