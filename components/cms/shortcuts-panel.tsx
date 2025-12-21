"use client";

import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Keyboard, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Shortcut {
    category: string;
    keys: string;
    description: string;
}

const shortcuts: Shortcut[] = [
    { category: 'Formatting', keys: 'Ctrl+B', description: 'Bold' },
    { category: 'Formatting', keys: 'Ctrl+I', description: 'Italic' },
    { category: 'Formatting', keys: 'Ctrl+U', description: 'Underline' },
    { category: 'Formatting', keys: 'Ctrl+K', description: 'Insert Link' },
    { category: 'Editing', keys: 'Ctrl+Z', description: 'Undo' },
    { category: 'Editing', keys: 'Ctrl+Shift+Z', description: 'Redo' },
    { category: 'Editing', keys: 'Ctrl+F', description: 'Find' },
    { category: 'Editing', keys: 'Ctrl+H', description: 'Find & Replace' },
    { category: 'Editing', keys: 'Ctrl+A', description: 'Select All' },
    { category: 'Editing', keys: 'Ctrl+C', description: 'Copy' },
    { category: 'Editing', keys: 'Ctrl+V', description: 'Paste' },
    { category: 'Editing', keys: 'Ctrl+X', description: 'Cut' },
    { category: 'Navigation', keys: 'Ctrl+Home', description: 'Go to Start' },
    { category: 'Navigation', keys: 'Ctrl+End', description: 'Go to End' },
    { category: 'View', keys: 'Ctrl+/', description: 'Show Shortcuts' },
];

interface ShortcutsPanelProps {
    onClose: () => void;
}

export function ShortcutsPanel({ onClose }: ShortcutsPanelProps) {
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    const categories = Array.from(new Set(shortcuts.map(s => s.category)));
    const filteredShortcuts = shortcuts.filter(s => {
        const matchesSearch = s.description.toLowerCase().includes(search.toLowerCase()) ||
                            s.keys.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = !selectedCategory || s.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <Dialog.Root open={true} onOpenChange={onClose}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
                <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl w-[700px] max-h-[80vh] z-50 flex flex-col">
                    <div className="p-6 border-b border-border">
                        <Dialog.Title className="text-xl font-semibold flex items-center gap-2">
                            <Keyboard className="w-5 h-5" />
                            Keyboard Shortcuts
                        </Dialog.Title>
                    </div>
                    <div className="p-6 border-b border-border">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search shortcuts..."
                                className="w-full pl-10 pr-4 py-2 border border-border rounded-md"
                            />
                        </div>
                        <div className="flex gap-2 mt-4 flex-wrap">
                            <button
                                onClick={() => setSelectedCategory(null)}
                                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                                    !selectedCategory
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-muted hover:bg-muted/80'
                                }`}
                            >
                                All
                            </button>
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`px-3 py-1 text-sm rounded-md transition-colors ${
                                        selectedCategory === cat
                                            ? 'bg-primary text-primary-foreground'
                                            : 'bg-muted hover:bg-muted/80'
                                    }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6">
                        <div className="space-y-4">
                            {categories.map(category => {
                                const categoryShortcuts = filteredShortcuts.filter(s => s.category === category);
                                if (categoryShortcuts.length === 0) return null;
                                
                                return (
                                    <div key={category}>
                                        <h3 className="font-semibold text-sm text-muted-foreground mb-2">{category}</h3>
                                        <div className="space-y-2">
                                            {categoryShortcuts.map((shortcut, idx) => (
                                                <div key={idx} className="flex items-center justify-between p-3 hover:bg-muted rounded-md">
                                                    <span className="text-sm">{shortcut.description}</span>
                                                    <kbd className="px-2 py-1 bg-muted border border-border rounded text-xs font-mono">
                                                        {shortcut.keys}
                                                    </kbd>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    <div className="p-6 border-t border-border flex justify-end">
                        <Button onClick={onClose}>Close</Button>
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}



