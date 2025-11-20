import db from '../db';
import type { BlogPost, Service, TeamMember, Page, Testimonial, JobPosting } from './types';

// Blog Posts
export const blogPosts = {
  getAll: async (published = false) => {
    const query = published 
      ? 'SELECT * FROM blog_posts WHERE published = true ORDER BY publish_date DESC'
      : 'SELECT * FROM blog_posts ORDER BY created_at DESC';
    return await db.prepare(query).all();
  },
  
  getBySlug: async (slug: string) => {
    const result = await db.prepare('SELECT * FROM blog_posts WHERE slug = ?').get(slug);
    return result as BlogPost | null;
  },
  
  create: async (post: Omit<BlogPost, 'id'>) => {
    const stmt = db.prepare(`
      INSERT INTO blog_posts (slug, title, excerpt, content, author, featured_image, category, tags, published, publish_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      RETURNING *
    `);
    return await stmt.run(
      post.slug, post.title, post.excerpt || '', post.content || '', 
      post.author || '', post.featured_image || '', post.category || '', 
      post.tags || '', post.published || false, post.publish_date || new Date().toISOString()
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

// Services
export const services = {
  getAll: async (published = false) => {
    const query = published 
      ? 'SELECT * FROM services WHERE published = true ORDER BY created_at DESC'
      : 'SELECT * FROM services ORDER BY created_at DESC';
    return await db.prepare(query).all();
  },
  
  getBySlug: async (slug: string) => {
    return await db.prepare('SELECT * FROM services WHERE slug = $1').get(slug);
  },
  
  create: async (service: Omit<Service, 'id'>) => {
    const stmt = db.prepare(`
      INSERT INTO services (slug, title, description, content, icon, featured_image, price, features, published)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `);
    return await stmt.run(
      service.slug, service.title, service.description || '', service.content || '',
      service.icon || '', service.featured_image || '', service.price || '',
      service.features || '', service.published || false
    );
  },
  
  update: async (id: number, service: Partial<Service>) => {
    const fields = Object.keys(service).filter(k => k !== 'id');
    const setClause = fields.map((k, i) => `${k} = $${i + 1}`).join(', ');
    const values = fields.map(field => service[field as keyof Service]);
    const stmt = db.prepare(`UPDATE services SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = $${fields.length + 1} RETURNING *`);
    return await stmt.run(...values, id);
  },
  
  delete: async (id: number) => {
    return await db.prepare('DELETE FROM services WHERE id = $1').run(id);
  },
};

// Team Members
export const teamMembers = {
  getAll: async (published = false) => {
    const query = published 
      ? 'SELECT * FROM team_members WHERE published = true ORDER BY order_index ASC'
      : 'SELECT * FROM team_members ORDER BY order_index ASC';
    return await db.prepare(query).all();
  },
  
  create: async (member: Omit<TeamMember, 'id'>) => {
    const stmt = db.prepare(`
      INSERT INTO team_members (name, position, bio, image, email, linkedin, twitter, order_index, published)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `);
    return await stmt.run(
      member.name, member.position || '', member.bio || '', member.image || '',
      member.email || '', member.linkedin || '', member.twitter || '',
      member.order_index || 0, member.published || false
    );
  },
  
  update: async (id: number, member: Partial<TeamMember>) => {
    const fields = Object.keys(member).filter(k => k !== 'id');
    const setClause = fields.map((k, i) => `${k} = $${i + 1}`).join(', ');
    const values = fields.map(field => member[field as keyof TeamMember]);
    const stmt = db.prepare(`UPDATE team_members SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = $${fields.length + 1} RETURNING *`);
    return await stmt.run(...values, id);
  },
  
  delete: async (id: number) => {
    return await db.prepare('DELETE FROM team_members WHERE id = $1').run(id);
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





