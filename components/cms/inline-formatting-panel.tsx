"use client";

import { Editor } from '@tiptap/core';
import { useState } from 'react';
import { X, Type, AlignLeft, Indent, Outdent, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { InlineColorPicker } from './inline-color-picker';

interface InlineFormattingPanelProps {
    editor: Editor;
    isOpen: boolean;
    onClose: () => void;
    activeTab?: 'font' | 'paragraph' | 'borders';
}

export function InlineFormattingPanel({ 
    editor, 
    isOpen, 
    onClose, 
    activeTab: initialTab = 'font' 
}: InlineFormattingPanelProps) {
    const [activeTab, setActiveTab] = useState<'font' | 'paragraph' | 'borders'>(initialTab);
    const [showTextColorPicker, setShowTextColorPicker] = useState(false);
    const [showHighlightPicker, setShowHighlightPicker] = useState(false);
    const [showBorderColorPicker, setShowBorderColorPicker] = useState(false);
    const [showShadingPicker, setShowShadingPicker] = useState(false);

    const [fontFamily, setFontFamily] = useState('');
    const [fontSize, setFontSize] = useState('16px');
    const [textColor, setTextColor] = useState('#000000');
    const [highlightColor, setHighlightColor] = useState('#FFFF00');
    const [indent, setIndent] = useState(0);
    const [spacingBefore, setSpacingBefore] = useState(0);
    const [spacingAfter, setSpacingAfter] = useState(0);
    const [lineSpacing, setLineSpacing] = useState('1.15');
    const [borderStyle, setBorderStyle] = useState('solid');
    const [borderWidth, setBorderWidth] = useState('1px');
    const [borderColor, setBorderColor] = useState('#000000');
    const [shadingColor, setShadingColor] = useState('#FFFFFF');

    if (!isOpen) return null;

    const applyFontSettings = () => {
        if (fontFamily) {
            editor.chain().focus().setFontFamily(fontFamily).run();
        }
        if (fontSize) {
            editor.chain().focus().setFontSize(fontSize).run();
        }
        if (textColor) {
            editor.chain().focus().setColor(textColor).run();
        }
        if (highlightColor) {
            editor.chain().focus().toggleHighlight({ color: highlightColor }).run();
        }
    };

    const applyParagraphSettings = () => {
        // Apply indentation
        if (indent !== 0) {
            const indentValue = indent * 20;
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
    };

    const applyBordersShading = () => {
        const style = `border: ${borderWidth} ${borderStyle} ${borderColor}; background-color: ${shadingColor};`;
        editor.chain().focus().updateAttributes('paragraph', {
            style: style
        } as any).run();
    };

    return (
        <div className="h-full w-80 bg-white border-l border-border shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 max-h-[calc(100vh-200px)] overflow-hidden" style={{ width: 'min(320px, 90vw)' }}>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border bg-gradient-to-r from-slate-50 to-white">
                <h3 className="text-sm font-semibold">Formatting Options</h3>
                <button
                    onClick={onClose}
                    className="p-1.5 hover:bg-muted rounded-md transition-colors"
                    aria-label="Close panel"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-border">
                <button
                    onClick={() => setActiveTab('font')}
                    className={`flex-1 px-4 py-3 text-xs font-medium transition-colors border-b-2 ${
                        activeTab === 'font'
                            ? 'border-primary text-primary bg-primary/5'
                            : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`}
                >
                    <Type className="w-4 h-4 mx-auto mb-1" />
                    Font
                </button>
                <button
                    onClick={() => setActiveTab('paragraph')}
                    className={`flex-1 px-4 py-3 text-xs font-medium transition-colors border-b-2 ${
                        activeTab === 'paragraph'
                            ? 'border-primary text-primary bg-primary/5'
                            : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`}
                >
                    <AlignLeft className="w-4 h-4 mx-auto mb-1" />
                    Paragraph
                </button>
                <button
                    onClick={() => setActiveTab('borders')}
                    className={`flex-1 px-4 py-3 text-xs font-medium transition-colors border-b-2 ${
                        activeTab === 'borders'
                            ? 'border-primary text-primary bg-primary/5'
                            : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`}
                >
                    <Square className="w-4 h-4 mx-auto mb-1" />
                    Borders
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 smooth-scroll">
                {activeTab === 'font' && (
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-medium text-muted-foreground mb-2 block">Font Family</label>
                            <select
                                value={fontFamily}
                                onChange={(e) => setFontFamily(e.target.value)}
                                className="w-full h-9 px-3 text-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20"
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
                            <label className="text-xs font-medium text-muted-foreground mb-2 block">Font Size</label>
                            <input
                                type="text"
                                value={fontSize}
                                onChange={(e) => setFontSize(e.target.value)}
                                className="w-full h-9 px-3 text-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20"
                                placeholder="16px"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-muted-foreground mb-2 block">Text Color</label>
                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowTextColorPicker(!showTextColorPicker);
                                        setShowHighlightPicker(false);
                                    }}
                                    className="w-full h-9 px-3 border border-border rounded-md flex items-center gap-2 hover:bg-muted transition-colors"
                                >
                                    <div
                                        className="w-5 h-5 rounded border border-border"
                                        style={{ backgroundColor: textColor }}
                                    />
                                    <span className="text-sm flex-1 text-left">{textColor.toUpperCase()}</span>
                                </button>
                                {showTextColorPicker && (
                                    <div className="absolute top-full left-0 mt-2 z-50">
                                        <InlineColorPicker
                                            color={textColor}
                                            onChange={(color) => {
                                                setTextColor(color);
                                                editor.chain().focus().setColor(color).run();
                                            }}
                                            label="Text Color"
                                            isOpen={true}
                                            onClose={() => setShowTextColorPicker(false)}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-medium text-muted-foreground mb-2 block">Highlight Color</label>
                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowHighlightPicker(!showHighlightPicker);
                                        setShowTextColorPicker(false);
                                    }}
                                    className="w-full h-9 px-3 border border-border rounded-md flex items-center gap-2 hover:bg-muted transition-colors"
                                >
                                    <div
                                        className="w-5 h-5 rounded border border-border"
                                        style={{ backgroundColor: highlightColor }}
                                    />
                                    <span className="text-sm flex-1 text-left">{highlightColor.toUpperCase()}</span>
                                </button>
                                {showHighlightPicker && (
                                    <div className="absolute top-full left-0 mt-2 z-50">
                                        <InlineColorPicker
                                            color={highlightColor}
                                            onChange={(color) => {
                                                setHighlightColor(color);
                                                editor.chain().focus().toggleHighlight({ color }).run();
                                            }}
                                            label="Highlight"
                                            presetColors={['#FFFF00', '#FF0000', '#00FF00', '#0000FF', '#FFA500']}
                                            isOpen={true}
                                            onClose={() => setShowHighlightPicker(false)}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                        <Button onClick={applyFontSettings} className="w-full">Apply Font Settings</Button>
                    </div>
                )}

                {activeTab === 'paragraph' && (
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-medium text-muted-foreground mb-2 block">Indentation</label>
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
                                    className="flex-1 h-9 px-3 text-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20"
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
                            <label className="text-xs font-medium text-muted-foreground mb-2 block">Spacing Before (pt)</label>
                            <input
                                type="number"
                                value={spacingBefore}
                                onChange={(e) => setSpacingBefore(parseInt(e.target.value) || 0)}
                                className="w-full h-9 px-3 text-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20"
                                min="0"
                                max="1584"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-muted-foreground mb-2 block">Spacing After (pt)</label>
                            <input
                                type="number"
                                value={spacingAfter}
                                onChange={(e) => setSpacingAfter(parseInt(e.target.value) || 0)}
                                className="w-full h-9 px-3 text-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20"
                                min="0"
                                max="1584"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-muted-foreground mb-2 block">Line Spacing</label>
                            <select
                                value={lineSpacing}
                                onChange={(e) => setLineSpacing(e.target.value)}
                                className="w-full h-9 px-3 text-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20"
                            >
                                <option value="1.0">Single</option>
                                <option value="1.15">1.15</option>
                                <option value="1.5">1.5 lines</option>
                                <option value="2.0">Double</option>
                                <option value="2.5">2.5</option>
                                <option value="3.0">3.0</option>
                            </select>
                        </div>
                        <Button onClick={applyParagraphSettings} className="w-full">Apply Paragraph Settings</Button>
                    </div>
                )}

                {activeTab === 'borders' && (
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-medium text-muted-foreground mb-2 block">Border Style</label>
                            <select
                                value={borderStyle}
                                onChange={(e) => setBorderStyle(e.target.value)}
                                className="w-full h-9 px-3 text-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20"
                            >
                                <option value="none">None</option>
                                <option value="solid">Solid</option>
                                <option value="dashed">Dashed</option>
                                <option value="dotted">Dotted</option>
                                <option value="double">Double</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-medium text-muted-foreground mb-2 block">Border Width</label>
                            <input
                                type="text"
                                value={borderWidth}
                                onChange={(e) => setBorderWidth(e.target.value)}
                                className="w-full h-9 px-3 text-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20"
                                placeholder="1px"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-muted-foreground mb-2 block">Border Color</label>
                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowBorderColorPicker(!showBorderColorPicker);
                                        setShowShadingPicker(false);
                                    }}
                                    className="w-full h-9 px-3 border border-border rounded-md flex items-center gap-2 hover:bg-muted transition-colors"
                                >
                                    <div
                                        className="w-5 h-5 rounded border border-border"
                                        style={{ backgroundColor: borderColor }}
                                    />
                                    <span className="text-sm flex-1 text-left">{borderColor.toUpperCase()}</span>
                                </button>
                                {showBorderColorPicker && (
                                    <div className="absolute top-full left-0 mt-2 z-50">
                                        <InlineColorPicker
                                            color={borderColor}
                                            onChange={setBorderColor}
                                            label="Border Color"
                                            isOpen={true}
                                            onClose={() => setShowBorderColorPicker(false)}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-medium text-muted-foreground mb-2 block">Shading Color</label>
                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowShadingPicker(!showShadingPicker);
                                        setShowBorderColorPicker(false);
                                    }}
                                    className="w-full h-9 px-3 border border-border rounded-md flex items-center gap-2 hover:bg-muted transition-colors"
                                >
                                    <div
                                        className="w-5 h-5 rounded border border-border"
                                        style={{ backgroundColor: shadingColor }}
                                    />
                                    <span className="text-sm flex-1 text-left">{shadingColor.toUpperCase()}</span>
                                </button>
                                {showShadingPicker && (
                                    <div className="absolute top-full left-0 mt-2 z-50">
                                        <InlineColorPicker
                                            color={shadingColor}
                                            onChange={setShadingColor}
                                            label="Shading Color"
                                            isOpen={true}
                                            onClose={() => setShowShadingPicker(false)}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                        <Button onClick={applyBordersShading} className="w-full">Apply Borders & Shading</Button>
                    </div>
                )}
            </div>
        </div>
    );
}

