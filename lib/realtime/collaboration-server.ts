import { Server } from 'socket.io';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';

export interface CollaborationUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  cursor?: {
    position: number;
    selection?: {
      start: number;
      end: number;
    };
  };
  lastSeen: Date;
}

export interface DocumentState {
  id: string;
  content: string;
  version: number;
  lastModified: Date;
  lastModifiedBy: string;
  lockedBy?: string;
  collaborators: Map<string, CollaborationUser>;
}

export interface Operation {
  type: 'insert' | 'delete' | 'retain';
  content?: string;
  length: number;
  version: number;
  userId: string;
  timestamp: number;
}

class CollaborationServer {
  private io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>;
  private documents: Map<string, DocumentState> = new Map();
  private userSessions: Map<string, string> = new Map(); // userId -> documentId

  constructor(io: Server) {
    this.io = io;
    this.setupEventHandlers();
    this.startCleanupInterval();
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log('User connected:', socket.id);

      // Join document room
      socket.on('join-document', (data: { documentId: string; user: CollaborationUser }) => {
        this.joinDocument(socket, data.documentId, data.user);
      });

      // Leave document room
      socket.on('leave-document', (data: { documentId: string; userId: string }) => {
        this.leaveDocument(socket, data.documentId, data.userId);
      });

      // Handle cursor movements
      socket.on('cursor-move', (data: { documentId: string; userId: string; cursor: any }) => {
        this.updateCursor(data.documentId, data.userId, data.cursor);
      });

      // Handle content changes
      socket.on('content-change', (data: { documentId: string; userId: string; operation: Operation }) => {
        this.handleContentChange(data.documentId, data.userId, data.operation);
      });

      // Handle document lock
      socket.on('lock-document', (data: { documentId: string; userId: string }) => {
        this.lockDocument(data.documentId, data.userId);
      });

      // Handle document unlock
      socket.on('unlock-document', (data: { documentId: string; userId: string }) => {
        this.unlockDocument(data.documentId, data.userId);
      });

      // Handle disconnect
      socket.on('disconnect', () => {
        this.handleDisconnect(socket.id);
      });
    });
  }

  private joinDocument(socket: any, documentId: string, user: CollaborationUser) {
    socket.join(documentId);
    this.userSessions.set(socket.id, documentId);

    // Get or create document state
    let document = this.documents.get(documentId);
    if (!document) {
      document = {
        id: documentId,
        content: '',
        version: 0,
        lastModified: new Date(),
        lastModifiedBy: user.id,
        collaborators: new Map(),
      };
      this.documents.set(documentId, document);
    }

    // Add user to collaborators
    user.lastSeen = new Date();
    document.collaborators.set(user.id, user);

    // Notify others in the room
    socket.to(documentId).emit('user-joined', {
      user,
      collaborators: Array.from(document.collaborators.values()),
    });

    // Send current document state to the new user
    socket.emit('document-state', {
      content: document.content,
      version: document.version,
      collaborators: Array.from(document.collaborators.values()),
      lockedBy: document.lockedBy,
    });

    console.log(`User ${user.name} joined document ${documentId}`);
  }

  private leaveDocument(socket: any, documentId: string, userId: string) {
    socket.leave(documentId);
    this.userSessions.delete(socket.id);

    const document = this.documents.get(documentId);
    if (document) {
      document.collaborators.delete(userId);
      
      // If user had locked the document, unlock it
      if (document.lockedBy === userId) {
        document.lockedBy = undefined;
      }

      // Notify others in the room
      socket.to(documentId).emit('user-left', {
        userId,
        collaborators: Array.from(document.collaborators.values()),
        lockedBy: document.lockedBy,
      });

      // Clean up empty documents
      if (document.collaborators.size === 0) {
        this.documents.delete(documentId);
      }
    }

    console.log(`User ${userId} left document ${documentId}`);
  }

  private updateCursor(documentId: string, userId: string, cursor: any) {
    const document = this.documents.get(documentId);
    if (document) {
      const user = document.collaborators.get(userId);
      if (user) {
        user.cursor = cursor;
        user.lastSeen = new Date();

        // Broadcast cursor position to others
        this.io.to(documentId).emit('cursor-updated', {
          userId,
          cursor,
        });
      }
    }
  }

  private handleContentChange(documentId: string, userId: string, operation: Operation) {
    const document = this.documents.get(documentId);
    if (!document) return;

    // Check if document is locked by another user
    if (document.lockedBy && document.lockedBy !== userId) {
      this.io.to(documentId).emit('document-locked', {
        lockedBy: document.lockedBy,
        message: 'Document is locked by another user',
      });
      return;
    }

    // Apply operational transformation
    const transformedOperation = this.transformOperation(operation, document.version);
    
    // Apply the operation to the document
    document.content = this.applyOperation(document.content, transformedOperation);
    document.version++;
    document.lastModified = new Date();
    document.lastModifiedBy = userId;

    // Update user's last seen
    const user = document.collaborators.get(userId);
    if (user) {
      user.lastSeen = new Date();
    }

    // Broadcast the change to all collaborators except the sender
    this.io.to(documentId).emit('content-changed', {
      operation: transformedOperation,
      version: document.version,
      lastModified: document.lastModified,
      lastModifiedBy: document.lastModifiedBy,
    });

    console.log(`Document ${documentId} updated by ${userId}, version: ${document.version}`);
  }

  private transformOperation(operation: Operation, documentVersion: number): Operation {
    // Simple operational transformation
    // In a production system, you'd implement proper OT algorithms
    return {
      ...operation,
      version: documentVersion + 1,
      timestamp: Date.now(),
    };
  }

  private applyOperation(content: string, operation: Operation): string {
    // Simple operation application
    // In a production system, you'd implement proper OT algorithms
    let result = content;
    let position = 0;

    // This is a simplified version - real OT is much more complex
    if (operation.type === 'insert' && operation.content) {
      result = result.slice(0, position) + operation.content + result.slice(position);
    } else if (operation.type === 'delete') {
      result = result.slice(0, position) + result.slice(position + operation.length);
    }

    return result;
  }

  private lockDocument(documentId: string, userId: string) {
    const document = this.documents.get(documentId);
    if (document && !document.lockedBy) {
      document.lockedBy = userId;
      
      this.io.to(documentId).emit('document-locked', {
        lockedBy: userId,
        message: 'Document has been locked for editing',
      });

      console.log(`Document ${documentId} locked by ${userId}`);
    }
  }

  private unlockDocument(documentId: string, userId: string) {
    const document = this.documents.get(documentId);
    if (document && document.lockedBy === userId) {
      document.lockedBy = undefined;
      
      this.io.to(documentId).emit('document-unlocked', {
        unlockedBy: userId,
        message: 'Document has been unlocked',
      });

      console.log(`Document ${documentId} unlocked by ${userId}`);
    }
  }

  private handleDisconnect(socketId: string) {
    const documentId = this.userSessions.get(socketId);
    if (documentId) {
      // Find user ID by socket ID (you'd need to maintain this mapping)
      // For now, we'll handle this in a simplified way
      console.log(`Socket ${socketId} disconnected from document ${documentId}`);
    }
  }

  private startCleanupInterval() {
    // Clean up inactive users every 5 minutes
    setInterval(() => {
      const now = new Date();
      const inactiveThreshold = 5 * 60 * 1000; // 5 minutes

      for (const [documentId, document] of this.documents) {
        const inactiveUsers: string[] = [];
        
        for (const [userId, user] of document.collaborators) {
          if (now.getTime() - user.lastSeen.getTime() > inactiveThreshold) {
            inactiveUsers.push(userId);
          }
        }

        inactiveUsers.forEach(userId => {
          document.collaborators.delete(userId);
        });

        if (document.collaborators.size === 0) {
          this.documents.delete(documentId);
        }
      }
    }, 5 * 60 * 1000);
  }

  // Public methods for external access
  public getDocumentState(documentId: string): DocumentState | undefined {
    return this.documents.get(documentId);
  }

  public getCollaborators(documentId: string): CollaborationUser[] {
    const document = this.documents.get(documentId);
    return document ? Array.from(document.collaborators.values()) : [];
  }

  public isDocumentLocked(documentId: string): boolean {
    const document = this.documents.get(documentId);
    return document ? !!document.lockedBy : false;
  }
}

export default CollaborationServer;



