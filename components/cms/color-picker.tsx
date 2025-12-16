"use client";

import { useState, useRef, useEffect } from 'react';
import { InlineColorPicker } from './inline-color-picker';

interface ColorPickerProps {
    color: string;
    onChange: (color: string) => void;
    label?: string;
    presetColors?: string[];
}

export function ColorPicker({ color, onChange, label = 'Color', presetColors }: ColorPickerProps) {
    const [showPicker, setShowPicker] = useState(false);
    const pickerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
                setShowPicker(false);
            }
        }

        if (showPicker) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [showPicker]);

    return (
        <div className="relative" ref={pickerRef}>
            <button
                type="button"
                onClick={() => setShowPicker(!showPicker)}
                className="h-9 w-9 p-0 border border-border rounded-md hover:border-primary/50 transition-all duration-200 flex items-center justify-center group hover:scale-105"
                title={label}
                style={{ backgroundColor: color }}
                aria-label={label}
            >
                <div className="w-full h-full rounded-md border-2 border-white shadow-sm group-hover:shadow-md transition-shadow" />
                <span className="sr-only">{label}</span>
            </button>
            <InlineColorPicker
                color={color}
                onChange={onChange}
                label={label}
                presetColors={presetColors}
                isOpen={showPicker}
                onClose={() => setShowPicker(false)}
            />
        </div>
    );
}

