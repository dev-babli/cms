import { NextRequest } from 'next/server';
import { news } from '@/lib/cms/api';
import { createSecureResponse, createErrorResponse, handleOptions } from '@/lib/security/api-helpers';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function OPTIONS(request: NextRequest) {
  return handleOptions(request);
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const item = await news.getBySlug(slug);

    if (!item) {
      return createErrorResponse('News item not found', request, 404);
    }

    // Parse tags if they were stored as JSON text in some environments
    if ((item as any).tags && typeof (item as any).tags === 'string') {
      try {
        (item as any).tags = JSON.parse((item as any).tags);
      } catch {
        // ignore
      }
    }

    return createSecureResponse({ success: true, data: item }, request);
  } catch (error: any) {
    console.error('Error fetching news by slug:', process.env.NODE_ENV === 'development' ? error : 'Error');
    return createErrorResponse(error, request, 500);
  }
}

