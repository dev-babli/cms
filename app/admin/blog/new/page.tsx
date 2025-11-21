"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RichTextEditor } from "@/components/cms/rich-text-editor";
import Link from "next/link";

export default function NewBlogPost() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [formData, setFormData] = useState({
        title: "",
        slug: "",
        excerpt: "",
        content: "",
        author: "",
        featured_image: "",
        category: "",
        tags: "",
        published: true, // Default to published so posts show up immediately
    });

    useEffect(() => {
        // Get current user
        fetch('/api/auth/me')
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setUser(data.data.user);
                    setFormData(prev => ({ ...prev, author: data.data.user.name }));
                }
            })
            .catch(console.error);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate required fields
        if (!formData.title.trim()) {
            alert("Please enter a title for your post");
            return;
        }

        if (!formData.slug.trim()) {
            alert("Please enter a slug for your post");
            return;
        }

        setLoading(true);

        try {
            const res = await fetch("/api/cms/blog", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    title: formData.title.trim(),
                    slug: formData.slug.trim(),
                    publish_date: new Date().toISOString(),
                }),
            });

            if (res.ok) {
                router.push("/admin/blog");
            } else {
                const data = await res.json();
                alert(`Failed to create post: ${data.error || 'Unknown error'}`);
                console.error('Post creation failed:', data);
            }
        } catch (error) {
            console.error('Error creating post:', error);
            alert(`Error creating post: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setLoading(false);
        }
    };

    const generateSlug = (title: string) => {
        return title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "");
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingImage(true);

        try {
            const formData = new FormData();
            formData.append("file", file);

            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            if (res.ok) {
                const data = await res.json();
                if (data.success && data.data) {
                    setFormData(prev => ({ ...prev, featured_image: data.data.url }));
                } else {
                    alert(`Upload failed: ${data.error || 'Unknown error'}`);
                }
            } else {
                // Try to get error message from response
                let errorMessage = 'Upload failed';
                try {
                    const errorData = await res.json();
                    errorMessage = errorData.error || errorMessage;
                } catch {
                    errorMessage = res.statusText || errorMessage;
                }
                alert(`Upload failed: ${errorMessage}`);
            }
        } catch (error: any) {
            console.error('Upload error:', error);
            const errorMessage = error?.message || 'Network error. Please check your connection.';
            alert(`Upload error: ${errorMessage}`);
        } finally {
            setUploadingImage(false);
        }
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-sm">
                <div className="px-6 py-4">
                    <div className="max-w-5xl mx-auto flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link href="/admin/blog">
                                <button className="text-muted-foreground hover:text-foreground transition-colors">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                    </svg>
                                </button>
                            </Link>
                            <h1 className="text-lg font-semibold">New Blog Post</h1>
                        </div>

                        <div className="flex items-center gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.push("/admin/blog")}
                            >
                                Cancel
                            </Button>
                            <Button onClick={handleSubmit} disabled={loading}>
                                {loading ? "Publishing..." : formData.published ? "Publish" : "Save Draft"}
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Content */}
            <div className="px-6 py-12">
                <div className="max-w-3xl mx-auto">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Title */}
                        <div>
                            <Input
                                value={formData.title}
                                onChange={(e) => {
                                    const title = e.target.value;
                                    setFormData({
                                        ...formData,
                                        title,
                                        slug: formData.slug || (title.trim() ? generateSlug(title) : ""),
                                    });
                                }}
                                placeholder="Post title"
                                className="text-4xl font-bold border-none shadow-none px-0 h-auto focus-visible:ring-0 placeholder:text-muted-foreground/50"
                                required
                            />
                        </div>

                        {/* Slug */}
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>URL:</span>
                            <span className="font-mono">/blog/</span>
                            <Input
                                value={formData.slug}
                                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                placeholder="post-slug"
                                className="h-8 max-w-xs font-mono text-sm border-none shadow-none px-0 focus-visible:ring-0"
                                required
                            />
                        </div>

                        {/* Featured Image */}
                        <div className="space-y-3">
                            <Label className="text-sm font-medium">Featured Image</Label>

                            {formData.featured_image ? (
                                <div className="space-y-3">
                                    <div className="rounded-lg overflow-hidden border">
                                        <img
                                            src={formData.featured_image}
                                            alt="Preview"
                                            className="w-full aspect-video object-cover"
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setFormData({ ...formData, featured_image: "" })}
                                        >
                                            Remove
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            disabled={uploadingImage}
                                            onClick={() => document.getElementById('change-image-input')?.click()}
                                        >
                                            {uploadingImage ? "Uploading..." : "Change Image"}
                                        </Button>
                                        <input
                                            id="change-image-input"
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            className="hidden"
                                            disabled={uploadingImage}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="w-full h-32 border-dashed"
                                        disabled={uploadingImage}
                                        onClick={() => document.getElementById('featured-image-input')?.click()}
                                    >
                                        <span className="flex flex-col items-center justify-center gap-2">
                                            {uploadingImage ? (
                                                <>
                                                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                                                    <span className="text-sm">Uploading...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                    <span className="text-sm font-medium">Click to upload image</span>
                                                    <span className="text-xs text-muted-foreground">PNG, JPG, GIF up to 10MB</span>
                                                </>
                                            )}
                                        </span>
                                    </Button>
                                    <input
                                        id="featured-image-input"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="hidden"
                                        disabled={uploadingImage}
                                    />

                                    <div className="relative">
                                        <div className="absolute inset-0 flex items-center">
                                            <div className="w-full border-t"></div>
                                        </div>
                                        <div className="relative flex justify-center text-xs">
                                            <span className="px-2 bg-white text-muted-foreground">or paste URL</span>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <Input
                                            value={formData.featured_image}
                                            onChange={(e) => setFormData({ ...formData, featured_image: e.target.value })}
                                            placeholder="https://images.unsplash.com/..."
                                            className="h-10 flex-1"
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => document.getElementById('url-image-input')?.click()}
                                            disabled={uploadingImage}
                                        >
                                            Upload
                                        </Button>
                                        <input
                                            id="url-image-input"
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            className="hidden"
                                            disabled={uploadingImage}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Excerpt */}
                        <div className="space-y-3">
                            <Label className="text-sm font-medium">Excerpt</Label>
                            <Textarea
                                value={formData.excerpt}
                                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                                placeholder="A brief description of your post..."
                                className="resize-none h-20"
                            />
                        </div>

                        {/* Content Editor */}
                        <div className="space-y-3">
                            <Label className="text-sm font-medium">Content</Label>
                            <div className="border rounded-lg">
                                <RichTextEditor
                                    content={formData.content}
                                    onChange={(content) => setFormData({ ...formData, content })}
                                />
                            </div>
                        </div>

                        {/* Meta Information */}
                        <div className="pt-8 border-t space-y-6">
                            <h3 className="text-sm font-semibold">Post Details</h3>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-sm">Author</Label>
                                    <Input
                                        value={formData.author}
                                        onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                                        placeholder="Your name"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-sm">Category</Label>
                                    <Input
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        placeholder="Technology, AI, etc."
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm">Tags</Label>
                                <Input
                                    value={formData.tags}
                                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                                    placeholder="ai, machine-learning, technology"
                                />
                            </div>
                        </div>

                        {/* Publish Toggle */}
                        <div className="pt-6 border-t">
                            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                                <div className="flex items-center space-x-3">
                                    <Checkbox
                                        id="published"
                                        checked={formData.published}
                                        onCheckedChange={(checked) =>
                                            setFormData({ ...formData, published: !!checked })
                                        }
                                    />
                                    <div>
                                        <Label htmlFor="published" className="cursor-pointer font-medium">
                                            Publish immediately
                                        </Label>
                                        <p className="text-sm text-muted-foreground">
                                            Make this post visible to everyone
                                        </p>
                                    </div>
                                </div>
                                {formData.published && (
                                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                                        Will Publish
                                    </span>
                                )}
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
