import db from '../db';
import type { BlogPost, Service, TeamMember, Page, Testimonial, JobPosting } from './types';

// Blog Posts
export const blogPosts = {
  getAll: (published = false) => {
    const query = published 
      ? 'SELECT * FROM blog_posts WHERE published = 1 ORDER BY publish_date DESC'
      : 'SELECT * FROM blog_posts ORDER BY created_at DESC';
    return db.prepare(query).all();
  },
  
  getBySlug: (slug: string) => {
    return db.prepare('SELECT * FROM blog_posts WHERE slug = ?').get(slug);
  },
  
  create: (post: Omit<BlogPost, 'id'>) => {
    const stmt = db.prepare(`
      INSERT INTO blog_posts (slug, title, excerpt, content, author, featured_image, category, tags, published, publish_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    return stmt.run(
      post.slug, post.title, post.excerpt || '', post.content || '', 
      post.author || '', post.featured_image || '', post.category || '', 
      post.tags || '', post.published ? 1 : 0, post.publish_date || new Date().toISOString()
    );
  },
  
  update: (id: number, post: Partial<BlogPost>) => {
    const fields = Object.keys(post).filter(k => k !== 'id').map(k => `${k} = ?`).join(', ');
    const values = Object.values(post).filter((_, i) => Object.keys(post)[i] !== 'id');
    const stmt = db.prepare(`UPDATE blog_posts SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`);
    return stmt.run(...values, id);
  },
  
  delete: (id: number) => {
    return db.prepare('DELETE FROM blog_posts WHERE id = ?').run(id);
  },
};

// Services
export const services = {
  getAll: (published = false) => {
    const query = published 
      ? 'SELECT * FROM services WHERE published = 1 ORDER BY created_at DESC'
      : 'SELECT * FROM services ORDER BY created_at DESC';
    return db.prepare(query).all();
  },
  
  getBySlug: (slug: string) => {
    return db.prepare('SELECT * FROM services WHERE slug = ?').get(slug);
  },
  
  create: (service: Omit<Service, 'id'>) => {
    const stmt = db.prepare(`
      INSERT INTO services (slug, title, description, content, icon, featured_image, price, features, published)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    return stmt.run(
      service.slug, service.title, service.description || '', service.content || '',
      service.icon || '', service.featured_image || '', service.price || '',
      service.features || '', service.published ? 1 : 0
    );
  },
  
  update: (id: number, service: Partial<Service>) => {
    const fields = Object.keys(service).filter(k => k !== 'id').map(k => `${k} = ?`).join(', ');
    const values = Object.values(service).filter((_, i) => Object.keys(service)[i] !== 'id');
    const stmt = db.prepare(`UPDATE services SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`);
    return stmt.run(...values, id);
  },
  
  delete: (id: number) => {
    return db.prepare('DELETE FROM services WHERE id = ?').run(id);
  },
};

// Team Members
export const teamMembers = {
  getAll: (published = false) => {
    const query = published 
      ? 'SELECT * FROM team_members WHERE published = 1 ORDER BY order_index ASC'
      : 'SELECT * FROM team_members ORDER BY order_index ASC';
    return db.prepare(query).all();
  },
  
  create: (member: Omit<TeamMember, 'id'>) => {
    const stmt = db.prepare(`
      INSERT INTO team_members (name, position, bio, image, email, linkedin, twitter, order_index, published)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    return stmt.run(
      member.name, member.position || '', member.bio || '', member.image || '',
      member.email || '', member.linkedin || '', member.twitter || '',
      member.order_index || 0, member.published ? 1 : 0
    );
  },
  
  update: (id: number, member: Partial<TeamMember>) => {
    const fields = Object.keys(member).filter(k => k !== 'id').map(k => `${k} = ?`).join(', ');
    const values = Object.values(member).filter((_, i) => Object.keys(member)[i] !== 'id');
    const stmt = db.prepare(`UPDATE team_members SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`);
    return stmt.run(...values, id);
  },
  
  delete: (id: number) => {
    return db.prepare('DELETE FROM team_members WHERE id = ?').run(id);
  },
};

// Job Postings
export const jobPostings = {
  getAll: (published = false) => {
    const query = published
      ? 'SELECT * FROM job_postings WHERE published = 1 ORDER BY created_at DESC'
      : 'SELECT * FROM job_postings ORDER BY created_at DESC';
    return db.prepare(query).all();
  },

  getBySlug: (slug: string) => {
    return db.prepare('SELECT * FROM job_postings WHERE slug = ?').get(slug);
  },

  create: (job: Omit<JobPosting, 'id'>) => {
    const stmt = db.prepare(`
      INSERT INTO job_postings (title, slug, location, employment_type, categories, description, requirements, skills, salary_range, apply_url, remote, published)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    return stmt.run(
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
      job.remote ? 1 : 0,
      job.published ? 1 : 0
    );
  },

  update: (id: number, job: Partial<JobPosting>) => {
    const fields = Object.keys(job)
      .filter((k) => k !== 'id')
      .map((k) => `${k} = ?`)
      .join(', ');
    const values = Object.values(job).filter(
      (_, i) => Object.keys(job)[i] !== 'id'
    );
    const stmt = db.prepare(
      `UPDATE job_postings SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`
    );
    return stmt.run(...values, id);
  },

  delete: (id: number) => {
    return db.prepare('DELETE FROM job_postings WHERE id = ?').run(id);
  },
};

// Pages
export const pages = {
  getAll: (published = false) => {
    const query = published 
      ? 'SELECT * FROM pages WHERE published = 1'
      : 'SELECT * FROM pages ORDER BY created_at DESC';
    return db.prepare(query).all();
  },
  
  getBySlug: (slug: string) => {
    return db.prepare('SELECT * FROM pages WHERE slug = ?').get(slug);
  },
  
  create: (page: Omit<Page, 'id'>) => {
    const stmt = db.prepare(`
      INSERT INTO pages (slug, title, content, meta_description, published)
      VALUES (?, ?, ?, ?, ?)
    `);
    return stmt.run(
      page.slug, page.title, page.content || '', page.meta_description || '', page.published ? 1 : 0
    );
  },
  
  update: (id: number, page: Partial<Page>) => {
    const fields = Object.keys(page).filter(k => k !== 'id').map(k => `${k} = ?`).join(', ');
    const values = Object.values(page).filter((_, i) => Object.keys(page)[i] !== 'id');
    const stmt = db.prepare(`UPDATE pages SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`);
    return stmt.run(...values, id);
  },
  
  delete: (id: number) => {
    return db.prepare('DELETE FROM pages WHERE id = ?').run(id);
  },
};





