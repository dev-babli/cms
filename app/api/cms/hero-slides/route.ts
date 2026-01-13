import { NextRequest, NextResponse } from "next/server";
import { heroSlides, heroSlidesConfig } from "@/lib/cms/api";
import { applyCorsHeaders } from "@/lib/security/cors";
import { CACHE_CONFIG, getCacheHeaders } from "@/lib/cache/cache-config";
import { unstable_cache } from "next/cache";

// Cache the data fetching function
const getCachedHeroSlides = unstable_cache(
  async (activeOnly: boolean) => {
    const slides = await heroSlides.getAll(activeOnly);
    const config = await heroSlidesConfig.get();
    return { slides, config };
  },
  ['hero-slides'],
  {
    revalidate: CACHE_CONFIG.HERO_SLIDES.maxAge,
    tags: CACHE_CONFIG.HERO_SLIDES.tags,
  }
);

export const dynamic = 'force-dynamic';
export const revalidate = 300; // 5 minutes

export async function GET(request: NextRequest) {
  // FEATURE HIDDEN - Temporarily disabled
  return NextResponse.json(
    { success: false, error: 'Feature temporarily disabled' },
    { status: 503 }
  );
  
  /* DISABLED CODE - Uncomment to enable
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active') !== 'false';
    
    // Use cached data
    const { slides, config } = await getCachedHeroSlides(activeOnly);
    
    const response = NextResponse.json({
      success: true,
      data: {
        slides,
        config: {
          maxSlidesDisplayed: config.max_slides_displayed,
          autoAdvanceEnabled: config.auto_advance_enabled,
          autoAdvanceInterval: config.auto_advance_interval
        }
      }
    }, {
      headers: getCacheHeaders(CACHE_CONFIG.HERO_SLIDES),
    });
    
    applyCorsHeaders(response, request);
    return response;
  } catch (error: any) {
    console.error('Error fetching hero slides:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch hero slides' },
      { status: 500 }
    );
  }
  */ // END DISABLED CODE
}

export async function OPTIONS(request: NextRequest) {
  const response = new NextResponse(null, { status: 200 });
  applyCorsHeaders(response, request);
  return response;
}

