import db from '../db';

// Initialize version history table
let tableInitialized = false;

async function initTable() {
  if (tableInitialized) return;
  
  await db.exec(`
    CREATE TABLE IF NOT EXISTS content_versions (
      id SERIAL PRIMARY KEY,
      document_type TEXT NOT NULL,
      document_id INTEGER NOT NULL,
      version_number INTEGER NOT NULL,
      content TEXT NOT NULL,
      changed_by TEXT,
      change_description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(document_type, document_id, version_number)
    );

    CREATE INDEX IF NOT EXISTS idx_versions_lookup 
    ON content_versions(document_type, document_id, version_number DESC);
  `);
  
  tableInitialized = true;
}

export const versioning = {
  // Save a new version
  saveVersion: async (
    documentType: string,
    documentId: number,
    content: any,
    changedBy?: string,
    description?: string
  ) => {
    await initTable();
    // Get latest version number
    const latestVersion = await db
      .prepare('SELECT MAX(version_number) as max FROM content_versions WHERE document_type = ? AND document_id = ?')
      .get(documentType, documentId) as { max: number | null };
    
    const newVersionNumber = (latestVersion?.max || 0) + 1;
    
    const stmt = db.prepare(`
      INSERT INTO content_versions (document_type, document_id, version_number, content, changed_by, change_description)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    return await stmt.run(
      documentType,
      documentId,
      newVersionNumber,
      JSON.stringify(content),
      changedBy || 'Unknown',
      description || `Version ${newVersionNumber}`
    );
  },

  // Get all versions for a document
  getVersions: async (documentType: string, documentId: number) => {
    await initTable();
    const stmt = db.prepare(`
      SELECT * FROM content_versions 
      WHERE document_type = ? AND document_id = ?
      ORDER BY version_number DESC
    `);
    return await stmt.all(documentType, documentId);
  },

  // Get specific version
  getVersion: async (documentType: string, documentId: number, versionNumber: number) => {
    await initTable();
    const stmt = db.prepare(`
      SELECT * FROM content_versions 
      WHERE document_type = ? AND document_id = ? AND version_number = ?
    `);
    const result = await stmt.get(documentType, documentId, versionNumber) as any;
    if (result) {
      result.content = JSON.parse(result.content);
    }
    return result;
  },

  // Restore to a specific version
  restoreVersion: async (documentType: string, documentId: number, versionNumber: number) => {
    const version = await versioning.getVersion(documentType, documentId, versionNumber);
    if (!version) {
      throw new Error('Version not found');
    }
    
    // Save current state as new version before restoring
    // Then return the content to restore
    return version.content;
  },

  // Get version count
  getVersionCount: async (documentType: string, documentId: number) => {
    await initTable();
    const result = await db.prepare(`
      SELECT COUNT(*) as count FROM content_versions 
      WHERE document_type = ? AND document_id = ?
    `).get(documentType, documentId) as { count: number };
    return result.count;
  },
};





