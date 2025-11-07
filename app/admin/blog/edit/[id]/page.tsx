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

interface PageProps {
    params: Promise<{ id: string }>;
}

export default function EditBlogPost({ params }: PageProps) {
    // Unwrap params for client component
    const unwrappedParams = params as unknown as { id: string };
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        slug: "",
        excerpt: "",
        content: "",
        author: "",
        featured_image: "",
        category: "",
        tags: "",
        published: false,
    });

    useEffect(() => {
        fetchPost();
    }, []);

    const fetchPost = async () => {
        try {
            const res = await fetch(`/api/cms/blog/${unwrappedParams.id}`);
            const data = await res.json();
            if (data.success) {
                setFormData(data.data);
            }
        } catch (error) {
            alert("Failed to load post");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const res = await fetch(`/api/cms/blog/${unwrappedParams.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                router.push("/admin/blog");
            } else {
                alert("Failed to update post");
            }
        } catch (error) {
            alert("Error updating post");
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
                                <Label htmlFor="featured_image">Featured Image URL</Label>
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

                            <div className="flex items-center gap-4 pt-6 border-t">
                                <Button
                                    type="submit"
                                    size="lg"
                                    disabled={saving}
                                    className="premium-button"
                                >
                                    {saving ? "Saving..." : "Save Changes"}
                                </Button>
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
