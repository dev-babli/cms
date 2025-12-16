"use client";

import { Editor } from '@tiptap/core';
import { useEffect, useState } from 'react';

interface StatisticsBarProps {
    editor: Editor;
}

export function StatisticsBar({ editor }: StatisticsBarProps) {
    const [stats, setStats] = useState({
        words: 0,
        characters: 0,
        charactersNoSpaces: 0,
        paragraphs: 0,
        headings: 0,
        readingTime: 0,
    });

    useEffect(() => {
        const updateStats = () => {
            const text = editor.getText();
            const html = editor.getHTML();
            
            const words = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
            const characters = text.length;
            const charactersNoSpaces = text.replace(/\s/g, '').length;
            const paragraphs = (html.match(/<p[^>]*>/g) || []).length;
            const headings = (html.match(/<h[1-6][^>]*>/g) || []).length;
            const readingTime = Math.ceil(words / 200);

            setStats({
                words,
                characters,
                charactersNoSpaces,
                paragraphs,
                headings,
                readingTime,
            });
        };

        updateStats();
        
        editor.on('update', updateStats);
        editor.on('selectionUpdate', updateStats);

        return () => {
            editor.off('update', updateStats);
            editor.off('selectionUpdate', updateStats);
        };
    }, [editor]);

    return (
        <div className="flex items-center gap-4 px-6 py-3 bg-gradient-to-r from-blue-50/30 via-purple-50/30 to-pink-50/30 border-t border-border/60 text-xs text-muted-foreground overflow-x-auto smooth-scroll">
            <div className="flex items-center gap-1.5 whitespace-nowrap">
                <span className="font-medium text-foreground">Words:</span>
                <span className="font-semibold text-primary">{stats.words.toLocaleString()}</span>
            </div>
            <div className="w-px h-4 bg-border" />
            <div className="flex items-center gap-1.5 whitespace-nowrap">
                <span className="font-medium text-foreground">Characters:</span>
                <span className="font-semibold text-primary">{stats.characters.toLocaleString()}</span>
            </div>
            <div className="w-px h-4 bg-border" />
            <div className="flex items-center gap-1.5 whitespace-nowrap">
                <span className="font-medium text-foreground">No Spaces:</span>
                <span className="font-semibold text-primary">{stats.charactersNoSpaces.toLocaleString()}</span>
            </div>
            <div className="w-px h-4 bg-border" />
            <div className="flex items-center gap-1.5 whitespace-nowrap">
                <span className="font-medium text-foreground">Paragraphs:</span>
                <span className="font-semibold text-primary">{stats.paragraphs}</span>
            </div>
            <div className="w-px h-4 bg-border" />
            <div className="flex items-center gap-1.5 whitespace-nowrap">
                <span className="font-medium text-foreground">Headings:</span>
                <span className="font-semibold text-primary">{stats.headings}</span>
            </div>
            <div className="w-px h-4 bg-border ml-auto" />
            <div className="flex items-center gap-1.5 whitespace-nowrap">
                <span className="font-medium text-foreground">Reading time:</span>
                <span className="font-semibold text-primary">~{stats.readingTime} min</span>
            </div>
        </div>
    );
}

