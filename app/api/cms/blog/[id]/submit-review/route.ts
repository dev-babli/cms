import { NextRequest, NextResponse } from 'next/server';
import { blogPosts } from '@/lib/cms/api';
import { requireAuth } from '@/lib/auth/server';

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
 * Submit blog post for review
 * Authors can submit their posts for editor/admin approval
 */
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Require authentication (any authenticated user can submit)
        const user = await requireAuth();

        const { id: paramId } = await params;
        const id = parseInt(paramId);

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

        // For authors: set published to false (they can't publish directly)
        // The post is now in "pending review" state (published = false)
        // Editors/admins will see it in the list and can approve it
        const result = await blogPosts.update(id, {
            published: false, // Keep as draft until approved
        });

        return NextResponse.json(
            {
                success: true,
                data: result,
                message: 'Post submitted for review. An editor or admin will review and approve it.'
            },
            { headers: corsHeaders }
        );
    } catch (error: any) {
        console.error('Submit for review error:', error);
        return NextResponse.json(
            { success: false, error: error?.message || 'Failed to submit for review' },
            { status: 500, headers: corsHeaders }
        );
    }
}


