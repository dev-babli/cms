import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requireRole } from "@/lib/auth/server";
import { pages } from "@/lib/cms/api";
import { applyCorsHeaders } from "@/lib/security/cors";
import { revalidateTag } from "next/cache";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    await requireRole(['admin', 'editor']); // Only admin/editor can change visibility
    
    const { id } = await params;
    const body = await request.json();
    
    if (typeof body.is_visible !== 'boolean') {
      return NextResponse.json(
        { success: false, error: 'is_visible must be a boolean' },
        { status: 400 }
      );
    }
    
    // Note: user.id is a string UUID from Supabase Auth, not a number
    // The visibility_changed_by field expects a number from users table, so we pass undefined for now
    const updated = await pages.updateVisibility(parseInt(id), body.is_visible, undefined);
    
    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'Page not found or cannot be modified' },
        { status: 404 }
      );
    }
    
    // Revalidate cache
    revalidateTag('pages');
    
    const response = NextResponse.json({ success: true, data: updated });
    applyCorsHeaders(response, request);
    return response;
  } catch (error: any) {
    console.error('Error updating page visibility:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update page visibility' },
      { status: error.statusCode || 500 }
    );
  }
}

export async function OPTIONS(request: NextRequest) {
  const response = new NextResponse(null, { status: 200 });
  applyCorsHeaders(response, request);
  return response;
}

