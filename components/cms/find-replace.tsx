"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Editor } from '@tiptap/core';
import { Search } from 'lucide-react';

interface FindReplaceProps {
    editor: Editor;
    onClose: () => void;
}

export function FindReplace({ editor, onClose }: FindReplaceProps) {
    const [findText, setFindText] = useState('');
    const [replaceText, setReplaceText] = useState('');
    const [matchCase, setMatchCase] = useState(false);
    const [matchCount, setMatchCount] = useState(0);
    const [currentMatch, setCurrentMatch] = useState(0);

    useEffect(() => {
        if (!findText) {
            setMatchCount(0);
            setCurrentMatch(0);
            return;
        }

        const content = editor.getHTML();
        const regex = new RegExp(
            findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
            matchCase ? 'g' : 'gi'
        );
        const matches = content.match(regex);
        setMatchCount(matches ? matches.length : 0);
        setCurrentMatch(0);
    }, [findText, matchCase, editor]);

    const findNext = () => {
        if (!findText) return;
        // TipTap doesn't have built-in find, so we'll use browser's find
        // For a proper implementation, we'd need to extend TipTap
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const text = editor.getText();
            const start = range.startOffset;
            const searchText = matchCase ? findText : findText.toLowerCase();
            const content = matchCase ? text : text.toLowerCase();
            const index = content.indexOf(searchText, start);
            if (index !== -1) {
                editor.commands.setTextSelection({ from: index, to: index + findText.length });
            }
        }
    };

    const replace = () => {
        if (!findText) return;
        const selectedText = editor.state.doc.textBetween(
            editor.state.selection.from,
            editor.state.selection.to
        );
        if (selectedText === findText || (!matchCase && selectedText.toLowerCase() === findText.toLowerCase())) {
            editor.commands.insertContent(replaceText);
            findNext();
        }
    };

    const replaceAll = () => {
        if (!findText) return;
        const content = editor.getHTML();
        const regex = new RegExp(
            findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
            matchCase ? 'g' : 'gi'
        );
        const newContent = content.replace(regex, replaceText);
        editor.commands.setContent(newContent);
        setMatchCount(0);
    };

    return (
        <div className="w-full">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                    <Search className="w-4 h-4" />
                    Find & Replace
                </h3>
                <button
                    type="button"
                    onClick={onClose}
                    className="h-7 w-7 p-0 rounded-md hover:bg-muted transition-colors flex items-center justify-center text-muted-foreground hover:text-foreground"
                    aria-label="Close"
                >
                    ×
                </button>
            </div>
            <div className="space-y-3">
                <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Find</label>
                    <input
                        type="text"
                        value={findText}
                        onChange={(e) => setFindText(e.target.value)}
                        className="w-full h-9 px-3 text-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20"
                        placeholder="Search..."
                    />
                </div>
                <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Replace</label>
                    <input
                        type="text"
                        value={replaceText}
                        onChange={(e) => setReplaceText(e.target.value)}
                        className="w-full h-9 px-3 text-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20"
                        placeholder="Replace with..."
                    />
                </div>
                <div className="flex items-center gap-2">
                    <label className="flex items-center gap-2 text-sm">
                        <input
                            type="checkbox"
                            checked={matchCase}
                            onChange={(e) => setMatchCase(e.target.checked)}
                        />
                        Match case
                    </label>
                    {matchCount > 0 && (
                        <span className="text-sm text-muted-foreground">
                            {currentMatch + 1} of {matchCount}
                        </span>
                    )}
                </div>
                <div className="flex gap-2 pt-2">
                    <Button
                        type="button"
                        variant="default"
                        size="sm"
                        onClick={findNext}
                        disabled={!findText}
                        className="flex-1"
                    >
                        Find Next
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={replace}
                        disabled={!findText}
                        className="flex-1"
                    >
                        Replace
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={replaceAll}
                        disabled={!findText}
                        className="flex-1"
                    >
                        Replace All
                    </Button>
                </div>
            </div>
        </div>
    );
}

