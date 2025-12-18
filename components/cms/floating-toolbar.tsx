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
                const { $anchor, $head } = editor.state.selection;
                // Use both anchor and head to get better positioning
                const startCoords = editor.view.coordsAtPos(Math.min(from, to));
                const endCoords = editor.view.coordsAtPos(Math.max(from, to));
                const editorRect = editor.view.dom.getBoundingClientRect();
                const viewportHeight = window.innerHeight;
                const toolbarHeight = 50; // Approximate toolbar height
                
                // Calculate position based on selection midpoint
                const midTop = (startCoords.top + endCoords.top) / 2;
                const midLeft = (startCoords.left + endCoords.left) / 2;
                
                // Check if we're near the bottom of the viewport
                const spaceBelow = viewportHeight - midTop;
                const spaceAbove = midTop;
                
                // Position toolbar above selection if near bottom, below if near top
                let topOffset;
                if (spaceBelow < toolbarHeight + 20 && spaceAbove > spaceBelow) {
                    // Position above selection
                    topOffset = midTop - editorRect.top - toolbarHeight - 10;
                } else {
                    // Position below selection
                    topOffset = midTop - editorRect.top + 10;
                }
                
                // Ensure toolbar stays within editor bounds
                topOffset = Math.max(0, Math.min(topOffset, editorRect.height - toolbarHeight));
                
                // Calculate left position, ensuring it stays within editor bounds
                let leftOffset = midLeft - editorRect.left;
                const toolbarWidth = 300; // Approximate toolbar width
                leftOffset = Math.max(0, Math.min(leftOffset, editorRect.width - toolbarWidth));
                
                setPosition({
                    top: topOffset,
                    left: leftOffset,
                });
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        editor.on('selectionUpdate', updatePosition);
        editor.on('transaction', updatePosition);
        // Also listen to scroll events to update position
        const handleScroll = () => {
            if (editor.state.selection.from !== editor.state.selection.to) {
                updatePosition();
            }
        };
        window.addEventListener('scroll', handleScroll, true);

        return () => {
            editor.off('selectionUpdate', updatePosition);
            editor.off('transaction', updatePosition);
            window.removeEventListener('scroll', handleScroll, true);
        };
    }, [editor]);

    if (!isVisible) return null;

    const editorRect = editor.view.dom.getBoundingClientRect();
    
    return (
        <div
            className="fixed z-50 bg-white border border-border rounded-lg shadow-xl p-2 flex items-center gap-1"
            style={{
                top: `${position.top + editorRect.top + window.scrollY}px`,
                left: `${position.left + editorRect.left}px`,
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


