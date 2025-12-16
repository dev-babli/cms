"use client";

import { Editor } from '@tiptap/core';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import * as Dialog from '@radix-ui/react-dialog';
import { AlignLeft, Indent, Outdent } from 'lucide-react';

interface ParagraphFormattingProps {
    editor: Editor;
    onClose: () => void;
}

export function ParagraphFormatting({ editor, onClose }: ParagraphFormattingProps) {
    const [indent, setIndent] = useState(0);
    const [spacingBefore, setSpacingBefore] = useState(0);
    const [spacingAfter, setSpacingAfter] = useState(0);
    const [lineSpacing, setLineSpacing] = useState('1.15');

    const applyFormatting = () => {
        // Apply indentation using CSS
        if (indent !== 0) {
            const indentValue = indent * 20; // 20px per indent level
            editor.chain().focus().updateAttributes('paragraph', {
                style: `margin-left: ${indentValue}px;`
            } as any).run();
        }
        // Apply spacing
        if (spacingBefore > 0 || spacingAfter > 0) {
            const currentStyle = editor.getAttributes('paragraph').style || '';
            const newStyle = `${currentStyle} margin-top: ${spacingBefore}pt; margin-bottom: ${spacingAfter}pt;`;
            editor.chain().focus().updateAttributes('paragraph', {
                style: newStyle
            } as any).run();
        }
        // Apply line spacing
        if (lineSpacing !== '1.0') {
            const currentStyle = editor.getAttributes('paragraph').style || '';
            const newStyle = `${currentStyle} line-height: ${lineSpacing};`;
            editor.chain().focus().updateAttributes('paragraph', {
                style: newStyle
            } as any).run();
        }
        onClose();
    };

    return (
        <Dialog.Root open={true} onOpenChange={onClose}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
                <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl w-[500px] z-50">
                    <div className="p-6 border-b border-border">
                        <Dialog.Title className="text-xl font-semibold">Paragraph Formatting</Dialog.Title>
                    </div>
                    <div className="p-6 space-y-4">
                        <div>
                            <label className="text-sm font-medium mb-2 block">Indentation</label>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setIndent(Math.max(-5, indent - 1))}
                                    className="p-2 border border-border rounded-md hover:bg-muted"
                                >
                                    <Outdent className="w-4 h-4" />
                                </button>
                                <input
                                    type="number"
                                    value={indent}
                                    onChange={(e) => setIndent(parseInt(e.target.value) || 0)}
                                    className="flex-1 px-3 py-2 border border-border rounded-md"
                                    min="-5"
                                    max="10"
                                />
                                <button
                                    onClick={() => setIndent(Math.min(10, indent + 1))}
                                    className="p-2 border border-border rounded-md hover:bg-muted"
                                >
                                    <Indent className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-2 block">Spacing Before (pt)</label>
                            <input
                                type="number"
                                value={spacingBefore}
                                onChange={(e) => setSpacingBefore(parseInt(e.target.value) || 0)}
                                className="w-full px-3 py-2 border border-border rounded-md"
                                min="0"
                                max="1584"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-2 block">Spacing After (pt)</label>
                            <input
                                type="number"
                                value={spacingAfter}
                                onChange={(e) => setSpacingAfter(parseInt(e.target.value) || 0)}
                                className="w-full px-3 py-2 border border-border rounded-md"
                                min="0"
                                max="1584"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-2 block">Line Spacing</label>
                            <select
                                value={lineSpacing}
                                onChange={(e) => setLineSpacing(e.target.value)}
                                className="w-full px-3 py-2 border border-border rounded-md"
                            >
                                <option value="1.0">Single</option>
                                <option value="1.15">1.15</option>
                                <option value="1.5">1.5 lines</option>
                                <option value="2.0">Double</option>
                                <option value="2.5">2.5</option>
                                <option value="3.0">3.0</option>
                            </select>
                        </div>
                    </div>
                    <div className="p-6 border-t border-border flex justify-end gap-2">
                        <Button variant="outline" onClick={onClose}>Cancel</Button>
                        <Button onClick={applyFormatting}>Apply</Button>
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}

