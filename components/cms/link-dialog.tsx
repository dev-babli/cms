"use client";

import { Editor } from '@tiptap/core';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import * as Dialog from '@radix-ui/react-dialog';
import { Link as LinkIcon, ExternalLink, Bookmark } from 'lucide-react';

interface LinkDialogProps {
    editor: Editor;
    onClose: () => void;
}

export function LinkDialog({ editor, onClose }: LinkDialogProps) {
    const [url, setUrl] = useState('');
    const [displayText, setDisplayText] = useState('');
    const [tooltip, setTooltip] = useState('');
    const [openInNewTab, setOpenInNewTab] = useState(false);

    useEffect(() => {
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
    }, [editor]);

    const handleApply = () => {
        if (url) {
            if (displayText) {
                editor.chain().focus().insertContent(`<a href="${url}" ${openInNewTab ? 'target="_blank" rel="noopener noreferrer"' : ''} ${tooltip ? `title="${tooltip}"` : ''}>${displayText}</a>`).run();
            } else {
                editor.chain().focus().setLink({ 
                    href: url,
                    target: openInNewTab ? '_blank' : undefined,
                } as any).run();
                // Apply tooltip via HTML attributes if needed
                if (tooltip) {
                    const linkElement = editor.view.dom.querySelector(`a[href="${url}"]`) as HTMLElement;
                    if (linkElement) {
                        linkElement.setAttribute('title', tooltip);
                    }
                }
            }
        }
        onClose();
    };

    return (
        <Dialog.Root open={true} onOpenChange={onClose}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
                <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl w-[500px] z-50">
                    <div className="p-6 border-b border-border">
                        <Dialog.Title className="text-xl font-semibold flex items-center gap-2">
                            <LinkIcon className="w-5 h-5" />
                            Insert Link
                        </Dialog.Title>
                    </div>
                    <div className="p-6 space-y-4">
                        <div>
                            <label className="text-sm font-medium mb-2 block">URL</label>
                            <input
                                type="url"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                placeholder="https://example.com"
                                className="w-full px-3 py-2 border border-border rounded-md"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-2 block">Display Text</label>
                            <input
                                type="text"
                                value={displayText}
                                onChange={(e) => setDisplayText(e.target.value)}
                                placeholder="Link text"
                                className="w-full px-3 py-2 border border-border rounded-md"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-2 block">Tooltip (optional)</label>
                            <input
                                type="text"
                                value={tooltip}
                                onChange={(e) => setTooltip(e.target.value)}
                                placeholder="Tooltip text"
                                className="w-full px-3 py-2 border border-border rounded-md"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="newTab"
                                checked={openInNewTab}
                                onChange={(e) => setOpenInNewTab(e.target.checked)}
                                className="w-4 h-4"
                            />
                            <label htmlFor="newTab" className="text-sm flex items-center gap-2">
                                <ExternalLink className="w-4 h-4" />
                                Open in new tab
                            </label>
                        </div>
                    </div>
                    <div className="p-6 border-t border-border flex justify-end gap-2">
                        <Button variant="outline" onClick={onClose}>Cancel</Button>
                        <Button onClick={handleApply} disabled={!url}>Apply</Button>
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}

