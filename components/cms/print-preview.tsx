"use client";

import { Editor } from '@tiptap/core';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import * as Dialog from '@radix-ui/react-dialog';
import { Printer, Download, X, ZoomIn, ZoomOut } from 'lucide-react';
import jsPDF from 'jspdf';

interface PrintPreviewProps {
    editor: Editor;
    onClose: () => void;
}

export function PrintPreview({ editor, onClose }: PrintPreviewProps) {
    const [zoom, setZoom] = useState(100);
    const [page, setPage] = useState(1);

    const handlePrint = () => {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Print</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 20px; }
                        ${editor.getHTML()}
                    </style>
                </head>
                <body>
                    ${editor.getHTML()}
                </body>
                </html>
            `);
            printWindow.document.close();
            printWindow.print();
        }
    };

    const handleExportPDF = () => {
        const pdf = new jsPDF();
        const content = editor.getText();
        pdf.text(content, 10, 10);
        pdf.save('document.pdf');
    };

    return (
        <Dialog.Root open={true} onOpenChange={onClose}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
                <Dialog.Content className="fixed inset-4 bg-white rounded-lg shadow-xl z-50 flex flex-col">
                    <div className="p-4 border-b border-border flex items-center justify-between">
                        <Dialog.Title className="text-xl font-semibold flex items-center gap-2">
                            <Printer className="w-5 h-5" />
                            Print Preview
                        </Dialog.Title>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setZoom(Math.max(50, zoom - 10))}
                                className="p-2 hover:bg-muted rounded-md"
                            >
                                <ZoomOut className="w-4 h-4" />
                            </button>
                            <span className="text-sm font-medium w-16 text-center">{zoom}%</span>
                            <button
                                onClick={() => setZoom(Math.min(200, zoom + 10))}
                                className="p-2 hover:bg-muted rounded-md"
                            >
                                <ZoomIn className="w-4 h-4" />
                            </button>
                            <div className="w-px h-6 bg-border mx-2" />
                            <Button variant="outline" size="sm" onClick={handleExportPDF}>
                                <Download className="w-4 h-4 mr-2" />
                                Export PDF
                            </Button>
                            <Button size="sm" onClick={handlePrint}>
                                <Printer className="w-4 h-4 mr-2" />
                                Print
                            </Button>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-muted rounded-md"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                    <div className="flex-1 overflow-auto p-8 bg-slate-50 flex justify-center">
                        <div
                            className="bg-white shadow-lg p-8 max-w-4xl"
                            style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
                        >
                            <div
                                className="prose max-w-none"
                                dangerouslySetInnerHTML={{ __html: editor.getHTML() }}
                            />
                        </div>
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}















