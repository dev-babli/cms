import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/server';
import { applyCorsHeaders } from '@/lib/security/cors';
import { createSecureResponse, createErrorResponse } from '@/lib/security/api-helpers';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return createErrorResponse('Not authenticated', request, 401);
    }

    return createSecureResponse({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          status: 'active',
        },
      },
    }, request);
  } catch (error: any) {
    console.error('Auth check error:', process.env.NODE_ENV === 'development' ? error : 'Error');
    return createErrorResponse(error, request, 500);
  }
}
