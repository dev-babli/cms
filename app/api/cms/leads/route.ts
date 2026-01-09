import { NextRequest, NextResponse } from 'next/server';
import { leads, notifications } from '@/lib/cms/api';
import { LeadSchema } from '@/lib/cms/types';
import { z } from 'zod';
import { sendThankYouEmail, sendAdminNotificationEmail } from '@/lib/email/service';
import { securityCheck, applySecurityHeaders } from '@/lib/security/security-middleware';
import { getClientIdentifier } from '@/lib/security/rate-limiter';
import { getCurrentUser } from '@/lib/auth/server';
import { applyCorsHeaders } from '@/lib/security/cors';
import { handleOptions } from '@/lib/security/api-helpers';

export async function GET(request: NextRequest) {
  try {
    // SECURITY: Require authentication for accessing leads data
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // SECURITY: Only admins and editors can view leads
    if (user.role !== 'admin' && user.role !== 'editor') {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }
    
    // Security check
    const securityResult = await securityCheck(request, {
      scanBody: false,
      rateLimitType: 'api',
    });
    
    if (!securityResult.allowed) {
      return NextResponse.json(
        { success: false, error: securityResult.message || 'Access denied' },
        { 
          status: securityResult.statusCode || 403,
        }
      );
    }
    
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

    const response = NextResponse.json(
      { success: true, data: items }
    );
    
    // Apply secure CORS headers
    return applyCorsHeaders(response, request, {
      allowCredentials: true,
      allowedMethods: ['GET', 'POST', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    });
  } catch (error: any) {
    // SECURITY: Don't expose detailed error messages in production
    const errorMessage = process.env.NODE_ENV === 'development' 
      ? error?.message || 'Failed to fetch leads'
      : 'An error occurred';
    
    console.error('❌ Leads API Error:', process.env.NODE_ENV === 'development' ? error : 'Error fetching leads');
    
    const response = NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
    
    return applyCorsHeaders(response, request, {
      allowCredentials: true,
      allowedMethods: ['GET', 'POST', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    });
  }
}

export async function OPTIONS(request: NextRequest) {
  return handleOptions(request);
}

export async function POST(request: NextRequest) {
  try {
    // Security check with lenient body scanning for lead submissions
    // Lead submissions contain user input (names, emails, company names) that might trigger false positives
    const securityResult = await securityCheck(request, {
      scanBody: false, // Disable body scanning for lead submissions to avoid false positives
      rateLimitType: 'lead',
    });
    
    if (!securityResult.allowed) {
      const ip = getClientIdentifier(request);
      console.warn(`🚨 Security check failed for lead submission from ${ip}:`, {
        reason: securityResult.reason,
        message: securityResult.message,
        statusCode: securityResult.statusCode,
      });
      
      // Log detailed information in development
      if (process.env.NODE_ENV === 'development') {
        try {
          const body = await request.clone().json().catch(() => ({}));
          console.warn('Request body keys:', Object.keys(body));
          console.warn('First few body values:', Object.fromEntries(
            Object.entries(body).slice(0, 5).map(([k, v]) => [k, typeof v === 'string' ? v.substring(0, 50) : v])
          ));
        } catch (e) {
          // Ignore body parsing errors
        }
      }
      
      const response = NextResponse.json(
        { success: false, error: securityResult.message || 'Access denied' },
        { 
          status: securityResult.statusCode || 403,
          headers: securityResult.headers,
        }
      );
      
      return applyCorsHeaders(response, request, {
        allowCredentials: true,
        allowedMethods: ['GET', 'POST', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
      });
    }
    
    console.log('📥 Leads API: Received POST request');
    const body = await request.json();
    console.log('📥 Leads API: Request body received', { 
      hasEmail: !!body.email, 
      hasFirstName: !!body.first_name,
      contentType: body.content_type,
      contentId: body.content_id,
    });

    // Extract IP and user agent from request headers
    const ipAddress = request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'unknown';
    const userAgent = request.headers.get('user-agent') || '';

    console.log('✅ Leads API: Validating lead data...');
    // For contact form submissions, content_type and content_id are optional
    // Build leadData with explicit null handling for contact forms
    const leadData: any = {
      first_name: body.first_name,
      last_name: body.last_name || null,
      email: body.email,
      phone: body.phone || null,
      company: body.company || null,
      job_title: body.job_title || null,
      role: body.role || null,
      industry: body.industry || null,
      notes: body.notes || null,
      consent_marketing: body.consent_marketing || false,
      consent_data_processing: body.consent_data_processing !== false,
      ip_address: ipAddress,
      user_agent: userAgent,
      status: body.status || 'new',
    };
    
    // Handle content_type: only include if it's a valid enum value, otherwise ALWAYS set to null
    if (body.content_type && typeof body.content_type === 'string' && ['ebook', 'case_study'].includes(body.content_type)) {
      leadData.content_type = body.content_type;
    } else {
      // CRITICAL: Always set to null (not undefined) for contact forms
      leadData.content_type = null;
    }
    
    // Handle content_id: only include if it's a valid number, otherwise ALWAYS set to null
    if (body.content_id !== undefined && body.content_id !== null && body.content_id !== '') {
      const parsedId = typeof body.content_id === 'string' ? parseInt(body.content_id, 10) : body.content_id;
      if (!isNaN(parsedId) && parsedId > 0) {
        leadData.content_id = parsedId;
      } else {
        leadData.content_id = null;
      }
    } else {
      // CRITICAL: Always set to null (not undefined) for contact forms
      leadData.content_id = null;
    }
    
    // Double-check: ensure these are never undefined
    if (leadData.content_type === undefined) {
      leadData.content_type = null;
    }
    if (leadData.content_id === undefined) {
      leadData.content_id = null;
    }
    
    // Include other optional fields
    if (body.content_title) leadData.content_title = body.content_title;
    if (body.lead_source) leadData.lead_source = body.lead_source;
    if (body.campaign) leadData.campaign = body.campaign;
    if (body.medium) leadData.medium = body.medium;
    if (body.referrer) leadData.referrer = body.referrer;
    if (body.utm_source) leadData.utm_source = body.utm_source;
    if (body.utm_medium) leadData.utm_medium = body.utm_medium;
    if (body.utm_campaign) leadData.utm_campaign = body.utm_campaign;
    if (body.utm_term) leadData.utm_term = body.utm_term;
    if (body.utm_content) leadData.utm_content = body.utm_content;
    
    console.log('📋 Leads API: Prepared leadData', {
      hasContentType: !!leadData.content_type,
      contentType: leadData.content_type,
      contentTypeType: typeof leadData.content_type,
      hasContentId: !!leadData.content_id,
      contentId: leadData.content_id,
      contentIdType: typeof leadData.content_id,
      email: leadData.email,
      fullLeadData: JSON.stringify(leadData, null, 2),
    });
    
    // Use safeParse to handle validation errors gracefully
    const validationResult = LeadSchema.safeParse(leadData);
    
    if (!validationResult.success) {
      // Zod validation errors are in 'issues' property, not 'errors'
      const errors = validationResult.error?.issues || [];
      console.error('❌ Leads API: Validation failed - Full details:', {
        errors: errors,
        leadData: leadData,
        leadDataKeys: Object.keys(leadData),
      });
      
      const errorMessages = errors.length > 0
        ? errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
        : 'Validation failed';
      
      const response = NextResponse.json(
        { 
          success: false, 
          error: `Validation failed: ${errorMessages}`
        },
        { status: 400 }
      );
      return applyCorsHeaders(response, request, {
        allowCredentials: true,
        allowedMethods: ['GET', 'POST', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
      });
    }
    
    const validated = validationResult.data;
    console.log('✅ Leads API: Validation passed', {
      hasContentType: !!validated.content_type,
      contentType: validated.content_type,
      hasContentId: !!validated.content_id,
      contentId: validated.content_id,
    });

    console.log('💾 Leads API: Creating lead in database...');
    let result;
    let newId;
    try {
      result = await leads.create(validated);
      newId = (result as any)?.row?.id || (result as any)?.id;
      const createdLead = (result as any)?.row || { id: newId, ...validated };
      console.log(`✅ Leads API: Lead created with ID ${newId}`, { result, newId, createdLead });
      
      if (!newId) {
        console.error('❌ Leads API: No ID returned from leads.create', { result });
        throw new Error('Failed to create lead: No ID returned');
      }
    } catch (dbError: any) {
      console.error('❌ Leads API: Database error creating lead:', {
        message: dbError?.message,
        code: dbError?.code,
        detail: dbError?.detail,
        hint: dbError?.hint,
        stack: process.env.NODE_ENV === 'development' ? dbError?.stack : undefined,
      });
      const response = NextResponse.json(
        { 
          success: false, 
          error: process.env.NODE_ENV === 'development' 
            ? `Database error: ${dbError?.message || 'Failed to create lead'}`
            : 'Failed to create lead',
          details: process.env.NODE_ENV === 'development' ? {
            message: dbError?.message,
            code: dbError?.code,
            detail: dbError?.detail,
            hint: dbError?.hint
          } : undefined
        },
        { status: 500 }
      );
      return applyCorsHeaders(response, request, {
        allowCredentials: true,
        allowedMethods: ['GET', 'POST', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
      });
    }
    
    const createdLead = (result as any)?.row || { id: newId, ...validated };

    // Record download if content type and ID are provided
    if (validated.content_type && validated.content_id && body.download_url) {
      console.log('📥 Leads API: Recording download...');
      try {
        await leads.recordDownload(
          newId,
          validated.content_type,
          validated.content_id,
          body.download_url,
          body.file_size
        );
        console.log('✅ Leads API: Download recorded');
      } catch (error: any) {
        console.error('⚠️ Leads API: Failed to record download (non-critical):', error?.message);
      }
    }

    // Send thank you email (non-blocking - don't fail if email fails)
    if (validated.email && body.download_url &&
      (validated.content_type === 'ebook' || validated.content_type === 'case_study')) {
      console.log('📧 Leads API: Sending thank you email...');
      sendThankYouEmail({
        recipientName: `${validated.first_name} ${validated.last_name || ''}`.trim() || validated.email,
        recipientEmail: validated.email,
        contentType: validated.content_type as 'ebook' | 'case_study',
        contentTitle: validated.content_title || 'Your Resource',
        downloadUrl: body.download_url,
      }).then(() => {
        console.log('✅ Leads API: Thank you email sent');
      }).catch((error) => {
        console.error('⚠️ Leads API: Failed to send thank you email (non-critical):', error?.message);
      });
    }

    // Create notification for admin (non-blocking but with better error handling)
    // Check if this is a contact form submission (no content_type/content_id)
    // Since we use .nullish(), fields might be undefined, null, or missing entirely
    const hasContentType = validated.content_type !== undefined && validated.content_type !== null;
    const hasContentId = validated.content_id !== undefined && validated.content_id !== null;
    const isContactForm = !hasContentType || !hasContentId;
    
    console.log('📢 Leads API: Checking notification creation...', {
      hasContentType,
      hasContentId,
      isContactForm,
      content_type: validated.content_type,
      content_id: validated.content_id,
      leadId: newId
    });
    
    if (isContactForm) {
      // This is a contact form submission - Keep it anonymous in notification
      console.log('📢 Leads API: Creating contact form notification...');
      // Anonymous notification - don't show personal data in title
      const notificationTitle = 'New Contact Form Submission';
      const notificationMessage = `A new contact form has been submitted.\n\nView details in the Leads section.`;
      
      try {
        console.log('💾 Leads API: Calling notifications.create...', {
          type: 'contact_form',
          title: notificationTitle,
          message: notificationMessage,
          link: '/admin/leads'
        });
        
        const notificationResult = await notifications.create({
          type: 'contact_form',
          title: notificationTitle,
          message: notificationMessage,
          link: `/admin/leads`,
        });
        
        const notificationId = (notificationResult as any)?.row?.id || 
                              (notificationResult as any)?.lastInsertRowid ||
                              (notificationResult as any)?.id;
        
        console.log('✅ Leads API: Contact form notification created (anonymous)', { 
          notificationId,
          notificationResult,
          leadId: newId
        });
      } catch (error: any) {
        console.error('❌ Leads API: Failed to create contact form notification:', {
          message: error?.message,
          code: error?.code,
          detail: error?.detail,
          hint: error?.hint,
          stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined,
        });
        // Don't fail the request, but log the error
      }

      // Send admin email notification for contact forms (non-blocking)
      console.log('📧 Leads API: Sending admin notification email...');
      sendAdminNotificationEmail({
        name: `${validated.first_name} ${validated.last_name || ''}`.trim() || validated.email,
        email: validated.email,
        company: validated.company ?? undefined,
        phone: validated.phone ?? undefined,
        message: validated.notes ?? undefined,
      }).then(() => {
        console.log('✅ Leads API: Admin notification email sent');
      }).catch((error) => {
        console.error('⚠️ Leads API: Failed to send admin notification email (non-critical):', error?.message);
      });
    } else {
      // This is a lead from content download
      console.log('📢 Leads API: Creating lead notification...');
      const notificationTitle = `New Lead: ${validated.first_name} ${validated.last_name || ''}`.trim() || validated.email;
      const notificationMessage = `Downloaded: ${validated.content_title || validated.content_type}`;
      
      try {
        const notificationResult = await notifications.create({
          type: 'lead',
          title: notificationTitle,
          message: notificationMessage,
          link: `/admin/leads?id=${newId}`,
        });
        console.log('✅ Leads API: Lead notification created', { 
          notificationId: (notificationResult as any)?.row?.id,
          leadId: newId
        });
      } catch (error: any) {
        console.error('❌ Leads API: Failed to create lead notification:', {
          message: error?.message,
          code: error?.code,
          detail: error?.detail,
          hint: error?.hint,
        });
        // Don't fail the request, but log the error
      }
    }

    console.log('✅ Leads API: Request completed successfully');
    const response = NextResponse.json(
      { success: true, data: createdLead }
    );
    
    // Apply secure CORS and security headers
    const corsResponse = applyCorsHeaders(response, request, {
      allowCredentials: true,
      allowedMethods: ['GET', 'POST', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    });
    return applySecurityHeaders(corsResponse);
  } catch (error: any) {
    console.error('❌ Leads API Error:', {
      message: error?.message,
      code: error?.code,
      detail: error?.detail,
      hint: error?.hint,
      stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined,
    });

    if (error instanceof z.ZodError) {
      const issues = error.issues || [];
      const errorMessages = Array.isArray(issues) && issues.length > 0
        ? issues.map((err: any) => {
            const path = Array.isArray(err.path) ? err.path.join('.') : String(err.path || 'unknown');
            const message = err.message || 'Invalid input';
            return `${path}: ${message}`;
          }).join(', ')
        : 'Validation failed';
      const response = NextResponse.json(
        { success: false, error: `Validation failed: ${errorMessages}` },
        { status: 400 }
      );
      return applyCorsHeaders(response, request, {
        allowCredentials: true,
        allowedMethods: ['GET', 'POST', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
      });
    }
    
    // Handle other errors that might have .issues but aren't ZodError
    if (error && typeof error === 'object' && 'issues' in error) {
      const issues = (error as any).issues || [];
      const errorMessages = Array.isArray(issues) && issues.length > 0
        ? issues.map((err: any) => {
            const path = Array.isArray(err?.path) ? err.path.join('.') : String(err?.path || 'unknown');
            const message = err?.message || 'Invalid input';
            return `${path}: ${message}`;
          }).join(', ')
        : error?.message || 'Validation failed';
      const response = NextResponse.json(
        { success: false, error: `Validation failed: ${errorMessages}` },
        { status: 400 }
      );
      return applyCorsHeaders(response, request, {
        allowCredentials: true,
        allowedMethods: ['GET', 'POST', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
      });
    }

    const response = NextResponse.json(
      { 
        success: false, 
        error: process.env.NODE_ENV === 'development' 
          ? (error?.message || 'Failed to create lead')
          : 'Failed to create lead',
        details: process.env.NODE_ENV === 'development' ? {
          message: error?.message,
          code: error?.code,
          detail: error?.detail,
          hint: error?.hint
        } : undefined
      },
      { status: 500 }
    );
    return applyCorsHeaders(response, request, {
      allowCredentials: true,
      allowedMethods: ['GET', 'POST', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    });
  }
}

