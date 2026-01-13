/**
 * Query Optimizer Utilities
 * Optimizes database queries for better performance
 */

/**
 * Select only essential fields for list views
 * Reduces data transfer and improves query speed
 */
export const LIST_FIELDS = {
  blogPosts: 'id, title, slug, excerpt, featured_image, author, published, publish_date, created_at',
  jobPostings: 'id, title, slug, location, employment_type, published, created_at',
  ebooks: 'id, title, slug, excerpt, cover_image, author, published, publish_date, created_at',
  caseStudies: 'id, title, slug, excerpt, featured_image, published, created_at',
  teamMembers: 'id, name, role, image, bio, created_at',
  leads: 'id, name, email, phone, company, content_type, content_id, created_at',
  pages: 'id, slug, title, published, is_visible, created_at',
};

/**
 * Build optimized SELECT query with field selection
 */
export function buildOptimizedQuery(
  table: keyof typeof LIST_FIELDS,
  where?: string,
  orderBy?: string,
  limit?: number
): string {
  const fields = LIST_FIELDS[table] || '*';
  let query = `SELECT ${fields} FROM ${table}`;
  
  if (where) {
    query += ` WHERE ${where}`;
  }
  
  if (orderBy) {
    query += ` ORDER BY ${orderBy}`;
  }
  
  if (limit) {
    query += ` LIMIT ${limit}`;
  }
  
  return query;
}

/**
 * Pagination helper
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

export function getPaginationParams(params: PaginationParams) {
  const page = params.page || 1;
  const limit = params.limit || 20;
  const offset = params.offset !== undefined ? params.offset : (page - 1) * limit;
  
  return { limit, offset, page };
}

/**
 * Build pagination SQL
 */
export function buildPaginationSQL(limit: number, offset: number): string {
  return `LIMIT ${limit} OFFSET ${offset}`;
}

