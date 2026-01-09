"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { sanitizeArticleContent } from '@/lib/utils/sanitize';

interface LivePreviewProps {
    content: any;
    schema: string;
}

export function LivePreview({ content, schema }: LivePreviewProps) {
    const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
    const [isVisible, setIsVisible] = useState(true);

    const deviceSizes = {
        desktop: 'w-full',
        tablet: 'w-[768px]',
        mobile: 'w-[375px]',
    };

    const renderPreview = () => {
        if (schema === 'post') {
            return (
                <article className="bg-white overflow-hidden">
                    {content.featured_image && (
                        <img
                            src={content.featured_image}
                            alt={content.title}
                            className="w-full h-64 object-cover"
                        />
                    )}
                    <div className="p-8">
                        {content.category && (
                            <span className="inline-block px-2 py-1 bg-[#F9FAFB] text-[#6B7280] rounded text-xs font-medium mb-4">
                                {content.category}
                            </span>
                        )}
                        <h1 className="text-2xl font-semibold mb-4 text-[#111827]">{content.title || 'Untitled Post'}</h1>
                        {content.excerpt && (
                            <p className="text-[#6B7280] text-sm mb-6">{content.excerpt}</p>
                        )}
                        <div
                            className="prose prose-sm max-w-none text-[#111827]"
                            dangerouslySetInnerHTML={{ __html: sanitizeArticleContent(content.content || '<p>Start writing...</p>') }}
                        />
                        {content.author && (
                            <div className="mt-8 pt-6 border-t border-[#E5E7EB] flex items-center gap-3">
                                <div className="w-10 h-10 bg-[#F3F4F6] rounded-full flex items-center justify-center text-[#6B7280] text-sm font-medium">
                                    {content.author[0]}
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-[#111827]">{content.author}</p>
                                    <p className="text-xs text-[#6B7280]">Author</p>
                                </div>
                            </div>
                        )}
                    </div>
                </article>
            );
        }

        return <div className="p-8 text-center text-[#6B7280] text-sm">Preview not available</div>;
    };

    return (
        <div className="h-full flex flex-col bg-muted/30">
            {/* Preview Controls - Sanity style */}
            <div className="flex items-center justify-between p-3 bg-white border-b border-[#E5E7EB]">
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => setDevice('desktop')}
                        className={`p-1.5 rounded transition-colors duration-150 ${device === 'desktop' ? 'bg-[#F3F4F6] text-[#111827]' : 'text-[#6B7280] hover:bg-[#F9FAFB]'
                            }`}
                        title="Desktop"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                    </button>
                    <button
                        onClick={() => setDevice('tablet')}
                        className={`p-1.5 rounded transition-colors duration-150 ${device === 'tablet' ? 'bg-[#F3F4F6] text-[#111827]' : 'text-[#6B7280] hover:bg-[#F9FAFB]'
                            }`}
                        title="Tablet"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                    </button>
                    <button
                        onClick={() => setDevice('mobile')}
                        className={`p-1.5 rounded transition-colors duration-150 ${device === 'mobile' ? 'bg-[#F3F4F6] text-[#111827]' : 'text-[#6B7280] hover:bg-[#F9FAFB]'
                            }`}
                        title="Mobile"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                    </button>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-xs text-[#6B7280]">Live Preview</span>
                    <div className="w-1.5 h-1.5 bg-[#10B981] rounded-full" />
                </div>
            </div>

            {/* Preview Area - Sanity style */}
            <div className="flex-1 overflow-auto p-4 flex items-start justify-center bg-[#F9FAFB]">
                <motion.div
                    key={device}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.15 }}
                    className={`${deviceSizes[device]} mx-auto transition-all`}
                >
                    <div className="bg-[#E5E7EB] p-2 rounded-md">
                        <div className="bg-white overflow-hidden" style={{ minHeight: '600px' }}>
                            {renderPreview()}
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}





