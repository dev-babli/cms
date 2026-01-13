import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requireRole } from "@/lib/auth/server";
import { heroSlidesConfig } from "@/lib/cms/api";
import { applyCorsHeaders } from "@/lib/security/cors";
import { revalidateTag } from "next/cache";

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    await requireRole(['admin', 'editor', 'author']);
    
    const config = await heroSlidesConfig.get();
    
    const response = NextResponse.json({ success: true, data: config });
    applyCorsHeaders(response, request);
    return response;
  } catch (error: any) {
    console.error('Error fetching hero slides config:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch config' },
      { status: error.statusCode || 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await requireAuth();
    await requireRole('admin'); // Only admin can change config
    
    const body = await request.json();
    
    // Validation
    if (body.max_slides_displayed && (body.max_slides_displayed < 1 || body.max_slides_displayed > 20)) {
      return NextResponse.json(
        { success: false, error: 'max_slides_displayed must be between 1 and 20' },
        { status: 400 }
      );
    }
    
    if (body.auto_advance_interval && (body.auto_advance_interval < 1000 || body.auto_advance_interval > 60000)) {
      return NextResponse.json(
        { success: false, error: 'auto_advance_interval must be between 1000 and 60000 milliseconds' },
        { status: 400 }
      );
    }
    
    // Note: user.id is a string UUID from Supabase Auth, not a number
    // The updated_by field expects a number from users table, so we pass undefined for now
    const updated = await heroSlidesConfig.update(body, undefined);
    
    // Revalidate cache
    revalidateTag('hero-slides');
    
    const response = NextResponse.json({ success: true, data: updated });
    applyCorsHeaders(response, request);
    return response;
  } catch (error: any) {
    console.error('Error updating hero slides config:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update config' },
      { status: error.statusCode || 500 }
    );
  }
}

export async function OPTIONS(request: NextRequest) {
  const response = new NextResponse(null, { status: 200 });
  applyCorsHeaders(response, request);
  return response;
}

