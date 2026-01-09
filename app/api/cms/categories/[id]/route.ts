import { NextRequest, NextResponse } from 'next/server';
import { categories } from '@/lib/cms/api';
import { CategorySchema } from '@/lib/cms/types';
import { z } from 'zod';
import { getCurrentUser } from '@/lib/auth/server';
import { applyCorsHeaders, handleCorsPreflight } from '@/lib/security/cors';
import { createSecureResponse, createErrorResponse, handleOptions } from '@/lib/security/api-helpers';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const item = await categories.getById(parseInt(id));
    if (!item) {
      return createErrorResponse('Category not found', request, 404);
    }
    return createSecureResponse({ success: true, data: item }, request);
  } catch (error: any) {
    return createErrorResponse(error, request, 500);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // SECURITY: Require authentication for updating categories
    const user = await getCurrentUser();
    if (!user) {
      return createErrorResponse('Authentication required', request, 401);
    }
    
    // SECURITY: Only admins and editors can update categories
    if (!['admin', 'editor'].includes(user.role)) {
      return createErrorResponse('Insufficient permissions', request, 403);
    }
    
    const { id } = await params;
    const body = await request.json();
    const validated = CategorySchema.partial().parse(body);
    const result = await categories.update(parseInt(id), validated);
    
    return createSecureResponse({ success: true, data: (result as any).row || result }, request);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.issues.map(err => 
        `${err.path.join('.')}: ${err.message}`
      ).join(', ');
      return createErrorResponse(`Validation failed: ${errorMessages}`, request, 400);
    }
    return createErrorResponse(error, request, 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // SECURITY: Require authentication for deleting categories
    const user = await getCurrentUser();
    if (!user) {
      return createErrorResponse('Authentication required', request, 401);
    }
    
    // SECURITY: Only admins can delete categories
    if (user.role !== 'admin') {
      return createErrorResponse('Insufficient permissions', request, 403);
    }
    
    const { id } = await params;
    await categories.delete(parseInt(id));
    return createSecureResponse({ success: true }, request);
  } catch (error: any) {
    return createErrorResponse(error, request, 500);
  }
}

export async function OPTIONS(request: NextRequest) {
  return handleOptions(request);
}





