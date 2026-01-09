import { NextRequest, NextResponse } from 'next/server';
import { notifications } from '@/lib/cms/api';
import { getCurrentUser } from '@/lib/auth/server';
import { applyCorsHeaders, handleCorsPreflight } from '@/lib/security/cors';
import { createSecureResponse, createErrorResponse, handleOptions } from '@/lib/security/api-helpers';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // SECURITY: Require authentication
    const user = await getCurrentUser();
    if (!user) {
      return createErrorResponse('Authentication required', request, 401);
    }
    
    const { id } = await params;
    const body = await request.json();
    
    if (body.read !== undefined) {
      const result = await notifications.markAsRead(parseInt(id));
      return createSecureResponse({ success: true, data: (result as any).row }, request);
    }
    
    return createErrorResponse('Invalid update', request, 400);
  } catch (error: any) {
    console.error('❌ Notifications API Error:', process.env.NODE_ENV === 'development' ? error : 'Error');
    return createErrorResponse(error, request, 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // SECURITY: Require authentication
    const user = await getCurrentUser();
    if (!user) {
      return createErrorResponse('Authentication required', request, 401);
    }
    
    const { id } = await params;
    await notifications.delete(parseInt(id));
    
    return createSecureResponse({ success: true, message: 'Notification deleted successfully' }, request);
  } catch (error: any) {
    console.error('❌ Notifications API Error:', process.env.NODE_ENV === 'development' ? error : 'Error');
    return createErrorResponse(error, request, 500);
  }
}

export async function OPTIONS(request: NextRequest) {
  return handleOptions(request);
}







