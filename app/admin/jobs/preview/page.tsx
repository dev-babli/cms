"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { sanitizeArticleContent, sanitizeTitle, stripHtml } from "@/lib/utils/sanitize";

export default function JobPreviewPage() {
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
                    <p className="text-slate-600">Please go back and create a job posting to preview.</p>
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
                    <span>📄 Preview Mode - Job Posting</span>
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
                    <h1 className="text-4xl font-bold text-slate-900 mb-4">
                        {previewData.title}
                    </h1>
                    <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                        {previewData.location && (
                            <span className="flex items-center gap-1">
                                📍 {previewData.location}
                            </span>
                        )}
                        {previewData.employment_type && (
                            <span className="flex items-center gap-1">
                                💼 {previewData.employment_type}
                            </span>
                        )}
                        {previewData.remote && (
                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                                Remote
                            </span>
                        )}
                        {previewData.salary_range && (
                            <span className="flex items-center gap-1">
                                💰 {previewData.salary_range}
                            </span>
                        )}
                    </div>
                    {previewData.categories && (
                        <div className="mt-4 flex flex-wrap gap-2">
                            {previewData.categories.split(',').map((cat: string, idx: number) => (
                                <span
                                    key={idx}
                                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold"
                                >
                                    {cat.trim()}
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                {/* Description */}
                {previewData.description && (
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">Description</h2>
                        <div
                            className="prose prose-lg max-w-none mb-8"
                            dangerouslySetInnerHTML={{ __html: sanitizeArticleContent(previewData.description) }}
                        />
                    </div>
                )}

                {/* Requirements */}
                {previewData.requirements && (
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">Requirements</h2>
                        <div
                            className="prose prose-lg max-w-none mb-8"
                            dangerouslySetInnerHTML={{ __html: sanitizeArticleContent(previewData.requirements) }}
                        />
                    </div>
                )}

                {/* Skills */}
                {previewData.skills && (
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">Skills</h2>
                        <div
                            className="prose prose-lg max-w-none mb-8"
                            dangerouslySetInnerHTML={{ __html: sanitizeArticleContent(previewData.skills) }}
                        />
                    </div>
                )}

                {/* Apply Button */}
                {previewData.apply_url && (
                    <div className="mt-8 pt-8 border-t">
                        <a
                            href={previewData.apply_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                        >
                            Apply Now →
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
}
