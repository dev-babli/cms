import { NextRequest, NextResponse } from 'next/server';
import { leads } from '@/lib/cms/api';
import { getCurrentUser } from '@/lib/auth/server';
import { applyCorsHeaders, handleCorsPreflight } from '@/lib/security/cors';
import { createErrorResponse, handleOptions } from '@/lib/security/api-helpers';

export async function GET(request: NextRequest) {
  try {
    // SECURITY: Require authentication for exporting leads
    const user = await getCurrentUser();
    if (!user) {
      return createErrorResponse('Authentication required', request, 401);
    }
    
    // SECURITY: Only admins and editors can export leads
    if (!['admin', 'editor'].includes(user.role)) {
      return createErrorResponse('Insufficient permissions', request, 403);
    }
    
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const status = searchParams.get('status');
    const contentType = searchParams.get('content_type');

    // Fetch all leads
    let allLeads = await leads.getAll();

    // Apply filters
    if (startDate || endDate) {
      allLeads = allLeads.filter((lead: any) => {
        const leadDate = new Date(lead.created_at);
        if (startDate && leadDate < new Date(startDate)) return false;
        if (endDate && leadDate > new Date(endDate)) return false;
        return true;
      });
    }

    if (status) {
      allLeads = allLeads.filter((lead: any) => lead.status === status);
    }

    if (contentType) {
      allLeads = allLeads.filter((lead: any) => lead.content_type === contentType);
    }

    // Convert to CSV
    const headers = [
      'ID',
      'First Name',
      'Last Name',
      'Email',
      'Phone',
      'Company',
      'Job Title',
      'Role',
      'Industry',
      'Content Type',
      'Content ID',
      'Content Title',
      'Lead Source',
      'Campaign',
      'Status',
      'Created At',
    ];

    const csvRows = [
      headers.join(','),
      ...allLeads.map((lead: any) => [
        lead.id || '',
        `"${(lead.first_name || '').replace(/"/g, '""')}"`,
        `"${(lead.last_name || '').replace(/"/g, '""')}"`,
        lead.email || '',
        lead.phone || '',
        `"${(lead.company || '').replace(/"/g, '""')}"`,
        `"${(lead.job_title || '').replace(/"/g, '""')}"`,
        lead.role || '',
        lead.industry || '',
        lead.content_type || '',
        lead.content_id || '',
        `"${(lead.content_title || '').replace(/"/g, '""')}"`,
        lead.lead_source || '',
        lead.campaign || '',
        lead.status || '',
        lead.created_at || '',
      ].join(',')),
    ];

    const csv = csvRows.join('\n');

    const response = new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="leads-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
    return applyCorsHeaders(response, request);
  } catch (error: any) {
    console.error('❌ Lead Export Error:', process.env.NODE_ENV === 'development' ? error : 'Error');
    const response = NextResponse.json(
      { 
        success: false, 
        error: process.env.NODE_ENV === 'development' 
          ? (error?.message || 'Failed to export leads')
          : 'Failed to export leads'
      },
      { status: 500 }
    );
    return applyCorsHeaders(response, request);
  }
}

export async function OPTIONS(request: NextRequest) {
  return handleOptions(request);
}





