import { NextRequest, NextResponse } from 'next/server';
import { notifications } from '@/lib/cms/api';
import { getCurrentUser } from '@/lib/auth/server';
import { applyCorsHeaders, handleCorsPreflight } from '@/lib/security/cors';
import { createSecureResponse, createErrorResponse, handleOptions } from '@/lib/security/api-helpers';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    // SECURITY: Require authentication for viewing notifications
    const user = await getCurrentUser();
    if (!user) {
      return createErrorResponse('Authentication required', request, 401);
    }
    
    // SECURITY: Only admins, editors, and authors can view notifications
    if (!['admin', 'editor', 'author'].includes(user.role)) {
      return createErrorResponse('Insufficient permissions', request, 403);
    }
    
    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get('unread_only') === 'true';
    const userId = searchParams.get('user_id') ? parseInt(searchParams.get('user_id')!) : undefined;
    
    console.log(`📢 Notifications API: Fetching (unreadOnly=${unreadOnly}, userId=${userId})`);
    
    const items = await notifications.getAll(userId, unreadOnly);
    const notificationsList = Array.isArray(items) ? items : [];
    
    console.log(`✅ Notifications API: Found ${notificationsList.length} notifications`);
    
    const response = NextResponse.json(
      { success: true, data: notificationsList },
      { 
        headers: { 
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        } 
      }
    );
    return applyCorsHeaders(response, request);
  } catch (error: any) {
    console.error('❌ Notifications API Error:', process.env.NODE_ENV === 'development' ? error : 'Error fetching notifications');
    return createErrorResponse(error, request, 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    // SECURITY: Require authentication for creating notifications
    const user = await getCurrentUser();
    if (!user) {
      return createErrorResponse('Authentication required', request, 401);
    }
    
    // SECURITY: Only admins and editors can create notifications
    if (!['admin', 'editor'].includes(user.role)) {
      return createErrorResponse('Insufficient permissions', request, 403);
    }
    
    console.log('📢 Notifications API: Creating notification...');
    const body = await request.json();
    const { type, title, message, user_id, link } = body;
    
    if (!type || !title) {
      console.warn('⚠️ Notifications API: Missing required fields', { type, title });
      return createErrorResponse('Type and title are required', request, 400);
    }
    
    console.log('💾 Notifications API: Saving to database...', { type, title });
    const result = await notifications.create({
      type,
      title,
      message,
      user_id,
      link,
    });
    
    const createdNotification = (result as any).row || { ...body };
    const notificationId = createdNotification.id || (result as any).lastInsertRowid;
    
    console.log(`✅ Notifications API: Notification created with ID ${notificationId}`);
    
    return createSecureResponse({ success: true, data: createdNotification }, request);
  } catch (error: any) {
    console.error('❌ Notifications API Error:', process.env.NODE_ENV === 'development' ? error : 'Error creating notification');
    return createErrorResponse(error, request, 500);
  }
}

export async function OPTIONS(request: NextRequest) {
  return handleOptions(request);
}

