"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import * as Dialog from '@radix-ui/react-dialog';
import { FileText, User, Tag, Calendar } from 'lucide-react';

interface DocumentPropertiesProps {
    onClose: () => void;
    onSave: (properties: DocumentInfo) => void;
    initialProperties?: DocumentInfo;
}

export interface DocumentInfo {
    title: string;
    author: string;
    subject: string;
    keywords: string;
    comments: string;
}

export function DocumentProperties({ onClose, onSave, initialProperties }: DocumentPropertiesProps) {
    const [properties, setProperties] = useState<DocumentInfo>(
        initialProperties || {
            title: '',
            author: '',
            subject: '',
            keywords: '',
            comments: '',
        }
    );

    return (
        <Dialog.Root open={true} onOpenChange={onClose}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
                <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl w-[600px] z-50">
                    <div className="p-6 border-b border-border">
                        <Dialog.Title className="text-xl font-semibold flex items-center gap-2">
                            <FileText className="w-5 h-5" />
                            Document Properties
                        </Dialog.Title>
                    </div>
                    <div className="p-6 space-y-4">
                        <div>
                            <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                                <FileText className="w-4 h-4" />
                                Title
                            </label>
                            <input
                                type="text"
                                value={properties.title}
                                onChange={(e) => setProperties({ ...properties, title: e.target.value })}
                                className="w-full px-3 py-2 border border-border rounded-md"
                                placeholder="Document title"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                                <User className="w-4 h-4" />
                                Author
                            </label>
                            <input
                                type="text"
                                value={properties.author}
                                onChange={(e) => setProperties({ ...properties, author: e.target.value })}
                                className="w-full px-3 py-2 border border-border rounded-md"
                                placeholder="Author name"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-2 block">Subject</label>
                            <input
                                type="text"
                                value={properties.subject}
                                onChange={(e) => setProperties({ ...properties, subject: e.target.value })}
                                className="w-full px-3 py-2 border border-border rounded-md"
                                placeholder="Subject"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                                <Tag className="w-4 h-4" />
                                Keywords
                            </label>
                            <input
                                type="text"
                                value={properties.keywords}
                                onChange={(e) => setProperties({ ...properties, keywords: e.target.value })}
                                className="w-full px-3 py-2 border border-border rounded-md"
                                placeholder="Keywords (comma separated)"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-2 block">Comments</label>
                            <textarea
                                value={properties.comments}
                                onChange={(e) => setProperties({ ...properties, comments: e.target.value })}
                                className="w-full px-3 py-2 border border-border rounded-md min-h-[100px]"
                                placeholder="Comments"
                            />
                        </div>
                    </div>
                    <div className="p-6 border-t border-border flex justify-end gap-2">
                        <Button variant="outline" onClick={onClose}>Cancel</Button>
                        <Button onClick={() => {
                            onSave(properties);
                            onClose();
                        }}>Save</Button>
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}



