import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { nanoid } from 'nanoid';
import sharp from 'sharp';
import db from '@/lib/db';
import { createServerClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml',
      'video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'
    ];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid file type. Allowed: images and videos' },
        { status: 400 }
      );
    }

    const isVideo = file.type.startsWith('video/');

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    let finalFilename: string;
    let finalBuffer: Buffer;
    let mimeType: string;

    if (isVideo) {
      // For videos, just save as-is
      const ext = path.extname(file.name);
      finalFilename = `${nanoid()}${ext}`;
      finalBuffer = buffer;
      mimeType = file.type;
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
    const supabase = createServerClient();
    const bucketName = process.env.SUPABASE_STORAGE_BUCKET || 'cms-media';
    
    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(finalFilename, finalBuffer, {
        contentType: mimeType,
        upsert: false, // Don't overwrite existing files
      });

    if (uploadError) {
      console.error('Supabase Storage upload error:', uploadError);
      
      // If bucket doesn't exist, provide helpful error
      if (uploadError.message?.includes('Bucket not found') || uploadError.message?.includes('does not exist')) {
        return NextResponse.json(
          { 
            success: false, 
            error: `Storage bucket "${bucketName}" not found. Please create it in Supabase Dashboard > Storage. See cms/SUPABASE-STORAGE-SETUP.md for instructions.` 
          },
          { status: 400 }
        );
      }
      
      return NextResponse.json(
        { success: false, error: `Upload failed: ${uploadError.message}` },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(finalFilename);

    const publicUrl = urlData.publicUrl;

    // Save to database
    const stmt = db.prepare(`
      INSERT INTO media (filename, original_name, url, mime_type, size, alt_text)
      VALUES (?, ?, ?, ?, ?, ?)
      RETURNING id
    `);

    const result = await stmt.run(
      finalFilename,
      file.name,
      publicUrl, // Use Supabase Storage public URL
      mimeType,
      finalBuffer.length,
      ''
    );

    return NextResponse.json({
      success: true,
      data: {
        url: publicUrl,
        filename: finalFilename,
        size: finalBuffer.length,
        type: isVideo ? 'video' : 'image',
      },
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    
    // Provide more specific error messages
    let errorMessage = 'Upload failed';
    if (error?.message) {
      errorMessage = error.message;
    }
    
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
