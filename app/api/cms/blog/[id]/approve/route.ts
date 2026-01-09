import { NextRequest, NextResponse } from 'next/server';
import { blogPosts } from '@/lib/cms/api';
import { requireAuth, requireRole } from '@/lib/auth/server';
import { applyCorsHeaders, handleCorsPreflight } from '@/lib/security/cors';
import { createSecureResponse, createErrorResponse, handleOptions } from '@/lib/security/api-helpers';

export async function OPTIONS(request: NextRequest) {
  return handleOptions(request);
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
            return createErrorResponse('Invalid post ID', request, 400);
        }

        // Get the current post
        const allPosts = await blogPosts.getAll(false);
        const post = allPosts.find((p: any) => p.id === id);

        if (!post) {
            return createErrorResponse('Post not found', request, 404);
        }

        // Update post: if approving, set published to true and publish_date
        if (approve) {
            const result = await blogPosts.update(id, {
                published: true,
                publish_date: new Date().toISOString(),
            });
            return createSecureResponse({ success: true, data: result, message: 'Post approved and published' }, request);
        } else {
            // Reject: keep as draft
            const result = await blogPosts.update(id, {
                published: false,
            });
            return createSecureResponse({ success: true, data: result, message: 'Post rejected' }, request);
        }
    } catch (error: any) {
        console.error('Approval error:', process.env.NODE_ENV === 'development' ? error : 'Error');
        return createErrorResponse(error, request, 500);
    }
}


