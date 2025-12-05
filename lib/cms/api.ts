import db, { query, execute } from '../db';
import type { BlogPost, TeamMember, Page, Testimonial, JobPosting, Ebook, CaseStudy, Whitepaper, Lead, Category } from './types';

// Blog Posts
export const blogPosts = {
  getAll: async (published = false) => {
    try {
      const query = published 
        ? 'SELECT * FROM blog_posts WHERE published = true ORDER BY publish_date DESC'
        : 'SELECT * FROM blog_posts ORDER BY created_at DESC';
      console.log('📝 Executing query:', query);
      const result = await db.prepare(query).all();
      console.log('📝 Query result:', result?.length || 0, 'posts');
      return result || [];
    } catch (error: any) {
      console.error('❌ Error in blogPosts.getAll:', error);
      console.error('Error details:', {
        message: error?.message,
        code: error?.code,
        detail: error?.detail,
        hint: error?.hint
      });
      throw error;
    }
  },
  
  getBySlug: async (slug: string) => {
    try {
      const result = await db.prepare('SELECT * FROM blog_posts WHERE slug = ?').get(slug);
      return result as BlogPost | null;
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
    const stmt = db.prepare(`
      INSERT INTO blog_posts (
        slug, title, excerpt, content, author, featured_image, category, tags, 
        published, publish_date, scheduled_publish_date,
        meta_title, meta_description, meta_keywords, canonical_url,
        og_title, og_description, og_image, og_type, schema_markup
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      RETURNING *
    `);
    return await stmt.run(
      post.slug, 
      post.title, 
      post.excerpt || '', 
      post.content || '', 
      post.author || '', 
      post.featured_image || '', 
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
      post.schema_markup || null
    );
  },
  
  update: async (id: number, post: Partial<BlogPost>) => {
    const fields = Object.keys(post).filter(k => k !== 'id');
    const setClause = fields.map(() => '?').join(', ');
    const placeholders = fields.map((k, i) => `${k} = ?`).join(', ');
    const values = fields.map(field => post[field as keyof BlogPost]);
    const stmt = db.prepare(`UPDATE blog_posts SET ${placeholders}, updated_at = CURRENT_TIMESTAMP WHERE id = ? RETURNING *`);
    return await stmt.run(...values, id);
  },
  
  delete: async (id: number) => {
    return await db.prepare('DELETE FROM blog_posts WHERE id = ?').run(id);
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
    return await execute('DELETE FROM team_members WHERE id = $1', [id]);
  },
};

// Job Postings
export const jobPostings = {
  getAll: async (published = false) => {
    const query = published
      ? 'SELECT * FROM job_postings WHERE published = true ORDER BY created_at DESC'
      : 'SELECT * FROM job_postings ORDER BY created_at DESC';
    return await db.prepare(query).all();
  },

  getBySlug: async (slug: string) => {
    return await db.prepare('SELECT * FROM job_postings WHERE slug = $1').get(slug);
  },

  create: async (job: Omit<JobPosting, 'id'>) => {
    const stmt = db.prepare(`
      INSERT INTO job_postings (title, slug, location, employment_type, categories, description, requirements, skills, salary_range, apply_url, remote, published)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `);
    return await stmt.run(
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
    );
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
    return await db.prepare('DELETE FROM job_postings WHERE id = $1').run(id);
  },
};

// Pages
export const pages = {
  getAll: async (published = false) => {
    const query = published 
      ? 'SELECT * FROM pages WHERE published = true'
      : 'SELECT * FROM pages ORDER BY created_at DESC';
    return await db.prepare(query).all();
  },
  
  getBySlug: async (slug: string) => {
    return await db.prepare('SELECT * FROM pages WHERE slug = $1').get(slug);
  },
  
  create: async (page: Omit<Page, 'id'>) => {
    const stmt = db.prepare(`
      INSERT INTO pages (slug, title, content, meta_description, published)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `);
    return await stmt.run(
      page.slug, page.title, page.content || '', page.meta_description || '', page.published || false
    );
  },
  
  update: async (id: number, page: Partial<Page>) => {
    const fields = Object.keys(page).filter(k => k !== 'id');
    const setClause = fields.map((k, i) => `${k} = $${i + 1}`).join(', ');
    const values = fields.map(field => page[field as keyof Page]);
    const stmt = db.prepare(`UPDATE pages SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = $${fields.length + 1} RETURNING *`);
    return await stmt.run(...values, id);
  },
  
  delete: async (id: number) => {
    return await db.prepare('DELETE FROM pages WHERE id = $1').run(id);
  },
};

// eBooks
export const ebooks = {
  getAll: async (published = false) => {
    const query = published
      ? 'SELECT * FROM ebooks WHERE published = true ORDER BY publish_date DESC, created_at DESC'
      : 'SELECT * FROM ebooks ORDER BY created_at DESC';
    return await db.prepare(query).all();
  },

  getBySlug: async (slug: string) => {
    return await db.prepare('SELECT * FROM ebooks WHERE slug = $1').get(slug);
  },

  create: async (ebook: Omit<Ebook, 'id'>) => {
    const stmt = db.prepare(`
      INSERT INTO ebooks (
        slug, title, excerpt, description, content, cover_image, pdf_url, pdf_size,
        author, category_id, category_ids, tags, featured, gated, published,
        publish_date, scheduled_publish_date, meta_title, meta_description, meta_keywords,
        canonical_url, og_title, og_description, og_image, og_type, schema_markup,
        google_analytics_id, custom_tracking_script, created_by
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29)
      RETURNING *
    `);
    return await stmt.run(
      ebook.slug, ebook.title, ebook.excerpt || '', ebook.description || '',
      ebook.content || '', ebook.cover_image || '', ebook.pdf_url || '', ebook.pdf_size || 0,
      ebook.author || '', ebook.category_id || null, ebook.category_ids || '[]', ebook.tags || '',
      ebook.featured || false, ebook.gated !== false, ebook.published || false,
      ebook.publish_date || null, ebook.scheduled_publish_date || null,
      ebook.meta_title || '', ebook.meta_description || '', ebook.meta_keywords || '',
      ebook.canonical_url || '', ebook.og_title || '', ebook.og_description || '',
      ebook.og_image || '', ebook.og_type || 'book', ebook.schema_markup || '',
      ebook.google_analytics_id || '', ebook.custom_tracking_script || '', ebook.created_by || null
    );
  },

  update: async (id: number, ebook: Partial<Ebook>) => {
    const fields = Object.keys(ebook).filter((k) => k !== 'id');
    const setClause = fields.map((k, i) => `${k} = $${i + 1}`).join(', ');
    const values = fields.map(field => ebook[field as keyof Ebook]);
    const stmt = db.prepare(
      `UPDATE ebooks SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = $${fields.length + 1} RETURNING *`
    );
    return await stmt.run(...values, id);
  },

  delete: async (id: number) => {
    return await db.prepare('DELETE FROM ebooks WHERE id = $1').run(id);
  },

  incrementDownload: async (id: number) => {
    return await db.prepare('UPDATE ebooks SET download_count = download_count + 1 WHERE id = $1 RETURNING download_count').run(id);
  },
};

// Case Studies
export const caseStudies = {
  getAll: async (published = false) => {
    const query = published
      ? 'SELECT * FROM case_studies WHERE published = true ORDER BY publish_date DESC, created_at DESC'
      : 'SELECT * FROM case_studies ORDER BY created_at DESC';
    return await db.prepare(query).all();
  },

  getBySlug: async (slug: string) => {
    return await db.prepare('SELECT * FROM case_studies WHERE slug = $1').get(slug);
  },

  create: async (caseStudy: Omit<CaseStudy, 'id'>) => {
    const stmt = db.prepare(`
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
    `);
    return await stmt.run(
      caseStudy.slug, caseStudy.title, caseStudy.excerpt || '', caseStudy.description || '',
      caseStudy.content || '', caseStudy.featured_image || '', caseStudy.pdf_url || '', caseStudy.pdf_size || 0,
      caseStudy.client_name || '', caseStudy.client_logo || '', caseStudy.industry || '',
      caseStudy.challenge || '', caseStudy.solution || '', caseStudy.results || '', caseStudy.testimonial || '',
      caseStudy.category_id || null, caseStudy.category_ids || '[]', caseStudy.tags || '',
      caseStudy.featured || false, caseStudy.gated !== false, caseStudy.published || false,
      caseStudy.publish_date || null, caseStudy.scheduled_publish_date || null,
      caseStudy.meta_title || '', caseStudy.meta_description || '', caseStudy.meta_keywords || '',
      caseStudy.canonical_url || '', caseStudy.og_title || '', caseStudy.og_description || '',
      caseStudy.og_image || '', caseStudy.og_type || 'article', caseStudy.schema_markup || '',
      caseStudy.google_analytics_id || '', caseStudy.custom_tracking_script || '', caseStudy.created_by || null
    );
  },

  update: async (id: number, caseStudy: Partial<CaseStudy>) => {
    const fields = Object.keys(caseStudy).filter((k) => k !== 'id');
    const setClause = fields.map((k, i) => `${k} = $${i + 1}`).join(', ');
    const values = fields.map(field => caseStudy[field as keyof CaseStudy]);
    const stmt = db.prepare(
      `UPDATE case_studies SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = $${fields.length + 1} RETURNING *`
    );
    return await stmt.run(...values, id);
  },

  delete: async (id: number) => {
    return await db.prepare('DELETE FROM case_studies WHERE id = $1').run(id);
  },

  incrementDownload: async (id: number) => {
    return await db.prepare('UPDATE case_studies SET download_count = download_count + 1 WHERE id = $1 RETURNING download_count').run(id);
  },
};

// Whitepapers
export const whitepapers = {
  getAll: async (published = false) => {
    const query = published
      ? 'SELECT * FROM whitepapers WHERE published = true ORDER BY publish_date DESC, created_at DESC'
      : 'SELECT * FROM whitepapers ORDER BY created_at DESC';
    return await db.prepare(query).all();
  },

  getBySlug: async (slug: string) => {
    return await db.prepare('SELECT * FROM whitepapers WHERE slug = $1').get(slug);
  },

  create: async (whitepaper: Omit<Whitepaper, 'id'>) => {
    const stmt = db.prepare(`
      INSERT INTO whitepapers (
        slug, title, excerpt, description, content, cover_image, pdf_url, pdf_size,
        author, pages, reading_time, category_id, category_ids, tags, featured, gated, published,
        publish_date, scheduled_publish_date, meta_title, meta_description, meta_keywords,
        canonical_url, og_title, og_description, og_image, og_type, schema_markup,
        google_analytics_id, custom_tracking_script, created_by
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30)
      RETURNING *
    `);
    return await stmt.run(
      whitepaper.slug, whitepaper.title, whitepaper.excerpt || '', whitepaper.description || '',
      whitepaper.content || '', whitepaper.cover_image || '', whitepaper.pdf_url, whitepaper.pdf_size || 0,
      whitepaper.author || '', whitepaper.pages || null, whitepaper.reading_time || null,
      whitepaper.category_id || null, whitepaper.category_ids || '[]', whitepaper.tags || '',
      whitepaper.featured || false, whitepaper.gated !== false, whitepaper.published || false,
      whitepaper.publish_date || null, whitepaper.scheduled_publish_date || null,
      whitepaper.meta_title || '', whitepaper.meta_description || '', whitepaper.meta_keywords || '',
      whitepaper.canonical_url || '', whitepaper.og_title || '', whitepaper.og_description || '',
      whitepaper.og_image || '', whitepaper.og_type || 'article', whitepaper.schema_markup || '',
      whitepaper.google_analytics_id || '', whitepaper.custom_tracking_script || '', whitepaper.created_by || null
    );
  },

  update: async (id: number, whitepaper: Partial<Whitepaper>) => {
    const fields = Object.keys(whitepaper).filter((k) => k !== 'id');
    const setClause = fields.map((k, i) => `${k} = $${i + 1}`).join(', ');
    const values = fields.map(field => whitepaper[field as keyof Whitepaper]);
    const stmt = db.prepare(
      `UPDATE whitepapers SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = $${fields.length + 1} RETURNING *`
    );
    return await stmt.run(...values, id);
  },

  delete: async (id: number) => {
    return await db.prepare('DELETE FROM whitepapers WHERE id = $1').run(id);
  },

  incrementDownload: async (id: number) => {
    return await db.prepare('UPDATE whitepapers SET download_count = download_count + 1 WHERE id = $1 RETURNING download_count').run(id);
  },
};

// Leads
export const leads = {
  getAll: async () => {
    return await db.prepare('SELECT * FROM leads ORDER BY created_at DESC').all();
  },

  getById: async (id: number) => {
    return await db.prepare('SELECT * FROM leads WHERE id = $1').get(id);
  },

  getByEmail: async (email: string) => {
    return await db.prepare('SELECT * FROM leads WHERE email = $1 ORDER BY created_at DESC').all(email);
  },

  getByContent: async (contentType: string, contentId: number) => {
    return await db.prepare('SELECT * FROM leads WHERE content_type = $1 AND content_id = $2 ORDER BY created_at DESC').all(contentType, contentId);
  },

  create: async (lead: Omit<Lead, 'id'>) => {
    const stmt = db.prepare(`
      INSERT INTO leads (
        first_name, last_name, email, phone, company, job_title, role, industry,
        content_type, content_id, content_title, lead_source, campaign, medium, referrer,
        utm_source, utm_medium, utm_campaign, utm_term, utm_content, status, notes,
        assigned_to, consent_marketing, consent_data_processing, ip_address, user_agent
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27)
      RETURNING *
    `);
    return await stmt.run(
      lead.first_name, lead.last_name || '', lead.email, lead.phone || '',
      lead.company || '', lead.job_title || '', lead.role || '', lead.industry || '',
      lead.content_type, lead.content_id, lead.content_title || '',
      lead.lead_source || '', lead.campaign || '', lead.medium || '', lead.referrer || '',
      lead.utm_source || '', lead.utm_medium || '', lead.utm_campaign || '',
      lead.utm_term || '', lead.utm_content || '', lead.status || 'new', lead.notes || '',
      lead.assigned_to || null, lead.consent_marketing || false, lead.consent_data_processing !== false,
      lead.ip_address || '', lead.user_agent || ''
    );
  },

  update: async (id: number, lead: Partial<Lead>) => {
    const fields = Object.keys(lead).filter((k) => k !== 'id');
    const setClause = fields.map((k, i) => `${k} = $${i + 1}`).join(', ');
    const values = fields.map(field => lead[field as keyof Lead]);
    const stmt = db.prepare(
      `UPDATE leads SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = $${fields.length + 1} RETURNING *`
    );
    return await stmt.run(...values, id);
  },

  delete: async (id: number) => {
    return await db.prepare('DELETE FROM leads WHERE id = $1').run(id);
  },

  recordDownload: async (leadId: number, contentType: string, contentId: number, fileUrl: string, fileSize?: number) => {
    const stmt = db.prepare(`
      INSERT INTO lead_downloads (lead_id, content_type, content_id, file_url, file_size)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (lead_id, content_type, content_id) DO NOTHING
      RETURNING *
    `);
    return await stmt.run(leadId, contentType, contentId, fileUrl, fileSize || null);
  },
};

// Categories
export const categories = {
  getAll: async (contentType?: string) => {
    const query = contentType
      ? 'SELECT * FROM categories WHERE content_type = $1 OR content_type = \'all\' ORDER BY order_index ASC, name ASC'
      : 'SELECT * FROM categories ORDER BY order_index ASC, name ASC';
    return contentType ? await db.prepare(query).all(contentType) : await db.prepare(query).all();
  },

  getById: async (id: number) => {
    return await db.prepare('SELECT * FROM categories WHERE id = $1').get(id);
  },

  getBySlug: async (slug: string) => {
    return await db.prepare('SELECT * FROM categories WHERE slug = $1').get(slug);
  },

  create: async (category: Omit<Category, 'id'>) => {
    const stmt = db.prepare(`
      INSERT INTO categories (name, slug, description, content_type, color, icon, order_index, parent_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `);
    return await stmt.run(
      category.name, category.slug, category.description || '',
      category.content_type || 'blog', category.color || '', category.icon || '',
      category.order_index || 0, category.parent_id || null
    );
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
    return await db.prepare('DELETE FROM categories WHERE id = $1').run(id);
  },
};

// Content-Category mapping
export const contentCategories = {
  getByContent: async (contentType: string, contentId: number) => {
    return await db.prepare('SELECT c.* FROM categories c INNER JOIN content_categories cc ON c.id = cc.category_id WHERE cc.content_type = $1 AND cc.content_id = $2').all(contentType, contentId);
  },

  setCategories: async (contentType: string, contentId: number, categoryIds: number[]) => {
    // Delete existing mappings
    await db.prepare('DELETE FROM content_categories WHERE content_type = $1 AND content_id = $2').run(contentType, contentId);
    
    // Insert new mappings
    if (categoryIds.length > 0) {
      const stmt = db.prepare('INSERT INTO content_categories (content_type, content_id, category_id) VALUES ($1, $2, $3)');
      for (const catId of categoryIds) {
        await stmt.run(contentType, contentId, catId);
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

