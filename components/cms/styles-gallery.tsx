"use client";

import { Editor } from '@tiptap/core';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Heading1, Heading2, Heading3, Heading4, Heading5, Heading6, Type, List, Quote } from 'lucide-react';

interface StylesGalleryProps {
    editor: Editor;
}

const styles = [
    { name: 'Normal', type: 'paragraph', icon: Type, command: () => {} },
    { name: 'Heading 1', type: 'heading', level: 1, icon: Heading1, command: (editor: Editor) => editor.chain().focus().toggleHeading({ level: 1 }).run() },
    { name: 'Heading 2', type: 'heading', level: 2, icon: Heading2, command: (editor: Editor) => editor.chain().focus().toggleHeading({ level: 2 }).run() },
    { name: 'Heading 3', type: 'heading', level: 3, icon: Heading3, command: (editor: Editor) => editor.chain().focus().toggleHeading({ level: 3 }).run() },
    { name: 'Heading 4', type: 'heading', level: 4, icon: Heading4, command: (editor: Editor) => editor.chain().focus().toggleHeading({ level: 4 }).run() },
    { name: 'Heading 5', type: 'heading', level: 5, icon: Heading5, command: (editor: Editor) => editor.chain().focus().toggleHeading({ level: 5 }).run() },
    { name: 'Heading 6', type: 'heading', level: 6, icon: Heading6, command: (editor: Editor) => editor.chain().focus().toggleHeading({ level: 6 }).run() },
    { name: 'Bullet List', type: 'bulletList', icon: List, command: (editor: Editor) => editor.chain().focus().toggleBulletList().run() },
    { name: 'Quote', type: 'blockquote', icon: Quote, command: (editor: Editor) => editor.chain().focus().toggleBlockquote().run() },
];

export function StylesGallery({ editor }: StylesGalleryProps) {
    const [showGallery, setShowGallery] = useState(false);

    const getActiveStyle = () => {
        if (editor.isActive('heading', { level: 1 })) return 'Heading 1';
        if (editor.isActive('heading', { level: 2 })) return 'Heading 2';
        if (editor.isActive('heading', { level: 3 })) return 'Heading 3';
        if (editor.isActive('heading', { level: 4 })) return 'Heading 4';
        if (editor.isActive('heading', { level: 5 })) return 'Heading 5';
        if (editor.isActive('heading', { level: 6 })) return 'Heading 6';
        if (editor.isActive('bulletList')) return 'Bullet List';
        if (editor.isActive('blockquote')) return 'Quote';
        return 'Normal';
    };

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => setShowGallery(!showGallery)}
                className="h-9 px-4 text-sm border border-border bg-background rounded-md hover:bg-muted transition-all duration-200 flex items-center gap-2 min-w-[140px] justify-between hover:scale-105 active:scale-95"
            >
                <span className="flex items-center gap-2">
                    <Type className="w-4 h-4" />
                    {getActiveStyle()}
                </span>
                <span className="text-xs text-muted-foreground">▼</span>
            </button>
            {showGallery && (
                <div className="absolute top-full left-0 mt-2 bg-white border border-border rounded-lg shadow-2xl z-50 min-w-[200px] py-2 animate-in slide-in-from-top-2 fade-in-0 duration-200 max-h-[300px] overflow-y-auto smooth-scroll">
                    {styles.map((style) => {
                        const Icon = style.icon;
                        const isActive = 
                            (style.type === 'heading' && editor.isActive('heading', { level: style.level })) ||
                            (style.type === 'bulletList' && editor.isActive('bulletList')) ||
                            (style.type === 'blockquote' && editor.isActive('blockquote')) ||
                            (style.name === 'Normal' && !editor.isActive('heading') && !editor.isActive('bulletList') && !editor.isActive('blockquote'));

                        return (
                            <button
                                key={style.name}
                                type="button"
                                onClick={() => {
                                    style.command(editor);
                                    setShowGallery(false);
                                }}
                                className={`w-full px-4 py-2.5 text-left text-sm flex items-center gap-2.5 hover:bg-muted transition-all duration-150 ${
                                    isActive ? 'bg-primary/10 text-primary font-semibold ring-1 ring-primary/20' : 'text-foreground'
                                }`}
                            >
                                <Icon className="w-4 h-4" />
                                {style.name}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

