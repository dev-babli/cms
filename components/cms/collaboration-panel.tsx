"use client";

import { useState } from "react";
import { CollaborationUser } from "@/lib/realtime/collaboration-server";

interface CollaborationPanelProps {
    collaborators: CollaborationUser[];
    isConnected: boolean;
    isDocumentLocked: boolean;
    lockedBy?: string;
    isAutoSaving: boolean;
    lastSaved: Date | null;
    onLockDocument: () => void;
    onUnlockDocument: () => void;
    canEdit: boolean;
    isOwner: boolean;
}

export function CollaborationPanel({
    collaborators,
    isConnected,
    isDocumentLocked,
    lockedBy,
    isAutoSaving,
    lastSaved,
    onLockDocument,
    onUnlockDocument,
    canEdit,
    isOwner,
}: CollaborationPanelProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    const getStatusColor = (lastSeen: Date) => {
        const now = new Date();
        const diff = now.getTime() - lastSeen.getTime();

        if (diff < 30000) return 'bg-green-500'; // Active (30 seconds)
        if (diff < 300000) return 'bg-yellow-500'; // Away (5 minutes)
        return 'bg-gray-400'; // Inactive
    };

    const getStatusText = (lastSeen: Date) => {
        const now = new Date();
        const diff = now.getTime() - lastSeen.getTime();

        if (diff < 30000) return 'Active';
        if (diff < 300000) return 'Away';
        return 'Inactive';
    };

    return (
        <div className="fixed top-4 right-4 z-50">
            {/* Connection Status */}
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg mb-2 text-sm ${isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                {isConnected ? 'Connected' : 'Disconnected'}
            </div>

            {/* Auto-save Status */}
            {isAutoSaving && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg mb-2 text-sm bg-blue-100 text-blue-800">
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    Auto-saving...
                </div>
            )}

            {lastSaved && !isAutoSaving && (
                <div className="px-3 py-2 rounded-lg mb-2 text-sm bg-gray-100 text-gray-600">
                    Saved {lastSaved.toLocaleTimeString()}
                </div>
            )}

            {/* Document Lock Status */}
            {isDocumentLocked && (
                <div className={`px-3 py-2 rounded-lg mb-2 text-sm ${isOwner ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'
                    }`}>
                    {isOwner ? 'You have locked this document' : `Document locked by ${lockedBy}`}
                </div>
            )}

            {/* Collaborators Panel */}
            <div className="bg-white rounded-lg shadow-lg border">
                <div
                    className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50"
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">
                            Collaborators ({collaborators.length})
                        </span>
                    </div>
                    <svg
                        className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>

                {isExpanded && (
                    <div className="border-t">
                        {/* Document Controls */}
                        <div className="p-3 border-b bg-gray-50">
                            <div className="flex gap-2">
                                {!isDocumentLocked ? (
                                    <button
                                        onClick={onLockDocument}
                                        className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                                    >
                                        Lock for Editing
                                    </button>
                                ) : isOwner ? (
                                    <button
                                        onClick={onUnlockDocument}
                                        className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                                    >
                                        Unlock
                                    </button>
                                ) : (
                                    <span className="px-3 py-1 text-xs bg-gray-300 text-gray-600 rounded">
                                        Document Locked
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Collaborators List */}
                        <div className="max-h-64 overflow-y-auto">
                            {collaborators.map((collaborator) => (
                                <div key={collaborator.id} className="flex items-center gap-3 p-3 hover:bg-gray-50">
                                    <div className="relative">
                                        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                                            <span className="text-xs font-medium text-gray-600">
                                                {collaborator.name.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                        <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(collaborator.lastSeen)}`} />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium text-gray-900 truncate">
                                                {collaborator.name}
                                            </span>
                                            {collaborator.id === lockedBy && (
                                                <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded">
                                                    Editing
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                            <span>{getStatusText(collaborator.lastSeen)}</span>
                                            {collaborator.cursor && (
                                                <span>• Position {collaborator.cursor.position}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Edit Permissions */}
                        <div className="p-3 border-t bg-gray-50">
                            <div className="text-xs text-gray-600">
                                {canEdit ? (
                                    <span className="text-green-600">✓ You can edit this document</span>
                                ) : (
                                    <span className="text-orange-600">⚠ Read-only mode</span>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}



