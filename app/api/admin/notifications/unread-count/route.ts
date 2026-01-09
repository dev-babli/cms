import { NextRequest, NextResponse } from 'next/server';
import { notifications } from '@/lib/cms/api';
import { getCurrentUser } from '@/lib/auth/server';
import { applyCorsHeaders, handleCorsPreflight } from '@/lib/security/cors';
import { createSecureResponse, createErrorResponse, handleOptions } from '@/lib/security/api-helpers';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    // SECURITY: Require authentication
    const user = await getCurrentUser();
    if (!user) {
      return createErrorResponse('Authentication required', request, 401);
    }
    
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id') ? parseInt(searchParams.get('user_id')!) : undefined;
    
    const count = await notifications.getUnreadCount(userId);
    const unreadCount = typeof count === 'number' ? count : 0;
    
    const response = NextResponse.json(
      { success: true, count: unreadCount },
      { 
        headers: { 
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        } 
      }
    );
    return applyCorsHeaders(response, request);
  } catch (error: any) {
    console.error('❌ Notifications Unread Count API Error:', process.env.NODE_ENV === 'development' ? error : 'Error');
    const response = NextResponse.json(
      { 
        success: false, 
        error: process.env.NODE_ENV === 'development' 
          ? (error?.message || 'Failed to get unread count')
          : 'Failed to get unread count',
        count: 0,
      },
      { status: 500 }
    );
    return applyCorsHeaders(response, request);
  }
}

export async function OPTIONS(request: NextRequest) {
  return handleOptions(request);
}

