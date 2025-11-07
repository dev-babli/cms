// Content workflows and validation
import db from '../db';

export enum WorkflowStatus {
  DRAFT = 'draft',
  PENDING_REVIEW = 'pending_review',
  IN_REVIEW = 'in_review',
  APPROVED = 'approved',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

// Initialize workflows table
db.exec(`
  CREATE TABLE IF NOT EXISTS content_workflows (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    document_type TEXT NOT NULL,
    document_id INTEGER NOT NULL,
    status TEXT NOT NULL,
    assigned_to INTEGER,
    reviewer_notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (assigned_to) REFERENCES users(id)
  );

  CREATE INDEX IF NOT EXISTS idx_workflows ON content_workflows(document_type, document_id);
`);

export const workflows = {
  // Create workflow
  create: (documentType: string, documentId: number, status: WorkflowStatus = WorkflowStatus.DRAFT) => {
    const stmt = db.prepare(`
      INSERT INTO content_workflows (document_type, document_id, status)
      VALUES (?, ?, ?)
    `);
    return stmt.run(documentType, documentId, status);
  },

  // Update workflow status
  updateStatus: (
    documentType: string,
    documentId: number,
    status: WorkflowStatus,
    assignedTo?: number,
    reviewerNotes?: string
  ) => {
    const stmt = db.prepare(`
      UPDATE content_workflows 
      SET status = ?, assigned_to = ?, reviewer_notes = ?, updated_at = CURRENT_TIMESTAMP
      WHERE document_type = ? AND document_id = ?
    `);
    return stmt.run(status, assignedTo || null, reviewerNotes || null, documentType, documentId);
  },

  // Get workflow
  get: (documentType: string, documentId: number) => {
    return db.prepare(`
      SELECT * FROM content_workflows 
      WHERE document_type = ? AND document_id = ?
      ORDER BY created_at DESC
      LIMIT 1
    `).get(documentType, documentId);
  },

  // Get all pending reviews
  getPendingReviews: () => {
    return db.prepare(`
      SELECT * FROM content_workflows 
      WHERE status IN ('pending_review', 'in_review')
      ORDER BY created_at DESC
    `).all();
  },
};

// Validation rules
export const validationRules = {
  blogPost: {
    title: {
      required: true,
      minLength: 10,
      maxLength: 200,
      message: 'Title must be between 10 and 200 characters',
    },
    slug: {
      required: true,
      pattern: /^[a-z0-9-]+$/,
      message: 'Slug must be lowercase letters, numbers, and hyphens only',
    },
    content: {
      required: true,
      minLength: 100,
      message: 'Content must be at least 100 characters',
    },
    excerpt: {
      maxLength: 300,
      message: 'Excerpt should be under 300 characters',
    },
  },
};

export function validateContent(type: string, data: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const rules = validationRules[type as keyof typeof validationRules];

  if (!rules) {
    return { valid: true, errors: [] };
  }

  Object.entries(rules).forEach(([field, rule]: [string, any]) => {
    const value = data[field];

    if (rule.required && !value) {
      errors.push(`${field} is required`);
    }

    if (value && rule.minLength && value.length < rule.minLength) {
      errors.push(rule.message || `${field} is too short`);
    }

    if (value && rule.maxLength && value.length > rule.maxLength) {
      errors.push(rule.message || `${field} is too long`);
    }

    if (value && rule.pattern && !rule.pattern.test(value)) {
      errors.push(rule.message || `${field} format is invalid`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}





