"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { sanitizeArticleContent, sanitizeTitle, stripHtml } from "@/lib/utils/sanitize";

function BlogPreviewContent() {
    const searchParams = useSearchParams();
    const [previewData, setPreviewData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const dataParam = searchParams.get('data');
        if (dataParam) {
            try {
                const decoded = JSON.parse(decodeURIComponent(dataParam));
                setPreviewData(decoded);
            } catch (error) {
                console.error('Failed to parse preview data:', error);
            }
        }
        setLoading(false);
    }, [searchParams]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!previewData || !previewData.title) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-slate-900 mb-2">No Preview Data</h1>
                    <p className="text-slate-600">Please go back and create a blog post to preview.</p>
                    <button
                        onClick={() => window.close()}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        Close
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
            {/* Preview Banner */}
            <div className="bg-yellow-500 text-white px-6 py-3 text-center font-semibold">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <span>📄 Preview Mode - Draft Blog Post</span>
                    <button
                        onClick={() => window.close()}
                        className="text-white hover:underline font-normal"
                    >
                        Close Preview
                    </button>
                </div>
            </div>

            {/* Content Preview */}
            <div className="max-w-4xl mx-auto px-6 py-12">
                {/* Header */}
                <div className="mb-8">
                    <h1
                        className="text-4xl font-bold text-slate-900 mb-4"
                        dangerouslySetInnerHTML={{ __html: sanitizeTitle(previewData.title) }}
                    />
                    {previewData.excerpt && (
                        <p className="text-xl text-slate-600 leading-relaxed">
                            {stripHtml(previewData.excerpt)}
                        </p>
                    )}
                    {previewData.author && (
                        <p className="text-sm text-slate-500 mt-4">By {previewData.author}</p>
                    )}
                    {previewData.category && (
                        <span className="inline-block mt-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                            {previewData.category}
                        </span>
                    )}
                    {previewData.tags && (
                        <div className="mt-2 flex flex-wrap gap-2">
                            {previewData.tags.split(',').map((tag: string, idx: number) => (
                                <span
                                    key={idx}
                                    className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                                >
                                    {tag.trim()}
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                {/* Featured Image */}
                {previewData.featured_image && (
                    <img
                        src={previewData.featured_image}
                        alt={previewData.title}
                        className="w-full h-auto rounded-lg mb-8"
                    />
                )}

                {/* Content */}
                {previewData.content && (
                    <div
                        className="prose prose-lg max-w-none mb-8"
                        dangerouslySetInnerHTML={{ __html: sanitizeArticleContent(previewData.content) }}
                    />
                )}

                {!previewData.content && (
                    <div className="text-center py-12 text-slate-400">
                        <p>No content yet. Add content in the editor to see it here.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function BlogPreviewPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        }>
            <BlogPreviewContent />
        </Suspense>
    );
}
