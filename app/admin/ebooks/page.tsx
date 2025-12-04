"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { Ebook } from "@/lib/cms/types";
import { useRouter } from "next/navigation";
import { PremiumAdminHeader } from "@/components/ui/premium-admin-header";

export default function EbooksList() {
    const router = useRouter();
    const [ebooks, setEbooks] = useState<Ebook[]>([]);
    const [loading, setLoading] = useState(true);
    const [authenticated, setAuthenticated] = useState(false);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const res = await fetch("/api/auth/check");
            if (res.ok) {
                setAuthenticated(true);
                fetchEbooks();
            } else {
                router.push("/auth/login");
            }
        } catch (error) {
            router.push("/auth/login");
        }
    };

    const fetchEbooks = async () => {
        try {
            const res = await fetch("/api/cms/ebooks");
            const data = await res.json();
            if (data.success) {
                setEbooks(data.data);
            }
        } catch (error) {
            console.error("Failed to fetch eBooks:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this eBook?")) return;

        try {
            const res = await fetch(`/api/cms/ebooks/${id}`, { method: "DELETE" });
            if (res.ok) {
                fetchEbooks();
            }
        } catch (error) {
            console.error("Failed to delete eBook:", error);
        }
    };

    if (!authenticated || loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-600">Loading eBooks...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
            <PremiumAdminHeader
                title="eBooks"
                description={`${ebooks.length} ${ebooks.length === 1 ? 'eBook' : 'eBooks'} total`}
                backLink="/admin"
                backText="Dashboard"
            >
                <Link href="/admin/ebooks/new">
                    <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/30">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        New eBook
                    </Button>
                </Link>
            </PremiumAdminHeader>

            <div className="max-w-7xl mx-auto px-6 py-12">
                {ebooks.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-16 text-center">
                        <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-slate-900 mb-2">No eBooks yet</h3>
                        <p className="text-slate-600 mb-6">Create your first eBook to start capturing leads</p>
                        <Link href="/admin/ebooks/new">
                            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
                                Create Your First eBook
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {ebooks.map((ebook) => (
                            <div
                                key={ebook.id}
                                className="group bg-white rounded-2xl shadow-sm border border-slate-200 hover:shadow-xl hover:border-blue-300 transition-all duration-300 overflow-hidden"
                            >
                                {/* Cover Image */}
                                {ebook.cover_image && (
                                    <div className="relative h-48 overflow-hidden bg-gradient-to-br from-slate-100 to-slate-50">
                                        <img
                                            src={ebook.cover_image}
                                            alt={ebook.title}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        />
                                        <div className="absolute top-4 right-4 flex gap-2">
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm border ${
                                                    ebook.published
                                                        ? "bg-green-500/90 text-white border-green-400"
                                                        : "bg-yellow-500/90 text-white border-yellow-400"
                                                }`}
                                            >
                                                {ebook.published ? "Published" : "Draft"}
                                            </span>
                                            {ebook.gated && (
                                                <span className="px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm bg-blue-500/90 text-white border border-blue-400">
                                                    Gated
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <div className="p-6">
                                    {/* Title */}
                                    <h3 className="text-xl font-bold mb-2 text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 min-h-[3.5rem]">
                                        {ebook.title}
                                    </h3>

                                    {/* Excerpt */}
                                    {ebook.excerpt && (
                                        <p className="text-slate-600 text-sm mb-4 line-clamp-3 leading-relaxed">
                                            {ebook.excerpt}
                                        </p>
                                    )}

                                    {/* Meta Info */}
                                    <div className="flex items-center justify-between text-xs text-slate-500 mb-4 pb-4 border-b border-slate-100">
                                        <div className="flex items-center gap-2">
                                            {ebook.author && (
                                                <>
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                    </svg>
                                                    <span>{ebook.author}</span>
                                                </>
                                            )}
                                        </div>
                                        {ebook.download_count !== undefined && (
                                            <span className="flex items-center gap-1">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                </svg>
                                                {ebook.download_count}
                                            </span>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2">
                                        <Link
                                            href={`/admin/ebook/edit/${ebook.id}`}
                                            className="flex-1"
                                        >
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="w-full border-slate-300 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50"
                                            >
                                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                                Edit
                                            </Button>
                                        </Link>
                                        <Link
                                            href={`/admin/ebook/preview/${ebook.id}`}
                                            target="_blank"
                                        >
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="border-slate-300 hover:border-green-500 hover:text-green-600 hover:bg-green-50"
                                            >
                                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                                Preview
                                            </Button>
                                        </Link>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => handleDelete(ebook.id!)}
                                            className="bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
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
    );
}

