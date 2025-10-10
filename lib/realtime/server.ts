// Real-time collaboration server using WebSockets
import { Server as SocketServer } from 'socket.io';
import { Server as HTTPServer } from 'http';

export interface CollaborationEvent {
  type: 'user_joined' | 'user_left' | 'content_updated' | 'cursor_move';
  userId: string;
  documentId: string;
  data: any;
  timestamp: number;
}

let io: SocketServer | null = null;

export function initializeRealtimeServer(httpServer: HTTPServer) {
  if (io) return io;

  io = new SocketServer(httpServer, {
    cors: {
      origin: process.env.NEXTAUTH_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Join document room
    socket.on('join_document', (documentId: string) => {
      socket.join(`document:${documentId}`);
      
      // Notify others
      socket.to(`document:${documentId}`).emit('user_joined', {
        userId: socket.id,
        timestamp: Date.now(),
      });
    });

    // Leave document room
    socket.on('leave_document', (documentId: string) => {
      socket.leave(`document:${documentId}`);
      
      socket.to(`document:${documentId}`).emit('user_left', {
        userId: socket.id,
        timestamp: Date.now(),
      });
    });

    // Broadcast content changes
    socket.on('content_update', (event: CollaborationEvent) => {
      socket.to(`document:${event.documentId}`).emit('content_updated', event);
    });

    // Broadcast cursor position
    socket.on('cursor_move', (event: CollaborationEvent) => {
      socket.to(`document:${event.documentId}`).emit('cursor_moved', event);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  return io;
}

export function getRealtimeServer() {
  return io;
}



