"use client";

import { Editor } from '@tiptap/core';
import { useState, useEffect } from 'react';
import { Link as LinkIcon, ExternalLink, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface InlineLinkInputProps {
    editor: Editor;
    isOpen: boolean;
    onClose: () => void;
}

export function InlineLinkInput({ editor, isOpen, onClose }: InlineLinkInputProps) {
    const [url, setUrl] = useState('');
    const [displayText, setDisplayText] = useState('');
    const [openInNewTab, setOpenInNewTab] = useState(false);
    const [tooltip, setTooltip] = useState('');

    useEffect(() => {
        if (isOpen) {
            if (editor.isActive('link')) {
                const attrs = editor.getAttributes('link');
                setUrl(attrs.href || '');
                const selectedText = editor.state.doc.textBetween(
                    editor.state.selection.from,
                    editor.state.selection.to
                );
                setDisplayText(selectedText || attrs.href || '');
            } else {
                const selectedText = editor.state.doc.textBetween(
                    editor.state.selection.from,
                    editor.state.selection.to
                );
                setDisplayText(selectedText);
            }
        }
    }, [isOpen, editor]);

    const handleApply = () => {
        if (url) {
            if (displayText) {
                editor.chain().focus().insertContent(`<a href="${url}" ${openInNewTab ? 'target="_blank" rel="noopener noreferrer"' : ''} ${tooltip ? `title="${tooltip}"` : ''}>${displayText}</a>`).run();
            } else {
                editor.chain().focus().setLink({ 
                    href: url,
                    target: openInNewTab ? '_blank' : undefined,
                } as any).run();
                if (tooltip) {
                    const linkElement = editor.view.dom.querySelector(`a[href="${url}"]`) as HTMLElement;
                    if (linkElement) {
                        linkElement.setAttribute('title', tooltip);
                    }
                }
            }
            onClose();
            setUrl('');
            setDisplayText('');
            setTooltip('');
        }
    };

    const handleUnlink = () => {
        editor.chain().focus().unsetLink().run();
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="absolute top-full left-0 mt-2 bg-white border border-border rounded-lg shadow-2xl z-50 p-4 min-w-[400px] max-w-[500px] animate-in slide-in-from-top-2 fade-in-0 duration-200 max-h-[600px] overflow-y-auto smooth-scroll" style={{ maxWidth: 'min(500px, calc(100vw - 2rem))' }}>
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <LinkIcon className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-semibold">Insert Link</span>
                </div>
                <button
                    onClick={onClose}
                    className="p-1 hover:bg-muted rounded-md transition-colors"
                    aria-label="Close"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>

            <div className="space-y-3">
                <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">URL</label>
                    <input
                        type="url"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="https://example.com"
                        className="w-full h-9 px-3 text-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20"
                        autoFocus
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                handleApply();
                            } else if (e.key === 'Escape') {
                                onClose();
                            }
                        }}
                    />
                </div>
                <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Display Text</label>
                    <input
                        type="text"
                        value={displayText}
                        onChange={(e) => setDisplayText(e.target.value)}
                        placeholder="Link text"
                        className="w-full h-9 px-3 text-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                handleApply();
                            }
                        }}
                    />
                </div>
                <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Tooltip (optional)</label>
                    <input
                        type="text"
                        value={tooltip}
                        onChange={(e) => setTooltip(e.target.value)}
                        placeholder="Tooltip text"
                        className="w-full h-9 px-3 text-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        id="newTab"
                        checked={openInNewTab}
                        onChange={(e) => setOpenInNewTab(e.target.checked)}
                        className="w-4 h-4 rounded border-border"
                    />
                    <label htmlFor="newTab" className="text-xs flex items-center gap-1.5 cursor-pointer">
                        <ExternalLink className="w-3.5 h-3.5" />
                        Open in new tab
                    </label>
                </div>
            </div>

            <div className="flex items-center justify-between gap-2 mt-4 pt-4 border-t border-border">
                {editor.isActive('link') && (
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleUnlink}
                        className="h-8"
                    >
                        <X className="w-3.5 h-3.5 mr-1.5" />
                        Remove Link
                    </Button>
                )}
                <div className="flex gap-2 ml-auto">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onClose}
                        className="h-8"
                    >
                        Cancel
                    </Button>
                    <Button
                        size="sm"
                        onClick={handleApply}
                        disabled={!url}
                        className="h-8"
                    >
                        <Check className="w-3.5 h-3.5 mr-1.5" />
                        Apply
                    </Button>
                </div>
            </div>
        </div>
    );
}

