import { NextRequest, NextResponse } from 'next/server';
import { caseStudies } from '@/lib/cms/api';
import { applyCorsHeaders, handleCorsPreflight } from '@/lib/security/cors';
import { createSecureResponse, createErrorResponse, handleOptions } from '@/lib/security/api-helpers';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await caseStudies.incrementDownload(parseInt(id));
    return createSecureResponse({ success: true }, request);
  } catch (error: any) {
    return createErrorResponse(error, request, 500);
  }
}

export async function OPTIONS(request: NextRequest) {
  return handleOptions(request);
}





