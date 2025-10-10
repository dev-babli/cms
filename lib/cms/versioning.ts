import db from '../db';

// Initialize version history table
db.exec(`
  CREATE TABLE IF NOT EXISTS content_versions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    document_type TEXT NOT NULL,
    document_id INTEGER NOT NULL,
    version_number INTEGER NOT NULL,
    content TEXT NOT NULL,
    changed_by TEXT,
    change_description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(document_type, document_id, version_number)
  );

  CREATE INDEX IF NOT EXISTS idx_versions_lookup 
  ON content_versions(document_type, document_id, version_number DESC);
`);

export const versioning = {
  // Save a new version
  saveVersion: (
    documentType: string,
    documentId: number,
    content: any,
    changedBy?: string,
    description?: string
  ) => {
    // Get latest version number
    const latestVersion = db
      .prepare('SELECT MAX(version_number) as max FROM content_versions WHERE document_type = ? AND document_id = ?')
      .get(documentType, documentId) as { max: number | null };
    
    const newVersionNumber = (latestVersion?.max || 0) + 1;
    
    const stmt = db.prepare(`
      INSERT INTO content_versions (document_type, document_id, version_number, content, changed_by, change_description)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    return stmt.run(
      documentType,
      documentId,
      newVersionNumber,
      JSON.stringify(content),
      changedBy || 'Unknown',
      description || `Version ${newVersionNumber}`
    );
  },

  // Get all versions for a document
  getVersions: (documentType: string, documentId: number) => {
    const stmt = db.prepare(`
      SELECT * FROM content_versions 
      WHERE document_type = ? AND document_id = ?
      ORDER BY version_number DESC
    `);
    return stmt.all(documentType, documentId);
  },

  // Get specific version
  getVersion: (documentType: string, documentId: number, versionNumber: number) => {
    const stmt = db.prepare(`
      SELECT * FROM content_versions 
      WHERE document_type = ? AND document_id = ? AND version_number = ?
    `);
    const result = stmt.get(documentType, documentId, versionNumber) as any;
    if (result) {
      result.content = JSON.parse(result.content);
    }
    return result;
  },

  // Restore to a specific version
  restoreVersion: (documentType: string, documentId: number, versionNumber: number) => {
    const version = versioning.getVersion(documentType, documentId, versionNumber);
    if (!version) {
      throw new Error('Version not found');
    }
    
    // Save current state as new version before restoring
    // Then return the content to restore
    return version.content;
  },

  // Get version count
  getVersionCount: (documentType: string, documentId: number) => {
    const result = db.prepare(`
      SELECT COUNT(*) as count FROM content_versions 
      WHERE document_type = ? AND document_id = ?
    `).get(documentType, documentId) as { count: number };
    return result.count;
  },
};



