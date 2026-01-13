import { NextRequest, NextResponse } from "next/server";
import { officeAddresses } from "@/lib/cms/api";
import { applyCorsHeaders } from "@/lib/security/cors";
import { CACHE_CONFIG, getCacheHeaders } from "@/lib/cache/cache-config";
import { unstable_cache } from "next/cache";

// Cache the data fetching function (addresses don't change often)
const getCachedOfficeAddresses = unstable_cache(
  async () => {
    return await officeAddresses.getAll(true); // Active only
  },
  ['office-addresses'],
  {
    revalidate: CACHE_CONFIG.OFFICE_ADDRESSES.maxAge,
    tags: CACHE_CONFIG.OFFICE_ADDRESSES.tags,
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
    // Use cached data
    const addresses = await getCachedOfficeAddresses();
    
    const response = NextResponse.json({ 
      success: true, 
      data: addresses 
    }, {
      headers: getCacheHeaders(CACHE_CONFIG.OFFICE_ADDRESSES),
    });
    
    applyCorsHeaders(response, request);
    return response;
  } catch (error: any) {
    console.error('Error fetching office addresses:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch office addresses' },
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

