import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { nanoid } from 'nanoid';
import sharp from 'sharp';
import db from '@/lib/db';

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

    // Generate unique filename
    const ext = path.extname(file.name);
    const filename = `${nanoid()}${ext}`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    const filepath = path.join(uploadDir, filename);

    // Ensure upload directory exists
    await mkdir(uploadDir, { recursive: true });

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    let finalFilename: string;
    let finalBuffer: Buffer;
    let mimeType: string;

    if (isVideo) {
      // For videos, just save as-is
      finalFilename = filename;
      finalBuffer = buffer;
      mimeType = file.type;
    } else {
      // Optimize images with sharp
      finalBuffer = await sharp(buffer)
        .resize(1920, 1080, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 85 })
        .toBuffer();
      
      finalFilename = filename.replace(ext, '.webp');
      mimeType = 'image/webp';
    }

    const finalPath = path.join(uploadDir, finalFilename);

    // Save file
    await writeFile(finalPath, finalBuffer);

    // Save to database
    const stmt = db.prepare(`
      INSERT INTO media (filename, original_name, url, mime_type, size, alt_text)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const url = `/uploads/${finalFilename}`;
    stmt.run(
      finalFilename,
      file.name,
      url,
      mimeType,
      finalBuffer.length,
      ''
    );

    return NextResponse.json({
      success: true,
      data: {
        url,
        filename: finalFilename,
        size: finalBuffer.length,
        type: isVideo ? 'video' : 'image',
      },
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { success: false, error: 'Upload failed' },
      { status: 500 }
    );
  }
}
