"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { BlogPost } from "@/lib/cms/types";

export default function BlogList() {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPosts();
    }, []);

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

    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <header className="border-b sticky top-0 bg-white z-50">
                <div className="px-6 py-4">
                    <div className="max-w-7xl mx-auto flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link href="/admin">
                                <button className="text-muted-foreground hover:text-foreground transition-colors">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                    </svg>
                                </button>
                            </Link>
                            <div>
                                <h1 className="text-xl font-semibold">Blog Posts</h1>
                                <p className="text-sm text-muted-foreground">{posts.length} posts</p>
                            </div>
                        </div>

                        <Link href="/admin/blog/new">
                            <Button>New Post</Button>
                        </Link>
                    </div>
                </div>
            </header>

            {/* Content */}
            <div className="px-6 py-8">
                <div className="max-w-7xl mx-auto">
                    {loading ? (
                        <div className="text-center py-20">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
                        </div>
                    ) : posts.length === 0 ? (
                        <div className="text-center py-20">
                            <div className="w-16 h-16 bg-muted rounded-2xl mx-auto mb-4 flex items-center justify-center text-2xl">
                                📝
                            </div>
                            <h3 className="text-xl font-semibold mb-2">No posts yet</h3>
                            <p className="text-muted-foreground mb-6">Get started by creating your first blog post</p>
                            <Link href="/admin/blog/new">
                                <Button>Create First Post</Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {posts.map((post) => (
                                <div
                                    key={post.id}
                                    className="group border rounded-lg p-6 hover:border-primary/50 hover:shadow-sm transition-all"
                                >
                                    <div className="flex items-center gap-6">
                                        {/* Thumbnail */}
                                        {post.featured_image && (
                                            <div className="w-32 h-20 rounded-md overflow-hidden bg-muted flex-shrink-0">
                                                <img
                                                    src={post.featured_image}
                                                    alt={post.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        )}

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-lg font-semibold mb-1 truncate group-hover:text-primary transition-colors">
                                                {post.title}
                                            </h3>
                                            <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
                                                {post.excerpt}
                                            </p>
                                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                                <span
                                                    className={`px-2 py-1 rounded-md font-medium ${post.published
                                                            ? "bg-green-100 text-green-700"
                                                            : "bg-yellow-100 text-yellow-700"
                                                        }`}
                                                >
                                                    {post.published ? "Published" : "Draft"}
                                                </span>
                                                {post.category && (
                                                    <span className="px-2 py-1 bg-muted rounded-md">{post.category}</span>
                                                )}
                                                <span>/blog/{post.slug}</span>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            <Link href={`/admin/blog/edit/${post.id}`}>
                                                <Button variant="outline" size="sm">
                                                    Edit
                                                </Button>
                                            </Link>
                                            <Link href={`/blog/${post.slug}`} target="_blank">
                                                <Button variant="ghost" size="sm">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                    </svg>
                                                </Button>
                                            </Link>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDelete(post.id!)}
                                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
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
        </div>
    );
}
