import { NextRequest, NextResponse } from 'next/server';
import { query, execute } from '@/lib/db';

/**
 * Short URL Redirect Handler
 * Redirects short URLs to their original destination
 */

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ hash: string }> }
) {
  try {
    const { hash } = await params;

    if (!hash) {
      return NextResponse.redirect(new URL('/404', request.url));
    }

    // Get original URL from database
    const result = await query(
      `SELECT original_url, clicks FROM url_shortener WHERE short_hash = $1`,
      [hash]
    );

    if (!result.rows || result.rows.length === 0) {
      return NextResponse.redirect(new URL('/404', request.url));
    }

    const { original_url, clicks } = result.rows[0];

    // Increment click count
    await execute(
      `UPDATE url_shortener 
       SET clicks = clicks + 1, last_accessed = CURRENT_TIMESTAMP 
       WHERE short_hash = $1`,
      [hash]
    ).catch(err => {
      // Log but don't fail if update fails
      console.error('Failed to update click count:', err);
    });

    // Redirect to original URL
    return NextResponse.redirect(new URL(original_url));
  } catch (error: any) {
    console.error('Short URL redirect error:', error);
    return NextResponse.redirect(new URL('/404', request.url));
  }
}

