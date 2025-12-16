"use client";

import { Editor } from '@tiptap/core';
import { useState, useEffect } from 'react';
import { Bold, Italic, Underline, Link as LinkIcon, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';

interface FloatingToolbarProps {
    editor: Editor;
}

export function FloatingToolbar({ editor }: FloatingToolbarProps) {
    const [position, setPosition] = useState({ top: 0, left: 0 });
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const updatePosition = () => {
            const { from, to } = editor.state.selection;
            if (from !== to) {
                const { $anchor } = editor.state.selection;
                const coords = editor.view.coordsAtPos($anchor.pos);
                const editorRect = editor.view.dom.getBoundingClientRect();
                
                setPosition({
                    top: coords.top - editorRect.top - 50,
                    left: coords.left - editorRect.left,
                });
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        editor.on('selectionUpdate', updatePosition);
        editor.on('transaction', updatePosition);

        return () => {
            editor.off('selectionUpdate', updatePosition);
            editor.off('transaction', updatePosition);
        };
    }, [editor]);

    if (!isVisible) return null;

    return (
        <div
            className="absolute z-50 bg-white border border-border rounded-lg shadow-xl p-2 flex items-center gap-1"
            style={{
                top: `${position.top}px`,
                left: `${position.left}px`,
                transform: 'translateX(-50%)',
            }}
        >
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={`p-2 rounded-md hover:bg-muted transition-colors ${
                    editor.isActive('bold') ? 'bg-primary/10 text-primary' : ''
                }`}
                title="Bold"
            >
                <Bold className="w-4 h-4" />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={`p-2 rounded-md hover:bg-muted transition-colors ${
                    editor.isActive('italic') ? 'bg-primary/10 text-primary' : ''
                }`}
                title="Italic"
            >
                <Italic className="w-4 h-4" />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                className={`p-2 rounded-md hover:bg-muted transition-colors ${
                    editor.isActive('underline') ? 'bg-primary/10 text-primary' : ''
                }`}
                title="Underline"
            >
                <Underline className="w-4 h-4" />
            </button>
            <div className="w-px h-6 bg-border mx-1" />
            <button
                type="button"
                onClick={() => {
                    const url = prompt('Enter URL:');
                    if (url) {
                        editor.chain().focus().setLink({ href: url }).run();
                    }
                }}
                className="p-2 rounded-md hover:bg-muted transition-colors"
                title="Add Link"
            >
                <LinkIcon className="w-4 h-4" />
            </button>
            <div className="w-px h-6 bg-border mx-1" />
            <button
                type="button"
                onClick={() => editor.chain().focus().setTextAlign('left').run()}
                className={`p-2 rounded-md hover:bg-muted transition-colors ${
                    editor.isActive({ textAlign: 'left' }) ? 'bg-primary/10 text-primary' : ''
                }`}
                title="Align Left"
            >
                <AlignLeft className="w-4 h-4" />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().setTextAlign('center').run()}
                className={`p-2 rounded-md hover:bg-muted transition-colors ${
                    editor.isActive({ textAlign: 'center' }) ? 'bg-primary/10 text-primary' : ''
                }`}
                title="Align Center"
            >
                <AlignCenter className="w-4 h-4" />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().setTextAlign('right').run()}
                className={`p-2 rounded-md hover:bg-muted transition-colors ${
                    editor.isActive({ textAlign: 'right' }) ? 'bg-primary/10 text-primary' : ''
                }`}
                title="Align Right"
            >
                <AlignRight className="w-4 h-4" />
            </button>
        </div>
    );
}

