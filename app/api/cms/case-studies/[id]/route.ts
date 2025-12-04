import { NextRequest, NextResponse } from 'next/server';
import { caseStudies } from '@/lib/cms/api';
import { CaseStudySchema } from '@/lib/cms/types';
import { z } from 'zod';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const item = await caseStudies.getBySlug(params.id);
    if (!item) {
      return NextResponse.json(
        { success: false, error: 'Case study not found' },
        { status: 404, headers: { 'Access-Control-Allow-Origin': '*' } }
      );
    }
    return NextResponse.json(
      { success: true, data: item },
      { headers: { 'Access-Control-Allow-Origin': '*' } }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch case study' },
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
    const validated = CaseStudySchema.partial().parse(body);
    const result = await caseStudies.update(parseInt(params.id), validated);
    
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
      { success: false, error: error?.message || 'Failed to update case study' },
      { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await caseStudies.delete(parseInt(params.id));
    return NextResponse.json(
      { success: true },
      { headers: { 'Access-Control-Allow-Origin': '*' } }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to delete case study' },
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

