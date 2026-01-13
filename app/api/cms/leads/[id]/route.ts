import { NextRequest, NextResponse } from 'next/server';
import { leads } from '@/lib/cms/api';
import { getCurrentUser } from '@/lib/auth/server';
import { applyCorsHeaders } from '@/lib/security/cors';
import { createSecureResponse, createErrorResponse } from '@/lib/security/api-helpers';

// Update lead status (admin and editor only - authors can view but not edit)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const leadId = parseInt(id);

    if (isNaN(leadId) || leadId <= 0) {
      return createErrorResponse('Invalid lead ID', request, 400);
    }

    // Check authentication
    const user = await getCurrentUser();
    if (!user) {
      return createErrorResponse('Authentication required', request, 401);
    }

    // Only admins and editors can update leads (authors can only view)
    if (user.role !== 'admin' && user.role !== 'editor') {
      return createErrorResponse(
        `Insufficient permissions. Only admins and editors can update leads. Your role: ${user.role}`,
        request,
        403
      );
    }

    const body = await request.json();
    const { status } = body;

    if (!status) {
      return createErrorResponse('Status is required', request, 400);
    }

    // Validate status value
    const validStatuses = ['new', 'contacted', 'qualified', 'converted', 'lost'];
    if (!validStatuses.includes(status)) {
      return createErrorResponse(
        `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
        request,
        400
      );
    }

    // Check if lead exists
    const existingLead = await leads.getById(leadId);
    if (!existingLead) {
      return createErrorResponse('Lead not found', request, 404);
    }

    // Update lead status
    const result = await leads.update(leadId, { status });

    if (!result.row) {
      return createErrorResponse('Failed to update lead', request, 500);
    }

    return createSecureResponse(
      { success: true, data: result.row },
      request
    );
  } catch (error: any) {
    console.error('Update lead error:', error);
    return createErrorResponse(error, request, 500);
  }
}





