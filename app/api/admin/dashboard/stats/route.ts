import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/server';
import { createErrorResponse, createSecureResponse } from '@/lib/security/api-helpers';
// Removed unused imports - using COUNT queries instead
import { query } from '@/lib/db';
import { createServerClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return createErrorResponse('Authentication required', request, 401);
    }

    // Performance: Use COUNT queries instead of fetching all data
    // This is MUCH faster for large datasets
    const [
      blogPostsCount,
      jobsCount,
      ebooksCount,
      caseStudiesCount,
      teamMembersCount,
      categoriesCount,
      leadsCount,
      publishedPostsCount,
      usersData,
    ] = await Promise.all([
      query('SELECT COUNT(*) as count FROM blog_posts').then(r => parseInt(r.rows?.[0]?.count || '0')).catch(() => 0),
      query('SELECT COUNT(*) as count FROM job_postings').then(r => parseInt(r.rows?.[0]?.count || '0')).catch(() => 0),
      query('SELECT COUNT(*) as count FROM ebooks').then(r => parseInt(r.rows?.[0]?.count || '0')).catch(() => 0),
      query('SELECT COUNT(*) as count FROM case_studies').then(r => parseInt(r.rows?.[0]?.count || '0')).catch(() => 0),
      query('SELECT COUNT(*) as count FROM team_members').then(r => parseInt(r.rows?.[0]?.count || '0')).catch(() => 0),
      query('SELECT COUNT(*) as count FROM categories').then(r => parseInt(r.rows?.[0]?.count || '0')).catch(() => 0),
      query('SELECT COUNT(*) as count FROM leads').then(r => parseInt(r.rows?.[0]?.count || '0')).catch(() => 0),
      query(`SELECT COUNT(*) as count FROM blog_posts WHERE (published = true OR published::text = 'true' OR published::text = '1')`).then(r => parseInt(r.rows?.[0]?.count || '0')).catch(() => 0),
      // Fetch users count (admin only)
      user.role === 'admin'
        ? (async () => {
            try {
              const supabase = createServerClient();
              const { data } = await supabase.auth.admin.listUsers();
              return data?.users?.length || 0;
            } catch {
              return 0;
            }
          })()
        : Promise.resolve(0),
    ]);

    const stats = {
      blogPosts: blogPostsCount,
      jobs: jobsCount,
      ebooks: ebooksCount,
      caseStudies: caseStudiesCount,
      teamMembers: teamMembersCount,
      categories: categoriesCount,
      leads: leadsCount,
      publishedPosts: publishedPostsCount,
      users: usersData,
    };

    return createSecureResponse({ success: true, data: stats }, request);
  } catch (error: any) {
    console.error('Failed to fetch dashboard stats:', error);
    return createErrorResponse(error, request, 500);
  }
}





