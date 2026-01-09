import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { applyCorsHeaders } from '@/lib/security/cors';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    checks: {
      database: {
        status: 'unknown',
        message: '',
        error: null as any,
      },
      environment: {
        status: 'ok',
        variables: {
          DATABASE_URL: process.env.DATABASE_URL ? 'set' : 'missing',
          NODE_ENV: process.env.NODE_ENV || 'not set',
        },
      },
    },
  };

  // Test database connection
  try {
    const result = await query('SELECT NOW() as current_time, version() as pg_version');
    health.checks.database.status = 'ok';
    health.checks.database.message = 'Database connection successful';
    health.checks.database.error = null;
    
    // Test if required tables exist
    const tables = [
      'blog_posts', 
      'leads', 
      'case_studies', 
      'ebooks',
      'notifications', 
      'news_announcements',
      'pages',
      'services',
      'team_members',
      'testimonials',
      'job_postings',
      'categories',
      'users'
    ];
    const tableChecks: Record<string, boolean> = {};
    
    for (const table of tables) {
      try {
        await query(`SELECT 1 FROM ${table} LIMIT 1`);
        tableChecks[table] = true;
      } catch (err: any) {
        tableChecks[table] = false;
        health.checks.database.error = {
          ...health.checks.database.error,
          [table]: err.message,
        };
      }
    }
    
    // Check for banner_image column in blog_posts
    try {
      await query(`SELECT banner_image FROM blog_posts LIMIT 1`);
      (health.checks.database as any).blog_posts_has_banner_image = true;
    } catch (err: any) {
      (health.checks.database as any).blog_posts_has_banner_image = false;
      (health.checks.database as any).banner_image_error = err.message;
    }
    
    (health.checks.database as any).tables = tableChecks;
  } catch (error: any) {
    health.status = 'error';
    health.checks.database.status = 'error';
    health.checks.database.message = 'Database connection failed';
    health.checks.database.error = {
      message: error.message,
      code: error.code,
      detail: error.detail,
      hint: error.hint,
    };
  }

  const statusCode = health.status === 'ok' ? 200 : 503;

  const response = NextResponse.json(health, {
    status: statusCode,
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return applyCorsHeaders(response, request);
}
