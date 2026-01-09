import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { securityCheck, applySecurityHeaders } from '@/lib/security/security-middleware';
import { getClientIdentifier } from '@/lib/security/rate-limiter';
import { recordViolation } from '@/lib/security/ip-manager';
import { applyCorsHeaders, handleCorsPreflight } from '@/lib/security/cors';
import { validateDownloadUrl } from '@/lib/security/url-validator';

/**
 * Secure PDF Download Endpoint (2026 Best Practices)
 * 
 * This endpoint handles PDF downloads with:
 * - SSRF protection (URL whitelisting and private IP blocking)
 * - CORS support
 * - Supabase storage URL handling
 * - Signed URL generation for private files
 * - Proper content-type headers
 * - Download tracking
 * - Comprehensive security layers
 */
export async function GET(request: NextRequest) {
  try {
    // Security check - lighter for downloads (no body scanning needed)
    const securityResult = await securityCheck(request, {
      scanBody: false,
      rateLimitType: 'api',
    });
    
    if (!securityResult.allowed) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('🚨 Download blocked by security check:', securityResult.message);
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
        allowedMethods: ['GET', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
      });
    }
    
    const { searchParams } = new URL(request.url);
    const fileUrl = searchParams.get('url');
    const contentType = searchParams.get('content_type') || 'case_study';
    const contentId = searchParams.get('content_id');
    
    if (process.env.NODE_ENV === 'development') {
      console.log('📥 Download request:', { fileUrl, contentType, contentId, url: request.url });
    }

    if (!fileUrl) {
      const response = NextResponse.json(
        { success: false, error: 'File URL is required' },
        { status: 400 }
      );
      return applyCorsHeaders(response, request, {
        allowCredentials: true,
        allowedMethods: ['GET', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
      });
    }

    // SECURITY FIX: Validate URL to prevent SSRF attacks
    const urlValidation = validateDownloadUrl(fileUrl);
    if (!urlValidation.valid) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`🚨 SSRF attempt blocked: ${urlValidation.error} - URL: ${fileUrl.substring(0, 100)}`);
      }
      const response = NextResponse.json(
        { success: false, error: urlValidation.error || 'Invalid URL' },
        { status: 400 }
      );
      return applyCorsHeaders(response, request, {
        allowCredentials: true,
        allowedMethods: ['GET', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
      });
    }
    
    // Use validated URL
    const downloadUrl = urlValidation.url!;
    
    if (process.env.NODE_ENV === 'development') {
      console.log('📥 Fetching file from:', downloadUrl);
    }

    // Fetch the file
    try {
      const fetchResponse = await fetch(downloadUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/pdf, */*',
        },
        // SECURITY: Set timeout to prevent resource exhaustion
        signal: AbortSignal.timeout(30000), // 30 second timeout
      });

      if (!fetchResponse.ok) {
        // If fetch fails, return error with details
        const errorText = await fetchResponse.text().catch(() => 'Unknown error');
        console.error(`❌ Failed to fetch file from ${downloadUrl}: ${fetchResponse.status} ${fetchResponse.statusText}`);
        if (process.env.NODE_ENV === 'development') {
          console.error('Error response:', errorText.substring(0, 500));
        }
        const errorResponse = NextResponse.json(
          { 
            success: false, 
            error: process.env.NODE_ENV === 'development' 
              ? `Failed to fetch file: ${fetchResponse.status} ${fetchResponse.statusText} - ${errorText.substring(0, 200)}`
              : 'Failed to download file. Please check the file URL.'
          },
          { status: fetchResponse.status || 500 }
        );
        return applyCorsHeaders(errorResponse, request, {
          allowCredentials: true,
          allowedMethods: ['GET', 'OPTIONS'],
          allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
        });
      }

      // Fetch successful, process the file
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ File fetch successful, processing blob...');
      }
      const blob = await fetchResponse.blob();
      const arrayBuffer = await blob.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ Blob processed:', { size: buffer.length, contentType: fetchResponse.headers.get('Content-Type') });
      }

      // Get filename from URL or use default
      let filename = 'download.pdf';
      try {
        const urlPath = new URL(fileUrl).pathname;
        filename = urlPath.split('/').pop() || 'download.pdf';
      } catch {
        // If URL parsing fails, use default
        filename = 'download.pdf';
      }

      // Increment download count if contentId is provided
      if (contentId) {
        try {
          // Import dynamically based on content type
          if (contentType === 'case_study') {
            const { caseStudies } = await import('@/lib/cms/api');
            await caseStudies.incrementDownload(parseInt(contentId));
          } else if (contentType === 'ebook') {
            const { ebooks } = await import('@/lib/cms/api');
            await ebooks.incrementDownload(parseInt(contentId));
          }
        } catch (error) {
          console.warn('Failed to increment download count:', error);
          // Don't fail the download if tracking fails
        }
      }

      if (process.env.NODE_ENV === 'development') {
        console.log('📥 Returning download response:', { filename, size: buffer.length });
      }
      
      const downloadResponse = new NextResponse(buffer, {
        status: 200,
        headers: {
          'Content-Type': fetchResponse.headers.get('Content-Type') || 'application/pdf',
          'Content-Disposition': `attachment; filename="${filename}"`,
          'Content-Length': buffer.length.toString(),
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      });
      
      // Apply CORS and security headers
      const corsResponse = applyCorsHeaders(downloadResponse, request, {
        allowCredentials: true,
        allowedMethods: ['GET', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
      });
      return applySecurityHeaders(corsResponse);
    } catch (fetchError: any) {
      console.error('❌ Failed to fetch file:', process.env.NODE_ENV === 'development' ? fetchError : 'Error');
      if (process.env.NODE_ENV === 'development') {
        console.error('Fetch error details:', {
          name: fetchError?.name,
          message: fetchError?.message,
          stack: fetchError?.stack?.substring(0, 500),
        });
      }
      
      // Handle timeout errors specifically
      if (fetchError?.name === 'AbortError' || fetchError?.message?.includes('timeout')) {
        const timeoutResponse = NextResponse.json(
          { 
            success: false, 
            error: 'Download timeout. The file may be too large or the server is slow.'
          },
          { status: 504 }
        );
        return applyCorsHeaders(timeoutResponse, request, {
          allowCredentials: true,
          allowedMethods: ['GET', 'OPTIONS'],
          allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
        });
      }
      
      // Other fetch errors
      const errorResponse = NextResponse.json(
        { 
          success: false, 
          error: process.env.NODE_ENV === 'development' 
            ? `Failed to fetch file: ${fetchError?.message || 'Unknown error'}`
            : 'Failed to download file. Please try again later.'
        },
        { status: 500 }
      );
      return applyCorsHeaders(errorResponse, request, {
        allowCredentials: true,
        allowedMethods: ['GET', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
      });
    }
  } catch (error: any) {
    console.error('❌ Download endpoint error:', process.env.NODE_ENV === 'development' ? error : 'Error');
    if (process.env.NODE_ENV === 'development') {
      console.error('Error details:', {
        message: error?.message,
        stack: error?.stack?.substring(0, 500),
      });
    }
    const response = NextResponse.json(
      { 
        success: false, 
        error: process.env.NODE_ENV === 'development' 
          ? (error?.message || 'Failed to download file')
          : 'Failed to download file'
      },
      { status: 500 }
    );
    return applyCorsHeaders(response, request, {
      allowCredentials: true,
      allowedMethods: ['GET', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    });
  }
}

export async function OPTIONS(request: NextRequest) {
  const preflightResponse = handleCorsPreflight(request);
  if (preflightResponse) {
    return preflightResponse;
  }
  return new NextResponse(null, { status: 403 });
}

