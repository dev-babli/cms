"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { BlogPost } from "@/lib/cms/types";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";

export default function BlogList() {
    const router = useRouter();
    const { showToast } = useToast();
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [authenticated, setAuthenticated] = useState(false);
    const [userRole, setUserRole] = useState<string>('viewer');

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const res = await fetch("/api/auth/check", {
                credentials: 'include',
            });
            if (res.ok) {
                setAuthenticated(true);
                fetchUserRole();
                fetchPosts();
            } else {
                // Only redirect if we get a clear auth error
                if (res.status === 401 || res.status === 403) {
                    router.push("/auth/login");
                } else {
                    // For other errors, still try to load (might be temporary)
                    setAuthenticated(true);
                    fetchPosts();
                }
            }
        } catch (error) {
            console.error("Auth check failed:", error);
            // Don't immediately redirect on network errors
            // Let the user see the page, it will show loading state
            setAuthenticated(false);
            setLoading(false);
        }
    };

    const fetchUserRole = async () => {
        try {
            const res = await fetch("/api/auth/me");
            if (!res.ok) {
                return; // Silently fail if auth check fails
            }
            const data = await res.json();
            if (data.success && data.data?.user) {
                setUserRole(data.data.user.role || 'viewer');
            }
        } catch (error) {
            // Silently handle error - user role will default to 'viewer'
            console.error("Failed to fetch user role:", error);
        }
    };

    const fetchPosts = async () => {
        try {
            setLoading(true);
            const res = await fetch("/api/cms/blog", {
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            
            if (!res.ok) {
                // If we get a 401, redirect to login
                if (res.status === 401) {
                    router.push("/auth/login");
                    return;
                }
                // For other errors, try to parse the error message
                try {
                    const errorData = await res.json();
                    console.error("API returned error:", errorData.error || `HTTP ${res.status}`);
                } catch {
                    console.error(`HTTP error! status: ${res.status}`);
                }
                setPosts([]);
                return;
            }
            
            const data = await res.json();
            if (data.success) {
                setPosts(data.data || []);
            } else {
                console.error("API returned error:", data.error);
                setPosts([]);
            }
        } catch (error) {
            console.error("Failed to fetch posts:", error);
            setPosts([]);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this post? This action cannot be undone.")) return;

        try {
            const res = await fetch(`/api/cms/blog/${id}`, { 
                method: "DELETE",
                credentials: 'include',
            });
            
            const data = await res.json();
            
            if (res.ok && data.success) {
                showToast("Post deleted successfully", "success");
                fetchPosts(); // Refresh the list
            } else {
                // Show error message from API
                const errorMessage = data.error || data.message || `Failed to delete post (${res.status})`;
                showToast(errorMessage, "error");
                console.error("Failed to delete post:", data);
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Network error. Please check your connection.";
            showToast(errorMessage, "error");
            console.error("Failed to delete post:", error);
        }
    };

    const handleApprove = async (id: number) => {
        if (!confirm("Approve and publish this post?")) return;

        try {
            const res = await fetch(`/api/cms/blog/${id}/approve`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ approve: true }),
            });

            const data = await res.json();
            if (res.ok && data.success) {
                alert(data.message || "Post approved and published!");
                fetchPosts();
            } else {
                alert(data.error || "Failed to approve post");
            }
        } catch (error) {
            console.error("Failed to approve post:", error);
            alert("Error approving post");
        }
    };

    if (!authenticated || loading) {
        return (
            <div className="p-6">
                <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                        <div className="w-8 h-8 border-2 border-[#E5E7EB] border-t-[#3B82F6] rounded-full animate-spin mx-auto mb-3"></div>
                        <p className="text-sm text-[#6B7280]">Loading blog posts...</p>
                    </div>
                </div>
            </div>
        );
    }

    const formatDate = (dateString: string | null | undefined) => {
        if (!dateString) return '—';
        try {
            const date = new Date(dateString);
            // Check if date is valid
            if (isNaN(date.getTime())) {
                return '—';
            }
            return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
        } catch (error) {
            // Silently handle date parsing errors
            return '—';
        }
    };

    return (
        <div className="p-6">
            {/* Page Header - Sanity Style */}
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-[18px] font-medium text-[#111827] mb-1">Blog Posts</h1>
                    <p className="text-sm text-[#6B7280]">{posts.length} {posts.length === 1 ? 'post' : 'posts'}</p>
                </div>
                <Link href="/admin/blog/new">
                    <button className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium bg-[#3B82F6] text-white hover:bg-[#2563EB] transition-colors duration-150 ease-out">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        New Post
                    </button>
                </Link>
            </div>

            {/* List View - Row-based, High Density */}
            {posts.length === 0 ? (
                <div className="border border-[#E5E7EB] rounded-md bg-white p-12 text-center">
                    <svg className="w-12 h-12 text-[#9CA3AF] mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    <h3 className="text-sm font-medium text-[#111827] mb-2">No posts yet</h3>
                    <p className="text-sm text-[#6B7280] mb-6">Get started by creating your first blog post</p>
                    <Link href="/admin/blog/new">
                        <button className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium bg-[#3B82F6] text-white hover:bg-[#2563EB] transition-colors duration-150 ease-out">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Create Post
                        </button>
                    </Link>
                </div>
            ) : (
                <div className="border border-[#E5E7EB] rounded-md bg-white">
                    {/* Table Header */}
                    <div className="border-b border-[#E5E7EB] bg-[#F9FAFB] px-4 py-2">
                        <div className="grid grid-cols-12 gap-4 text-xs font-medium text-[#6B7280] uppercase tracking-wide">
                            <div className="col-span-5">Title</div>
                            <div className="col-span-2">Author</div>
                            <div className="col-span-2">Date</div>
                            <div className="col-span-1">Status</div>
                            <div className="col-span-2 text-right">Actions</div>
                        </div>
                    </div>

                    {/* Table Rows - High Density */}
                    <div className="divide-y divide-[#E5E7EB]">
                        {posts.map((post) => (
                            <div
                                key={post.id}
                                className="px-4 py-3 hover:bg-[#F9FAFB] transition-colors duration-150 ease-out"
                            >
                                <div className="grid grid-cols-12 gap-4 items-center">
                                    {/* Title Column */}
                                    <div className="col-span-5 min-w-0">
                                        <Link href={`/admin/blog/edit/${post.id}`}>
                                            <h3 className="text-sm font-medium text-[#111827] truncate hover:text-[#3B82F6] transition-colors duration-150">
                                                {post.title || 'Untitled'}
                                            </h3>
                                        </Link>
                                        {post.excerpt && (
                                            <p className="text-xs text-[#6B7280] truncate mt-0.5">
                                                {post.excerpt}
                                            </p>
                                        )}
                                    </div>

                                    {/* Author Column */}
                                    <div className="col-span-2">
                                        <span className="text-sm text-[#6B7280]">
                                            {post.author || '—'}
                                        </span>
                                    </div>

                                    {/* Date Column */}
                                    <div className="col-span-2">
                                        <span className="text-sm text-[#6B7280]">
                                            {formatDate(post.publish_date || (post as any).created_at)}
                                        </span>
                                    </div>

                                    {/* Status Column */}
                                    <div className="col-span-1">
                                        <span
                                            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                                post.published
                                                    ? 'bg-[#D1FAE5] text-[#065F46]'
                                                    : 'bg-[#FEF3C7] text-[#92400E]'
                                            }`}
                                        >
                                            {post.published ? 'Published' : 'Draft'}
                                        </span>
                                    </div>

                                    {/* Actions Column */}
                                    <div className="col-span-2 flex items-center justify-end gap-2">
                                        <Link href={`/admin/blog/edit/${post.id}`}>
                                            <button
                                                className="p-1.5 text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6] rounded transition-colors duration-150 ease-out"
                                                title="Edit"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                            </button>
                                        </Link>
                                        <Link href={`/blog/${post.slug}`} target="_blank">
                                            <button
                                                className="p-1.5 text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6] rounded transition-colors duration-150 ease-out"
                                                title="View"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                </svg>
                                            </button>
                                        </Link>
                                        {!post.published && (userRole === 'editor' || userRole === 'admin') && (
                                            <button
                                                onClick={() => handleApprove(post.id!)}
                                                className="p-1.5 text-[#059669] hover:text-[#047857] hover:bg-[#D1FAE5] rounded transition-colors duration-150 ease-out"
                                                title="Approve"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDelete(post.id!)}
                                            className="p-1.5 text-[#6B7280] hover:text-[#EF4444] hover:bg-[#FEE2E2] rounded transition-colors duration-150 ease-out"
                                            title="Delete"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
