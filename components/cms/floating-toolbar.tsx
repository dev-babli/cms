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
            try {
                const { from, to } = editor.state.selection;
                if (from !== to && editor.view) {
                    const startCoords = editor.view.coordsAtPos(Math.min(from, to));
                    const endCoords = editor.view.coordsAtPos(Math.max(from, to));
                    const editorRect = editor.view.dom.getBoundingClientRect();
                    const viewportHeight = window.innerHeight;
                    const viewportWidth = window.innerWidth;
                    const toolbarHeight = 50;
                    const toolbarWidth = 300;
                    
                    // Calculate position based on selection midpoint
                    const midTop = (startCoords.top + endCoords.top) / 2;
                    const midLeft = (startCoords.left + endCoords.left) / 2;
                    
                    // Check if we're near the bottom of the viewport
                    const spaceBelow = viewportHeight - midTop;
                    const spaceAbove = midTop - editorRect.top;
                    
                    // Position toolbar above selection if near bottom, below if near top
                    let topOffset;
                    if (spaceBelow < toolbarHeight + 20 && spaceAbove > toolbarHeight + 20) {
                        // Position above selection
                        topOffset = midTop - editorRect.top - toolbarHeight - 10;
                    } else {
                        // Position below selection
                        topOffset = midTop - editorRect.top + 10;
                    }
                    
                    // Ensure toolbar stays within editor bounds
                    topOffset = Math.max(10, Math.min(topOffset, editorRect.height - toolbarHeight - 10));
                    
                    // Calculate left position, centering on selection
                    let leftOffset = midLeft - editorRect.left - (toolbarWidth / 2);
                    // Ensure toolbar stays within editor bounds
                    leftOffset = Math.max(10, Math.min(leftOffset, editorRect.width - toolbarWidth - 10));
                    
                    setPosition({
                        top: topOffset,
                        left: leftOffset,
                    });
                    setIsVisible(true);
                } else {
                    setIsVisible(false);
                }
            } catch (error) {
                // Silently handle errors (e.g., when editor is not ready)
                setIsVisible(false);
            }
        };

        // Use requestAnimationFrame to ensure editor is ready
        const rafId = requestAnimationFrame(() => {
            editor.on('selectionUpdate', updatePosition);
            editor.on('transaction', updatePosition);
            editor.on('update', updatePosition);
            updatePosition(); // Initial check
        });

        // Also listen to scroll events to update position
        const handleScroll = () => {
            if (editor.state.selection.from !== editor.state.selection.to) {
                updatePosition();
            }
        };
        window.addEventListener('scroll', handleScroll, true);
        const editorElement = editor.view?.dom;
        if (editorElement) {
            editorElement.addEventListener('scroll', handleScroll, true);
        }

        return () => {
            cancelAnimationFrame(rafId);
            editor.off('selectionUpdate', updatePosition);
            editor.off('transaction', updatePosition);
            editor.off('update', updatePosition);
            window.removeEventListener('scroll', handleScroll, true);
            if (editorElement) {
                editorElement.removeEventListener('scroll', handleScroll, true);
            }
        };
    }, [editor]);

    if (!isVisible) return null;

    const editorRect = editor.view.dom.getBoundingClientRect();
    
    // Sanity Studio Design - Minimal Floating Toolbar
    return (
        <div
            className="fixed z-50 bg-white border border-[#E5E7EB] rounded-md p-1.5 flex items-center gap-0.5"
            style={{
                top: `${position.top + editorRect.top + window.scrollY}px`,
                left: `${position.left + editorRect.left}px`,
                transform: 'translateX(-50%)',
                transition: 'opacity 150ms ease-out',
            }}
        >
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={`p-1.5 rounded-md transition-colors duration-150 ease-out ${
                    editor.isActive('bold') 
                        ? 'bg-[#F9FAFB] text-[#111827]' 
                        : 'text-[#6B7280] hover:bg-[#F9FAFB] hover:text-[#111827]'
                }`}
                title="Bold (Ctrl+B)"
            >
                <Bold className="w-4 h-4" />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={`p-1.5 rounded-md transition-colors duration-150 ease-out ${
                    editor.isActive('italic') 
                        ? 'bg-[#F9FAFB] text-[#111827]' 
                        : 'text-[#6B7280] hover:bg-[#F9FAFB] hover:text-[#111827]'
                }`}
                title="Italic (Ctrl+I)"
            >
                <Italic className="w-4 h-4" />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                className={`p-1.5 rounded-md transition-colors duration-150 ease-out ${
                    editor.isActive('underline') 
                        ? 'bg-[#F9FAFB] text-[#111827]' 
                        : 'text-[#6B7280] hover:bg-[#F9FAFB] hover:text-[#111827]'
                }`}
                title="Underline (Ctrl+U)"
            >
                <Underline className="w-4 h-4" />
            </button>
            <div className="w-px h-5 bg-[#E5E7EB] mx-0.5" />
            <button
                type="button"
                onClick={() => {
                    const url = prompt('Enter URL:');
                    if (url) {
                        editor.chain().focus().setLink({ href: url }).run();
                    }
                }}
                className="p-1.5 rounded-md text-[#6B7280] hover:bg-[#F9FAFB] hover:text-[#111827] transition-colors duration-150 ease-out"
                title="Add Link (Ctrl+K)"
            >
                <LinkIcon className="w-4 h-4" />
            </button>
            <div className="w-px h-5 bg-[#E5E7EB] mx-0.5" />
            <button
                type="button"
                onClick={() => editor.chain().focus().setTextAlign('left').run()}
                className={`p-1.5 rounded-md transition-colors duration-150 ease-out ${
                    editor.isActive({ textAlign: 'left' }) 
                        ? 'bg-[#F9FAFB] text-[#111827]' 
                        : 'text-[#6B7280] hover:bg-[#F9FAFB] hover:text-[#111827]'
                }`}
                title="Align Left"
            >
                <AlignLeft className="w-4 h-4" />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().setTextAlign('center').run()}
                className={`p-1.5 rounded-md transition-colors duration-150 ease-out ${
                    editor.isActive({ textAlign: 'center' }) 
                        ? 'bg-[#F9FAFB] text-[#111827]' 
                        : 'text-[#6B7280] hover:bg-[#F9FAFB] hover:text-[#111827]'
                }`}
                title="Align Center"
            >
                <AlignCenter className="w-4 h-4" />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().setTextAlign('right').run()}
                className={`p-1.5 rounded-md transition-colors duration-150 ease-out ${
                    editor.isActive({ textAlign: 'right' }) 
                        ? 'bg-[#F9FAFB] text-[#111827]' 
                        : 'text-[#6B7280] hover:bg-[#F9FAFB] hover:text-[#111827]'
                }`}
                title="Align Right"
            >
                <AlignRight className="w-4 h-4" />
            </button>
        </div>
    );
}


