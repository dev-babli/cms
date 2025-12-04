import { NextRequest, NextResponse } from 'next/server';
import { leads } from '@/lib/cms/api';
import { LeadSchema } from '@/lib/cms/types';
import { z } from 'zod';
import { sendThankYouEmail } from '@/lib/email/service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const contentType = searchParams.get('content_type');
    const contentId = searchParams.get('content_id');
    const email = searchParams.get('email');

    let items;
    if (contentType && contentId) {
      items = await leads.getByContent(contentType, parseInt(contentId));
    } else if (email) {
      items = await leads.getByEmail(email);
    } else {
      items = await leads.getAll();
    }

    return NextResponse.json(
      { success: true, data: items },
      {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      }
    );
  } catch (error: any) {
    console.error('❌ Leads API Error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch leads' },
      { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Extract IP and user agent from request headers
    const ipAddress = request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'unknown';
    const userAgent = request.headers.get('user-agent') || '';

    const validated = LeadSchema.parse({
      ...body,
      ip_address: ipAddress,
      user_agent: userAgent,
    });

    const result = await leads.create(validated);
    const newId = (result as any).row?.id || (result as any).lastInsertRowid;
    const createdLead = (result as any).row || { id: newId, ...validated };

    // Record download if content type and ID are provided
    if (validated.content_type && validated.content_id && body.download_url) {
      await leads.recordDownload(
        newId,
        validated.content_type,
        validated.content_id,
        body.download_url,
        body.file_size
      );
    }

    // Send thank you email (non-blocking - don't fail if email fails)
    if (validated.email && body.download_url &&
      (validated.content_type === 'ebook' || validated.content_type === 'case_study' || validated.content_type === 'whitepaper')) {
      sendThankYouEmail({
        recipientName: `${validated.first_name} ${validated.last_name || ''}`.trim() || validated.email,
        recipientEmail: validated.email,
        contentType: validated.content_type as 'ebook' | 'case_study' | 'whitepaper',
        contentTitle: validated.content_title || 'Your Resource',
        downloadUrl: body.download_url,
      }).catch((error) => {
        // Log error but don't fail the request
        console.error('Failed to send thank you email:', error);
      });
    }

    return NextResponse.json(
      { success: true, data: createdLead },
      { headers: { 'Access-Control-Allow-Origin': '*' } }
    );
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.issues.map(err =>
        `${err.path.join('.')}: ${err.message}`
      ).join(', ');
      return NextResponse.json(
        { success: false, error: `Validation failed: ${errorMessages}` },
        { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } }
      );
    }

    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to create lead' },
      { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } }
    );
  }
}

