"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Layout, Palette, Columns } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';

interface PageLayoutProps {
    onClose: () => void;
    onApply: (settings: PageSettings) => void;
}

export interface PageSettings {
    margins: {
        top: string;
        bottom: string;
        left: string;
        right: string;
    };
    orientation: 'portrait' | 'landscape';
    pageSize: 'A4' | 'Letter' | 'Legal' | 'Custom';
    customSize?: { width: string; height: string };
    pageColor: string;
    columns: number;
}

export function PageLayout({ onClose, onApply }: PageLayoutProps) {
    const [settings, setSettings] = useState<PageSettings>({
        margins: { top: '1in', bottom: '1in', left: '1in', right: '1in' },
        orientation: 'portrait',
        pageSize: 'A4',
        pageColor: '#FFFFFF',
        columns: 1,
    });
    const [activeTab, setActiveTab] = useState<'margins' | 'paper' | 'layout'>('margins');

    return (
        <Dialog.Root open={true} onOpenChange={onClose}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
                <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl w-[600px] max-h-[80vh] overflow-hidden z-50 flex flex-col">
                    <div className="p-6 border-b border-border">
                        <Dialog.Title className="text-xl font-semibold flex items-center gap-2">
                            <FileText className="w-5 h-5" />
                            Page Setup
                        </Dialog.Title>
                    </div>
                    
                    <div className="flex border-b border-border">
                        <button
                            onClick={() => setActiveTab('margins')}
                            className={`px-6 py-3 text-sm font-medium transition-colors ${
                                activeTab === 'margins' 
                                    ? 'text-primary border-b-2 border-primary' 
                                    : 'text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            Margins
                        </button>
                        <button
                            onClick={() => setActiveTab('paper')}
                            className={`px-6 py-3 text-sm font-medium transition-colors ${
                                activeTab === 'paper' 
                                    ? 'text-primary border-b-2 border-primary' 
                                    : 'text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            Paper
                        </button>
                        <button
                            onClick={() => setActiveTab('layout')}
                            className={`px-6 py-3 text-sm font-medium transition-colors ${
                                activeTab === 'layout' 
                                    ? 'text-primary border-b-2 border-primary' 
                                    : 'text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            Layout
                        </button>
                    </div>

                    <div className="p-6 overflow-y-auto flex-1">
                        {activeTab === 'margins' && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium mb-2 block">Top</label>
                                        <input
                                            type="text"
                                            value={settings.margins.top}
                                            onChange={(e) => setSettings({
                                                ...settings,
                                                margins: { ...settings.margins, top: e.target.value }
                                            })}
                                            className="w-full px-3 py-2 border border-border rounded-md"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium mb-2 block">Bottom</label>
                                        <input
                                            type="text"
                                            value={settings.margins.bottom}
                                            onChange={(e) => setSettings({
                                                ...settings,
                                                margins: { ...settings.margins, bottom: e.target.value }
                                            })}
                                            className="w-full px-3 py-2 border border-border rounded-md"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium mb-2 block">Left</label>
                                        <input
                                            type="text"
                                            value={settings.margins.left}
                                            onChange={(e) => setSettings({
                                                ...settings,
                                                margins: { ...settings.margins, left: e.target.value }
                                            })}
                                            className="w-full px-3 py-2 border border-border rounded-md"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium mb-2 block">Right</label>
                                        <input
                                            type="text"
                                            value={settings.margins.right}
                                            onChange={(e) => setSettings({
                                                ...settings,
                                                margins: { ...settings.margins, right: e.target.value }
                                            })}
                                            className="w-full px-3 py-2 border border-border rounded-md"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'paper' && (
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium mb-2 block">Page Size</label>
                                    <select
                                        value={settings.pageSize}
                                        onChange={(e) => setSettings({ ...settings, pageSize: e.target.value as any })}
                                        className="w-full px-3 py-2 border border-border rounded-md"
                                    >
                                        <option value="A4">A4 (8.27" x 11.69")</option>
                                        <option value="Letter">Letter (8.5" x 11")</option>
                                        <option value="Legal">Legal (8.5" x 14")</option>
                                        <option value="Custom">Custom</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-2 block">Orientation</label>
                                    <div className="flex gap-4">
                                        <button
                                            onClick={() => setSettings({ ...settings, orientation: 'portrait' })}
                                            className={`flex-1 p-4 border-2 rounded-lg transition-colors ${
                                                settings.orientation === 'portrait' 
                                                    ? 'border-primary bg-primary/10' 
                                                    : 'border-border hover:border-primary/50'
                                            }`}
                                        >
                                            <div className="w-12 h-16 mx-auto border-2 border-current" />
                                            <p className="mt-2 text-sm">Portrait</p>
                                        </button>
                                        <button
                                            onClick={() => setSettings({ ...settings, orientation: 'landscape' })}
                                            className={`flex-1 p-4 border-2 rounded-lg transition-colors ${
                                                settings.orientation === 'landscape' 
                                                    ? 'border-primary bg-primary/10' 
                                                    : 'border-border hover:border-primary/50'
                                            }`}
                                        >
                                            <div className="w-16 h-12 mx-auto border-2 border-current" />
                                            <p className="mt-2 text-sm">Landscape</p>
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-2 block">Page Color</label>
                                    <input
                                        type="color"
                                        value={settings.pageColor}
                                        onChange={(e) => setSettings({ ...settings, pageColor: e.target.value })}
                                        className="w-full h-12 border border-border rounded-md"
                                    />
                                </div>
                            </div>
                        )}

                        {activeTab === 'layout' && (
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium mb-2 block">Columns</label>
                                    <div className="flex gap-2">
                                        {[1, 2, 3].map((num) => (
                                            <button
                                                key={num}
                                                onClick={() => setSettings({ ...settings, columns: num })}
                                                className={`flex-1 p-4 border-2 rounded-lg transition-colors ${
                                                    settings.columns === num 
                                                        ? 'border-primary bg-primary/10' 
                                                        : 'border-border hover:border-primary/50'
                                                }`}
                                            >
                                                <Columns className="w-6 h-6 mx-auto mb-2" />
                                                <p className="text-sm">{num} Column{num > 1 ? 's' : ''}</p>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="p-6 border-t border-border flex justify-end gap-2">
                        <Button variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button onClick={() => {
                            onApply(settings);
                            onClose();
                        }}>
                            Apply
                        </Button>
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}



