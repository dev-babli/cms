import { NextRequest, NextResponse } from 'next/server';
import { blogPosts } from '@/lib/cms/api';
import { requireAuth, requireRole } from '@/lib/auth/server';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
    return new NextResponse(null, {
        status: 200,
        headers: corsHeaders,
    });
}

/**
 * Approve blog post for publishing
 * Only editors and admins can approve
 */
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Require authentication and editor/admin role
        const user = await requireAuth();
        await requireRole(['editor', 'admin']);

        const { id: paramId } = await params;
        const id = parseInt(paramId);
        const body = await request.json();
        const { approve = true } = body;

        if (isNaN(id) || id <= 0) {
            return NextResponse.json(
                { success: false, error: 'Invalid post ID' },
                { status: 400, headers: corsHeaders }
            );
        }

        // Get the current post
        const allPosts = await blogPosts.getAll(false);
        const post = allPosts.find((p: any) => p.id === id);

        if (!post) {
            return NextResponse.json(
                { success: false, error: 'Post not found' },
                { status: 404, headers: corsHeaders }
            );
        }

        // Update post: if approving, set published to true and publish_date
        if (approve) {
            const result = await blogPosts.update(id, {
                published: true,
                publish_date: new Date().toISOString(),
            });
            return NextResponse.json(
                { success: true, data: result, message: 'Post approved and published' },
                { headers: corsHeaders }
            );
        } else {
            // Reject: keep as draft
            const result = await blogPosts.update(id, {
                published: false,
            });
            return NextResponse.json(
                { success: true, data: result, message: 'Post rejected' },
                { headers: corsHeaders }
            );
        }
    } catch (error: any) {
        console.error('Approval error:', error);
        return NextResponse.json(
            { success: false, error: error?.message || 'Failed to approve post' },
            { status: 500, headers: corsHeaders }
        );
    }
}

