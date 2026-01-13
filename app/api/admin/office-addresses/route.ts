import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requireRole } from "@/lib/auth/server";
import { officeAddresses } from "@/lib/cms/api";
import { applyCorsHeaders } from "@/lib/security/cors";
import { revalidateTag } from "next/cache";

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    await requireRole(['admin', 'editor']); // Only admin/editor can view
    
    const addresses = await officeAddresses.getAll(false);
    
    const response = NextResponse.json({ success: true, data: addresses });
    applyCorsHeaders(response, request);
    return response;
  } catch (error: any) {
    console.error('Error fetching office addresses (admin):', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch office addresses' },
      { status: error.statusCode || 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    await requireRole('admin'); // CRITICAL: Only admin can create addresses
    
    const body = await request.json();
    
    // Validation
    if (!body.name || !body.city || !body.country || !body.address_line1) {
      return NextResponse.json(
        { success: false, error: 'Name, city, country, and address_line1 are required' },
        { status: 400 }
      );
    }
    
    // Note: user.id is a string UUID from Supabase Auth, not a number
    // The created_by field expects a number from users table, so we pass undefined for now
    const newAddress = await officeAddresses.create(body, undefined);
    
    // Revalidate cache
    revalidateTag('office-addresses');
    
    const response = NextResponse.json({ success: true, data: newAddress });
    applyCorsHeaders(response, request);
    return response;
  } catch (error: any) {
    console.error('Error creating office address:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create office address' },
      { status: error.statusCode || 500 }
    );
  }
}

export async function OPTIONS(request: NextRequest) {
  const response = new NextResponse(null, { status: 200 });
  applyCorsHeaders(response, request);
  return response;
}

