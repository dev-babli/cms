"use client";

import { Editor } from '@tiptap/core';
import * as ContextMenu from '@radix-ui/react-context-menu';
import { 
    Copy, Scissors, Clipboard, Bold, Italic, Underline, Link as LinkIcon, 
    Image as ImageIcon, Table as TableIcon, AlignLeft, AlignCenter, 
    AlignRight, List, ListOrdered, Quote, Code, X
} from 'lucide-react';

interface ContextMenuComponentProps {
    editor: Editor;
    children: React.ReactNode;
}

export function ContextMenuComponent({ editor, children }: ContextMenuComponentProps) {
    const handleCut = () => {
        document.execCommand('cut');
    };

    const handleCopy = () => {
        document.execCommand('copy');
    };

    const handlePaste = () => {
        document.execCommand('paste');
    };

    const handleUnlink = () => {
        editor.chain().focus().unsetLink().run();
    };

    return (
        <ContextMenu.Root>
            <ContextMenu.Trigger asChild>
                {children}
            </ContextMenu.Trigger>
            <ContextMenu.Portal>
                <ContextMenu.Content className="min-w-[200px] bg-white border border-border rounded-lg shadow-xl p-1 z-50">
                    <ContextMenu.Item
                        className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-muted cursor-pointer outline-none"
                        onSelect={handleCut}
                    >
                        <Scissors className="w-4 h-4" />
                        Cut
                    </ContextMenu.Item>
                    <ContextMenu.Item
                        className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-muted cursor-pointer outline-none"
                        onSelect={handleCopy}
                    >
                        <Copy className="w-4 h-4" />
                        Copy
                    </ContextMenu.Item>
                    <ContextMenu.Item
                        className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-muted cursor-pointer outline-none"
                        onSelect={handlePaste}
                    >
                        <Clipboard className="w-4 h-4" />
                        Paste
                    </ContextMenu.Item>
                    <ContextMenu.Separator className="h-px bg-border my-1" />
                    <ContextMenu.Item
                        className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-muted cursor-pointer outline-none"
                        onSelect={() => editor.chain().focus().toggleBold().run()}
                    >
                        <Bold className="w-4 h-4" />
                        Bold
                    </ContextMenu.Item>
                    <ContextMenu.Item
                        className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-muted cursor-pointer outline-none"
                        onSelect={() => editor.chain().focus().toggleItalic().run()}
                    >
                        <Italic className="w-4 h-4" />
                        Italic
                    </ContextMenu.Item>
                    <ContextMenu.Item
                        className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-muted cursor-pointer outline-none"
                        onSelect={() => editor.chain().focus().toggleUnderline().run()}
                    >
                        <Underline className="w-4 h-4" />
                        Underline
                    </ContextMenu.Item>
                    {editor.isActive('link') && (
                        <>
                            <ContextMenu.Separator className="h-px bg-border my-1" />
                            <ContextMenu.Item
                                className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-muted cursor-pointer outline-none"
                                onSelect={handleUnlink}
                            >
                                <X className="w-4 h-4" />
                                Remove Link
                            </ContextMenu.Item>
                        </>
                    )}
                </ContextMenu.Content>
            </ContextMenu.Portal>
        </ContextMenu.Root>
    );
}

