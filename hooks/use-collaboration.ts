"use client";

import { useState, useEffect, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { CollaborationUser, Operation } from '@/lib/realtime/collaboration-server';

interface UseCollaborationOptions {
  documentId: string;
  user: CollaborationUser;
  onContentChange?: (operation: Operation) => void;
  onCursorUpdate?: (userId: string, cursor: any) => void;
  onUserJoined?: (user: CollaborationUser, collaborators: CollaborationUser[]) => void;
  onUserLeft?: (userId: string, collaborators: CollaborationUser[]) => void;
}

interface CollaborationState {
  socket: Socket | null;
  collaborators: CollaborationUser[];
  isConnected: boolean;
  isDocumentLocked: boolean;
  lockedBy?: string;
  documentVersion: number;
  lastModified?: Date;
  lastModifiedBy?: string;
}

export function useCollaboration(options: UseCollaborationOptions) {
  const [state, setState] = useState<CollaborationState>({
    socket: null,
    collaborators: [],
    isConnected: false,
    isDocumentLocked: false,
    documentVersion: 0,
  });

  const [content, setContent] = useState<string>('');
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Initialize socket connection
  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001', {
      transports: ['websocket'],
    });

    socket.on('connect', () => {
      console.log('Connected to collaboration server');
      setState(prev => ({ ...prev, socket, isConnected: true }));
      
      // Join the document
      socket.emit('join-document', {
        documentId: options.documentId,
        user: options.user,
      });
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from collaboration server');
      setState(prev => ({ ...prev, isConnected: false }));
    });

    // Handle document state
    socket.on('document-state', (data: {
      content: string;
      version: number;
      collaborators: CollaborationUser[];
      lockedBy?: string;
    }) => {
      setContent(data.content);
      setState(prev => ({
        ...prev,
        collaborators: data.collaborators,
        documentVersion: data.version,
        isDocumentLocked: !!data.lockedBy,
        lockedBy: data.lockedBy,
      }));
    });

    // Handle user joined
    socket.on('user-joined', (data: {
      user: CollaborationUser;
      collaborators: CollaborationUser[];
    }) => {
      setState(prev => ({
        ...prev,
        collaborators: data.collaborators,
      }));
      options.onUserJoined?.(data.user, data.collaborators);
    });

    // Handle user left
    socket.on('user-left', (data: {
      userId: string;
      collaborators: CollaborationUser[];
      lockedBy?: string;
    }) => {
      setState(prev => ({
        ...prev,
        collaborators: data.collaborators,
        isDocumentLocked: !!data.lockedBy,
        lockedBy: data.lockedBy,
      }));
      options.onUserLeft?.(data.userId, data.collaborators);
    });

    // Handle cursor updates
    socket.on('cursor-updated', (data: { userId: string; cursor: any }) => {
      setState(prev => ({
        ...prev,
        collaborators: prev.collaborators.map(collaborator =>
          collaborator.id === data.userId
            ? { ...collaborator, cursor: data.cursor }
            : collaborator
        ),
      }));
      options.onCursorUpdate?.(data.userId, data.cursor);
    });

    // Handle content changes
    socket.on('content-changed', (data: {
      operation: Operation;
      version: number;
      lastModified: Date;
      lastModifiedBy: string;
    }) => {
      setState(prev => ({
        ...prev,
        documentVersion: data.version,
        lastModified: new Date(data.lastModified),
        lastModifiedBy: data.lastModifiedBy,
      }));
      options.onContentChange?.(data.operation);
    });

    // Handle document locked
    socket.on('document-locked', (data: { lockedBy: string; message: string }) => {
      setState(prev => ({
        ...prev,
        isDocumentLocked: true,
        lockedBy: data.lockedBy,
      }));
    });

    // Handle document unlocked
    socket.on('document-unlocked', (data: { unlockedBy: string; message: string }) => {
      setState(prev => ({
        ...prev,
        isDocumentLocked: false,
        lockedBy: undefined,
      }));
    });

    return () => {
      socket.disconnect();
    };
  }, [options.documentId, options.user.id]);

  // Send content change
  const sendContentChange = useCallback((operation: Operation) => {
    if (state.socket && state.isConnected) {
      state.socket.emit('content-change', {
        documentId: options.documentId,
        userId: options.user.id,
        operation,
      });
    }
  }, [state.socket, state.isConnected, options.documentId, options.user.id]);

  // Send cursor update
  const sendCursorUpdate = useCallback((cursor: any) => {
    if (state.socket && state.isConnected) {
      state.socket.emit('cursor-move', {
        documentId: options.documentId,
        userId: options.user.id,
        cursor,
      });
    }
  }, [state.socket, state.isConnected, options.documentId, options.user.id]);

  // Lock document
  const lockDocument = useCallback(() => {
    if (state.socket && state.isConnected && !state.isDocumentLocked) {
      state.socket.emit('lock-document', {
        documentId: options.documentId,
        userId: options.user.id,
      });
    }
  }, [state.socket, state.isConnected, state.isDocumentLocked, options.documentId, options.user.id]);

  // Unlock document
  const unlockDocument = useCallback(() => {
    if (state.socket && state.isConnected && state.lockedBy === options.user.id) {
      state.socket.emit('unlock-document', {
        documentId: options.documentId,
        userId: options.user.id,
      });
    }
  }, [state.socket, state.isConnected, state.lockedBy, options.documentId, options.user.id]);

  // Leave document
  const leaveDocument = useCallback(() => {
    if (state.socket && state.isConnected) {
      state.socket.emit('leave-document', {
        documentId: options.documentId,
        userId: options.user.id,
      });
    }
  }, [state.socket, state.isConnected, options.documentId, options.user.id]);

  // Auto-save functionality
  useEffect(() => {
    if (state.lastModified && state.lastModifiedBy !== options.user.id) {
      setIsAutoSaving(true);
      setLastSaved(new Date());
      
      const timer = setTimeout(() => {
        setIsAutoSaving(false);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [state.lastModified, state.lastModifiedBy, options.user.id]);

  return {
    // State
    ...state,
    content,
    isAutoSaving,
    lastSaved,
    
    // Actions
    sendContentChange,
    sendCursorUpdate,
    lockDocument,
    unlockDocument,
    leaveDocument,
    
    // Computed
    canEdit: !state.isDocumentLocked || state.lockedBy === options.user.id,
    isOwner: state.lockedBy === options.user.id,
  };
}

