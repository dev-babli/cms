import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/server';
import { applyCorsHeaders } from '@/lib/security/cors';
import { createSecureResponse, createErrorResponse } from '@/lib/security/api-helpers';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      const response = NextResponse.json(
        { success: false, authenticated: false },
        { status: 401 }
      );
      return applyCorsHeaders(response, request);
    }

    const response = NextResponse.json({
      success: true,
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
    return applyCorsHeaders(response, request);
  } catch (error: any) {
    const response = NextResponse.json(
      { success: false, authenticated: false },
      { status: 401 }
    );
    return applyCorsHeaders(response, request);
  }
}


