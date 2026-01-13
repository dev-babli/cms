import { NextRequest, NextResponse } from "next/server";
import { pages } from "@/lib/cms/api";
import { applyCorsHeaders } from "@/lib/security/cors";
import { CACHE_CONFIG, getCacheHeaders } from "@/lib/cache/cache-config";
import { unstable_cache } from "next/cache";

// Cache the data fetching function
const getCachedPages = unstable_cache(
  async (published: boolean, visibleOnly: boolean) => {
    return await pages.getAll(published, visibleOnly);
  },
  ['pages'],
  {
    revalidate: CACHE_CONFIG.PAGES.maxAge,
    tags: CACHE_CONFIG.PAGES.tags,
  }
);

export const dynamic = 'force-dynamic';
export const revalidate = 300; // 5 minutes

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const published = searchParams.get('published') === 'true';
    const visibleOnly = searchParams.get('visible') === 'true';
    
    // Use cached data
    const pagesData = await getCachedPages(published, visibleOnly);
    
    const response = NextResponse.json({
      success: true,
      data: pagesData
    }, {
      headers: getCacheHeaders(CACHE_CONFIG.PAGES),
    });
    
    applyCorsHeaders(response, request);
    return response;
  } catch (error: any) {
    console.error('Error fetching pages:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch pages' },
      { status: 500 }
    );
  }
}

export async function OPTIONS(request: NextRequest) {
  const response = new NextResponse(null, { status: 200 });
  applyCorsHeaders(response, request);
  return response;
}

