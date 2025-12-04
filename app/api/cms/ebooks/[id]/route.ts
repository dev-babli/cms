import { NextRequest, NextResponse } from 'next/server';
import { ebooks } from '@/lib/cms/api';
import { EbookSchema } from '@/lib/cms/types';
import { z } from 'zod';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const item = await ebooks.getBySlug(params.id);
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
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const validated = EbookSchema.partial().parse(body);
    const result = await ebooks.update(parseInt(params.id), validated);
    
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
  { params }: { params: { id: string } }
) {
  try {
    await ebooks.delete(parseInt(params.id));
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

