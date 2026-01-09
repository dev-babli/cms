import { NextRequest, NextResponse } from 'next/server';
import { blogPosts } from '@/lib/cms/api';
import { requireAuth } from '@/lib/auth/server';
import { applyCorsHeaders, handleCorsPreflight } from '@/lib/security/cors';
import { createSecureResponse, createErrorResponse, handleOptions } from '@/lib/security/api-helpers';

export async function OPTIONS(request: NextRequest) {
  return handleOptions(request);
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
            return createErrorResponse('Invalid post ID', request, 400);
        }

        // Get the current post
        const allPosts = await blogPosts.getAll(false);
        const post = allPosts.find((p: any) => p.id === id);

        if (!post) {
            return createErrorResponse('Post not found', request, 404);
        }

        // For authors: set published to false (they can't publish directly)
        // The post is now in "pending review" state (published = false)
        // Editors/admins will see it in the list and can approve it
        const result = await blogPosts.update(id, {
            published: false, // Keep as draft until approved
        });

        return createSecureResponse({
            success: true,
            data: result,
            message: 'Post submitted for review. An editor or admin will review and approve it.'
        }, request);
    } catch (error: any) {
        console.error('Submit for review error:', process.env.NODE_ENV === 'development' ? error : 'Error');
        return createErrorResponse(error, request, 500);
    }
}


