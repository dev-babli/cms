import { NextRequest, NextResponse } from 'next/server';
import { leads } from '@/lib/cms/api';

export async function GET(request: NextRequest) {
  try {
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

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="leads-${new Date().toISOString().split('T')[0]}.csv"`,
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error: any) {
    console.error('❌ Lead Export Error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to export leads' },
      { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

