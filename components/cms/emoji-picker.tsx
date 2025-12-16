"use client";

import { useState, useRef, useEffect } from 'react';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
import { Smile } from 'lucide-react';

interface EmojiPickerButtonProps {
    onEmojiClick: (emoji: string) => void;
}

export function EmojiPickerButton({ onEmojiClick }: EmojiPickerButtonProps) {
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

    const handleEmojiClick = (emojiData: EmojiClickData) => {
        onEmojiClick(emojiData.emoji);
        setShowPicker(false);
    };

    return (
        <div className="relative" ref={pickerRef}>
            <button
                type="button"
                onClick={() => setShowPicker(!showPicker)}
                className="h-9 w-9 p-0 rounded-md hover:bg-muted transition-all duration-200 flex items-center justify-center hover:scale-105 active:scale-95"
                title="Insert Emoji"
                aria-label="Insert Emoji"
            >
                <Smile className="w-4 h-4" />
            </button>
            {showPicker && (
                <div className="absolute z-50 mt-2 shadow-2xl rounded-lg overflow-hidden border border-border animate-in slide-in-from-top-2 fade-in-0 duration-200 max-h-[400px] overflow-y-auto smooth-scroll">
                    <EmojiPicker
                        onEmojiClick={handleEmojiClick}
                        width={350}
                        height={400}
                    />
                </div>
            )}
        </div>
    );
}

