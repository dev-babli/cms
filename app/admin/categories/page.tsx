"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Category } from "@/lib/cms/types";
import { useRouter } from "next/navigation";
import { PremiumAdminHeader } from "@/components/ui/premium-admin-header";

export default function CategoriesList() {
    const router = useRouter();
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [authenticated, setAuthenticated] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        slug: "",
        description: "",
        content_type: "blog" as "blog" | "ebook" | "case_study" | "whitepaper" | "all",
        color: "#3b82f6",
        icon: "",
    });

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const res = await fetch("/api/auth/check");
            if (res.ok) {
                setAuthenticated(true);
                fetchCategories();
            } else {
                router.push("/auth/login");
            }
        } catch (error) {
            router.push("/auth/login");
        }
    };

    const fetchCategories = async () => {
        try {
            const res = await fetch("/api/cms/categories");
            const data = await res.json();
            if (data.success) {
                setCategories(data.data);
            }
        } catch (error) {
            console.error("Failed to fetch categories:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.name.trim()) {
            alert("Please enter a category name");
            return;
        }

        try {
            const res = await fetch("/api/cms/categories", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    slug: formData.slug || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
                }),
            });

            if (res.ok) {
                setShowForm(false);
                setFormData({ name: "", slug: "", description: "", content_type: "blog", color: "#3b82f6", icon: "" });
                fetchCategories();
            } else {
                const data = await res.json();
                alert(`Failed to create category: ${data.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error creating category:', error);
            alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this category?")) return;

        try {
            const res = await fetch(`/api/cms/categories/${id}`, { method: "DELETE" });
            if (res.ok) {
                fetchCategories();
            }
        } catch (error) {
            console.error("Failed to delete category:", error);
        }
    };

    if (!authenticated || loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-600">Loading categories...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
            <PremiumAdminHeader
                title="Categories"
                description={`${categories.length} ${categories.length === 1 ? 'category' : 'categories'} total`}
                backLink="/admin"
                backText="Dashboard"
            >
                <Button 
                    size="lg" 
                    className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/30"
                    onClick={() => setShowForm(!showForm)}
                >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    {showForm ? "Cancel" : "New Category"}
                </Button>
            </PremiumAdminHeader>

            <div className="max-w-7xl mx-auto px-6 py-12">
                {showForm && (
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8">
                        <h2 className="text-xl font-bold text-slate-900 mb-6">Create New Category</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="name">Name *</Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Category name"
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="slug">Slug</Label>
                                    <Input
                                        id="slug"
                                        value={formData.slug}
                                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                        placeholder="Auto-generated from name"
                                    />
                                </div>
                            </div>
                            <div>
                                <Label htmlFor="description">Description</Label>
                                <Input
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Category description"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="content_type">Content Type</Label>
                                    <select
                                        id="content_type"
                                        value={formData.content_type}
                                        onChange={(e) => setFormData({ ...formData, content_type: e.target.value as any })}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                                    >
                                        <option value="blog">Blog</option>
                                        <option value="ebook">eBook</option>
                                        <option value="case_study">Case Study</option>
                                        <option value="whitepaper">Whitepaper</option>
                                        <option value="all">All Types</option>
                                    </select>
                                </div>
                                <div>
                                    <Label htmlFor="color">Color</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            id="color"
                                            type="color"
                                            value={formData.color}
                                            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                            className="w-16 h-10"
                                        />
                                        <Input
                                            value={formData.color}
                                            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                            placeholder="#3b82f6"
                                            className="flex-1"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-end gap-4">
                                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
                                    Create Category
                                </Button>
                            </div>
                        </form>
                    </div>
                )}

                {categories.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-16 text-center">
                        <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-slate-900 mb-2">No categories yet</h3>
                        <p className="text-slate-600 mb-6">Create your first category to organize content</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {categories.map((category) => (
                            <div
                                key={category.id}
                                className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-xl hover:border-blue-300 transition-all duration-300"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        {category.icon && (
                                            <span className="text-2xl">{category.icon}</span>
                                        )}
                                        <div>
                                            <h3 className="text-lg font-bold text-slate-900">{category.name}</h3>
                                            <span 
                                                className="inline-block px-2 py-1 text-xs font-semibold rounded-full mt-1"
                                                style={{ 
                                                    backgroundColor: `${category.color}20`,
                                                    color: category.color 
                                                }}
                                            >
                                                {category.content_type || 'blog'}
                                            </span>
                                        </div>
                                    </div>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => handleDelete(category.id!)}
                                        className="bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </Button>
                                </div>
                                {category.description && (
                                    <p className="text-sm text-slate-600 mb-4">{category.description}</p>
                                )}
                                <p className="text-xs text-slate-400">/{category.slug}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

