import { NextRequest, NextResponse } from 'next/server';
import { publishScheduledContent } from '@/lib/cms/scheduled-publisher';

/**
 * Cron endpoint for scheduled publishing
 * 
 * This endpoint should be called periodically (e.g., every hour) by:
 * - Vercel Cron Jobs
 * - GitHub Actions
 * - External cron service
 * - Or any scheduled task runner
 * 
 * To secure this endpoint, you can:
 * 1. Add a secret token check
 * 2. Use Vercel Cron with cron secret
 * 3. Restrict by IP address
 */

export async function GET(request: NextRequest) {
    try {
        // Optional: Check for cron secret (recommended for production)
        const cronSecret = request.headers.get('x-cron-secret') ||
            request.nextUrl.searchParams.get('secret');
        const expectedSecret = process.env.CRON_SECRET;

        if (expectedSecret && cronSecret !== expectedSecret) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        console.log('🕐 Running scheduled publishing job...');
        const results = await publishScheduledContent();

        const published = results.filter(r => r.published).length;
        const failed = results.filter(r => !r.published).length;

        console.log(`✅ Published ${published} items, ${failed} failed`);

        return NextResponse.json({
            success: true,
            message: `Published ${published} scheduled items`,
            results,
            summary: {
                total: results.length,
                published,
                failed,
            },
        });
    } catch (error: any) {
        console.error('❌ Scheduled publishing error:', error);
        return NextResponse.json(
            {
                success: false,
                error: error?.message || 'Failed to publish scheduled content',
            },
            { status: 500 }
        );
    }
}

/**
 * Also support POST for cron services that use POST
 */
export async function POST(request: NextRequest) {
    return GET(request);
}

