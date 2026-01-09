"use client";

import { Editor } from '@tiptap/core';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Image as ImageIcon, Crop, Maximize2, AlignLeft, AlignCenter, AlignRight, X } from 'lucide-react';

interface ImageToolbarProps {
    editor: Editor;
    onClose: () => void;
}

export function ImageToolbar({ editor, onClose }: ImageToolbarProps) {
    const [cropMode, setCropMode] = useState(false);

    const handleCrop = () => {
        setCropMode(true);
        // Crop functionality would be implemented here
    };

    const handleResize = (width: number, height: number) => {
        const attrs = editor.getAttributes('image');
        editor.chain().focus().updateAttributes('image', {
            ...attrs,
            width: `${width}px`,
            height: `${height}px`,
        } as any).run();
    };

    const handleRemove = () => {
        editor.chain().focus().deleteSelection().run();
        onClose();
    };

    return (
        <div className="absolute z-50 top-4 left-1/2 transform -translate-x-1/2 bg-white border border-border rounded-lg shadow-xl p-3 flex items-center gap-2">
            <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleCrop}
                className="h-8 px-3 text-xs"
            >
                <Crop className="w-4 h-4 mr-1" />
                Crop
            </Button>
            <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleResize(800, 600)}
                className="h-8 px-3 text-xs"
            >
                <Maximize2 className="w-4 h-4 mr-1" />
                Resize
            </Button>
            <div className="w-px h-6 bg-border mx-1" />
            <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                    const attrs = editor.getAttributes('image');
                    editor.chain().focus().updateAttributes('image', {
                        ...attrs,
                        style: 'float: left; margin-right: 1rem;',
                    } as any).run();
                }}
                className="h-8 w-8 p-0"
            >
                <AlignLeft className="w-4 h-4" />
            </Button>
            <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                    const attrs = editor.getAttributes('image');
                    editor.chain().focus().updateAttributes('image', {
                        ...attrs,
                        style: 'display: block; margin: 0 auto;',
                    } as any).run();
                }}
                className="h-8 w-8 p-0"
            >
                <AlignCenter className="w-4 h-4" />
            </Button>
            <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                    const attrs = editor.getAttributes('image');
                    editor.chain().focus().updateAttributes('image', {
                        ...attrs,
                        style: 'float: right; margin-left: 1rem;',
                    } as any).run();
                }}
                className="h-8 w-8 p-0"
            >
                <AlignRight className="w-4 h-4" />
            </Button>
            <div className="w-px h-6 bg-border mx-1" />
            <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRemove}
                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
            >
                <X className="w-4 h-4" />
            </Button>
        </div>
    );
}















