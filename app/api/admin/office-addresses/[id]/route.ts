import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requireRole } from "@/lib/auth/server";
import { officeAddresses } from "@/lib/cms/api";
import { applyCorsHeaders } from "@/lib/security/cors";
import { revalidateTag } from "next/cache";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    await requireRole('admin'); // Only admin can update
    
    const { id } = await params;
    const body = await request.json();
    
    // Note: user.id is a string UUID from Supabase Auth, not a number
    // The updated_by field expects a number from users table, so we pass undefined for now
    const updated = await officeAddresses.update(parseInt(id), body, undefined);
    
    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'Address not found' },
        { status: 404 }
      );
    }
    
    // Revalidate cache
    revalidateTag('office-addresses');
    
    const response = NextResponse.json({ success: true, data: updated });
    applyCorsHeaders(response, request);
    return response;
  } catch (error: any) {
    console.error('Error updating office address:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update office address' },
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
    await officeAddresses.delete(parseInt(id));
    
    // Revalidate cache
    revalidateTag('office-addresses');
    
    const response = NextResponse.json({ success: true });
    applyCorsHeaders(response, request);
    return response;
  } catch (error: any) {
    console.error('Error deleting office address:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete office address' },
      { status: error.statusCode || 500 }
    );
  }
}

export async function OPTIONS(request: NextRequest) {
  const response = new NextResponse(null, { status: 200 });
  applyCorsHeaders(response, request);
  return response;
}

