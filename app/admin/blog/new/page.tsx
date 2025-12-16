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
    const [categories, setCategories] = useState<any[]>([]);
    const [authors, setAuthors] = useState<string[]>([]);
    const [existingTags, setExistingTags] = useState<string[]>([]);
    const [formData, setFormData] = useState({
        title: "",
        slug: "",
        excerpt: "",
        content: "",
        author: "",
        featured_image: "",
        category: "",
        tags: "",
        published: false, // Default to draft - user can publish when ready
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
        
        // Fetch categories
        fetch('/api/cms/categories?content_type=blog')
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setCategories(data.data || []);
                }
            })
            .catch(console.error);
        
        // Fetch existing authors
        fetch('/api/cms/blog?published=true')
            .then(res => res.json())
            .then(data => {
                if (data.success && data.data) {
                    const authors = data.data.map((p: any) => p.author).filter((a: any): a is string => typeof a === 'string' && Boolean(a));
                    const uniqueAuthors: string[] = Array.from(new Set(authors));
                    setAuthors(uniqueAuthors);
                }
            })
            .catch(console.error);
        
        // Fetch existing tags
        fetch('/api/cms/blog?published=true')
            .then(res => res.json())
            .then(data => {
                if (data.success && data.data) {
                    const tagStrings = data.data
                        .map((p: any) => p.tags)
                        .filter((t: any): t is string => typeof t === 'string' && Boolean(t));
                    const allTags: string[] = tagStrings
                        .join(',')
                        .split(',')
                        .map((t: string) => t.trim())
                        .filter((t: string): t is string => Boolean(t));
                    const uniqueTags: string[] = Array.from(new Set(allTags));
                    setExistingTags(uniqueTags);
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
                    published: formData.published, // Use the current published state
                    publish_date: formData.published ? new Date().toISOString() : null,
                }),
            });

            // Get response text first (can only read response body once)
            const responseText = await res.text();
            
            // Log response details for debugging
            console.log('Response status:', res.status);
            console.log('Response headers:', Object.fromEntries(res.headers.entries()));
            console.log('Response text length:', responseText.length);
            console.log('Response text preview:', responseText.substring(0, 500));
            
            // Check if response is empty
            if (!responseText || responseText.trim().length === 0) {
                console.error('Empty response from server');
                throw new Error(`Server returned empty response (Status: ${res.status} ${res.statusText})`);
            }
            
            // Check if response is JSON
            const contentType = res.headers.get('content-type');
            const isJson = contentType?.includes('application/json');
            
            if (!isJson) {
                console.error('Non-JSON response:', responseText);
                throw new Error(`Server returned non-JSON response (Status: ${res.status}): ${responseText.substring(0, 200)}`);
            }

            // Parse JSON response
            let data;
            try {
                data = JSON.parse(responseText);
            } catch (parseError: any) {
                console.error('Failed to parse JSON response:', parseError);
                console.error('Response text:', responseText);
                throw new Error(`Invalid JSON response from server (Status: ${res.status}): ${responseText.substring(0, 200)}`);
            }

            if (res.ok && data.success) {
                router.push("/admin/blog");
            } else {
                alert(`Failed to create post: ${data.error || 'Unknown error'}`);
                console.error('Post creation failed:', data);
            }
        } catch (error) {
            console.error('Error creating post:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            alert(`Error creating post: ${errorMessage}`);
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

            // Check content type before parsing
            const contentType = res.headers.get('content-type');
            const isJson = contentType?.includes('application/json');

            if (res.ok) {
                // Parse successful response
                let data;
                try {
                    if (isJson) {
                        data = await res.json();
                    } else {
                        const text = await res.text();
                        throw new Error(`Expected JSON but got: ${text.substring(0, 100)}`);
                    }
                } catch (parseError: any) {
                    console.error('Failed to parse response:', parseError);
                    alert(`Upload error: Failed to parse server response. ${parseError.message}`);
                    return;
                }

                if (data.success && data.data) {
                    setFormData(prev => ({ ...prev, featured_image: data.data.url }));
                } else {
                    alert(`Upload failed: ${data.error || 'Unknown error'}`);
                }
            } else {
                // Try to get error message from response
                let errorMessage = 'Upload failed';
                try {
                    if (isJson) {
                        const errorData = await res.json();
                        errorMessage = errorData.error || errorMessage;
                    } else {
                        // Response is not JSON, read as text
                        const text = await res.text();
                        errorMessage = text || res.statusText || errorMessage;
                        // If it looks like HTML, extract meaningful part
                        if (text.includes('<')) {
                            errorMessage = `Server error (${res.status}): ${res.statusText}`;
                        }
                    }
                } catch (parseError) {
                    errorMessage = res.statusText || `HTTP ${res.status}`;
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
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    // Encode form data and pass to preview page
                                    const previewData = encodeURIComponent(JSON.stringify({
                                        title: formData.title,
                                        slug: formData.slug || 'preview',
                                        excerpt: formData.excerpt,
                                        content: formData.content,
                                        author: formData.author,
                                        category: formData.category,
                                        tags: formData.tags,
                                        featured_image: formData.featured_image,
                                    }));
                                    const previewUrl = `/admin/blog/preview?data=${previewData}`;
                                    window.open(previewUrl, '_blank');
                                }}
                                disabled={!formData.title}
                            >
                                Preview
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={async (e) => {
                                    e.preventDefault();
                                    setFormData(prev => ({ ...prev, published: false }));
                                    await handleSubmit(e as any);
                                }}
                                disabled={loading}
                            >
                                {loading ? "Saving..." : "Save Draft"}
                            </Button>
                            <Button onClick={handleSubmit} disabled={loading}>
                                {loading ? "Publishing..." : "Publish"}
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
                            <div className="flex items-center justify-between">
                                <Label className="text-sm font-medium">Featured Image</Label>
                                <span className="text-xs text-muted-foreground bg-blue-50 px-2 py-1 rounded">
                                    Recommended: 1200×630px (16:9) or 1920×1080px
                                </span>
                            </div>

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
                                    <div className="relative">
                                        <Input
                                            list="authors-list"
                                            value={formData.author}
                                            onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                                            placeholder="Your name"
                                        />
                                        <datalist id="authors-list">
                                            {authors.map((author, idx) => (
                                                <option key={idx} value={author} />
                                            ))}
                                        </datalist>
                                    </div>
                                    {authors.length > 0 && (
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Or select from existing authors above
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-sm">Category</Label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                                    >
                                        <option value="">Select or type new category</option>
                                        {categories.map((cat) => (
                                            <option key={cat.id} value={cat.name}>
                                                {cat.name}
                                            </option>
                                        ))}
                                    </select>
                                    {formData.category && !categories.find(c => c.name === formData.category) && (
                                        <p className="text-xs text-muted-foreground mt-1">
                                            New category will be created
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm">Tags</Label>
                                <div className="relative">
                                    <Input
                                        list="tags-list"
                                        value={formData.tags}
                                        onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                                        placeholder="ai, machine-learning, technology"
                                    />
                                    <datalist id="tags-list">
                                        {existingTags.map((tag, idx) => (
                                            <option key={idx} value={tag} />
                                        ))}
                                    </datalist>
                                </div>
                                {existingTags.length > 0 && (
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        <span className="text-xs text-muted-foreground">Suggestions:</span>
                                        {existingTags.slice(0, 10).map((tag, idx) => (
                                            <button
                                                key={idx}
                                                type="button"
                                                onClick={() => {
                                                    const currentTags = formData.tags ? formData.tags.split(',').map(t => t.trim()) : [];
                                                    if (!currentTags.includes(tag)) {
                                                        setFormData({ 
                                                            ...formData, 
                                                            tags: [...currentTags, tag].join(', ') 
                                                        });
                                                    }
                                                }}
                                                className="text-xs px-2 py-1 bg-muted hover:bg-muted/80 rounded-md"
                                            >
                                                + {tag}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* SEO Settings */}
                        <div className="pt-8 border-t space-y-6">
                            <h3 className="text-sm font-semibold">SEO Settings</h3>
                            
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="meta_title">Meta Title</Label>
                                    <Input
                                        id="meta_title"
                                        value={formData.meta_title}
                                        onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                                        placeholder="SEO page title (defaults to post title if empty)"
                                        className="mt-2"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="meta_description">Meta Description</Label>
                                    <Textarea
                                        id="meta_description"
                                        value={formData.meta_description}
                                        onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                                        placeholder="SEO meta description (defaults to excerpt if empty)"
                                        rows={3}
                                        className="mt-2"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="meta_keywords">Meta Keywords</Label>
                                    <Input
                                        id="meta_keywords"
                                        value={formData.meta_keywords}
                                        onChange={(e) => setFormData({ ...formData, meta_keywords: e.target.value })}
                                        placeholder="keyword1, keyword2, keyword3"
                                        className="mt-2"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="canonical_url">Canonical URL</Label>
                                    <Input
                                        id="canonical_url"
                                        value={formData.canonical_url}
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
                                                value={formData.og_title}
                                                onChange={(e) => setFormData({ ...formData, og_title: e.target.value })}
                                                placeholder="Social sharing title"
                                                className="mt-2"
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="og_description">OG Description</Label>
                                            <Textarea
                                                id="og_description"
                                                value={formData.og_description}
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
                                                value={formData.og_image}
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
                                        value={formData.schema_markup}
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
