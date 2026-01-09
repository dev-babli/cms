import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { applyCorsHeaders, handleCorsPreflight } from '@/lib/security/cors';
import { createSecureResponse, createErrorResponse, handleOptions } from '@/lib/security/api-helpers';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const published = searchParams.get('published') === 'true';
    
    // Query whitepapers from database
    const sqlQuery = published
      ? `SELECT * FROM whitepapers 
         WHERE (published = true OR published::text = 'true' OR published::text = '1')
         ORDER BY publish_date DESC NULLS LAST, created_at DESC`
      : 'SELECT * FROM whitepapers ORDER BY created_at DESC';
    
    const result = await query(sqlQuery);
    const items = result?.rows || [];
    
    const response = NextResponse.json(
      { success: true, data: items },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );
    return applyCorsHeaders(response, request);
  } catch (error: any) {
    console.error('❌ Whitepapers API Error:', process.env.NODE_ENV === 'development' ? error : 'Error fetching Whitepapers');
    return createErrorResponse(error, request, 500);
  }
}

export async function OPTIONS(request: NextRequest) {
  return handleOptions(request);
}

