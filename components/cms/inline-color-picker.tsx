"use client";

import { useState, useRef, useEffect } from 'react';
import { X, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface InlineColorPickerProps {
    color: string;
    onChange: (color: string) => void;
    label?: string;
    presetColors?: string[];
    onClose?: () => void;
    isOpen: boolean;
}

const defaultPresets = [
    '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF',
    '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080',
    '#FFC0CB', '#A52A2A', '#808080', '#000080', '#008000',
    '#FF6347', '#40E0D0', '#EE82EE', '#F0E68C', '#DDA0DD',
];

export function InlineColorPicker({ 
    color, 
    onChange, 
    label = 'Color', 
    presetColors = defaultPresets,
    onClose,
    isOpen 
}: InlineColorPickerProps) {
    const [customColor, setCustomColor] = useState(color);
    const [recentColors, setRecentColors] = useState<string[]>(() => {
        const stored = localStorage.getItem('recentColors');
        return stored ? JSON.parse(stored) : [];
    });

    useEffect(() => {
        setCustomColor(color);
    }, [color]);

    const handleColorSelect = (selectedColor: string) => {
        onChange(selectedColor);
        // Add to recent colors
        const updated = [selectedColor, ...recentColors.filter(c => c !== selectedColor)].slice(0, 8);
        setRecentColors(updated);
        localStorage.setItem('recentColors', JSON.stringify(updated));
    };

    const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newColor = e.target.value;
        setCustomColor(newColor);
        onChange(newColor);
    };

    if (!isOpen) return null;

    return (
        <div className="absolute top-full left-0 mt-2 bg-white border border-border rounded-lg shadow-2xl z-50 p-4 min-w-[320px] max-w-[400px] animate-in slide-in-from-top-2 fade-in-0 duration-200 max-h-[500px] overflow-y-auto smooth-scroll" style={{ maxWidth: 'min(400px, calc(100vw - 2rem))' }}>
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Palette className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-semibold">{label}</span>
                </div>
                {onClose && (
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-muted rounded-md transition-colors"
                        aria-label="Close color picker"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* Preset Colors Grid */}
            <div className="mb-4">
                <label className="text-xs font-medium text-muted-foreground mb-2 block">Preset Colors</label>
                <div className="grid grid-cols-10 gap-1.5">
                    {presetColors.map((presetColor, idx) => (
                        <button
                            key={idx}
                            type="button"
                            onClick={() => handleColorSelect(presetColor)}
                            className={`
                                w-8 h-8 rounded-md border-2 transition-all duration-150
                                hover:scale-110 hover:shadow-md
                                ${color === presetColor 
                                    ? 'border-primary shadow-md scale-110 ring-2 ring-primary/20' 
                                    : 'border-border hover:border-primary/50'
                                }
                            `}
                            style={{ backgroundColor: presetColor }}
                            title={presetColor}
                            aria-label={`Select color ${presetColor}`}
                        />
                    ))}
                </div>
            </div>

            {/* Recent Colors */}
            {recentColors.length > 0 && (
                <div className="mb-4">
                    <label className="text-xs font-medium text-muted-foreground mb-2 block">Recent Colors</label>
                    <div className="grid grid-cols-8 gap-1.5">
                        {recentColors.map((recentColor, idx) => (
                            <button
                                key={idx}
                                type="button"
                                onClick={() => handleColorSelect(recentColor)}
                                className={`
                                    w-8 h-8 rounded-md border-2 transition-all duration-150
                                    hover:scale-110 hover:shadow-md
                                    ${color === recentColor 
                                        ? 'border-primary shadow-md scale-110 ring-2 ring-primary/20' 
                                        : 'border-border hover:border-primary/50'
                                    }
                                `}
                                style={{ backgroundColor: recentColor }}
                                title={recentColor}
                                aria-label={`Select recent color ${recentColor}`}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Custom Color Input */}
            <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block">Custom Color</label>
                <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                        <input
                            type="color"
                            value={customColor}
                            onChange={handleCustomColorChange}
                            className="w-full h-10 rounded-md border border-border cursor-pointer"
                            title="Select custom color"
                        />
                    </div>
                    <input
                        type="text"
                        value={customColor}
                        onChange={handleCustomColorChange}
                        className="w-24 h-10 px-3 text-sm border border-border rounded-md font-mono focus:outline-none focus:ring-2 focus:ring-primary/20"
                        placeholder="#000000"
                        pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
                    />
                </div>
            </div>

            {/* Current Color Display */}
            <div className="mt-4 pt-4 border-t border-border">
                <div className="flex items-center gap-3">
                    <span className="text-xs font-medium text-muted-foreground">Current:</span>
                    <div className="flex items-center gap-2">
                        <div
                            className="w-8 h-8 rounded-md border-2 border-border shadow-sm"
                            style={{ backgroundColor: color }}
                        />
                        <span className="text-sm font-mono">{color.toUpperCase()}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

