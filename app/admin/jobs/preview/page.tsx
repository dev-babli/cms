"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { sanitizeArticleContent, sanitizeTitle, stripHtml } from "@/lib/utils/sanitize";

function JobPreviewContent() {
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
                            className="prose prose-lg prose-slate max-w-none mb-8
                                prose-headings:text-slate-900 prose-headings:font-bold
                                prose-h1:text-3xl prose-h1:mb-6 prose-h1:mt-12 prose-h1:tracking-tight
                                prose-h2:text-2xl prose-h2:mb-4 prose-h2:mt-10 prose-h2:tracking-tight
                                prose-h3:text-xl prose-h3:mb-3 prose-h3:mt-8 prose-h3:tracking-tight prose-h3:font-bold
                                prose-h4:text-lg prose-h4:mb-3 prose-h4:mt-6 prose-h4:tracking-tight prose-h4:font-bold
                                prose-h5:text-base prose-h5:mb-2 prose-h5:mt-4 prose-h5:tracking-tight prose-h5:font-semibold
                                prose-h6:text-sm prose-h6:mb-2 prose-h6:mt-4 prose-h6:tracking-tight prose-h6:font-semibold prose-h6:uppercase prose-h6:tracking-wider
                                prose-p:text-slate-700 prose-p:leading-relaxed prose-p:mb-6 prose-p:text-lg
                                prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-a:font-medium
                                prose-strong:text-slate-900 prose-strong:font-semibold
                                prose-ul:list-disc prose-ul:list-outside prose-ul:pl-6 prose-ul:mb-6 prose-ul:text-lg
                                prose-ol:list-decimal prose-ol:list-outside prose-ol:pl-6 prose-ol:mb-6 prose-ol:text-lg
                                prose-li:text-slate-700 prose-li:mb-2 prose-li:leading-relaxed prose-li:pl-2
                                prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:pl-6 prose-blockquote:italic prose-blockquote:text-slate-600 prose-blockquote:bg-slate-50 prose-blockquote:py-4 prose-blockquote:my-6
                                prose-code:text-blue-600 prose-code:bg-slate-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono
                                prose-pre:bg-slate-900 prose-pre:text-slate-100 prose-pre:rounded-lg prose-pre:p-4 prose-pre:shadow-xl
                                prose-img:rounded-xl prose-img:shadow-xl prose-img:my-10 prose-img:w-full
                                prose-hr:border-slate-200 prose-hr:my-10
                                [&_u]:underline
                                [&_mark]:bg-yellow-200 [&_mark]:px-0.5 [&_mark]:rounded
                                [&_sub]:text-xs [&_sub]:align-sub
                                [&_sup]:text-xs [&_sup]:align-super
                                [&_span[style*='color']]:[color:inherit]
                                [&_span[style*='background-color']]:[background-color:inherit]
                                [&_span[style*='font-size']]:[font-size:inherit]
                                [&_p[style*='text-align']]:[text-align:inherit]
                                [&_h1[style*='text-align']]:[text-align:inherit]
                                [&_h2[style*='text-align']]:[text-align:inherit]
                                [&_h3[style*='text-align']]:[text-align:inherit]
                                [&_h4[style*='text-align']]:[text-align:inherit]
                                [&_h5[style*='text-align']]:[text-align:inherit]
                                [&_h6[style*='text-align']]:[text-align:inherit]
                                [&_img[style*='float:left']]:float-left [&_img[style*='float:left']]:mr-4 [&_img[style*='float:left']]:mb-4
                                [&_img[style*='float:right']]:float-right [&_img[style*='float:right']]:ml-4 [&_img[style*='float:right']]:mb-4
                                [&_img[style*='display:block']]:block [&_img[style*='display:block']]:mx-auto"
                            dangerouslySetInnerHTML={{ __html: sanitizeArticleContent(previewData.description) }}
                        />
                    </div>
                )}

                {/* Requirements */}
                {previewData.requirements && (
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">Requirements</h2>
                        <div
                            className="prose prose-lg prose-slate max-w-none mb-8
                                prose-headings:text-slate-900 prose-headings:font-bold
                                prose-h1:text-3xl prose-h1:mb-6 prose-h1:mt-12 prose-h1:tracking-tight
                                prose-h2:text-2xl prose-h2:mb-4 prose-h2:mt-10 prose-h2:tracking-tight
                                prose-h3:text-xl prose-h3:mb-3 prose-h3:mt-8 prose-h3:tracking-tight prose-h3:font-bold
                                prose-h4:text-lg prose-h4:mb-3 prose-h4:mt-6 prose-h4:tracking-tight prose-h4:font-bold
                                prose-h5:text-base prose-h5:mb-2 prose-h5:mt-4 prose-h5:tracking-tight prose-h5:font-semibold
                                prose-h6:text-sm prose-h6:mb-2 prose-h6:mt-4 prose-h6:tracking-tight prose-h6:font-semibold prose-h6:uppercase prose-h6:tracking-wider
                                prose-p:text-slate-700 prose-p:leading-relaxed prose-p:mb-6 prose-p:text-lg
                                prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-a:font-medium
                                prose-strong:text-slate-900 prose-strong:font-semibold
                                prose-ul:list-disc prose-ul:list-outside prose-ul:pl-6 prose-ul:mb-6 prose-ul:text-lg
                                prose-ol:list-decimal prose-ol:list-outside prose-ol:pl-6 prose-ol:mb-6 prose-ol:text-lg
                                prose-li:text-slate-700 prose-li:mb-2 prose-li:leading-relaxed prose-li:pl-2
                                prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:pl-6 prose-blockquote:italic prose-blockquote:text-slate-600 prose-blockquote:bg-slate-50 prose-blockquote:py-4 prose-blockquote:my-6
                                prose-code:text-blue-600 prose-code:bg-slate-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono
                                prose-pre:bg-slate-900 prose-pre:text-slate-100 prose-pre:rounded-lg prose-pre:p-4 prose-pre:shadow-xl
                                prose-img:rounded-xl prose-img:shadow-xl prose-img:my-10 prose-img:w-full
                                prose-hr:border-slate-200 prose-hr:my-10
                                [&_u]:underline
                                [&_mark]:bg-yellow-200 [&_mark]:px-0.5 [&_mark]:rounded
                                [&_sub]:text-xs [&_sub]:align-sub
                                [&_sup]:text-xs [&_sup]:align-super
                                [&_span[style*='color']]:[color:inherit]
                                [&_span[style*='background-color']]:[background-color:inherit]
                                [&_span[style*='font-size']]:[font-size:inherit]
                                [&_p[style*='text-align']]:[text-align:inherit]
                                [&_h1[style*='text-align']]:[text-align:inherit]
                                [&_h2[style*='text-align']]:[text-align:inherit]
                                [&_h3[style*='text-align']]:[text-align:inherit]
                                [&_h4[style*='text-align']]:[text-align:inherit]
                                [&_h5[style*='text-align']]:[text-align:inherit]
                                [&_h6[style*='text-align']]:[text-align:inherit]
                                [&_img[style*='float:left']]:float-left [&_img[style*='float:left']]:mr-4 [&_img[style*='float:left']]:mb-4
                                [&_img[style*='float:right']]:float-right [&_img[style*='float:right']]:ml-4 [&_img[style*='float:right']]:mb-4
                                [&_img[style*='display:block']]:block [&_img[style*='display:block']]:mx-auto"
                            dangerouslySetInnerHTML={{ __html: sanitizeArticleContent(previewData.requirements) }}
                        />
                    </div>
                )}

                {/* Skills */}
                {previewData.skills && (
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">Skills</h2>
                        <div
                            className="prose prose-lg prose-slate max-w-none mb-8
                                prose-headings:text-slate-900 prose-headings:font-bold
                                prose-h1:text-3xl prose-h1:mb-6 prose-h1:mt-12 prose-h1:tracking-tight
                                prose-h2:text-2xl prose-h2:mb-4 prose-h2:mt-10 prose-h2:tracking-tight
                                prose-h3:text-xl prose-h3:mb-3 prose-h3:mt-8 prose-h3:tracking-tight prose-h3:font-bold
                                prose-h4:text-lg prose-h4:mb-3 prose-h4:mt-6 prose-h4:tracking-tight prose-h4:font-bold
                                prose-h5:text-base prose-h5:mb-2 prose-h5:mt-4 prose-h5:tracking-tight prose-h5:font-semibold
                                prose-h6:text-sm prose-h6:mb-2 prose-h6:mt-4 prose-h6:tracking-tight prose-h6:font-semibold prose-h6:uppercase prose-h6:tracking-wider
                                prose-p:text-slate-700 prose-p:leading-relaxed prose-p:mb-6 prose-p:text-lg
                                prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-a:font-medium
                                prose-strong:text-slate-900 prose-strong:font-semibold
                                prose-ul:list-disc prose-ul:list-outside prose-ul:pl-6 prose-ul:mb-6 prose-ul:text-lg
                                prose-ol:list-decimal prose-ol:list-outside prose-ol:pl-6 prose-ol:mb-6 prose-ol:text-lg
                                prose-li:text-slate-700 prose-li:mb-2 prose-li:leading-relaxed prose-li:pl-2
                                prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:pl-6 prose-blockquote:italic prose-blockquote:text-slate-600 prose-blockquote:bg-slate-50 prose-blockquote:py-4 prose-blockquote:my-6
                                prose-code:text-blue-600 prose-code:bg-slate-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono
                                prose-pre:bg-slate-900 prose-pre:text-slate-100 prose-pre:rounded-lg prose-pre:p-4 prose-pre:shadow-xl
                                prose-img:rounded-xl prose-img:shadow-xl prose-img:my-10 prose-img:w-full
                                prose-hr:border-slate-200 prose-hr:my-10
                                [&_u]:underline
                                [&_mark]:bg-yellow-200 [&_mark]:px-0.5 [&_mark]:rounded
                                [&_sub]:text-xs [&_sub]:align-sub
                                [&_sup]:text-xs [&_sup]:align-super
                                [&_span[style*='color']]:[color:inherit]
                                [&_span[style*='background-color']]:[background-color:inherit]
                                [&_span[style*='font-size']]:[font-size:inherit]
                                [&_p[style*='text-align']]:[text-align:inherit]
                                [&_h1[style*='text-align']]:[text-align:inherit]
                                [&_h2[style*='text-align']]:[text-align:inherit]
                                [&_h3[style*='text-align']]:[text-align:inherit]
                                [&_h4[style*='text-align']]:[text-align:inherit]
                                [&_h5[style*='text-align']]:[text-align:inherit]
                                [&_h6[style*='text-align']]:[text-align:inherit]
                                [&_img[style*='float:left']]:float-left [&_img[style*='float:left']]:mr-4 [&_img[style*='float:left']]:mb-4
                                [&_img[style*='float:right']]:float-right [&_img[style*='float:right']]:ml-4 [&_img[style*='float:right']]:mb-4
                                [&_img[style*='display:block']]:block [&_img[style*='display:block']]:mx-auto"
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

export default function JobPreviewPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        }>
            <JobPreviewContent />
        </Suspense>
    );
}
