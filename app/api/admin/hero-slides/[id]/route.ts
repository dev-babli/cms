import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requireRole } from "@/lib/auth/server";
import { heroSlides } from "@/lib/cms/api";
import { applyCorsHeaders } from "@/lib/security/cors";
import { revalidateTag } from "next/cache";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    await requireRole(['admin', 'editor']);
    
    const { id } = await params;
    const body = await request.json();
    
    // Validation and sanitization (same as POST)
    if (body.title) body.title = body.title.substring(0, 200);
    if (body.subtitle) body.subtitle = body.subtitle.substring(0, 500);
    if (body.cta_text) body.cta_text = body.cta_text.substring(0, 100);
    
    // Validate CTA link
    if (body.cta_link && body.cta_link.startsWith('javascript:')) {
      return NextResponse.json(
        { success: false, error: 'Invalid CTA link' },
        { status: 400 }
      );
    }
    
    // Note: user.id is a string UUID from Supabase Auth, not a number
    // The updated_by field expects a number from users table, so we pass undefined for now
    const updated = await heroSlides.update(parseInt(id), body, undefined);
    
    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'Slide not found' },
        { status: 404 }
      );
    }
    
    // Revalidate cache
    revalidateTag('hero-slides');
    
    const response = NextResponse.json({ success: true, data: updated });
    applyCorsHeaders(response, request);
    return response;
  } catch (error: any) {
    console.error('Error updating hero slide:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update hero slide' },
      { status: error.statusCode || 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    await requireRole('admin'); // Only admin can delete
    
    const { id } = await params;
    await heroSlides.delete(parseInt(id));
    
    // Revalidate cache
    revalidateTag('hero-slides');
    
    const response = NextResponse.json({ success: true });
    applyCorsHeaders(response, request);
    return response;
  } catch (error: any) {
    console.error('Error deleting hero slide:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete hero slide' },
      { status: error.statusCode || 500 }
    );
  }
}

export async function OPTIONS(request: NextRequest) {
  const response = new NextResponse(null, { status: 200 });
  applyCorsHeaders(response, request);
  return response;
}

