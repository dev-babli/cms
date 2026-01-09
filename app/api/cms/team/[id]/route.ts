import { NextRequest, NextResponse } from 'next/server';
import { teamMembers } from '@/lib/cms/api';
import { TeamMemberSchema } from '@/lib/cms/types';
import { getCurrentUser } from '@/lib/auth/server';
import { applyCorsHeaders, handleCorsPreflight } from '@/lib/security/cors';
import { createSecureResponse, createErrorResponse, handleOptions } from '@/lib/security/api-helpers';
import { z } from 'zod';

// Handle CORS preflight
export async function OPTIONS(request: NextRequest) {
  return handleOptions(request);
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: paramId } = await params;
    const id = parseInt(paramId);
    
    // Get all members and find by ID
    const allMembers = await teamMembers.getAll(false);
    const member = allMembers.find((m: any) => m.id === id);
    
    if (!member) {
      return createErrorResponse('Team member not found', request, 404);
    }
    
    return createSecureResponse({ success: true, data: member }, request);
  } catch (error: any) {
    return createErrorResponse(error, request, 500);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // SECURITY: Require authentication for updating team members
    const user = await getCurrentUser();
    if (!user) {
      return createErrorResponse('Authentication required', request, 401);
    }
    
    // SECURITY: Only admins and editors can update team members
    if (!['admin', 'editor'].includes(user.role)) {
      return createErrorResponse('Insufficient permissions', request, 403);
    }
    
    const { id: paramId } = await params;
    const id = parseInt(paramId);
    const body = await request.json();
    const validated = TeamMemberSchema.partial().parse(body);
    
    const result = await teamMembers.update(id, validated);
    return createSecureResponse({ success: true, data: result }, request);
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
    // SECURITY: Require authentication for deleting team members
    const user = await getCurrentUser();
    if (!user) {
      return createErrorResponse('Authentication required', request, 401);
    }
    
    // SECURITY: Only admins can delete team members
    if (user.role !== 'admin') {
      return createErrorResponse('Insufficient permissions', request, 403);
    }
    
    const { id: paramId } = await params;
    const id = parseInt(paramId);
    const result = await teamMembers.delete(id);
    return createSecureResponse({ success: true, data: result }, request);
  } catch (error: any) {
    return createErrorResponse(error, request, 500);
  }
}

