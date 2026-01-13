import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requireRole } from "@/lib/auth/server";
import { heroSlides } from "@/lib/cms/api";
import { applyCorsHeaders } from "@/lib/security/cors";
import { revalidateTag } from "next/cache";

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    await requireRole(['admin', 'editor', 'author']);
    
    const slides = await heroSlides.getAll(false); // Get all including inactive
    
    const response = NextResponse.json({ success: true, data: slides });
    applyCorsHeaders(response, request);
    return response;
  } catch (error: any) {
    console.error('Error fetching hero slides (admin):', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch hero slides' },
      { status: error.statusCode || 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    await requireRole(['admin', 'editor']); // Only admin/editor can create
    
    const body = await request.json();
    
    // Validation
    if (!body.title || !body.background_image) {
      return NextResponse.json(
        { success: false, error: 'Title and background_image are required' },
        { status: 400 }
      );
    }
    
    // Sanitize inputs
    const slide = {
      title: body.title.substring(0, 200),
      subtitle: body.subtitle?.substring(0, 500) || null,
      cta_text: body.cta_text?.substring(0, 100) || null,
      cta_link: body.cta_link || null,
      background_image: body.background_image,
      accent_color: body.accent_color || '#667eea',
      has_light_background: body.has_light_background || false,
      display_order: body.display_order || 0,
      is_active: body.is_active !== undefined ? body.is_active : true
    };
    
    // Validate CTA link (prevent javascript: protocol)
    if (slide.cta_link && slide.cta_link.startsWith('javascript:')) {
      return NextResponse.json(
        { success: false, error: 'Invalid CTA link' },
        { status: 400 }
      );
    }
    
    // Note: user.id is a string UUID from Supabase Auth, not a number
    // The created_by field expects a number from users table, so we pass undefined for now
    const newSlide = await heroSlides.create(slide, undefined);
    
    // Revalidate cache
    revalidateTag('hero-slides');
    
    const response = NextResponse.json({ success: true, data: newSlide });
    applyCorsHeaders(response, request);
    return response;
  } catch (error: any) {
    console.error('Error creating hero slide:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create hero slide' },
      { status: error.statusCode || 500 }
    );
  }
}

export async function OPTIONS(request: NextRequest) {
  const response = new NextResponse(null, { status: 200 });
  applyCorsHeaders(response, request);
  return response;
}

