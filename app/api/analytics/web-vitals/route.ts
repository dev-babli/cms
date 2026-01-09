import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { applyCorsHeaders } from '@/lib/security/cors';

// Schema for web vitals data
const WebVitalsSchema = z.object({
  id: z.string(),
  name: z.enum(['CLS', 'FID', 'FCP', 'LCP', 'TTFB', 'INP']),
  value: z.number(),
  delta: z.number(),
  rating: z.enum(['good', 'needs-improvement', 'poor']),
  navigationType: z.string(),
  url: z.string().url(),
  userAgent: z.string(),
  timestamp: z.number(),
  attribution: z.any().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = WebVitalsSchema.parse(body);

    // In production, you might want to:
    // 1. Store in database for analysis
    // 2. Send to analytics service (DataDog, New Relic, etc.)
    // 3. Aggregate for performance dashboards
    
    // For now, we'll log structured data
    console.log('📊 Web Vitals Data:', {
      metric: validated.name,
      value: validated.value,
      rating: validated.rating,
      page: validated.url,
      timestamp: new Date(validated.timestamp).toISOString(),
    });

    // Example: Store in database (uncomment if you want to persist)
    /*
    await db.query(`
      INSERT INTO web_vitals (
        metric_id, name, value, delta, rating, 
        navigation_type, url, user_agent, timestamp
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      validated.id,
      validated.name,
      validated.value,
      validated.delta,
      validated.rating,
      validated.navigationType,
      validated.url,
      validated.userAgent,
      new Date(validated.timestamp),
    ]);
    */

    // Example: Send to external analytics (uncomment if needed)
    /*
    if (process.env.ANALYTICS_WEBHOOK_URL) {
      await fetch(process.env.ANALYTICS_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validated),
      });
    }
    */

    const response = NextResponse.json({ 
      success: true, 
      message: 'Web vitals data recorded' 
    });

    return applyCorsHeaders(response, request);

  } catch (error: any) {
    console.error('Web vitals tracking error:', error);
    
    const response = NextResponse.json(
      { 
        success: false, 
        error: process.env.NODE_ENV === 'development' 
          ? error.message 
          : 'Failed to record metrics' 
      },
      { status: 400 }
    );

    return applyCorsHeaders(response, request);
  }
}

export async function OPTIONS(request: NextRequest) {
  const response = new NextResponse(null, { status: 200 });
  return applyCorsHeaders(response, request);
}
