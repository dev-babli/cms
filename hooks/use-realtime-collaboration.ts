"use client";

import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

interface CollaborationUser {
  userId: string;
  cursor?: { x: number; y: number };
}

export function useRealtimeCollaboration(documentId: string) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connectedUsers, setConnectedUsers] = useState<CollaborationUser[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Initialize socket connection
    const socketInstance = io({
      path: '/api/socket',
    });

    socketInstance.on('connect', () => {
      setIsConnected(true);
      socketInstance.emit('join_document', documentId);
    });

    socketInstance.on('disconnect', () => {
      setIsConnected(false);
    });

    socketInstance.on('user_joined', (data) => {
      setConnectedUsers((prev) => [...prev, { userId: data.userId }]);
    });

    socketInstance.on('user_left', (data) => {
      setConnectedUsers((prev) => prev.filter((u) => u.userId !== data.userId));
    });

    socketInstance.on('content_updated', (event) => {
      // Handle content updates from other users
      console.log('Content updated by another user:', event);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.emit('leave_document', documentId);
      socketInstance.disconnect();
    };
  }, [documentId]);

  const broadcastUpdate = (data: any) => {
    if (socket && isConnected) {
      socket.emit('content_update', {
        type: 'content_updated',
        documentId,
        data,
        timestamp: Date.now(),
      });
    }
  };

  return {
    isConnected,
    connectedUsers,
    broadcastUpdate,
  };
}





