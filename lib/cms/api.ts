import db, { query, execute, queryAll } from '../db';
import type { BlogPost, TeamMember, Page, Testimonial, JobPosting, Ebook, CaseStudy, Lead, Category, HeroSlide, HeroSlidesConfig, OfficeAddress } from './types';

// Blog Posts
export const blogPosts = {
  getAll: async (published = false, limit?: number) => {
    try {
      // Performance: Select only needed fields instead of *
      // For dashboard/list views, we don't need full content
      const fields = limit && limit <= 20 
        ? 'id, title, slug, excerpt, featured_image, author, published, publish_date, created_at, updated_at'
        : 'id, title, slug, excerpt, featured_image, author, published, publish_date, created_at';
      
      const limitClause = limit ? `LIMIT ${limit}` : '';
      const sqlQuery = published 
        ? `SELECT ${fields} FROM blog_posts 
           WHERE (published = true OR published::text = 'true' OR published::text = '1')
           ORDER BY publish_date DESC NULLS LAST, created_at DESC ${limitClause}`
        : `SELECT ${fields} FROM blog_posts ORDER BY created_at DESC ${limitClause}`;
      
      const result = await query(sqlQuery);
      return result?.rows || [];
    } catch (error: any) {
      console.error('❌ Error in blogPosts.getAll:', error);
      throw error;
    }
  },
  
  getBySlug: async (slug: string) => {
    try {
      const result = await query('SELECT * FROM blog_posts WHERE slug = $1', [slug]);
      return (result?.rows?.[0] || null) as BlogPost | null;
    } catch (error: any) {
      console.error('Error fetching blog post by slug:', error);
      console.error('Slug:', slug);
      console.error('Error details:', {
        message: error?.message,
        code: error?.code,
        detail: error?.detail,
        hint: error?.hint
      });
      throw error;
    }
  },
  
  create: async (post: Omit<BlogPost, 'id'> | any) => {
    // Use PostgreSQL syntax directly for better reliability
    const sql = `
      INSERT INTO blog_posts (
        slug, title, excerpt, content, author, featured_image, banner_image, category, tags, 
        published, publish_date, scheduled_publish_date,
        meta_title, meta_description, meta_keywords, canonical_url,
        og_title, og_description, og_image, og_type, schema_markup, created_by
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)
      RETURNING *
    `;
    return await execute(sql, [
      post.slug, 
      post.title, 
      post.excerpt || '', 
      post.content || '', 
      post.author || '', 
      post.featured_image || '', 
      post.banner_image || '',
      post.category || '', 
      post.tags || '', 
      post.published || false, 
      post.publish_date || new Date().toISOString(),
      post.scheduled_publish_date || null,
      // SEO Fields
      post.meta_title || null,
      post.meta_description || null,
      post.meta_keywords || null,
      post.canonical_url || null,
      post.og_title || null,
      post.og_description || null,
      post.og_image || null,
      post.og_type || 'article',
      post.schema_markup || null,
      post.created_by || null
    ]);
  },
  
  update: async (id: number, post: Partial<BlogPost>) => {
    const fields = Object.keys(post).filter(k => k !== 'id');
    if (fields.length === 0) {
      return { row: null, rows: [] };
    }
    // 2026: Use PostgreSQL syntax directly ($1, $2, etc.)
    const setClause = fields.map((k, i) => `${k} = $${i + 1}`).join(', ');
    const values = fields.map(field => post[field as keyof BlogPost]);
    const sql = `UPDATE blog_posts SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = $${fields.length + 1} RETURNING *`;
    const result = await execute(sql, [...values, id]);
    return result;
  },
  
  delete: async (id: number) => {
    try {
      const result = await execute('DELETE FROM blog_posts WHERE id = $1', [id]);
      console.log('🗑️ [blogPosts.delete] Deleted post ID:', id, 'Changes:', result?.changes);
      return result;
    } catch (error: any) {
      console.error('❌ [blogPosts.delete] Error deleting post:', id, error);
      throw error;
    }
  },
};

// Team Members
export const teamMembers = {
  getAll: async (published = false) => {
    const sqlQuery = published 
      ? 'SELECT * FROM team_members WHERE published = true ORDER BY order_index ASC'
      : 'SELECT * FROM team_members ORDER BY order_index ASC';
    const result = await query(sqlQuery);
    return result.rows || [];
  },
  
  create: async (member: Omit<TeamMember, 'id'>) => {
    try {
      const result = await execute(`
        INSERT INTO team_members (name, position, qualification, bio, image, email, linkedin, twitter, order_index, published)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *
      `, [
        member.name, member.position || '', member.qualification || '', member.bio || '', member.image || '',
        member.email || '', member.linkedin || '', member.twitter || '',
        member.order_index || 0, member.published || false
      ]);
      return result.rows?.[0] || result.row || result;
    } catch (error: any) {
      // Check if qualification column doesn't exist
      if (error?.message?.includes('qualification') || error?.message?.includes('column') && error?.message?.includes('does not exist')) {
        throw new Error(`Database column 'qualification' does not exist. Please run the migration: ALTER TABLE team_members ADD COLUMN qualification TEXT;`);
      }
      throw error;
    }
  },
  
  update: async (id: number, member: Partial<TeamMember>) => {
    const fields = Object.keys(member).filter(k => k !== 'id');
    if (fields.length === 0) {
      return { rows: [] };
    }
    const setClause = fields.map((k, i) => `${k} = $${i + 1}`).join(', ');
    const values = fields.map(field => member[field as keyof TeamMember]);
    const result = await execute(
      `UPDATE team_members SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = $${fields.length + 1} RETURNING *`,
      [...values, id]
    );
    return result.rows?.[0] || result.row || result;
  },
  
  delete: async (id: number) => {
    try {
      const result = await execute('DELETE FROM team_members WHERE id = $1', [id]);
      console.log('🗑️ [teamMembers.delete] Deleted member ID:', id, 'Changes:', result?.changes);
      return result;
    } catch (error: any) {
      console.error('❌ [teamMembers.delete] Error deleting member:', id, error);
      throw error;
    }
  },
};

// Job Postings
export const jobPostings = {
  getAll: async (published = false, limit?: number) => {
    // Performance: Select only needed fields for list views
    const fields = 'id, title, slug, location, employment_type, published, created_at';
    const limitClause = limit ? `LIMIT ${limit}` : '';
    const sqlQuery = published
      ? `SELECT ${fields} FROM job_postings WHERE published = true ORDER BY created_at DESC ${limitClause}`
      : `SELECT ${fields} FROM job_postings ORDER BY created_at DESC ${limitClause}`;
    const result = await query(sqlQuery);
    return result?.rows || [];
  },

  getBySlug: async (slug: string) => {
    const result = await query('SELECT * FROM job_postings WHERE slug = $1', [slug]);
    return (result?.rows?.[0] || null) as JobPosting | null;
  },

  create: async (job: Omit<JobPosting, 'id'>) => {
    const result = await execute(`
      INSERT INTO job_postings (title, slug, location, employment_type, categories, description, requirements, skills, salary_range, apply_url, remote, published)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `, [
      job.title,
      job.slug,
      job.location || '',
      job.employment_type || '',
      job.categories || '',
      job.description || '',
      job.requirements || '',
      job.skills || '',
      job.salary_range || '',
      job.apply_url || '',
      job.remote || false,
      job.published || false
    ]);
    return result.rows?.[0] || result.row || result;
  },

  update: async (id: number, job: Partial<JobPosting>) => {
    const fields = Object.keys(job).filter((k) => k !== 'id');
    const setClause = fields.map((k, i) => `${k} = $${i + 1}`).join(', ');
    const values = fields.map(field => job[field as keyof JobPosting]);
    const stmt = db.prepare(
      `UPDATE job_postings SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = $${fields.length + 1} RETURNING *`
    );
    return await stmt.run(...values, id);
  },

  delete: async (id: number) => {
    try {
      const result = await execute('DELETE FROM job_postings WHERE id = $1', [id]);
      console.log('🗑️ [jobPostings.delete] Deleted job ID:', id, 'Changes:', result?.changes);
      return result;
    } catch (error: any) {
      console.error('❌ [jobPostings.delete] Error deleting job:', id, error);
      throw error;
    }
  },
};

// Pages
export const pages = {
  getAll: async (published = false, visibleOnly = false) => {
    let sqlQuery = 'SELECT * FROM pages WHERE 1=1';
    
    if (published) {
      sqlQuery += ' AND (published = true OR published::text = \'true\' OR published::text = \'1\')';
    }
    
    if (visibleOnly) {
      sqlQuery += ' AND (is_visible = true OR is_visible IS NULL)';
    }
    
    sqlQuery += ' ORDER BY created_at DESC';
    
    const result = await query(sqlQuery);
    return result?.rows || [];
  },
  
  getBySlug: async (slug: string) => {
    const result = await query('SELECT * FROM pages WHERE slug = $1', [slug]);
    return (result?.rows?.[0] || null) as Page | null;
  },
  
  create: async (page: Omit<Page, 'id'>) => {
    const result = await execute(`
      INSERT INTO pages (slug, title, content, meta_description, published)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [
      page.slug, page.title, page.content || '', page.meta_description || '', page.published || false
    ]);
    return result.rows?.[0] || result.row || result;
  },
  
  update: async (id: number, page: Partial<Page>) => {
    const fields = Object.keys(page).filter(k => k !== 'id');
    const setClause = fields.map((k, i) => `${k} = $${i + 1}`).join(', ');
    const values = fields.map(field => page[field as keyof Page]);
    const stmt = db.prepare(`UPDATE pages SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = $${fields.length + 1} RETURNING *`);
    return await stmt.run(...values, id);
  },
  
  delete: async (id: number) => {
    try {
      const result = await execute('DELETE FROM pages WHERE id = $1', [id]);
      console.log('🗑️ [pages.delete] Deleted page ID:', id, 'Changes:', result?.changes);
      return result;
    } catch (error: any) {
      console.error('❌ [pages.delete] Error deleting page:', id, error);
      throw error;
    }
  },

  updateVisibility: async (id: number, isVisible: boolean, userId?: number) => {
    try {
      // Check if this is a protected page
      const page = await query('SELECT slug FROM pages WHERE id = $1', [id]);
      if (!page?.rows?.[0]) {
        throw new Error('Page not found');
      }
      
      const slug = page.rows[0].slug?.toLowerCase() || '';
      const protectedSlugs = ['home', '/', 'index', 'contact', 'contact-us', 'contactus'];
      
      if (protectedSlugs.includes(slug) && !isVisible) {
        throw new Error('Cannot hide homepage or contact page');
      }
      
      const result = await query(`
        UPDATE pages 
        SET is_visible = $1, visibility_changed_at = NOW(), visibility_changed_by = $2
        WHERE id = $3
        RETURNING *
      `, [isVisible, userId || null, id]);
      
      return result?.rows?.[0] || null;
    } catch (error: any) {
      console.error('❌ Error updating page visibility:', error);
      throw error;
    }
  },
};

// eBooks
export const ebooks = {
  getAll: async (published = false, limit?: number) => {
    // Performance: Select only needed fields for list views
    const fields = limit && limit <= 20
      ? 'id, title, slug, excerpt, cover_image, author, published, publish_date, created_at'
      : 'id, title, slug, excerpt, cover_image, published, publish_date, created_at';
    const limitClause = limit ? `LIMIT ${limit}` : '';
    const sqlQuery = published
      ? `SELECT ${fields} FROM ebooks 
         WHERE (published = true OR published::text = 'true' OR published::text = '1')
         ORDER BY publish_date DESC NULLS LAST, created_at DESC ${limitClause}`
      : `SELECT ${fields} FROM ebooks ORDER BY created_at DESC ${limitClause}`;
    const result = await query(sqlQuery);
    return result?.rows || [];
  },

  getBySlug: async (slug: string) => {
    const result = await query('SELECT * FROM ebooks WHERE slug = $1', [slug]);
    return (result?.rows?.[0] || null) as Ebook | null;
  },

  create: async (ebook: Omit<Ebook, 'id'>) => {
    // Use PostgreSQL syntax with execute
    const sql = `
      INSERT INTO ebooks (
        slug, title, excerpt, description, content, cover_image, pdf_url, pdf_size,
        author, category_id, category_ids, tags, featured, gated, published,
        publish_date, scheduled_publish_date, meta_title, meta_description, meta_keywords,
        canonical_url, og_title, og_description, og_image, og_type, schema_markup,
        google_analytics_id, custom_tracking_script, created_by
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29)
      RETURNING *
    `;
    const result = await execute(sql, [
      ebook.slug, 
      ebook.title, 
      ebook.excerpt || '', 
      ebook.description || '',
      ebook.content || '', 
      ebook.cover_image || '', 
      ebook.pdf_url || '', 
      ebook.pdf_size || 0,
      ebook.author || '', 
      ebook.category_id || null, 
      ebook.category_ids || '[]', 
      ebook.tags || '',
      ebook.featured || false, 
      ebook.gated !== false, 
      ebook.published || false,
      ebook.publish_date || null, 
      ebook.scheduled_publish_date || null,
      ebook.meta_title || '', 
      ebook.meta_description || '', 
      ebook.meta_keywords || '',
      ebook.canonical_url || '', 
      ebook.og_title || '', 
      ebook.og_description || '',
      ebook.og_image || '', 
      ebook.og_type || 'book', 
      ebook.schema_markup || '',
      ebook.google_analytics_id || '', 
      ebook.custom_tracking_script || '', 
      ebook.created_by || null
    ]);
    return result;
  },

  update: async (id: number, ebook: Partial<Ebook>) => {
    const fields = Object.keys(ebook).filter((k) => k !== 'id');
    if (fields.length === 0) {
      return { row: null, rows: [] };
    }
    const setClause = fields.map((k, i) => `${k} = $${i + 1}`).join(', ');
    const values = fields.map(field => {
      const value = ebook[field as keyof Ebook];
      // Handle tags array if needed
      if (field === 'tags' && Array.isArray(value)) {
        return value.length > 0 ? `{${value.join(',')}}` : '{}';
      }
      return value;
    });
    const sql = `UPDATE ebooks SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = $${fields.length + 1} RETURNING *`;
    const result = await execute(sql, [...values, id]);
    return result;
  },

  delete: async (id: number) => {
    try {
      const result = await execute('DELETE FROM ebooks WHERE id = $1', [id]);
      console.log('🗑️ [ebooks.delete] Deleted ebook ID:', id, 'Changes:', result?.changes);
      return result;
    } catch (error: any) {
      console.error('❌ [ebooks.delete] Error deleting ebook:', id, error);
      throw error;
    }
  },

  incrementDownload: async (id: number) => {
    return await db.prepare('UPDATE ebooks SET download_count = download_count + 1 WHERE id = $1 RETURNING download_count').run(id);
  },
};

// Case Studies
export const caseStudies = {
  getAll: async (published = false) => {
    // Handle published field as boolean, string, or number
    // PostgreSQL requires explicit casting for boolean comparisons
    const sqlQuery = published
      ? `SELECT * FROM case_studies 
         WHERE (published = true OR published::text = 'true' OR published::text = '1')
         ORDER BY publish_date DESC NULLS LAST, created_at DESC`
      : 'SELECT * FROM case_studies ORDER BY created_at DESC';
    const result = await query(sqlQuery);
    return result?.rows || [];
  },

  getBySlug: async (slug: string) => {
    const result = await query('SELECT * FROM case_studies WHERE slug = $1', [slug]);
    return (result?.rows?.[0] || null) as CaseStudy | null;
  },

  create: async (caseStudy: Omit<CaseStudy, 'id'>) => {
    // Use PostgreSQL syntax with execute
    const sql = `
      INSERT INTO case_studies (
        slug, title, excerpt, description, content, featured_image, pdf_url, pdf_size,
        client_name, client_logo, industry, challenge, solution, results, testimonial,
        category_id, category_ids, tags, featured, gated, published,
        publish_date, scheduled_publish_date, meta_title, meta_description, meta_keywords,
        canonical_url, og_title, og_description, og_image, og_type, schema_markup,
        google_analytics_id, custom_tracking_script, created_by
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35)
      RETURNING *
    `;
    const result = await execute(sql, [
      caseStudy.slug, 
      caseStudy.title, 
      caseStudy.excerpt || '', 
      caseStudy.description || '',
      caseStudy.content || '', 
      caseStudy.featured_image || '', 
      caseStudy.pdf_url || '', 
      caseStudy.pdf_size || 0,
      caseStudy.client_name || '', 
      caseStudy.client_logo || '', 
      caseStudy.industry || '',
      caseStudy.challenge || '', 
      caseStudy.solution || '', 
      caseStudy.results || '', 
      caseStudy.testimonial || '',
      caseStudy.category_id || null, 
      caseStudy.category_ids || '[]', 
      caseStudy.tags || '',
      caseStudy.featured || false, 
      caseStudy.gated !== false, 
      caseStudy.published || false,
      caseStudy.publish_date || null, 
      caseStudy.scheduled_publish_date || null,
      caseStudy.meta_title || '', 
      caseStudy.meta_description || '', 
      caseStudy.meta_keywords || '',
      caseStudy.canonical_url || '', 
      caseStudy.og_title || '', 
      caseStudy.og_description || '',
      caseStudy.og_image || '', 
      caseStudy.og_type || 'article', 
      caseStudy.schema_markup || '',
      caseStudy.google_analytics_id || '', 
      caseStudy.custom_tracking_script || '', 
      caseStudy.created_by || null
    ]);
    return result;
  },

  update: async (id: number, caseStudy: Partial<CaseStudy>) => {
    const fields = Object.keys(caseStudy).filter((k) => k !== 'id');
    if (fields.length === 0) {
      return { row: null, rows: [] };
    }
    const setClause = fields.map((k, i) => `${k} = $${i + 1}`).join(', ');
    const values = fields.map(field => {
      const value = caseStudy[field as keyof CaseStudy];
      // Handle tags array if needed
      if (field === 'tags' && Array.isArray(value)) {
        return value.length > 0 ? `{${value.join(',')}}` : '{}';
      }
      return value;
    });
    const sql = `UPDATE case_studies SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = $${fields.length + 1} RETURNING *`;
    const result = await execute(sql, [...values, id]);
    return result;
  },

  delete: async (id: number) => {
    try {
      const result = await execute('DELETE FROM case_studies WHERE id = $1', [id]);
      console.log('🗑️ [caseStudies.delete] Deleted case study ID:', id, 'Changes:', result?.changes);
      return result;
    } catch (error: any) {
      console.error('❌ [caseStudies.delete] Error deleting case study:', id, error);
      throw error;
    }
  },

  incrementDownload: async (id: number) => {
    return await db.prepare('UPDATE case_studies SET download_count = download_count + 1 WHERE id = $1 RETURNING download_count').run(id);
  },
};


// Leads
export const leads = {
  getAll: async (limit?: number) => {
    try {
      // Performance: Select only needed fields, add limit for pagination
      // Combine first_name and last_name into a single name field for compatibility
      const fields = 'id, first_name, last_name, TRIM(COALESCE(first_name, \'\') || \' \' || COALESCE(last_name, \'\')) as name, email, phone, company, content_type, content_id, created_at';
      const limitClause = limit ? `LIMIT ${limit}` : '';
      const result = await query(`SELECT ${fields} FROM leads ORDER BY created_at DESC ${limitClause}`);
      // Ensure we return an array - handle both result.rows and result formats
      const rows = result?.rows || result || [];
      // Post-process to ensure name field is set properly
      return Array.isArray(rows) ? rows.map((row: any) => ({
        ...row,
        name: row.name || row.first_name || row.last_name || row.email || 'Unknown'
      })) : [];
    } catch (error: any) {
      console.error('❌ Error in leads.getAll:', error);
      throw error;
    }
  },

  getById: async (id: number) => {
    try {
      const result = await query('SELECT * FROM leads WHERE id = $1', [id]);
      return result.rows?.[0] || null;
    } catch (error: any) {
      console.error('❌ Error in leads.getById:', error);
      throw error;
    }
  },

  getByEmail: async (email: string) => {
    try {
      const result = await query('SELECT * FROM leads WHERE email = $1 ORDER BY created_at DESC', [email]);
      return result.rows || [];
    } catch (error: any) {
      console.error('❌ Error in leads.getByEmail:', error);
      throw error;
    }
  },

  getByContent: async (contentType: string, contentId: number) => {
    try {
      const result = await query(
        'SELECT * FROM leads WHERE content_type = $1 AND content_id = $2 ORDER BY created_at DESC',
        [contentType, contentId]
      );
      return result.rows || [];
    } catch (error: any) {
      console.error('❌ Error in leads.getByContent:', error);
      throw error;
    }
  },

  create: async (lead: Omit<Lead, 'id'>) => {
    try {
      console.log('💾 Leads.create: Creating lead', { email: lead.email, firstName: lead.first_name });
      const result = await query(
        `INSERT INTO leads (
          first_name, last_name, email, phone, company, job_title, role, industry,
          content_type, content_id, content_title, lead_source, campaign, medium, referrer,
          utm_source, utm_medium, utm_campaign, utm_term, utm_content, status, notes,
          assigned_to, consent_marketing, consent_data_processing, ip_address, user_agent
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27)
        RETURNING *`,
        [
          lead.first_name,
          lead.last_name || null,
          lead.email,
          lead.phone || null,
          lead.company || null,
          lead.job_title || null,
          lead.role || null,
          lead.industry || null,
          lead.content_type || null,
          lead.content_id || null,
          lead.content_title || null,
          lead.lead_source || null,
          lead.campaign || null,
          lead.medium || null,
          lead.referrer || null,
          lead.utm_source || null,
          lead.utm_medium || null,
          lead.utm_campaign || null,
          lead.utm_term || null,
          lead.utm_content || null,
          lead.status || 'new',
          lead.notes || null,
          lead.assigned_to || null,
          lead.consent_marketing || false,
          lead.consent_data_processing !== false,
          lead.ip_address || null,
          lead.user_agent || null
        ]
      );
      const created = result.rows?.[0];
      console.log('✅ Leads.create: Lead created', { id: created?.id, email: created?.email, result });
      // Return in format expected by the API route
      return { row: created, id: created?.id };
    } catch (error: any) {
      console.error('❌ Error in leads.create:', error);
      throw error;
    }
  },

  update: async (id: number, lead: Partial<Lead>) => {
    try {
      const fields = Object.keys(lead).filter((k) => k !== 'id');
      if (fields.length === 0) {
        return { row: null };
      }
      const setClause = fields.map((k, i) => `${k} = $${i + 1}`).join(', ');
      const values = fields.map(field => lead[field as keyof Lead]);
      const result = await query(
        `UPDATE leads SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = $${fields.length + 1} RETURNING *`,
        [...values, id]
      );
      return { row: result.rows?.[0] };
    } catch (error: any) {
      console.error('❌ Error in leads.update:', error);
      throw error;
    }
  },

  delete: async (id: number) => {
    try {
      await query('DELETE FROM leads WHERE id = $1', [id]);
      return { success: true };
    } catch (error: any) {
      console.error('❌ Error in leads.delete:', error);
      throw error;
    }
  },

  recordDownload: async (leadId: number, contentType: string, contentId: number, fileUrl: string, fileSize?: number) => {
    try {
      const result = await query(
        `INSERT INTO lead_downloads (lead_id, content_type, content_id, file_url, file_size)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (lead_id, content_type, content_id) DO NOTHING
         RETURNING *`,
        [leadId, contentType, contentId, fileUrl, fileSize || null]
      );
      return { row: result.rows?.[0] };
    } catch (error: any) {
      console.error('❌ Error in leads.recordDownload:', error);
      throw error;
    }
  },
};

// Categories
export const categories = {
  getAll: async (contentType?: string) => {
    const sqlQuery = contentType
      ? 'SELECT * FROM categories WHERE content_type = $1 OR content_type = \'all\' ORDER BY order_index ASC, name ASC'
      : 'SELECT * FROM categories ORDER BY order_index ASC, name ASC';
    const result = await query(sqlQuery, contentType ? [contentType] : undefined);
    return result?.rows || [];
  },

  getById: async (id: number) => {
    return await db.prepare('SELECT * FROM categories WHERE id = $1').get(id);
  },

  getBySlug: async (slug: string) => {
    return await db.prepare('SELECT * FROM categories WHERE slug = $1').get(slug);
  },

  create: async (category: Omit<Category, 'id'>) => {
    const result = await execute(`
      INSERT INTO categories (name, slug, description, content_type, color, icon, order_index, parent_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [
      category.name, category.slug, category.description || '',
      category.content_type || 'blog', category.color || '', category.icon || '',
      category.order_index || 0, category.parent_id || null
    ]);
    return result.rows?.[0] || result.row || result;
  },

  update: async (id: number, category: Partial<Category>) => {
    const fields = Object.keys(category).filter((k) => k !== 'id');
    const setClause = fields.map((k, i) => `${k} = $${i + 1}`).join(', ');
    const values = fields.map(field => category[field as keyof Category]);
    const stmt = db.prepare(
      `UPDATE categories SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = $${fields.length + 1} RETURNING *`
    );
    return await stmt.run(...values, id);
  },

  delete: async (id: number) => {
    try {
      const result = await execute('DELETE FROM categories WHERE id = $1', [id]);
      console.log('🗑️ [categories.delete] Deleted category ID:', id, 'Changes:', result?.changes);
      return result;
    } catch (error: any) {
      console.error('❌ [categories.delete] Error deleting category:', id, error);
      throw error;
    }
  },
};

// Content-Category mapping
export const contentCategories = {
  getByContent: async (contentType: string, contentId: number) => {
    return await db.prepare('SELECT c.* FROM categories c INNER JOIN content_categories cc ON c.id = cc.category_id WHERE cc.content_type = $1 AND cc.content_id = $2').all(contentType, contentId);
  },

  setCategories: async (contentType: string, contentId: number, categoryIds: number[]) => {
    // Delete existing mappings
    await execute('DELETE FROM content_categories WHERE content_type = $1 AND content_id = $2', [contentType, contentId]);
    
    // Insert new mappings
    if (categoryIds.length > 0) {
      for (const catId of categoryIds) {
        await execute('INSERT INTO content_categories (content_type, content_id, category_id) VALUES ($1, $2, $3)', [contentType, contentId, catId]);
      }
    }
    return { success: true };
  },
};

// Analytics Events
export const analyticsEvents = {
  create: async (event: {
    event_type: string;
    content_type?: string;
    content_id?: number;
    user_id?: number;
    session_id?: string;
    event_name?: string;
    event_data?: any;
    ip_address?: string;
    user_agent?: string;
    referrer?: string;
    url?: string;
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    utm_term?: string;
    utm_content?: string;
  }) => {
    const stmt = db.prepare(`
      INSERT INTO analytics_events (
        event_type, content_type, content_id, user_id, session_id, event_name, event_data,
        ip_address, user_agent, referrer, url, utm_source, utm_medium, utm_campaign, utm_term, utm_content
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING *
    `);
    return await stmt.run(
      event.event_type, event.content_type || null, event.content_id || null,
      event.user_id || null, event.session_id || null, event.event_name || null,
      event.event_data ? JSON.stringify(event.event_data) : null,
      event.ip_address || null, event.user_agent || null, event.referrer || null,
      event.url || null, event.utm_source || null, event.utm_medium || null,
      event.utm_campaign || null, event.utm_term || null, event.utm_content || null
    );
  },

  getByContent: async (contentType: string, contentId: number) => {
    return await db.prepare('SELECT * FROM analytics_events WHERE content_type = $1 AND content_id = $2 ORDER BY created_at DESC').all(contentType, contentId);
  },
};

// Notifications
export const notifications = {
  getAll: async (userId?: number, unreadOnly = false) => {
    try {
      let queryText = 'SELECT * FROM notifications';
      const conditions: string[] = [];
      const params: any[] = [];
      let paramIndex = 1;
      
      if (userId) {
        conditions.push(`user_id = $${paramIndex}`);
        params.push(userId);
        paramIndex++;
      }
      
      if (unreadOnly) {
        conditions.push(`read = false`);
      }
      
      if (conditions.length > 0) {
        queryText += ' WHERE ' + conditions.join(' AND ');
      }
      queryText += ' ORDER BY created_at DESC';
      
      console.log('📢 Notifications.getAll: Executing query', { queryText, params });
      const result = await query(queryText, params.length > 0 ? params : undefined);
      const rows = result.rows || [];
      console.log(`✅ Notifications.getAll: Found ${rows.length} notifications`);
      return rows;
    } catch (error: any) {
      console.error('❌ Error in notifications.getAll:', error);
      throw error;
    }
  },

  getById: async (id: number) => {
    try {
      const result = await query('SELECT * FROM notifications WHERE id = $1', [id]);
      return result.rows?.[0] || null;
    } catch (error: any) {
      console.error('❌ Error in notifications.getById:', error);
      throw error;
    }
  },

  create: async (notification: {
    type: string;
    title: string;
    message?: string;
    user_id?: number;
    link?: string;
  }) => {
    try {
      console.log('💾 Notifications.create: Creating notification', notification);
      const result = await query(
        `INSERT INTO notifications (type, title, message, user_id, link)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [
          notification.type,
          notification.title,
          notification.message || '',
          notification.user_id || null,
          notification.link || null
        ]
      );
      const created = result.rows?.[0];
      console.log('✅ Notifications.create: Notification created', { id: created?.id });
      return { row: created };
    } catch (error: any) {
      console.error('❌ Error in notifications.create:', error);
      throw error;
    }
  },

  markAsRead: async (id: number) => {
    try {
      const result = await query(
        'UPDATE notifications SET read = true WHERE id = $1 RETURNING *',
        [id]
      );
      return { row: result.rows?.[0] };
    } catch (error: any) {
      console.error('❌ Error in notifications.markAsRead:', error);
      throw error;
    }
  },

  markAllAsRead: async (userId?: number) => {
    try {
      if (userId) {
        const result = await query(
          'UPDATE notifications SET read = true WHERE user_id = $1 RETURNING *',
          [userId]
        );
        return { rows: result.rows || [] };
      }
      const result = await query('UPDATE notifications SET read = true RETURNING *');
      return { rows: result.rows || [] };
    } catch (error: any) {
      console.error('❌ Error in notifications.markAllAsRead:', error);
      throw error;
    }
  },

  delete: async (id: number) => {
    try {
      await query('DELETE FROM notifications WHERE id = $1', [id]);
      return { success: true };
    } catch (error: any) {
      console.error('❌ Error in notifications.delete:', error);
      throw error;
    }
  },

  getUnreadCount: async (userId?: number) => {
    try {
      const queryText = userId
        ? 'SELECT COUNT(*) as count FROM notifications WHERE read = false AND user_id = $1'
        : 'SELECT COUNT(*) as count FROM notifications WHERE read = false';
      const params = userId ? [userId] : undefined;
      const result = await query(queryText, params);
      const count = parseInt(result.rows?.[0]?.count || '0', 10);
      return count;
    } catch (error: any) {
      console.error('❌ Error in notifications.getUnreadCount:', error);
      throw error;
    }
  },
};

// News & Announcements
export const news = {
  getAll: async (published = false) => {
    // Handle published field as boolean, string, or number
    // PostgreSQL requires explicit casting for boolean comparisons
    const sqlQuery = published
      ? `SELECT * FROM news_announcements 
         WHERE (published = true OR published::text = 'true' OR published::text = '1')
         ORDER BY publish_date DESC NULLS LAST, created_at DESC`
      : 'SELECT * FROM news_announcements ORDER BY created_at DESC';
    const result = await query(sqlQuery);
    return result?.rows || [];
  },

  getBySlug: async (slug: string) => {
    const result = await query('SELECT * FROM news_announcements WHERE slug = $1', [slug]);
    return (result?.rows?.[0] || null) as any;
  },

  getById: async (id: number) => {
    const result = await query('SELECT * FROM news_announcements WHERE id = $1', [id]);
    return (result?.rows?.[0] || null) as any;
  },

  create: async (item: {
    title: string;
    slug: string;
    content?: string;
    excerpt?: string;
    featured_image?: string;
    published?: boolean;
    publish_date?: string;
    author?: string;
    category?: string;
    tags?: string[];
    created_by?: string | null;
  }) => {
    // Convert tags array to PostgreSQL array format: {tag1,tag2} or {} for empty
    const tagsArray = item.tags && item.tags.length > 0 
      ? `{${item.tags.join(',')}}` 
      : '{}';
    
    const sql = `
      INSERT INTO news_announcements (
        title, slug, content, excerpt, featured_image, published, publish_date, author, category, tags, created_by
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;
    
    const result = await execute(sql, [
      item.title,
      item.slug,
      item.content || '',
      item.excerpt || '',
      item.featured_image || '',
      item.published || false,
      item.publish_date || null,
      item.author || '',
      item.category || '',
      tagsArray,
      item.created_by || null
    ]);
    
    return result;
  },

  update: async (id: number, item: Partial<{
    title: string;
    slug: string;
    content: string;
    excerpt: string;
    featured_image: string;
    published: boolean;
    publish_date: string;
    author: string;
    category: string;
    tags: string[];
  }>) => {
    const fields = Object.keys(item).filter((k) => k !== 'id');
    if (fields.length === 0) {
      return { row: null, rows: [] };
    }
    
    const setClause = fields.map((k, i) => `${k} = $${i + 1}`).join(', ');
    const values = fields.map(field => {
      const value = item[field as keyof typeof item];
      // Handle tags array - convert to PostgreSQL array format
      if (field === 'tags' && Array.isArray(value)) {
        return value.length > 0 ? `{${value.join(',')}}` : '{}';
      }
      return value;
    });
    
    const sql = `UPDATE news_announcements SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = $${fields.length + 1} RETURNING *`;
    const result = await execute(sql, [...values, id]);
    return result;
  },

  delete: async (id: number) => {
    try {
      const result = await execute('DELETE FROM news_announcements WHERE id = $1', [id]);
      console.log('🗑️ [news.delete] Deleted news ID:', id, 'Changes:', result?.changes);
      return result;
    } catch (error: any) {
      console.error('❌ [news.delete] Error deleting news:', id, error);
      throw error;
    }
  },
};

// Hero Slides
export const heroSlides = {
  getAll: async (activeOnly = true) => {
    try {
      const sqlQuery = activeOnly
        ? `SELECT * FROM hero_slides WHERE is_active = true ORDER BY display_order ASC`
        : `SELECT * FROM hero_slides ORDER BY display_order ASC`;
      const result = await query(sqlQuery);
      return result?.rows || [];
    } catch (error: any) {
      console.error('❌ Error in heroSlides.getAll:', error);
      throw error;
    }
  },

  getById: async (id: number) => {
    try {
      const result = await query('SELECT * FROM hero_slides WHERE id = $1', [id]);
      return (result?.rows?.[0] || null) as HeroSlide | null;
    } catch (error: any) {
      console.error('❌ Error fetching hero slide by id:', error);
      throw error;
    }
  },

  create: async (slide: {
    title: string;
    subtitle?: string;
    cta_text?: string;
    cta_link?: string;
    background_image: string;
    accent_color?: string;
    has_light_background?: boolean;
    display_order: number;
    is_active?: boolean;
  }, userId?: number) => {
    try {
      const result = await query(`
        INSERT INTO hero_slides (
          title, subtitle, cta_text, cta_link, background_image,
          accent_color, has_light_background, display_order, is_active, created_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *
      `, [
        slide.title,
        slide.subtitle || null,
        slide.cta_text || null,
        slide.cta_link || null,
        slide.background_image,
        slide.accent_color || '#667eea',
        slide.has_light_background || false,
        slide.display_order,
        slide.is_active !== undefined ? slide.is_active : true,
        userId || null
      ]);
      return result?.rows?.[0] as HeroSlide;
    } catch (error: any) {
      console.error('❌ Error creating hero slide:', error);
      throw error;
    }
  },

  update: async (id: number, slide: Partial<{
    title: string;
    subtitle: string;
    cta_text: string;
    cta_link: string;
    background_image: string;
    accent_color: string;
    has_light_background: boolean;
    display_order: number;
    is_active: boolean;
  }>, userId?: number) => {
    try {
      const fields = Object.keys(slide).filter(k => k !== 'id');
      if (fields.length === 0) return null;

      const setClause = fields.map((k, i) => `${k} = $${i + 1}`).join(', ');
      const values = fields.map(field => slide[field as keyof typeof slide]);
      const queryStr = `
        UPDATE hero_slides 
        SET ${setClause}, updated_at = NOW(), updated_by = $${fields.length + 1}
        WHERE id = $${fields.length + 2}
        RETURNING *
      `;
      const result = await query(queryStr, [...values, userId || null, id]);
      return (result?.rows?.[0] || null) as HeroSlide | null;
    } catch (error: any) {
      console.error('❌ Error updating hero slide:', error);
      throw error;
    }
  },

  delete: async (id: number) => {
    try {
      // Soft delete - mark as inactive
      const result = await query(
        'UPDATE hero_slides SET is_active = false, updated_at = NOW() WHERE id = $1 RETURNING *',
        [id]
      );
      return result?.rows?.[0] as HeroSlide | null;
    } catch (error: any) {
      console.error('❌ Error deleting hero slide:', error);
      throw error;
    }
  },

  reorder: async (slides: { id: number; display_order: number }[]) => {
    try {
      // Update multiple slides' display_order
      const updates = slides.map(slide => 
        query('UPDATE hero_slides SET display_order = $1 WHERE id = $2', [slide.display_order, slide.id])
      );
      await Promise.all(updates);
      return true;
    } catch (error: any) {
      console.error('❌ Error reordering hero slides:', error);
      throw error;
    }
  }
};

// Hero Slides Config
export const heroSlidesConfig = {
  get: async () => {
    try {
      const result = await query('SELECT * FROM hero_slides_config ORDER BY id DESC LIMIT 1');
      return (result?.rows?.[0] || {
        max_slides_displayed: 5,
        auto_advance_enabled: true,
        auto_advance_interval: 8000
      }) as HeroSlidesConfig;
    } catch (error: any) {
      console.error('❌ Error fetching hero slides config:', error);
      // Return defaults if table doesn't exist yet
      return {
        max_slides_displayed: 5,
        auto_advance_enabled: true,
        auto_advance_interval: 8000
      } as HeroSlidesConfig;
    }
  },

  update: async (config: {
    max_slides_displayed?: number;
    auto_advance_enabled?: boolean;
    auto_advance_interval?: number;
  }, userId?: number) => {
    try {
      const result = await query(`
        UPDATE hero_slides_config 
        SET 
          max_slides_displayed = COALESCE($1, max_slides_displayed),
          auto_advance_enabled = COALESCE($2, auto_advance_enabled),
          auto_advance_interval = COALESCE($3, auto_advance_interval),
          updated_at = NOW(),
          updated_by = $4
        WHERE id = (SELECT id FROM hero_slides_config ORDER BY id DESC LIMIT 1)
        RETURNING *
      `, [
        config.max_slides_displayed || null,
        config.auto_advance_enabled !== undefined ? config.auto_advance_enabled : null,
        config.auto_advance_interval || null,
        userId || null
      ]);
      return (result?.rows?.[0] || null) as HeroSlidesConfig | null;
    } catch (error: any) {
      console.error('❌ Error updating hero slides config:', error);
      throw error;
    }
  }
};

// Office Addresses
export const officeAddresses = {
  getAll: async (activeOnly = true) => {
    try {
      const sqlQuery = activeOnly
        ? `SELECT * FROM office_addresses WHERE is_active = true ORDER BY country, display_order ASC`
        : `SELECT * FROM office_addresses ORDER BY country, display_order ASC`;
      const result = await query(sqlQuery);
      return result?.rows || [];
    } catch (error: any) {
      console.error('❌ Error in officeAddresses.getAll:', error);
      throw error;
    }
  },

  getById: async (id: number) => {
    try {
      const result = await query('SELECT * FROM office_addresses WHERE id = $1', [id]);
      return (result?.rows?.[0] || null) as OfficeAddress | null;
    } catch (error: any) {
      console.error('❌ Error fetching office address by id:', error);
      throw error;
    }
  },

  create: async (address: {
    name: string;
    city: string;
    country: string;
    address_line1: string;
    address_line2?: string;
    postal_code?: string;
    phone?: string;
    email?: string;
    coordinates_lat?: number;
    coordinates_lng?: number;
    display_order: number;
    is_active?: boolean;
  }, userId?: number) => {
    try {
      // Validate coordinates
      if (address.coordinates_lat && (address.coordinates_lat < -90 || address.coordinates_lat > 90)) {
        throw new Error('Invalid latitude. Must be between -90 and 90');
      }
      if (address.coordinates_lng && (address.coordinates_lng < -180 || address.coordinates_lng > 180)) {
        throw new Error('Invalid longitude. Must be between -180 and 180');
      }
      
      // Validate email format
      if (address.email && address.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address.email)) {
        throw new Error('Invalid email format');
      }
      
      const result = await query(`
        INSERT INTO office_addresses (
          name, city, country, address_line1, address_line2,
          postal_code, phone, email, coordinates_lat, coordinates_lng,
          display_order, is_active, created_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING *
      `, [
        address.name,
        address.city,
        address.country,
        address.address_line1,
        address.address_line2 || null,
        address.postal_code || null,
        address.phone || null,
        address.email || null,
        address.coordinates_lat || null,
        address.coordinates_lng || null,
        address.display_order,
        address.is_active !== undefined ? address.is_active : true,
        userId || null
      ]);
      return result?.rows?.[0] as OfficeAddress;
    } catch (error: any) {
      console.error('❌ Error creating office address:', error);
      throw error;
    }
  },

  update: async (id: number, address: Partial<{
    name: string;
    city: string;
    country: string;
    address_line1: string;
    address_line2: string;
    postal_code: string;
    phone: string;
    email: string;
    coordinates_lat: number;
    coordinates_lng: number;
    display_order: number;
    is_active: boolean;
  }>, userId?: number) => {
    try {
      // Same validation as create
      if (address.coordinates_lat !== undefined && (address.coordinates_lat < -90 || address.coordinates_lat > 90)) {
        throw new Error('Invalid latitude. Must be between -90 and 90');
      }
      if (address.coordinates_lng !== undefined && (address.coordinates_lng < -180 || address.coordinates_lng > 180)) {
        throw new Error('Invalid longitude. Must be between -180 and 180');
      }
      if (address.email !== undefined && address.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address.email)) {
        throw new Error('Invalid email format');
      }

      const fields = Object.keys(address).filter(k => k !== 'id');
      if (fields.length === 0) return null;

      const setClause = fields.map((k, i) => `${k} = $${i + 1}`).join(', ');
      const values = fields.map(field => address[field as keyof typeof address]);
      const queryStr = `
        UPDATE office_addresses 
        SET ${setClause}, updated_at = NOW(), updated_by = $${fields.length + 1}
        WHERE id = $${fields.length + 2}
        RETURNING *
      `;
      const result = await query(queryStr, [...values, userId || null, id]);
      return (result?.rows?.[0] || null) as OfficeAddress | null;
    } catch (error: any) {
      console.error('❌ Error updating office address:', error);
      throw error;
    }
  },

  delete: async (id: number) => {
    try {
      // Check if this is the last active address
      const activeCount = await query(
        'SELECT COUNT(*) as count FROM office_addresses WHERE is_active = true'
      );
      const count = parseInt(activeCount?.rows?.[0]?.count || '0', 10);
      if (count <= 1) {
        throw new Error('Cannot delete the last active address');
      }
      
      // Soft delete
      const result = await query(
        'UPDATE office_addresses SET is_active = false, updated_at = NOW() WHERE id = $1 RETURNING *',
        [id]
      );
      return result?.rows?.[0] as OfficeAddress | null;
    } catch (error: any) {
      console.error('❌ Error deleting office address:', error);
      throw error;
    }
  }
};

