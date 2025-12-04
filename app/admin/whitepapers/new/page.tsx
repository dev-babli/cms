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

export default function NewWhitepaper() {
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
        pdf_url: "", // Required for whitepapers
        author: "",
        pages: "",
        reading_time: "",
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
            const res = await fetch("/api/cms/categories?content_type=whitepaper");
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

        if (!formData.pdf_url) {
            alert("PDF file is required for whitepapers");
            return;
        }

        setLoading(true);

        try {
            const res = await fetch("/api/cms/whitepapers", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    pages: formData.pages ? parseInt(formData.pages) : null,
                    reading_time: formData.reading_time ? parseInt(formData.reading_time) : null,
                    category_id: formData.category_id ? parseInt(formData.category_id) : null,
                    published: formData.published,
                    gated: formData.gated,
                    publish_date: formData.published ? new Date().toISOString() : null,
                }),
            });

            if (res.ok) {
                router.push("/admin/whitepapers");
            } else {
                const data = await res.json();
                alert(`Failed to create whitepaper: ${data.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error creating whitepaper:', error);
            alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
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

            const res = await fetch("/api/upload", { method: "POST", body: formDataUpload });
            const data = await res.json();
            if (data.success && data.data) {
                setFormData(prev => ({ ...prev, pdf_url: data.data.url, pdf_size: data.data.size }));
            } else {
                alert(`Upload failed: ${data.error || 'Unknown error'}`);
            }
        } catch (error) {
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

            const res = await fetch("/api/upload", { method: "POST", body: formDataUpload });
            const data = await res.json();
            if (data.success && data.data) {
                setFormData(prev => ({ ...prev, cover_image: data.data.url }));
            } else {
                alert(`Upload failed: ${data.error || 'Unknown error'}`);
            }
        } catch (error) {
            alert(`Upload error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setUploadingImage(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
            <PremiumAdminHeader
                title="Create New Whitepaper"
                description="Add research and insights whitepaper"
                backLink="/admin/whitepapers"
                backText="Whitepapers"
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
                                    placeholder="Whitepaper title"
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="slug">Slug *</Label>
                                <Input
                                    id="slug"
                                    value={formData.slug}
                                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="pages">Number of Pages</Label>
                                    <Input
                                        id="pages"
                                        type="number"
                                        value={formData.pages}
                                        onChange={(e) => setFormData({ ...formData, pages: e.target.value })}
                                        placeholder="e.g., 25"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="reading_time">Reading Time (minutes)</Label>
                                    <Input
                                        id="reading_time"
                                        type="number"
                                        value={formData.reading_time}
                                        onChange={(e) => setFormData({ ...formData, reading_time: e.target.value })}
                                        placeholder="e.g., 15"
                                    />
                                </div>
                            </div>
                            <div>
                                <Label htmlFor="excerpt">Excerpt</Label>
                                <Textarea
                                    id="excerpt"
                                    value={formData.excerpt}
                                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                                    rows={3}
                                />
                            </div>
                            <div>
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={4}
                                />
                            </div>
                            <div>
                                <Label htmlFor="content">Content Summary (WYSIWYG)</Label>
                                <RichTextEditor
                                    content={formData.content}
                                    onChange={(content) => setFormData({ ...formData, content })}
                                />
                            </div>
                            <div>
                                <Label htmlFor="author">Author</Label>
                                <Input
                                    id="author"
                                    value={formData.author}
                                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    {/* PDF Upload - Required */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                        <h2 className="text-xl font-bold text-slate-900 mb-6">PDF File *</h2>
                        <div>
                            <Label htmlFor="pdf_url">PDF File (Required)</Label>
                            <Input
                                id="pdf_url"
                                type="file"
                                accept="application/pdf"
                                onChange={handlePdfUpload}
                                disabled={uploadingPdf}
                                required
                            />
                            {uploadingPdf && <p className="text-sm text-slate-500 mt-2">Uploading PDF...</p>}
                            {formData.pdf_url && (
                                <p className="text-sm text-green-600 mt-2">✓ PDF uploaded successfully</p>
                            )}
                        </div>
                    </div>

                    {/* Cover Image */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                        <h2 className="text-xl font-bold text-slate-900 mb-6">Cover Image</h2>
                        <div>
                            <Label htmlFor="cover_image">Cover Image</Label>
                            <Input
                                id="cover_image"
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                disabled={uploadingImage}
                            />
                            {formData.cover_image && (
                                <img src={formData.cover_image} alt="Cover" className="w-32 h-32 object-cover rounded-lg mt-4" />
                            )}
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
                                />
                            </div>
                            <div>
                                <Label htmlFor="meta_description">Meta Description</Label>
                                <Textarea
                                    id="meta_description"
                                    value={formData.meta_description}
                                    onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                                    rows={3}
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
                                    id="gated"
                                    checked={formData.gated}
                                    onCheckedChange={(checked) => setFormData({ ...formData, gated: !!checked })}
                                />
                                <Label htmlFor="gated">Gated Content</Label>
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

                    <div className="flex items-center justify-end gap-4">
                        <Link href="/admin/whitepapers">
                            <Button type="button" variant="outline">Cancel</Button>
                        </Link>
                        <Button type="submit" disabled={loading || !formData.pdf_url} className="bg-blue-600 hover:bg-blue-700 text-white">
                            {loading ? "Creating..." : "Create Whitepaper"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}

