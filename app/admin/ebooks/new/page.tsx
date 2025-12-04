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
import { PremiumAdminHeader } from "@/components/ui/premium-admin-header";

export default function NewEbook() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [uploadingPdf, setUploadingPdf] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [categories, setCategories] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        title: "",
        slug: "",
        excerpt: "",
        description: "",
        content: "",
        cover_image: "",
        pdf_url: "",
        author: "",
        category_id: "",
        tags: "",
        featured: false,
        gated: true,
        published: false,
        // SEO Fields
        meta_title: "",
        meta_description: "",
        meta_keywords: "",
        canonical_url: "",
        og_title: "",
        og_description: "",
        og_image: "",
        schema_markup: "",
    });

    useEffect(() => {
        fetchCategories();
        fetch('/api/auth/me')
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setFormData(prev => ({ ...prev, author: data.data.user.name }));
                }
            })
            .catch(console.error);
    }, []);

    const fetchCategories = async () => {
        try {
            const res = await fetch("/api/cms/categories?content_type=ebook");
            const data = await res.json();
            if (data.success) {
                setCategories(data.data);
            }
        } catch (error) {
            console.error("Failed to fetch categories:", error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.title.trim()) {
            alert("Please enter a title");
            return;
        }

        if (!formData.slug.trim()) {
            alert("Please enter a slug");
            return;
        }

        setLoading(true);

        try {
            const res = await fetch("/api/cms/ebooks", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    category_id: formData.category_id ? parseInt(formData.category_id) : null,
                    published: formData.published,
                    gated: formData.gated,
                    publish_date: formData.published ? new Date().toISOString() : null,
                }),
            });

            if (res.ok) {
                router.push("/admin/ebooks");
            } else {
                const data = await res.json();
                alert(`Failed to create eBook: ${data.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error creating eBook:', error);
            alert(`Error creating eBook: ${error instanceof Error ? error.message : 'Unknown error'}`);
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

    const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.type !== 'application/pdf') {
            alert("Please upload a PDF file");
            return;
        }

        setUploadingPdf(true);

        try {
            const formDataUpload = new FormData();
            formDataUpload.append("file", file);
            formDataUpload.append("type", "pdf");

            const res = await fetch("/api/upload", {
                method: "POST",
                body: formDataUpload,
            });

            const data = await res.json();
            if (data.success && data.data) {
                setFormData(prev => ({ 
                    ...prev, 
                    pdf_url: data.data.url,
                    pdf_size: data.data.size 
                }));
            } else {
                alert(`Upload failed: ${data.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('PDF upload error:', error);
            alert(`Upload error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setUploadingPdf(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingImage(true);

        try {
            const formDataUpload = new FormData();
            formDataUpload.append("file", file);
            formDataUpload.append("type", "image");

            const res = await fetch("/api/upload", {
                method: "POST",
                body: formDataUpload,
            });

            const data = await res.json();
            if (data.success && data.data) {
                setFormData(prev => ({ ...prev, cover_image: data.data.url }));
            } else {
                alert(`Upload failed: ${data.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Image upload error:', error);
            alert(`Upload error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setUploadingImage(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
            <PremiumAdminHeader
                title="Create New eBook"
                description="Add a new eBook to capture leads"
                backLink="/admin/ebooks"
                backText="eBooks"
            />

            <div className="max-w-5xl mx-auto px-6 py-12">
                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Basic Information */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                        <h2 className="text-xl font-bold text-slate-900 mb-6">Basic Information</h2>
                        
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="title">Title *</Label>
                                <Input
                                    id="title"
                                    value={formData.title}
                                    onChange={(e) => {
                                        setFormData({ ...formData, title: e.target.value });
                                        if (!formData.slug) {
                                            setFormData(prev => ({ ...prev, slug: generateSlug(e.target.value) }));
                                        }
                                    }}
                                    placeholder="Enter eBook title"
                                    required
                                />
                            </div>

                            <div>
                                <Label htmlFor="slug">Slug *</Label>
                                <Input
                                    id="slug"
                                    value={formData.slug}
                                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                    placeholder="ebook-slug"
                                    required
                                />
                            </div>

                            <div>
                                <Label htmlFor="excerpt">Excerpt</Label>
                                <Textarea
                                    id="excerpt"
                                    value={formData.excerpt}
                                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                                    placeholder="Short description for previews"
                                    rows={3}
                                />
                            </div>

                            <div>
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Detailed description"
                                    rows={4}
                                />
                            </div>

                            <div>
                                <Label htmlFor="content">Content (WYSIWYG)</Label>
                                <RichTextEditor
                                    value={formData.content}
                                    onChange={(content) => setFormData({ ...formData, content })}
                                />
                            </div>

                            <div>
                                <Label htmlFor="author">Author</Label>
                                <Input
                                    id="author"
                                    value={formData.author}
                                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                                    placeholder="Author name"
                                />
                            </div>

                            <div>
                                <Label htmlFor="category_id">Category</Label>
                                <select
                                    id="category_id"
                                    value={formData.category_id}
                                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                                >
                                    <option value="">Select a category</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <Label htmlFor="tags">Tags (comma-separated)</Label>
                                <Input
                                    id="tags"
                                    value={formData.tags}
                                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                                    placeholder="tag1, tag2, tag3"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Media Upload */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                        <h2 className="text-xl font-bold text-slate-900 mb-6">Media</h2>
                        
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="cover_image">Cover Image</Label>
                                <Input
                                    id="cover_image"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    disabled={uploadingImage}
                                />
                                {uploadingImage && <p className="text-sm text-slate-500 mt-2">Uploading...</p>}
                                {formData.cover_image && (
                                    <div className="mt-4">
                                        <img src={formData.cover_image} alt="Cover" className="w-32 h-32 object-cover rounded-lg" />
                                    </div>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="pdf_url">PDF File *</Label>
                                <Input
                                    id="pdf_url"
                                    type="file"
                                    accept="application/pdf"
                                    onChange={handlePdfUpload}
                                    disabled={uploadingPdf}
                                />
                                {uploadingPdf && <p className="text-sm text-slate-500 mt-2">Uploading PDF...</p>}
                                {formData.pdf_url && (
                                    <p className="text-sm text-green-600 mt-2">✓ PDF uploaded successfully</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* SEO Settings */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                        <h2 className="text-xl font-bold text-slate-900 mb-6">SEO Settings</h2>
                        
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="meta_title">Meta Title</Label>
                                <Input
                                    id="meta_title"
                                    value={formData.meta_title}
                                    onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                                    placeholder="SEO page title"
                                />
                            </div>

                            <div>
                                <Label htmlFor="meta_description">Meta Description</Label>
                                <Textarea
                                    id="meta_description"
                                    value={formData.meta_description}
                                    onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                                    placeholder="SEO meta description"
                                    rows={3}
                                />
                            </div>

                            <div>
                                <Label htmlFor="meta_keywords">Meta Keywords</Label>
                                <Input
                                    id="meta_keywords"
                                    value={formData.meta_keywords}
                                    onChange={(e) => setFormData({ ...formData, meta_keywords: e.target.value })}
                                    placeholder="keyword1, keyword2, keyword3"
                                />
                            </div>

                            <div>
                                <Label htmlFor="canonical_url">Canonical URL</Label>
                                <Input
                                    id="canonical_url"
                                    value={formData.canonical_url}
                                    onChange={(e) => setFormData({ ...formData, canonical_url: e.target.value })}
                                    placeholder="https://example.com/ebook/slug"
                                />
                            </div>

                            <div>
                                <Label htmlFor="og_title">OG Title</Label>
                                <Input
                                    id="og_title"
                                    value={formData.og_title}
                                    onChange={(e) => setFormData({ ...formData, og_title: e.target.value })}
                                    placeholder="Open Graph title"
                                />
                            </div>

                            <div>
                                <Label htmlFor="og_description">OG Description</Label>
                                <Textarea
                                    id="og_description"
                                    value={formData.og_description}
                                    onChange={(e) => setFormData({ ...formData, og_description: e.target.value })}
                                    placeholder="Open Graph description"
                                    rows={2}
                                />
                            </div>

                            <div>
                                <Label htmlFor="og_image">OG Image URL</Label>
                                <Input
                                    id="og_image"
                                    value={formData.og_image}
                                    onChange={(e) => setFormData({ ...formData, og_image: e.target.value })}
                                    placeholder="https://example.com/og-image.jpg"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Settings */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                        <h2 className="text-xl font-bold text-slate-900 mb-6">Settings</h2>
                        
                        <div className="space-y-4">
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="featured"
                                    checked={formData.featured}
                                    onCheckedChange={(checked) => setFormData({ ...formData, featured: !!checked })}
                                />
                                <Label htmlFor="featured">Featured</Label>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="gated"
                                    checked={formData.gated}
                                    onCheckedChange={(checked) => setFormData({ ...formData, gated: !!checked })}
                                />
                                <Label htmlFor="gated">Gated Content (Requires Lead Form)</Label>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="published"
                                    checked={formData.published}
                                    onCheckedChange={(checked) => setFormData({ ...formData, published: !!checked })}
                                />
                                <Label htmlFor="published">Published</Label>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-4">
                        <Link href="/admin/ebooks">
                            <Button type="button" variant="outline">
                                Cancel
                            </Button>
                        </Link>
                        <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white">
                            {loading ? "Creating..." : "Create eBook"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}

