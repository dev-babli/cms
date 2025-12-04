"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { BlogPost } from "@/lib/cms/types";
import { useRouter } from "next/navigation";

export default function BlogList() {
    const router = useRouter();
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [authenticated, setAuthenticated] = useState(false);
    const [userRole, setUserRole] = useState<string>('viewer');

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const res = await fetch("/api/auth/check");
            if (res.ok) {
                setAuthenticated(true);
                fetchUserRole();
                fetchPosts();
            } else {
                router.push("/auth/login");
            }
        } catch (error) {
            router.push("/auth/login");
        }
    };

    const fetchUserRole = async () => {
        try {
            const res = await fetch("/api/auth/me");
            const data = await res.json();
            if (data.success && data.data?.user) {
                setUserRole(data.data.user.role || 'viewer');
            }
        } catch (error) {
            console.error("Failed to fetch user role:", error);
        }
    };

    const fetchPosts = async () => {
        try {
            const res = await fetch("/api/cms/blog");
            const data = await res.json();
            if (data.success) {
                setPosts(data.data);
            }
        } catch (error) {
            console.error("Failed to fetch posts:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this post?")) return;

        try {
            const res = await fetch(`/api/cms/blog/${id}`, { method: "DELETE" });
            if (res.ok) {
                fetchPosts();
            }
        } catch (error) {
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
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-600">Loading blog posts...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 via-white to-indigo-50/20">
            {/* Premium Header with Glass Morphism */}
            <header className="sticky top-0 z-50 glass border-b border-slate-200/60 shadow-sm">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link
                                href="/admin"
                                className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors group"
                            >
                                <svg className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                Dashboard
                            </Link>
                            <div className="h-6 w-px bg-slate-300"></div>
                            <div>
                                <h1 className="text-2xl font-bold gradient-text">Blog Posts</h1>
                                <p className="text-sm text-slate-600 font-medium">{posts.length} {posts.length === 1 ? 'post' : 'posts'} total</p>
                            </div>
                        </div>
                        <Link href="/admin/blog/new">
                            <Button size="lg" className="btn-premium">
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                New Post
                            </Button>
                        </Link>
                    </div>
                </div>
            </header>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-6 py-12">
                {posts.length === 0 ? (
                    <div className="premium-card-gradient p-16 text-center">
                        <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/30 pulse-glow">
                            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 mb-3">No posts yet</h3>
                        <p className="text-lg text-slate-600 mb-8 font-medium">Get started by creating your first blog post</p>
                        <Link href="/admin/blog/new">
                            <Button size="lg" className="btn-premium text-lg px-8 py-4">
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Create Your First Post
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {posts.map((post) => (
                            <div
                                key={post.id}
                                className="group premium-card-gradient overflow-hidden hover-lift"
                            >
                                {/* Featured Image */}
                                {post.featured_image && (
                                    <div className="relative h-48 overflow-hidden bg-gradient-to-br from-slate-100 to-slate-50">
                                        <img
                                            src={post.featured_image}
                                            alt={post.title}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        />
                                        <div className="absolute top-4 right-4 flex gap-2">
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm border ${post.published
                                                        ? "bg-green-500/90 text-white border-green-400"
                                                        : "bg-yellow-500/90 text-white border-yellow-400"
                                                    }`}
                                            >
                                                {post.published ? "Published" : "Draft"}
                                            </span>
                                            {/* Show "Pending Review" badge for unpublished posts when editor/admin */}
                                            {!post.published && (userRole === 'editor' || userRole === 'admin') && (
                                                <span className="px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm bg-orange-500/90 text-white border border-orange-400">
                                                    Pending Review
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <div className="p-6">
                                    {/* Category Badge */}
                                    {post.category && (
                                        <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold mb-3">
                                            {post.category}
                                        </span>
                                    )}

                                    {/* Title */}
                                    <h3 className="text-xl font-bold mb-3 text-slate-900 group-hover:text-blue-600 transition-colors duration-300 line-clamp-2 min-h-[3.5rem]">
                                        {post.title}
                                    </h3>

                                    {/* Excerpt */}
                                    {post.excerpt && (
                                        <p className="text-slate-600 text-sm mb-4 line-clamp-3 leading-relaxed">
                                            {post.excerpt}
                                        </p>
                                    )}

                                    {/* Meta Info */}
                                    <div className="flex items-center justify-between text-xs text-slate-500 mb-4 pb-4 border-b border-slate-100">
                                        <div className="flex items-center gap-2">
                                            {post.author && (
                                                <>
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                    </svg>
                                                    <span>{post.author}</span>
                                                </>
                                            )}
                                        </div>
                                        <span className="text-slate-400">/blog/{post.slug}</span>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <Link
                                            href={`/admin/blog/edit/${post.id}`}
                                            className="flex-1 min-w-[100px]"
                                        >
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="w-full border-slate-300 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50"
                                            >
                                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                                Edit
                                            </Button>
                                        </Link>

                                        {/* Approve button - only for editors/admins on unpublished posts */}
                                        {!post.published && (userRole === 'editor' || userRole === 'admin') && (
                                            <Button
                                                size="sm"
                                                onClick={() => handleApprove(post.id!)}
                                                className="flex-1 min-w-[100px] bg-green-600 hover:bg-green-700 text-white"
                                            >
                                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                Approve
                                            </Button>
                                        )}

                                        <Link
                                            href={`/blog/${post.slug}`}
                                            target="_blank"
                                            className="flex-1 min-w-[100px]"
                                        >
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="w-full border-slate-300 hover:border-green-500 hover:text-green-600 hover:bg-green-50"
                                            >
                                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                </svg>
                                                View
                                            </Button>
                                        </Link>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => handleDelete(post.id!)}
                                            className="bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
