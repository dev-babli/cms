import { NextRequest, NextResponse } from 'next/server';
import { query, execute } from '@/lib/db';
import { applyCorsHeaders } from '@/lib/security/cors';
import { getCurrentUser } from '@/lib/auth/server';

/**
 * URL Shortener API
 * Creates short URLs and stores them in the database
 */

// Generate a short hash
function generateShortHash(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  const positiveHash = Math.abs(hash);
  const base62 = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let encoded = '';
  let num = positiveHash;
  
  do {
    encoded = base62[num % 62] + encoded;
    num = Math.floor(num / 62);
  } while (num > 0);
  
  // Add timestamp for uniqueness
  const timestamp = Date.now().toString(36);
  return (encoded.substring(0, 6) + timestamp.substring(0, 2)).toLowerCase();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, userId } = body;

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { success: false, error: 'URL is required' },
        { status: 400 }
      );
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    // Get current user if available
    const user = await getCurrentUser();
    const createdBy = userId || user?.id || null;

    // Generate unique short hash
    let shortHash = generateShortHash(url + Date.now().toString());
    let attempts = 0;
    const maxAttempts = 10;

    // Ensure uniqueness
    while (attempts < maxAttempts) {
      const existing = await query(
        'SELECT id FROM url_shortener WHERE short_hash = $1',
        [shortHash]
      );

      if (!existing.rows || existing.rows.length === 0) {
        break; // Hash is unique
      }

      // Regenerate if collision
      shortHash = generateShortHash(url + Date.now().toString() + attempts);
      attempts++;
    }

    if (attempts >= maxAttempts) {
      return NextResponse.json(
        { success: false, error: 'Failed to generate unique short URL' },
        { status: 500 }
      );
    }

    // Get base URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 
                   process.env.NEXT_PUBLIC_SITE_URL || 
                   'http://localhost:3001';

    const shortUrl = `${baseUrl}/s/${shortHash}`;

    // Insert into database
    const result = await execute(
      `INSERT INTO url_shortener (short_hash, original_url, created_by, clicks, created_at)
       VALUES ($1, $2, $3, 0, CURRENT_TIMESTAMP)
       RETURNING id, short_hash, original_url, clicks, created_at`,
      [shortHash, url, createdBy]
    );

    const response = NextResponse.json({
      success: true,
      data: {
        id: result.rows?.[0]?.id,
        shortHash,
        shortUrl,
        originalUrl: url,
        clicks: 0,
        createdAt: result.rows?.[0]?.created_at
      },
      shortUrl // For convenience
    });

    return applyCorsHeaders(response, request);
  } catch (error: any) {
    console.error('URL shortening error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: process.env.NODE_ENV === 'development' 
          ? error.message 
          : 'Failed to create short URL' 
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const hash = searchParams.get('hash');

    if (!hash) {
      return NextResponse.json(
        { success: false, error: 'Hash parameter is required' },
        { status: 400 }
      );
    }

    // Get URL from database
    const result = await query(
      `SELECT original_url, clicks FROM url_shortener WHERE short_hash = $1`,
      [hash]
    );

    if (!result.rows || result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Short URL not found' },
        { status: 404 }
      );
    }

    const { original_url, clicks } = result.rows[0];

    // Increment click count
    await execute(
      `UPDATE url_shortener 
       SET clicks = clicks + 1, last_accessed = CURRENT_TIMESTAMP 
       WHERE short_hash = $1`,
      [hash]
    );

    return NextResponse.json({
      success: true,
      data: {
        originalUrl: original_url,
        clicks: clicks + 1
      }
    });
  } catch (error: any) {
    console.error('URL resolution error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: process.env.NODE_ENV === 'development' 
          ? error.message 
          : 'Failed to resolve short URL' 
      },
      { status: 500 }
    );
  }
}

