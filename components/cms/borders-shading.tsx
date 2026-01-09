"use client";

import { Editor } from '@tiptap/core';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import * as Dialog from '@radix-ui/react-dialog';
import { Square, Palette } from 'lucide-react';
import { ColorPicker } from './color-picker';

interface BordersShadingProps {
    editor: Editor;
    onClose: () => void;
}

export function BordersShading({ editor, onClose }: BordersShadingProps) {
    const [borderStyle, setBorderStyle] = useState('solid');
    const [borderWidth, setBorderWidth] = useState('1px');
    const [borderColor, setBorderColor] = useState('#000000');
    const [shadingColor, setShadingColor] = useState('#FFFFFF');

    const applyBordersShading = () => {
        const style = `border: ${borderWidth} ${borderStyle} ${borderColor}; background-color: ${shadingColor};`;
        editor.chain().focus().updateAttributes('paragraph', {
            style: style
        } as any).run();
        onClose();
    };

    return (
        <Dialog.Root open={true} onOpenChange={onClose}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
                <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl w-[500px] z-50">
                    <div className="p-6 border-b border-border">
                        <Dialog.Title className="text-xl font-semibold flex items-center gap-2">
                            <Square className="w-5 h-5" />
                            Borders and Shading
                        </Dialog.Title>
                    </div>
                    <div className="p-6 space-y-4">
                        <div>
                            <label className="text-sm font-medium mb-2 block">Border Style</label>
                            <select
                                value={borderStyle}
                                onChange={(e) => setBorderStyle(e.target.value)}
                                className="w-full px-3 py-2 border border-border rounded-md"
                            >
                                <option value="none">None</option>
                                <option value="solid">Solid</option>
                                <option value="dashed">Dashed</option>
                                <option value="dotted">Dotted</option>
                                <option value="double">Double</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-2 block">Border Width</label>
                            <input
                                type="text"
                                value={borderWidth}
                                onChange={(e) => setBorderWidth(e.target.value)}
                                className="w-full px-3 py-2 border border-border rounded-md"
                                placeholder="1px"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                                <Palette className="w-4 h-4" />
                                Border Color
                            </label>
                            <div className="flex items-center gap-2">
                                <ColorPicker
                                    color={borderColor}
                                    onChange={setBorderColor}
                                    label="Border Color"
                                />
                                <input
                                    type="text"
                                    value={borderColor}
                                    onChange={(e) => setBorderColor(e.target.value)}
                                    className="flex-1 px-3 py-2 border border-border rounded-md"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                                <Palette className="w-4 h-4" />
                                Shading (Background) Color
                            </label>
                            <div className="flex items-center gap-2">
                                <ColorPicker
                                    color={shadingColor}
                                    onChange={setShadingColor}
                                    label="Shading Color"
                                />
                                <input
                                    type="text"
                                    value={shadingColor}
                                    onChange={(e) => setShadingColor(e.target.value)}
                                    className="flex-1 px-3 py-2 border border-border rounded-md"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="p-6 border-t border-border flex justify-end gap-2">
                        <Button variant="outline" onClick={onClose}>Cancel</Button>
                        <Button onClick={applyBordersShading}>Apply</Button>
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}















