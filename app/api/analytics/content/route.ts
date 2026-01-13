import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/server';
import { createErrorResponse, createSecureResponse } from '@/lib/security/api-helpers';
import { blogPosts } from '@/lib/cms/api';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return createErrorResponse('Authentication required', request, 401);
    }

    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || '30d';
    
    // Calculate date range
    const days = range === '7d' ? 7 : range === '90d' ? 90 : 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startTimestamp = Math.floor(startDate.getTime() / 1000);

    // Get page views from analytics_events (if table exists)
    let views: number[] = [];
    let dates: string[] = [];
    
    try {
      // Check if analytics_events table exists and has data
      // Use created_at instead of timestamp (table uses created_at)
      const pageViewsResult = await query(`
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as views
        FROM analytics_events
        WHERE event_type = 'page_view'
          AND created_at >= $1
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `, [new Date(startDate.toISOString())]).catch(() => ({ rows: [] }));

      if (pageViewsResult.rows && pageViewsResult.rows.length > 0) {
        views = pageViewsResult.rows.map((row: any) => parseInt(row.views) || 0);
        dates = pageViewsResult.rows.map((row: any) => {
          const date = new Date(row.date);
          return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        });
      } else {
        // Generate empty data for the date range
        for (let i = 0; i < days; i++) {
          const date = new Date();
          date.setDate(date.getDate() - (days - 1 - i));
          dates.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
          views.push(0);
        }
      }
    } catch (error) {
      // If analytics table doesn't exist, generate empty data
      for (let i = 0; i < days; i++) {
        const date = new Date();
        date.setDate(date.getDate() - (days - 1 - i));
        dates.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        views.push(0);
      }
    }

    // Performance: Get only top 5 posts instead of all
    const allPosts = await blogPosts.getAll(true, 5); // Get only 5 published posts
    const topPosts = allPosts
      .map((post: any) => ({
        title: post.title || 'Untitled',
        views: 0, // TODO: Add view tracking
        slug: post.slug,
      }));

    return createSecureResponse({
      success: true,
      data: {
        views,
        dates,
        topPosts,
        totalViews: views.reduce((a, b) => a + b, 0),
      },
    }, request);
  } catch (error: any) {
    console.error('Failed to fetch content analytics:', error);
    return createErrorResponse(error, request, 500);
  }
}





