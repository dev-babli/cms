import db from '../db';
import bcrypt from 'bcryptjs';
import { nanoid } from 'nanoid';

export interface User {
  id: number;
  email: string;
  name: string;
  avatar?: string;
  bio?: string;
  role: 'admin' | 'editor' | 'author' | 'viewer';
  status: 'active' | 'inactive' | 'suspended';
  email_verified: boolean;
  last_login?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateUserData {
  email: string;
  password: string;
  name: string;
  role?: 'admin' | 'editor' | 'author' | 'viewer';
}

export interface LoginData {
  email: string;
  password: string;
}

export interface Session {
  id: number;
  user_id: number;
  token: string;
  expires_at: string;
  created_at: string;
}

// User management functions
export const users = {
  // Create a new user
  create: async (userData: CreateUserData): Promise<User> => {
    const { email, password, name, role = 'author' } = userData;
    
    // Hash password
    const saltRounds = 12;
    const password_hash = await bcrypt.hash(password, saltRounds);
    
    // Insert user
    const stmt = db.prepare(`
      INSERT INTO users (email, password_hash, name, role, status, email_verified)
      VALUES (?, ?, ?, ?, 'active', 0)
    `);
    
    const result = stmt.run(email, password_hash, name, role);
    
    // Return created user (without password)
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid) as User;
    return user;
  },

  // Get user by email
  findByEmail: (email: string): User | null => {
    const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
    return stmt.get(email) as User | null;
  },

  // Get user by ID
  findById: (id: number): User | null => {
    const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
    return stmt.get(id) as User | null;
  },

  // Verify password
  verifyPassword: async (password: string, hash: string): Promise<boolean> => {
    return await bcrypt.compare(password, hash);
  },

  // Get user with password for authentication
  findByEmailWithPassword: (email: string): (User & { password_hash: string }) | null => {
    const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
    return stmt.get(email) as (User & { password_hash: string }) | null;
  },

  // Update user
  update: (id: number, updates: Partial<User>): User => {
    const fields = Object.keys(updates).filter(k => k !== 'id' && k !== 'password_hash');
    const values = fields.map(field => updates[field as keyof User]);
    
    if (fields.length > 0) {
      const setClause = fields.map(field => `${field} = ?`).join(', ');
      const stmt = db.prepare(`
        UPDATE users 
        SET ${setClause}, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `);
      stmt.run(...values, id);
    }
    
    return users.findById(id)!;
  },

  // Update last login
  updateLastLogin: (id: number): void => {
    const stmt = db.prepare('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?');
    stmt.run(id);
  },

  // Delete user
  delete: (id: number): boolean => {
    const stmt = db.prepare('DELETE FROM users WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  },

  // List all users
  list: (): User[] => {
    const stmt = db.prepare('SELECT * FROM users ORDER BY created_at DESC');
    return stmt.all() as User[];
  },

  // Get users by role
  findByRole: (role: string): User[] => {
    const stmt = db.prepare('SELECT * FROM users WHERE role = ? ORDER BY created_at DESC');
    return stmt.all(role) as User[];
  },
};

// Session management
export const sessions = {
  // Create session
  create: (userId: number): Session => {
    const token = nanoid(32);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days
    
    const stmt = db.prepare(`
      INSERT INTO user_sessions (user_id, token, expires_at)
      VALUES (?, ?, ?)
    `);
    
    const result = stmt.run(userId, token, expiresAt.toISOString());
    
    return {
      id: Number(result.lastInsertRowid),
      user_id: userId,
      token,
      expires_at: expiresAt.toISOString(),
      created_at: new Date().toISOString(),
    };
  },

  // Find session by token
  findByToken: (token: string): (Session & { user: User }) | null => {
    const stmt = db.prepare(`
      SELECT s.*, u.* 
      FROM user_sessions s
      JOIN users u ON s.user_id = u.id
      WHERE s.token = ? AND s.expires_at > datetime('now')
    `);
    
    const result = stmt.get(token) as any;
    if (!result) return null;
    
    const { user_id, token: sessionToken, expires_at, created_at, ...userData } = result;
    
    return {
      id: result.id,
      user_id,
      token: sessionToken,
      expires_at,
      created_at,
      user: userData,
    };
  },

  // Delete session
  delete: (token: string): boolean => {
    const stmt = db.prepare('DELETE FROM user_sessions WHERE token = ?');
    const result = stmt.run(token);
    return result.changes > 0;
  },

  // Delete all sessions for user
  deleteAllForUser: (userId: number): boolean => {
    const stmt = db.prepare('DELETE FROM user_sessions WHERE user_id = ?');
    const result = stmt.run(userId);
    return result.changes > 0;
  },

  // Clean expired sessions
  cleanExpired: (): number => {
    const stmt = db.prepare("DELETE FROM user_sessions WHERE expires_at <= datetime('now')");
    const result = stmt.run();
    return result.changes;
  },
};

// Initialize default admin user
export const initializeDefaultAdmin = async (): Promise<void> => {
  const adminExists = users.findByEmail('admin@emscale.com');
  
  if (!adminExists) {
    await users.create({
      email: 'admin@emscale.com',
      password: 'admin123',
      name: 'System Administrator',
      role: 'admin',
    });
    
    console.log('Default admin user created: admin@emscale.com / admin123');
  }
};



