import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { nanoid } from 'nanoid';
import sharp from 'sharp';
import db from '@/lib/db';
import { createServerClient } from '@/lib/supabase';

import { getCurrentUser } from '@/lib/auth/server';
import { handleCorsPreflight, applyCorsHeaders } from '@/lib/security/cors';

export async function POST(request: NextRequest) {
  try {
    // SECURITY: Require authentication for file uploads
    const user = await getCurrentUser();
    if (!user) {
      const response = NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
      return applyCorsHeaders(response, request);
    }
    
    // SECURITY: Only authenticated users can upload files
    // Optionally restrict to specific roles:
    // if (!['admin', 'editor', 'author'].includes(user.role)) {
    //   return NextResponse.json({ success: false, error: 'Insufficient permissions' }, { status: 403 });
    // }
    
    // Validate Supabase configuration first
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !serviceRoleKey) {
      const response = NextResponse.json(
        { 
          success: false, 
          error: process.env.NODE_ENV === 'development' 
            ? 'Supabase configuration missing. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.'
            : 'Server configuration error'
        },
        { status: 500 }
      );
      return applyCorsHeaders(response, request);
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      const response = NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
      return applyCorsHeaders(response, request);
    }
    
    // SECURITY: Enforce file size limits (10MB for images, 50MB for videos/PDFs)
    const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
    const MAX_VIDEO_PDF_SIZE = 50 * 1024 * 1024; // 50MB
    
    // Get file extension for fallback detection (browsers sometimes don't set MIME type correctly)
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
    
    // Detect file type - check MIME type first, then fallback to extension
    const isVideoFile = file.type?.startsWith('video/') || ['mp4', 'webm', 'mov', 'avi'].includes(fileExtension);
    const isPdf = file.type === 'application/pdf' || fileExtension === 'pdf';
    const isImage = file.type?.startsWith('image/') || ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(fileExtension);
    
    const maxSize = (isVideoFile || isPdf) ? MAX_VIDEO_PDF_SIZE : MAX_IMAGE_SIZE;
    
    if (file.size > maxSize) {
      const response = NextResponse.json(
        { 
          success: false, 
          error: `File too large. Maximum size: ${Math.round(maxSize / 1024 / 1024)}MB` 
        },
        { status: 400 }
      );
      return applyCorsHeaders(response, request);
    }
    
    // SECURITY: Validate file type - be strict about allowed types
    // Allow files if either MIME type or extension is valid (browsers sometimes don't set MIME type correctly)
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/webp', 'image/gif',
      // Note: SVG removed due to XSS risks - re-enable only if properly sanitized
      'video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo',
      'application/pdf'
    ];
    
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'mp4', 'webm', 'mov', 'avi', 'pdf'];
    
    // Check if file is allowed by MIME type OR extension
    const isValidByMimeType = file.type && allowedTypes.includes(file.type);
    const isValidByExtension = fileExtension && allowedExtensions.includes(fileExtension);
    
    if (!isValidByMimeType && !isValidByExtension) {
      const response = NextResponse.json(
        { 
          success: false, 
          error: `Invalid file type. Allowed: images (JPEG, PNG, WebP, GIF), videos (MP4, WebM, MOV, AVI), and PDFs. Detected type: ${file.type || 'unknown'}, extension: ${fileExtension || 'none'}` 
        },
        { status: 400 }
      );
      return applyCorsHeaders(response, request);
    }
    
    // SECURITY: Validate file extension matches detected type
    // If MIME type is set, verify it matches the extension (but be lenient if MIME type is missing)
    if (file.type) {
      const extensionMap: Record<string, string[]> = {
        'image/jpeg': ['jpg', 'jpeg'],
        'image/png': ['png'],
        'image/webp': ['webp'],
        'image/gif': ['gif'],
        'video/mp4': ['mp4'],
        'video/webm': ['webm'],
        'video/quicktime': ['mov'],
        'video/x-msvideo': ['avi'],
        'application/pdf': ['pdf'],
      };
      
      const expectedExtensions = extensionMap[file.type] || [];
      if (expectedExtensions.length > 0 && fileExtension && !expectedExtensions.includes(fileExtension)) {
        // Warn but allow if extension doesn't match (some browsers have incorrect MIME types)
        console.warn(`MIME type ${file.type} doesn't match extension ${fileExtension} for file ${file.name}`);
      }
    }


    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    let finalFilename: string;
    let finalBuffer: Buffer;
    let mimeType: string;

    if (isVideoFile || isPdf) {
      // For videos and PDFs, just save as-is
      const ext = path.extname(file.name) || (isPdf ? '.pdf' : (isVideoFile ? '.mp4' : ''));
      finalFilename = `${nanoid()}${ext}`;
      finalBuffer = buffer;
      // Use detected MIME type, or infer from extension if MIME type is missing/incorrect
      if (isPdf) {
        mimeType = file.type || 'application/pdf';
      } else if (isVideoFile) {
        mimeType = file.type || 'video/mp4';
      } else {
        mimeType = file.type || 'application/octet-stream';
      }
    } else {
      // Optimize images with sharp
      finalBuffer = await sharp(buffer)
        .resize(1920, 1080, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 85 })
        .toBuffer();
      
      finalFilename = `${nanoid()}.webp`;
      mimeType = 'image/webp';
    }

    // Upload to Supabase Storage
    let supabase;
    try {
      supabase = createServerClient();
    } catch (clientError: any) {
      console.error('Failed to create Supabase client:', clientError);
      return NextResponse.json(
        { 
          success: false, 
          error: `Supabase client initialization failed: ${clientError.message || 'Unknown error'}` 
        },
        { status: 500 }
      );
    }

    const bucketName = process.env.SUPABASE_STORAGE_BUCKET || 'cms-media';
    
    // Upload file to Supabase Storage
    let uploadData, uploadError;
    try {
      const uploadResult = await supabase.storage
        .from(bucketName)
        .upload(finalFilename, finalBuffer, {
          contentType: mimeType,
          upsert: false, // Don't overwrite existing files
        });
      uploadData = uploadResult.data;
      uploadError = uploadResult.error;
    } catch (storageError: any) {
      console.error('Supabase Storage upload exception:', storageError);
      return NextResponse.json(
        { 
          success: false, 
          error: `Storage upload failed: ${storageError.message || 'Unknown error'}` 
        },
        { status: 500 }
      );
    }

    if (uploadError) {
      console.error('Supabase Storage upload error:', uploadError);
      
      // If bucket doesn't exist, provide helpful error
      if (uploadError.message?.includes('Bucket not found') || 
          uploadError.message?.includes('does not exist') ||
          uploadError.message?.includes('The resource was not found')) {
        return NextResponse.json(
          { 
            success: false, 
            error: `Storage bucket "${bucketName}" not found. Please create it in Supabase Dashboard > Storage. See cms/SUPABASE-STORAGE-SETUP.md for instructions.` 
          },
          { status: 400 }
        );
      }
      
      // If MIME type is not supported, provide helpful error with fix instructions
      if (uploadError.message?.includes('mime type') || 
          uploadError.message?.includes('not supported') ||
          uploadError.message?.includes('MIME type')) {
        return NextResponse.json(
          { 
            success: false, 
            error: `MIME type "${mimeType}" is not allowed in the storage bucket. To fix this:\n\n1. Go to Supabase Dashboard > Storage > ${bucketName}\n2. Click "Settings" or "Edit bucket"\n3. In "Allowed MIME types", either:\n   - Leave empty to allow all types, OR\n   - Add: image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,application/pdf\n4. Save the changes\n\nSee cms/SUPABASE-STORAGE-SETUP.md for detailed instructions.` 
          },
          { status: 400 }
        );
      }
      
      return NextResponse.json(
        { success: false, error: `Upload failed: ${uploadError.message || 'Unknown storage error'}` },
        { status: 500 }
      );
    }

    // Get public URL
    let publicUrl: string;
    try {
      const { data: urlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(finalFilename);
      publicUrl = urlData.publicUrl;
    } catch (urlError: any) {
      console.error('Failed to get public URL:', urlError);
      return NextResponse.json(
        { 
          success: false, 
          error: `Failed to get file URL: ${urlError.message || 'Unknown error'}` 
        },
        { status: 500 }
      );
    }

    // Save to database (using PostgreSQL syntax)
    let dbResult;
    try {
      dbResult = await execute(
        `INSERT INTO media (filename, original_name, url, mime_type, size, alt_text)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id`,
        [
          finalFilename,
          file.name,
          publicUrl, // Use Supabase Storage public URL
          mimeType,
          finalBuffer.length,
          ''
        ]
      );
    } catch (dbError: any) {
      // If media table doesn't exist or insert fails, log but continue
      // The file is already uploaded to Supabase Storage, so return success
      console.warn('Failed to save media record to database:', dbError.message);
      // Continue without throwing - file upload was successful
    }

    const response = NextResponse.json({
      success: true,
      data: {
        url: publicUrl,
        filename: finalFilename,
        size: finalBuffer.length,
        type: isVideoFile ? 'video' : (isPdf ? 'pdf' : 'image'),
      },
    });
    
    return applyCorsHeaders(response, request);
  } catch (error: any) {
    // SECURITY: Don't expose detailed error messages in production
    console.error('Upload error:', process.env.NODE_ENV === 'development' ? error : 'Upload failed');
    
    const errorMessage = process.env.NODE_ENV === 'development' 
      ? (error?.message || 'Upload failed')
      : 'Upload failed';
    
    const response = NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
    
    return applyCorsHeaders(response, request);
  }
}

export async function OPTIONS(request: NextRequest) {
  const preflightResponse = handleCorsPreflight(request);
  if (preflightResponse) {
    return preflightResponse;
  }
  return new NextResponse(null, { status: 403 });
}
