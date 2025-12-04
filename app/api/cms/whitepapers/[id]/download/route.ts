import { NextRequest, NextResponse } from 'next/server';
import { whitepapers } from '@/lib/cms/api';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await whitepapers.incrementDownload(parseInt(params.id));
    return NextResponse.json(
      { success: true },
      { headers: { 'Access-Control-Allow-Origin': '*' } }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to increment download count' },
      { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

