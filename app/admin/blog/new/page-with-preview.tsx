"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RichTextEditor } from "@/components/cms/rich-text-editor";
import { LivePreview } from "@/components/cms/live-preview";
import { FadeIn } from "@/components/ui/scroll-reveal";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function NewBlogPostWithPreview() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [showPreview, setShowPreview] = useState(true);
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch("/api/cms/blog", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    publish_date: new Date().toISOString(),
                }),
            });

            if (res.ok) {
                router.push("/admin/blog");
            } else {
                alert("Failed to create post");
            }
        } catch (error) {
            alert("Error creating post");
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

    return (
        <div className="min-h-screen bg-gradient-to-br from-sky-blue-900 via-turquoise-900 to-pine-green text-white">
            {/* Top Bar */}
            <div className="border-b border-white/10 backdrop-blur-sm bg-white/5 sticky top-0 z-50">
                <div className="px-[5%] py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link href="/admin/blog">
                                <button className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl backdrop-blur-sm border border-white/20 transition-all">
                                    ← Back
                                </button>
                            </Link>
                            <h1 className="text-xl font-bold">Create New Post</h1>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => setShowPreview(!showPreview)}
                                className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl backdrop-blur-sm border border-white/20 transition-all text-sm"
                            >
                                {showPreview ? '👁️ Hide' : '👁️ Show'} Preview
                            </button>
                            <Button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="bg-gradient-to-r from-turquoise to-sky-blue font-bold shadow-lg"
                            >
                                {loading ? 'Publishing...' : formData.published ? '🚀 Publish' : '💾 Save Draft'}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Editor Layout - Split Screen */}
            <div className="flex h-[calc(100vh-80px)]">
                {/* Left: Form Editor */}
                <div className={`${showPreview ? 'w-1/2' : 'w-full'} overflow-auto p-6 border-r border-white/10 transition-all`}>
                    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl mx-auto">
                        {/* Title */}
                        <motion.div
                            className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20"
                            whileHover={{ scale: 1.01 }}
                        >
                            <Label className="text-white text-sm font-semibold mb-2 block">
                                Title *
                            </Label>
                            <Input
                                required
                                value={formData.title}
                                onChange={(e) => {
                                    setFormData({
                                        ...formData,
                                        title: e.target.value,
                                        slug: formData.slug || generateSlug(e.target.value),
                                    });
                                }}
                                placeholder="Enter title..."
                                className="bg-white/10 border-white/20 text-white placeholder:text-white/50 h-14 text-xl font-semibold"
                            />
                        </motion.div>

                        {/* Slug */}
                        <motion.div
                            className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20"
                            whileHover={{ scale: 1.01 }}
                        >
                            <Label className="text-white text-sm font-semibold mb-2 block">
                                Slug
                            </Label>
                            <Input
                                value={formData.slug}
                                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                            />
                        </motion.div>

                        {/* Content */}
                        <motion.div
                            className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20"
                        >
                            <Label className="text-white text-sm font-semibold mb-4 block">
                                Content ✨
                            </Label>
                            <div className="bg-white rounded-xl overflow-hidden">
                                <RichTextEditor
                                    content={formData.content}
                                    onChange={(content) => setFormData({ ...formData, content })}
                                />
                            </div>
                        </motion.div>

                        {/* Other fields... */}
                        <motion.div
                            className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20"
                        >
                            <Label className="text-white text-sm font-semibold mb-2 block">
                                Excerpt
                            </Label>
                            <Textarea
                                value={formData.excerpt}
                                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                                className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                                rows={3}
                            />
                        </motion.div>

                        {/* Meta fields grid */}
                        <div className="grid grid-cols-2 gap-4">
                            <motion.div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                                <Label className="text-white text-sm font-semibold mb-2 block">Author</Label>
                                <Input
                                    value={formData.author}
                                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                                />
                            </motion.div>

                            <motion.div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                                <Label className="text-white text-sm font-semibold mb-2 block">Category</Label>
                                <Input
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                                />
                            </motion.div>
                        </div>

                        {/* Featured Image */}
                        <motion.div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                            <Label className="text-white text-sm font-semibold mb-2 block">Featured Image</Label>
                            <Input
                                value={formData.featured_image}
                                onChange={(e) => setFormData({ ...formData, featured_image: e.target.value })}
                                placeholder="https://images.unsplash.com/..."
                                className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                            />
                        </motion.div>

                        {/* Publish */}
                        <motion.div className="bg-gradient-to-r from-turquoise/20 to-sky-blue/20 backdrop-blur-xl rounded-2xl p-6 border-2 border-turquoise/30">
                            <div className="flex items-center space-x-3">
                                <Checkbox
                                    id="published"
                                    checked={formData.published}
                                    onCheckedChange={(checked) =>
                                        setFormData({ ...formData, published: !!checked })
                                    }
                                    className="border-white/40"
                                />
                                <Label htmlFor="published" className="text-white font-semibold cursor-pointer">
                                    {formData.published ? "🚀 Published" : "💾 Draft"}
                                </Label>
                            </div>
                        </motion.div>
                    </form>
                </div>

                {/* Right: Live Preview */}
                <AnimatePresence>
                    {showPreview && (
                        <motion.div
                            initial={{ opacity: 0, x: 100 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 100 }}
                            className="w-1/2"
                        >
                            <LivePreview content={formData} schema="post" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}



