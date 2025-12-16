"use client";

import { Editor } from '@tiptap/core';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Download, FileText, FileCode, FileType, File } from 'lucide-react';
import jsPDF from 'jspdf';

interface ExportMenuProps {
    editor: Editor;
}

export function ExportMenu({ editor }: ExportMenuProps) {
    const [isOpen, setIsOpen] = useState(false);

    const exportToPDF = () => {
        const pdf = new jsPDF();
        const content = editor.getText();
        const lines = pdf.splitTextToSize(content, 180);
        pdf.text(lines, 10, 10);
        pdf.save('document.pdf');
        setIsOpen(false);
    };

    const exportToHTML = () => {
        const html = editor.getHTML();
        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'document.html';
        a.click();
        URL.revokeObjectURL(url);
        setIsOpen(false);
    };

    const exportToMarkdown = () => {
        // Simple markdown conversion
        const html = editor.getHTML();
        let markdown = html
            .replace(/<h1>(.*?)<\/h1>/g, '# $1\n')
            .replace(/<h2>(.*?)<\/h2>/g, '## $1\n')
            .replace(/<h3>(.*?)<\/h3>/g, '### $1\n')
            .replace(/<strong>(.*?)<\/strong>/g, '**$1**')
            .replace(/<em>(.*?)<\/em>/g, '*$1*')
            .replace(/<a href="(.*?)">(.*?)<\/a>/g, '[$2]($1)')
            .replace(/<p>(.*?)<\/p>/g, '$1\n\n')
            .replace(/<br\s*\/?>/g, '\n')
            .replace(/<[^>]+>/g, '');
        
        const blob = new Blob([markdown], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'document.md';
        a.click();
        URL.revokeObjectURL(url);
        setIsOpen(false);
    };

    const exportToText = () => {
        const text = editor.getText();
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'document.txt';
        a.click();
        URL.revokeObjectURL(url);
        setIsOpen(false);
    };

    return (
        <DropdownMenu.Root open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenu.Trigger asChild>
                <Button variant="ghost" size="sm" className="h-9">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                </Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
                <DropdownMenu.Content className="min-w-[200px] bg-white border border-border rounded-lg shadow-xl p-1 z-50">
                    <DropdownMenu.Item
                        className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-muted cursor-pointer outline-none"
                        onSelect={exportToPDF}
                    >
                        <FileText className="w-4 h-4" />
                        Export as PDF
                    </DropdownMenu.Item>
                    <DropdownMenu.Item
                        className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-muted cursor-pointer outline-none"
                        onSelect={exportToHTML}
                    >
                        <FileCode className="w-4 h-4" />
                        Export as HTML
                    </DropdownMenu.Item>
                    <DropdownMenu.Item
                        className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-muted cursor-pointer outline-none"
                        onSelect={exportToMarkdown}
                    >
                        <FileType className="w-4 h-4" />
                        Export as Markdown
                    </DropdownMenu.Item>
                    <DropdownMenu.Item
                        className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-muted cursor-pointer outline-none"
                        onSelect={exportToText}
                    >
                        <File className="w-4 h-4" />
                        Export as Plain Text
                    </DropdownMenu.Item>
                </DropdownMenu.Content>
            </DropdownMenu.Portal>
        </DropdownMenu.Root>
    );
}

