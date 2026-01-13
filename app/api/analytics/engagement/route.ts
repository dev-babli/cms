import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/server';
import { createErrorResponse, createSecureResponse } from '@/lib/security/api-helpers';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * Fetch engagement metrics: views, likes, comments from CMS
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return createErrorResponse('Authentication required', request, 401);
    }

    const { searchParams } = new URL(request.url);
    const contentType = searchParams.get('content_type') || 'all';
    const contentId = searchParams.get('content_id');

    // Get views from analytics_events
    let viewsQuery = `
      SELECT 
        content_type,
        content_id,
        COUNT(*) as views
      FROM analytics_events
      WHERE event_type = 'page_view'
      AND created_at >= CURRENT_TIMESTAMP - INTERVAL '30 days'
    `;

    if (contentType !== 'all') {
      viewsQuery += ` AND content_type = $1`;
    }
    if (contentId) {
      viewsQuery += contentType !== 'all' ? ` AND content_id = $2` : ` AND content_id = $1`;
    }

    viewsQuery += ` GROUP BY content_type, content_id ORDER BY views DESC LIMIT 50`;

    const viewsResult = await query(
      viewsQuery,
      contentType !== 'all' ? (contentId ? [contentType, contentId] : [contentType]) : (contentId ? [contentId] : [])
    );

    // Get total views
    const totalViewsResult = await query(`
      SELECT COUNT(*) as total_views
      FROM analytics_events
      WHERE event_type = 'page_view'
      AND created_at >= CURRENT_TIMESTAMP - INTERVAL '30 days'
    `);
    const totalViews = parseInt(totalViewsResult.rows?.[0]?.total_views || '0');

    // Get content-specific views
    const blogViewsResult = await query(`
      SELECT COUNT(*) as views
      FROM analytics_events
      WHERE event_type = 'page_view'
      AND content_type = 'blog'
      AND created_at >= CURRENT_TIMESTAMP - INTERVAL '30 days'
    `);
    const blogViews = parseInt(blogViewsResult.rows?.[0]?.views || '0');

    const ebookViewsResult = await query(`
      SELECT COUNT(*) as views
      FROM analytics_events
      WHERE event_type = 'page_view'
      AND content_type = 'ebook'
      AND created_at >= CURRENT_TIMESTAMP - INTERVAL '30 days'
    `);
    const ebookViews = parseInt(ebookViewsResult.rows?.[0]?.views || '0');

    const caseStudyViewsResult = await query(`
      SELECT COUNT(*) as views
      FROM analytics_events
      WHERE event_type = 'page_view'
      AND content_type = 'case_study'
      AND created_at >= CURRENT_TIMESTAMP - INTERVAL '30 days'
    `);
    const caseStudyViews = parseInt(caseStudyViewsResult.rows?.[0]?.views || '0');

    // Get downloads (if tracked)
    const downloadsResult = await query(`
      SELECT COUNT(*) as downloads
      FROM analytics_events
      WHERE event_type = 'download'
      AND created_at >= CURRENT_TIMESTAMP - INTERVAL '30 days'
    `);
    const downloads = parseInt(downloadsResult.rows?.[0]?.downloads || '0');

    // Get form submissions
    const formSubmissionsResult = await query(`
      SELECT COUNT(*) as submissions
      FROM analytics_events
      WHERE event_type = 'form_submit'
      AND created_at >= CURRENT_TIMESTAMP - INTERVAL '30 days'
    `);
    const formSubmissions = parseInt(formSubmissionsResult.rows?.[0]?.submissions || '0');

    // Get top content by views
    const topContentResult = await query(`
      SELECT 
        content_type,
        content_id,
        COUNT(*) as views
      FROM analytics_events
      WHERE event_type = 'page_view'
      AND content_type IS NOT NULL
      AND content_id IS NOT NULL
      AND created_at >= CURRENT_TIMESTAMP - INTERVAL '30 days'
      GROUP BY content_type, content_id
      ORDER BY views DESC
      LIMIT 10
    `);
    const topContent = topContentResult.rows || [];

    return createSecureResponse({
      success: true,
      data: {
        totalViews,
        blogViews,
        ebookViews,
        caseStudyViews,
        downloads,
        formSubmissions,
        topContent: topContent.map((c: any) => ({
          contentType: c.content_type,
          contentId: c.content_id,
          views: parseInt(c.views || '0'),
        })),
        contentViews: viewsResult.rows?.map((v: any) => ({
          contentType: v.content_type,
          contentId: v.content_id,
          views: parseInt(v.views || '0'),
        })) || [],
      },
    }, request);
  } catch (error: any) {
    console.error('Failed to fetch engagement metrics:', error);
    return createErrorResponse(error, request, 500);
  }
}

