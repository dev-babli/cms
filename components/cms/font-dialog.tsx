"use client";

import { Editor } from '@tiptap/core';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import * as Dialog from '@radix-ui/react-dialog';
import { Type, Palette, Highlighter } from 'lucide-react';
import { ColorPicker } from './color-picker';

interface FontDialogProps {
    editor: Editor;
    onClose: () => void;
}

export function FontDialog({ editor, onClose }: FontDialogProps) {
    const [fontFamily, setFontFamily] = useState('');
    const [fontSize, setFontSize] = useState('16px');
    const [fontColor, setFontColor] = useState('#000000');
    const [highlightColor, setHighlightColor] = useState('#FFFF00');
    const [underlineStyle, setUnderlineStyle] = useState('single');
    const [strikethroughStyle, setStrikethroughStyle] = useState('single');

    const applyFont = () => {
        if (fontFamily) {
            editor.chain().focus().setFontFamily(fontFamily).run();
        }
        if (fontSize) {
            editor.chain().focus().setFontSize(fontSize).run();
        }
        if (fontColor) {
            editor.chain().focus().setColor(fontColor).run();
        }
        if (highlightColor) {
            editor.chain().focus().toggleHighlight({ color: highlightColor }).run();
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
                            <Type className="w-5 h-5" />
                            Font
                        </Dialog.Title>
                    </div>
                    <div className="p-6 space-y-4">
                        <div>
                            <label className="text-sm font-medium mb-2 block">Font</label>
                            <select
                                value={fontFamily}
                                onChange={(e) => setFontFamily(e.target.value)}
                                className="w-full px-3 py-2 border border-border rounded-md"
                            >
                                <option value="">Select font</option>
                                <option value="Arial">Arial</option>
                                <option value="Helvetica">Helvetica</option>
                                <option value="Times New Roman">Times New Roman</option>
                                <option value="Courier New">Courier New</option>
                                <option value="Georgia">Georgia</option>
                                <option value="Verdana">Verdana</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-2 block">Font Size</label>
                            <input
                                type="text"
                                value={fontSize}
                                onChange={(e) => setFontSize(e.target.value)}
                                className="w-full px-3 py-2 border border-border rounded-md"
                                placeholder="16px"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                                <Palette className="w-4 h-4" />
                                Font Color
                            </label>
                            <div className="flex items-center gap-2">
                                <ColorPicker
                                    color={fontColor}
                                    onChange={setFontColor}
                                    label="Font Color"
                                />
                                <input
                                    type="text"
                                    value={fontColor}
                                    onChange={(e) => setFontColor(e.target.value)}
                                    className="flex-1 px-3 py-2 border border-border rounded-md"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                                <Highlighter className="w-4 h-4" />
                                Text Highlight Color
                            </label>
                            <div className="flex items-center gap-2">
                                <ColorPicker
                                    color={highlightColor}
                                    onChange={setHighlightColor}
                                    label="Highlight"
                                />
                                <input
                                    type="text"
                                    value={highlightColor}
                                    onChange={(e) => setHighlightColor(e.target.value)}
                                    className="flex-1 px-3 py-2 border border-border rounded-md"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-2 block">Underline Style</label>
                            <select
                                value={underlineStyle}
                                onChange={(e) => setUnderlineStyle(e.target.value)}
                                className="w-full px-3 py-2 border border-border rounded-md"
                            >
                                <option value="single">Single</option>
                                <option value="double">Double</option>
                                <option value="dotted">Dotted</option>
                                <option value="dashed">Dashed</option>
                                <option value="wavy">Wavy</option>
                            </select>
                        </div>
                    </div>
                    <div className="p-6 border-t border-border flex justify-end gap-2">
                        <Button variant="outline" onClick={onClose}>Cancel</Button>
                        <Button onClick={applyFont}>OK</Button>
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}


