"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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
                <article className="bg-white rounded-xl shadow-lg overflow-hidden">
                    {content.featured_image && (
                        <img
                            src={content.featured_image}
                            alt={content.title}
                            className="w-full h-64 object-cover"
                        />
                    )}
                    <div className="p-8">
                        {content.category && (
                            <span className="inline-block px-3 py-1 bg-turquoise/10 text-turquoise rounded-full text-xs font-semibold mb-4">
                                {content.category}
                            </span>
                        )}
                        <h1 className="text-4xl font-bold mb-4">{content.title || 'Untitled Post'}</h1>
                        {content.excerpt && (
                            <p className="text-muted-foreground text-lg mb-6">{content.excerpt}</p>
                        )}
                        <div
                            className="prose prose-lg max-w-none"
                            dangerouslySetInnerHTML={{ __html: content.content || '<p>Start writing...</p>' }}
                        />
                        {content.author && (
                            <div className="mt-8 pt-6 border-t flex items-center gap-3">
                                <div className="w-12 h-12 bg-gradient-to-br from-turquoise to-sky-blue rounded-full flex items-center justify-center text-white font-bold">
                                    {content.author[0]}
                                </div>
                                <div>
                                    <p className="font-semibold">{content.author}</p>
                                    <p className="text-sm text-muted-foreground">Author</p>
                                </div>
                            </div>
                        )}
                    </div>
                </article>
            );
        }

        return <div className="p-8 text-center text-muted-foreground">Preview not available</div>;
    };

    return (
        <div className="h-full flex flex-col bg-muted/30">
            {/* Preview Controls */}
            <div className="flex items-center justify-between p-4 bg-white border-b">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setDevice('desktop')}
                        className={`p-2 rounded-lg transition-colors ${device === 'desktop' ? 'bg-turquoise text-white' : 'hover:bg-muted'
                            }`}
                        title="Desktop"
                    >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z" clipRule="evenodd" />
                        </svg>
                    </button>
                    <button
                        onClick={() => setDevice('tablet')}
                        className={`p-2 rounded-lg transition-colors ${device === 'tablet' ? 'bg-turquoise text-white' : 'hover:bg-muted'
                            }`}
                        title="Tablet"
                    >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M7 2a2 2 0 00-2 2v12a2 2 0 002 2h6a2 2 0 002-2V4a2 2 0 00-2-2H7zm3 14a1 1 0 100-2 1 1 0 000 2z" />
                        </svg>
                    </button>
                    <button
                        onClick={() => setDevice('mobile')}
                        className={`p-2 rounded-lg transition-colors ${device === 'mobile' ? 'bg-turquoise text-white' : 'hover:bg-muted'
                            }`}
                        title="Mobile"
                    >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M7 2a2 2 0 00-2 2v12a2 2 0 002 2h6a2 2 0 002-2V4a2 2 0 00-2-2H7zm3 14a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Live Preview</span>
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                </div>
            </div>

            {/* Preview Area */}
            <div className="flex-1 overflow-auto p-6 flex items-start justify-center">
                <motion.div
                    key={device}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className={`${deviceSizes[device]} mx-auto transition-all`}
                >
                    <div className="bg-gray-100 rounded-xl p-4 shadow-2xl">
                        <div className="bg-white rounded-lg overflow-hidden" style={{ minHeight: '600px' }}>
                            {renderPreview()}
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}



