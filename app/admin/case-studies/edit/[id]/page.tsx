"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RichTextEditor } from "@/components/cms/rich-text-editor";
import Link from "next/link";
import { PremiumAdminHeader } from "@/components/ui/premium-admin-header";

export default function EditCaseStudy() {
    const router = useRouter();
    const params = useParams();
    const id = params?.id as string;
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploadingPdf, setUploadingPdf] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [categories, setCategories] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        title: "",
        slug: "",
        excerpt: "",
        description: "",
        content: "",
        featured_image: "",
        pdf_url: "",
        client_name: "",
        client_logo: "",
        industry: "",
        challenge: "",
        solution: "",
        results: "",
        testimonial: "",
        category_id: "",
        tags: "",
        featured: false,
        gated: true,
        published: false,
        meta_title: "",
        meta_description: "",
        meta_keywords: "",
        canonical_url: "",
        og_title: "",
        og_description: "",
        og_image: "",
    });

    useEffect(() => {
        if (id) {
            fetchCaseStudy();
            fetchCategories();
        }
    }, [id]);

    const fetchCaseStudy = async () => {
        try {
            const res = await fetch(`/api/cms/case-studies/${id}`);
            const data = await res.json();
            if (data.success && data.data) {
                const cs = data.data;
                setFormData({
                    title: cs.title || "",
                    slug: cs.slug || "",
                    excerpt: cs.excerpt || "",
                    description: cs.description || "",
                    content: cs.content || "",
                    featured_image: cs.featured_image || "",
                    pdf_url: cs.pdf_url || "",
                    client_name: cs.client_name || "",
                    client_logo: cs.client_logo || "",
                    industry: cs.industry || "",
                    challenge: cs.challenge || "",
                    solution: cs.solution || "",
                    results: cs.results || "",
                    testimonial: cs.testimonial || "",
                    category_id: cs.category_id?.toString() || "",
                    tags: cs.tags || "",
                    featured: cs.featured || false,
                    gated: cs.gated !== false,
                    published: cs.published || false,
                    meta_title: cs.meta_title || "",
                    meta_description: cs.meta_description || "",
                    meta_keywords: cs.meta_keywords || "",
                    canonical_url: cs.canonical_url || "",
                    og_title: cs.og_title || "",
                    og_description: cs.og_description || "",
                    og_image: cs.og_image || "",
                });
            }
        } catch (error) {
            console.error("Failed to fetch case study:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const res = await fetch("/api/cms/categories?content_type=case_study");
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
        setSaving(true);

        try {
            const res = await fetch(`/api/cms/case-studies/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    category_id: formData.category_id ? parseInt(formData.category_id) : null,
                    publish_date: formData.published ? new Date().toISOString() : null,
                }),
            });

            if (res.ok) {
                router.push("/admin/case-studies");
            } else {
                const data = await res.json();
                alert(`Failed to update case study: ${data.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error updating case study:', error);
            alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setSaving(false);
        }
    };

    const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || file.type !== 'application/pdf') {
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

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'featured_image' | 'client_logo') => {
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
                setFormData(prev => ({ ...prev, [field]: data.data.url }));
            } else {
                alert(`Upload failed: ${data.error || 'Unknown error'}`);
            }
        } catch (error) {
            alert(`Upload error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setUploadingImage(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-600">Loading case study...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
            <PremiumAdminHeader
                title="Edit Case Study"
                description={formData.title}
                backLink="/admin/case-studies"
                backText="Case Studies"
            />

            <div className="max-w-5xl mx-auto px-6 py-12">
                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Basic Information */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                        <h2 className="text-xl font-bold text-slate-900 mb-6">Basic Information</h2>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="title">Title *</Label>
                                <Input id="title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
                            </div>
                            <div>
                                <Label htmlFor="slug">Slug *</Label>
                                <Input id="slug" value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} required />
                            </div>
                            <div>
                                <Label htmlFor="excerpt">Excerpt</Label>
                                <Textarea id="excerpt" value={formData.excerpt} onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })} rows={3} />
                            </div>
                            <div>
                                <Label htmlFor="description">Description</Label>
                                <Textarea id="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={4} />
                            </div>
                        </div>
                    </div>

                    {/* Client Information */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                        <h2 className="text-xl font-bold text-slate-900 mb-6">Client Information</h2>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="client_name">Client Name</Label>
                                <Input id="client_name" value={formData.client_name} onChange={(e) => setFormData({ ...formData, client_name: e.target.value })} />
                            </div>
                            <div>
                                <Label htmlFor="client_logo">Client Logo</Label>
                                <Input id="client_logo" type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'client_logo')} disabled={uploadingImage} />
                                {formData.client_logo && <img src={formData.client_logo} alt="Logo" className="w-32 h-32 object-contain mt-4" />}
                            </div>
                            <div>
                                <Label htmlFor="industry">Industry</Label>
                                <Input id="industry" value={formData.industry} onChange={(e) => setFormData({ ...formData, industry: e.target.value })} />
                            </div>
                        </div>
                    </div>

                    {/* Case Study Details */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                        <h2 className="text-xl font-bold text-slate-900 mb-6">Case Study Details</h2>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="challenge">Challenge</Label>
                                <RichTextEditor value={formData.challenge} onChange={(content) => setFormData({ ...formData, challenge: content })} />
                            </div>
                            <div>
                                <Label htmlFor="solution">Solution</Label>
                                <RichTextEditor value={formData.solution} onChange={(content) => setFormData({ ...formData, solution: content })} />
                            </div>
                            <div>
                                <Label htmlFor="results">Results</Label>
                                <RichTextEditor value={formData.results} onChange={(content) => setFormData({ ...formData, results: content })} />
                            </div>
                            <div>
                                <Label htmlFor="testimonial">Client Testimonial</Label>
                                <Textarea id="testimonial" value={formData.testimonial} onChange={(e) => setFormData({ ...formData, testimonial: e.target.value })} rows={4} />
                            </div>
                            <div>
                                <Label htmlFor="content">Full Content (WYSIWYG)</Label>
                                <RichTextEditor value={formData.content} onChange={(content) => setFormData({ ...formData, content })} />
                            </div>
                        </div>
                    </div>

                    {/* Media & PDF */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                        <h2 className="text-xl font-bold text-slate-900 mb-6">Media</h2>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="featured_image">Featured Image</Label>
                                <Input id="featured_image" type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'featured_image')} disabled={uploadingImage} />
                                {formData.featured_image && <img src={formData.featured_image} alt="Featured" className="w-32 h-32 object-cover rounded-lg mt-4" />}
                            </div>
                            <div>
                                <Label htmlFor="pdf_url">PDF File (Optional)</Label>
                                <Input id="pdf_url" type="file" accept="application/pdf" onChange={handlePdfUpload} disabled={uploadingPdf} />
                                {formData.pdf_url && <p className="text-sm text-green-600 mt-2">✓ PDF uploaded</p>}
                            </div>
                        </div>
                    </div>

                    {/* SEO Settings */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                        <h2 className="text-xl font-bold text-slate-900 mb-6">SEO Settings</h2>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="meta_title">Meta Title</Label>
                                <Input id="meta_title" value={formData.meta_title} onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })} />
                            </div>
                            <div>
                                <Label htmlFor="meta_description">Meta Description</Label>
                                <Textarea id="meta_description" value={formData.meta_description} onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })} rows={3} />
                            </div>
                            <div>
                                <Label htmlFor="meta_keywords">Meta Keywords</Label>
                                <Input id="meta_keywords" value={formData.meta_keywords} onChange={(e) => setFormData({ ...formData, meta_keywords: e.target.value })} />
                            </div>
                        </div>
                    </div>

                    {/* Settings */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                        <h2 className="text-xl font-bold text-slate-900 mb-6">Settings</h2>
                        <div className="space-y-4">
                            <div className="flex items-center space-x-2">
                                <Checkbox id="gated" checked={formData.gated} onCheckedChange={(checked) => setFormData({ ...formData, gated: !!checked })} />
                                <Label htmlFor="gated">Gated Content</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox id="published" checked={formData.published} onCheckedChange={(checked) => setFormData({ ...formData, published: !!checked })} />
                                <Label htmlFor="published">Published</Label>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-4">
                        <Link href="/admin/case-studies"><Button type="button" variant="outline">Cancel</Button></Link>
                        <Button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white">
                            {saving ? "Saving..." : "Save Changes"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}

