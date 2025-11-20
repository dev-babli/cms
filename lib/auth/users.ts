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
  status: 'active' | 'inactive' | 'suspended' | 'pending';
  email_verified: boolean;
  last_login?: string;
  created_at: string;
  updated_at: string;
  supabase_user_id?: string; // Link to Supabase Auth user
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
    
    // Insert user with 'pending' status for admin approval
    const stmt = db.prepare(`
      INSERT INTO users (email, password_hash, name, role, status, email_verified)
      VALUES (?, ?, ?, ?, 'pending', false)
      RETURNING *
    `);
    
    const result = await stmt.run(email, password_hash, name, role);
    
    // Return created user from result
    if (result.lastInsertRowid) {
      const user = await db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid) as User;
      return user;
    }
    throw new Error('Failed to create user');
  },

  // Get user by email
  findByEmail: async (email: string): Promise<User | null> => {
    const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
    return await stmt.get(email) as User | null;
  },

  // Get user by ID
  findById: async (id: number): Promise<User | null> => {
    const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
    return await stmt.get(id) as User | null;
  },

  // Verify password
  verifyPassword: async (password: string, hash: string): Promise<boolean> => {
    return await bcrypt.compare(password, hash);
  },

  // Get user with password for authentication
  findByEmailWithPassword: async (email: string): Promise<(User & { password_hash: string }) | null> => {
    const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
    return await stmt.get(email) as (User & { password_hash: string }) | null;
  },

  // Update user
  update: async (id: number, updates: Partial<User>): Promise<User> => {
    const fields = Object.keys(updates).filter(k => k !== 'id' && k !== 'password_hash');
    const values = fields.map(field => updates[field as keyof User]);
    
    if (fields.length > 0) {
      const setClause = fields.map(field => `${field} = ?`).join(', ');
      const stmt = db.prepare(`
        UPDATE users 
        SET ${setClause}, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
        RETURNING *
      `);
      await stmt.run(...values, id);
    }
    
    const user = await users.findById(id);
    if (!user) throw new Error('User not found');
    return user;
  },

  // Update last login
  updateLastLogin: async (id: number): Promise<void> => {
    const stmt = db.prepare('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?');
    await stmt.run(id);
  },

  // Delete user
  delete: async (id: number): Promise<boolean> => {
    const stmt = db.prepare('DELETE FROM users WHERE id = ?');
    const result = await stmt.run(id);
    return result.changes > 0;
  },

  // List all users
  list: async (): Promise<User[]> => {
    const stmt = db.prepare('SELECT * FROM users ORDER BY created_at DESC');
    return await stmt.all() as User[];
  },

  // Get users by role
  findByRole: async (role: string): Promise<User[]> => {
    const stmt = db.prepare('SELECT * FROM users WHERE role = ? ORDER BY created_at DESC');
    return await stmt.all(role) as User[];
  },
};

// Session management
export const sessions = {
  // Create session
  create: async (userId: number): Promise<Session> => {
    const token = nanoid(32);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days
    
    const stmt = db.prepare(`
      INSERT INTO user_sessions (user_id, token, expires_at)
      VALUES (?, ?, ?)
      RETURNING *
    `);
    
    const result = await stmt.run(userId, token, expiresAt.toISOString());
    
    return {
      id: Number(result.lastInsertRowid),
      user_id: userId,
      token,
      expires_at: expiresAt.toISOString(),
      created_at: new Date().toISOString(),
    };
  },

  // Find session by token
  findByToken: async (token: string): Promise<(Session & { user: User }) | null> => {
    const stmt = db.prepare(`
      SELECT s.*, u.* 
      FROM user_sessions s
      JOIN users u ON s.user_id = u.id
      WHERE s.token = ? AND s.expires_at > CURRENT_TIMESTAMP
    `);
    
    const result = await stmt.get(token) as any;
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
  delete: async (token: string): Promise<boolean> => {
    const stmt = db.prepare('DELETE FROM user_sessions WHERE token = ?');
    const result = await stmt.run(token);
    return result.changes > 0;
  },

  // Delete all sessions for user
  deleteAllForUser: async (userId: number): Promise<boolean> => {
    const stmt = db.prepare('DELETE FROM user_sessions WHERE user_id = ?');
    const result = await stmt.run(userId);
    return result.changes > 0;
  },

  // Clean expired sessions
  cleanExpired: async (): Promise<number> => {
    const stmt = db.prepare("DELETE FROM user_sessions WHERE expires_at <= CURRENT_TIMESTAMP");
    const result = await stmt.run();
    return result.changes;
  },
};

// Initialize default admin user
export const initializeDefaultAdmin = async (): Promise<void> => {
  const adminExists = await users.findByEmail('admin@emscale.com');
  
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



