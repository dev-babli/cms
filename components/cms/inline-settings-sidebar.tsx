"use client";

import { useState } from 'react';
import { X, FileText, Layout, Keyboard, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageSettings } from './page-layout';
import { DocumentProperties, DocumentInfo } from './document-properties';
import { ShortcutsPanel } from './shortcuts-panel';

interface InlineSettingsSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    activeTab?: 'page' | 'document' | 'shortcuts';
    pageSettings?: PageSettings | null;
    documentInfo?: DocumentInfo | null;
    onPageSettingsChange?: (settings: PageSettings) => void;
    onDocumentInfoChange?: (info: DocumentInfo) => void;
}

export function InlineSettingsSidebar({
    isOpen,
    onClose,
    activeTab: initialTab = 'page',
    pageSettings,
    documentInfo,
    onPageSettingsChange,
    onDocumentInfoChange,
}: InlineSettingsSidebarProps) {
    const [activeTab, setActiveTab] = useState<'page' | 'document' | 'shortcuts'>(initialTab);

    if (!isOpen) return null;

    return (
        <div className="h-full w-96 bg-white border-l border-border shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 max-h-[calc(100vh-200px)] overflow-hidden" style={{ width: 'min(384px, 90vw)' }}>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border bg-gradient-to-r from-slate-50 to-white">
                <div className="flex items-center gap-2">
                    <Settings className="w-4 h-4 text-muted-foreground" />
                    <h3 className="text-sm font-semibold">Settings</h3>
                </div>
                <button
                    onClick={onClose}
                    className="p-1.5 hover:bg-muted rounded-md transition-colors"
                    aria-label="Close sidebar"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-border">
                <button
                    onClick={() => setActiveTab('page')}
                    className={`flex-1 px-4 py-3 text-xs font-medium transition-colors border-b-2 ${
                        activeTab === 'page'
                            ? 'border-primary text-primary bg-primary/5'
                            : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`}
                >
                    <Layout className="w-4 h-4 mx-auto mb-1" />
                    Page Setup
                </button>
                <button
                    onClick={() => setActiveTab('document')}
                    className={`flex-1 px-4 py-3 text-xs font-medium transition-colors border-b-2 ${
                        activeTab === 'document'
                            ? 'border-primary text-primary bg-primary/5'
                            : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`}
                >
                    <FileText className="w-4 h-4 mx-auto mb-1" />
                    Properties
                </button>
                <button
                    onClick={() => setActiveTab('shortcuts')}
                    className={`flex-1 px-4 py-3 text-xs font-medium transition-colors border-b-2 ${
                        activeTab === 'shortcuts'
                            ? 'border-primary text-primary bg-primary/5'
                            : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`}
                >
                    <Keyboard className="w-4 h-4 mx-auto mb-1" />
                    Shortcuts
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto smooth-scroll">
                {activeTab === 'page' && (
                    <div className="p-4">
                        {/* Page setup content will be rendered inline here */}
                        <div className="text-sm text-muted-foreground">
                            Page layout settings will be integrated here
                        </div>
                    </div>
                )}
                {activeTab === 'document' && (
                    <div className="p-4">
                        {/* Document properties will be rendered inline here */}
                        <div className="text-sm text-muted-foreground">
                            Document properties will be integrated here
                        </div>
                    </div>
                )}
                {activeTab === 'shortcuts' && (
                    <div className="p-4">
                        <ShortcutsPanel onClose={() => {}} />
                    </div>
                )}
            </div>
        </div>
    );
}

