import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/server';
import { createErrorResponse, createSecureResponse } from '@/lib/security/api-helpers';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * Fetch web performance metrics from intellectt.com
 * Uses PageSpeed Insights API or fetches from analytics_events table
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return createErrorResponse('Authentication required', request, 401);
    }

    const { searchParams } = new URL(request.url);
    const source = searchParams.get('source') || 'analytics'; // 'analytics' or 'pagespeed'

    if (source === 'pagespeed' && process.env.GOOGLE_PAGESPEED_API_KEY) {
      // Fetch from Google PageSpeed Insights API
      try {
        const pagespeedUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=https://intellectt.com&key=${process.env.GOOGLE_PAGESPEED_API_KEY}`;
        const response = await fetch(pagespeedUrl);
        const data = await response.json();

        if (data.lighthouseResult) {
          const metrics = data.lighthouseResult.audits;
          return createSecureResponse({
            success: true,
            data: {
              lcp: metrics['largest-contentful-paint']?.numericValue || 0,
              fid: metrics['max-potential-fid']?.numericValue || 0,
              cls: metrics['cumulative-layout-shift']?.numericValue || 0,
              fcp: metrics['first-contentful-paint']?.numericValue || 0,
              ttfb: metrics['server-response-time']?.numericValue || 0,
              performanceScore: data.lighthouseResult.categories.performance?.score * 100 || 0,
              source: 'pagespeed',
            },
          }, request);
        }
      } catch (error) {
        console.error('PageSpeed API error:', error);
        // Fall through to analytics fallback
      }
    }

    // Fetch from analytics_events table (real CMS data)
    try {
      // Get page views count
      const pageViewsResult = await query(`
        SELECT COUNT(*) as count 
        FROM analytics_events 
        WHERE event_type = 'page_view' 
        AND created_at >= NOW() - INTERVAL '30 days'
      `);
      const pageViews = parseInt(pageViewsResult.rows?.[0]?.count || '0');

      // Get unique visitors
      const uniqueVisitorsResult = await query(`
        SELECT COUNT(DISTINCT session_id) as count 
        FROM analytics_events 
        WHERE event_type = 'page_view' 
        AND created_at >= CURRENT_TIMESTAMP - INTERVAL '30 days'
        AND session_id IS NOT NULL
      `);
      const uniqueVisitors = parseInt(uniqueVisitorsResult.rows?.[0]?.count || '0');

      // Get average session duration (if tracked)
      const avgDurationResult = await query(`
        SELECT AVG((event_data->>'duration')::numeric) as avg_duration
        FROM analytics_events 
        WHERE event_type = 'page_view' 
        AND event_data->>'duration' IS NOT NULL
        AND created_at >= CURRENT_TIMESTAMP - INTERVAL '30 days'
      `);
      const avgDuration = parseFloat(avgDurationResult.rows?.[0]?.avg_duration || '0');

      // Get bounce rate (sessions with only 1 page view)
      const bounceRateResult = await query(`
        WITH session_views AS (
          SELECT session_id, COUNT(*) as view_count
          FROM analytics_events
          WHERE event_type = 'page_view'
          AND created_at >= CURRENT_TIMESTAMP - INTERVAL '30 days'
          AND session_id IS NOT NULL
          GROUP BY session_id
        )
        SELECT 
          COUNT(CASE WHEN view_count = 1 THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0) as bounce_rate
        FROM session_views
      `);
      const bounceRate = parseFloat(bounceRateResult.rows?.[0]?.bounce_rate || '0');

      // Get top pages
      const topPagesResult = await query(`
        SELECT 
          url,
          COUNT(*) as views
        FROM analytics_events
        WHERE event_type = 'page_view'
        AND created_at >= CURRENT_TIMESTAMP - INTERVAL '30 days'
        AND url IS NOT NULL
        GROUP BY url
        ORDER BY views DESC
        LIMIT 10
      `);
      const topPages = topPagesResult.rows || [];

      return createSecureResponse({
        success: true,
        data: {
          pageViews,
          uniqueVisitors,
          avgDuration: Math.round(avgDuration),
          bounceRate: Math.round(bounceRate * 100) / 100,
          topPages: topPages.map((p: any) => ({
            url: p.url,
            views: parseInt(p.views || '0'),
          })),
          source: 'analytics',
        },
      }, request);
    } catch (error: any) {
      console.error('Analytics query error:', error);
      // Return default metrics if query fails
      return createSecureResponse({
        success: true,
        data: {
          pageViews: 0,
          uniqueVisitors: 0,
          avgDuration: 0,
          bounceRate: 0,
          topPages: [],
          source: 'default',
        },
      }, request);
    }
  } catch (error: any) {
    console.error('Failed to fetch web performance:', error);
    return createErrorResponse(error, request, 500);
  }
}

