"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RichTextEditor } from "@/components/cms/rich-text-editor";
import Link from "next/link";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default function EditBlogPost({ params }: PageProps) {
    // Properly unwrap params using use() hook for Next.js 15
    const { id } = use(params);
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [userRole, setUserRole] = useState<string>('viewer');
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        slug: "",
        excerpt: "",
        content: "",
        author: "",
        featured_image: "",
        banner_image: "",
        category: "",
        tags: "",
        published: false,
        // SEO Fields
        meta_title: "",
        meta_description: "",
        meta_keywords: "",
        canonical_url: "",
        og_title: "",
        og_description: "",
        og_image: "",
        og_type: "article",
        schema_markup: "",
    });

    useEffect(() => {
        fetchUserRole();
        fetchPost();
    }, [id]);

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

    const fetchPost = async () => {
        try {
            console.log('📥 [Edit Blog] Fetching post ID:', id);
            const res = await fetch(`/api/cms/blog/${id}`);
            const data = await res.json();
            if (data.success) {
                console.log('✅ [Edit Blog] Post loaded:', { 
                    id: data.data.id, 
                    title: data.data.title,
                    published: data.data.published,
                    hasBannerImage: !!data.data.banner_image 
                });
                // Ensure all fields are set, including banner_image
                setFormData({
                    ...data.data,
                    banner_image: data.data.banner_image || "",
                });
            } else {
                console.error('❌ [Edit Blog] Failed to load post:', data.error);
                alert(`Failed to load post: ${data.error || 'Unknown error'}`);
            }
        } catch (error: any) {
            console.error('❌ [Edit Blog] Error loading post:', error);
            alert(`Failed to load post: ${error?.message || 'Unknown error'}`);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitForReview = async () => {
        if (!confirm("Submit this post for editor/admin review?")) return;

        setSubmitting(true);
        try {
            const res = await fetch(`/api/cms/blog/${id}/submit-review`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
            });

            const data = await res.json();
            if (res.ok && data.success) {
                alert(data.message || "Post submitted for review successfully!");
                router.push("/admin/blog");
            } else {
                alert(data.error || "Failed to submit for review");
            }
        } catch (error) {
            alert("Error submitting for review");
        } finally {
            setSubmitting(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            console.log('💾 [Edit Blog] Submitting update for post ID:', id);
            console.log('💾 [Edit Blog] Form data:', { 
                title: formData.title, 
                published: formData.published,
                hasBannerImage: !!formData.banner_image,
                hasFeaturedImage: !!formData.featured_image
            });
            
            const res = await fetch(`/api/cms/blog/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await res.json();
            
            if (res.ok && data.success) {
                console.log('✅ [Edit Blog] Post updated successfully');
                router.push("/admin/blog");
            } else {
                const errorMessage = data.error || 'Failed to update post';
                console.error('❌ [Edit Blog] Update failed:', errorMessage);
                alert(`Failed to update post: ${errorMessage}`);
            }
        } catch (error: any) {
            console.error('❌ [Edit Blog] Error updating post:', error);
            alert(`Error updating post: ${error?.message || 'Unknown error'}`);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="p-12 text-center">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-muted/30 to-background">
            <div className="px-[5%] py-12">
                <div className="container max-w-4xl mx-auto">
                    <div className="mb-8">
                        <Link href="/admin/blog">
                            <Button variant="outline">← Back to Blog Posts</Button>
                        </Link>
                    </div>

                    <div className="premium-card p-8">
                        <h1 className="text-3xl font-semibold tracking-tight mb-8">
                            Edit Blog Post
                        </h1>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <Label htmlFor="title">Title *</Label>
                                <Input
                                    id="title"
                                    required
                                    value={formData.title}
                                    onChange={(e) =>
                                        setFormData({ ...formData, title: e.target.value })
                                    }
                                    className="mt-2"
                                />
                            </div>

                            <div>
                                <Label htmlFor="slug">Slug *</Label>
                                <Input
                                    id="slug"
                                    required
                                    value={formData.slug}
                                    onChange={(e) =>
                                        setFormData({ ...formData, slug: e.target.value })
                                    }
                                    className="mt-2"
                                />
                            </div>

                            <div>
                                <Label htmlFor="excerpt">Excerpt</Label>
                                <Textarea
                                    id="excerpt"
                                    value={formData.excerpt}
                                    onChange={(e) =>
                                        setFormData({ ...formData, excerpt: e.target.value })
                                    }
                                    className="mt-2"
                                    rows={3}
                                />
                            </div>

                            <div>
                                <Label>Content *</Label>
                                <div className="mt-2">
                                    <RichTextEditor
                                        content={formData.content}
                                        onChange={(content) =>
                                            setFormData({ ...formData, content })
                                        }
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <Label htmlFor="author">Author</Label>
                                    <Input
                                        id="author"
                                        value={formData.author}
                                        onChange={(e) =>
                                            setFormData({ ...formData, author: e.target.value })
                                        }
                                        className="mt-2"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="category">Category</Label>
                                    <Input
                                        id="category"
                                        value={formData.category}
                                        onChange={(e) =>
                                            setFormData({ ...formData, category: e.target.value })
                                        }
                                        className="mt-2"
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-2">
                                <Label htmlFor="featured_image">Featured Image URL</Label>
                                    <span className="text-xs text-muted-foreground bg-blue-50 px-2 py-1 rounded">
                                        Recommended: 1200×630px (16:9) or 1920×1080px
                                    </span>
                                </div>
                                <Input
                                    id="featured_image"
                                    value={formData.featured_image}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            featured_image: e.target.value,
                                        })
                                    }
                                    placeholder="https://images.unsplash.com/..."
                                    className="mt-2"
                                />
                                {formData.featured_image && (
                                    <img
                                        src={formData.featured_image}
                                        alt="Preview"
                                        className="mt-4 rounded-lg max-h-48 object-cover"
                                    />
                                )}
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-2">
                                <Label htmlFor="banner_image">Banner Image URL (Hero Section)</Label>
                                    <span className="text-xs text-muted-foreground bg-blue-50 px-2 py-1 rounded">
                                        Recommended: 1920×1080px (Full-width hero banner)
                                    </span>
                                </div>
                                <Input
                                    id="banner_image"
                                    value={formData.banner_image || ""}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            banner_image: e.target.value,
                                        })
                                    }
                                    placeholder="https://images.unsplash.com/..."
                                    className="mt-2"
                                />
                                {formData.banner_image && (
                                    <img
                                        src={formData.banner_image}
                                        alt="Banner Preview"
                                        className="mt-4 rounded-lg max-h-48 object-cover w-full"
                                    />
                                )}
                            </div>

                            <div>
                                <Label htmlFor="tags">Tags (comma-separated)</Label>
                                <Input
                                    id="tags"
                                    value={formData.tags}
                                    onChange={(e) =>
                                        setFormData({ ...formData, tags: e.target.value })
                                    }
                                    placeholder="ai, machine-learning, technology"
                                    className="mt-2"
                                />
                            </div>

                            {/* SEO Settings */}
                            <div className="pt-6 border-t space-y-4">
                                <h3 className="text-lg font-semibold">SEO Settings</h3>

                                <div>
                                    <Label htmlFor="meta_title">Meta Title</Label>
                                    <Input
                                        id="meta_title"
                                        value={formData.meta_title || ""}
                                        onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                                        placeholder="SEO page title"
                                        className="mt-2"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="meta_description">Meta Description</Label>
                                    <Textarea
                                        id="meta_description"
                                        value={formData.meta_description || ""}
                                        onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                                        placeholder="SEO meta description"
                                        rows={3}
                                        className="mt-2"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="meta_keywords">Meta Keywords</Label>
                                    <Input
                                        id="meta_keywords"
                                        value={formData.meta_keywords || ""}
                                        onChange={(e) => setFormData({ ...formData, meta_keywords: e.target.value })}
                                        placeholder="keyword1, keyword2, keyword3"
                                        className="mt-2"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="canonical_url">Canonical URL</Label>
                                    <Input
                                        id="canonical_url"
                                        value={formData.canonical_url || ""}
                                        onChange={(e) => setFormData({ ...formData, canonical_url: e.target.value })}
                                        placeholder="https://yourdomain.com/blog/post-slug"
                                        className="mt-2"
                                    />
                                </div>

                                <div className="pt-4 border-t">
                                    <h4 className="text-sm font-semibold mb-4">Open Graph (Social Sharing)</h4>
                                    <div className="space-y-4">
                                        <div>
                                            <Label htmlFor="og_title">OG Title</Label>
                                            <Input
                                                id="og_title"
                                                value={formData.og_title || ""}
                                                onChange={(e) => setFormData({ ...formData, og_title: e.target.value })}
                                                placeholder="Social sharing title"
                                                className="mt-2"
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="og_description">OG Description</Label>
                                            <Textarea
                                                id="og_description"
                                                value={formData.og_description || ""}
                                                onChange={(e) => setFormData({ ...formData, og_description: e.target.value })}
                                                placeholder="Social sharing description"
                                                rows={2}
                                                className="mt-2"
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="og_image">OG Image URL</Label>
                                            <Input
                                                id="og_image"
                                                value={formData.og_image || ""}
                                                onChange={(e) => setFormData({ ...formData, og_image: e.target.value })}
                                                placeholder="https://yourdomain.com/image.jpg"
                                                className="mt-2"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 border-t">
                                    <Label htmlFor="schema_markup">Schema Markup (JSON-LD)</Label>
                                    <Textarea
                                        id="schema_markup"
                                        value={formData.schema_markup || ""}
                                        onChange={(e) => setFormData({ ...formData, schema_markup: e.target.value })}
                                        placeholder='{"@context":"https://schema.org","@type":"BlogPosting",...}'
                                        rows={6}
                                        className="mt-2 font-mono text-xs"
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Optional: Add custom JSON-LD structured data for enhanced SEO
                                    </p>
                                </div>
                            </div>

                            {/* Publish checkbox - only show for editors and admins */}
                            {(userRole === 'editor' || userRole === 'admin') && (
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="published"
                                        checked={formData.published}
                                        onCheckedChange={(checked) =>
                                            setFormData({ ...formData, published: !!checked })
                                        }
                                    />
                                    <Label htmlFor="published" className="cursor-pointer">
                                        Published
                                    </Label>
                                </div>
                            )}

                            <div className="flex items-center gap-4 pt-6 border-t">
                                <Button
                                    type="submit"
                                    size="lg"
                                    disabled={saving}
                                    className="premium-button"
                                >
                                    {saving ? "Saving..." : "Save Changes"}
                                </Button>

                                {/* Submit for Review button - only for authors */}
                                {userRole === 'author' && (
                                    <Button
                                        type="button"
                                        size="lg"
                                        disabled={submitting}
                                        onClick={handleSubmitForReview}
                                        className="bg-blue-600 hover:bg-blue-700 text-white"
                                    >
                                        {submitting ? "Submitting..." : "Submit for Review"}
                                    </Button>
                                )}

                                <Link href="/admin/blog">
                                    <Button type="button" variant="outline" size="lg">
                                        Cancel
                                    </Button>
                                </Link>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
