import { z } from 'zod';

// Blog Post Schema
export const BlogPostSchema = z.object({
  id: z.number().optional(),
  slug: z.string().min(1),
  title: z.string().min(1),
  excerpt: z.string().optional(),
  content: z.string().optional(),
  author: z.string().optional(),
  featured_image: z.string().optional(),
  category: z.string().optional(),
  tags: z.string().optional(),
  published: z.boolean().default(false),
  publish_date: z.string().optional(),
  scheduled_publish_date: z.string().optional(),
  // SEO Fields
  meta_title: z.string().optional(),
  meta_description: z.string().optional(),
  meta_keywords: z.string().optional(),
  canonical_url: z.string().optional(),
  og_title: z.string().optional(),
  og_description: z.string().optional(),
  og_image: z.string().optional(),
  og_type: z.string().optional(),
  schema_markup: z.string().optional(),
  custom_tracking_script: z.string().optional(),
});

export type BlogPost = z.infer<typeof BlogPostSchema>;

// Team Member Schema
export const TeamMemberSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1),
  position: z.string().optional(),
  qualification: z.string().optional(),
  bio: z.string().optional(),
  image: z.string().optional(),
  email: z.string().email().optional(),
  linkedin: z.string().optional(),
  twitter: z.string().optional(),
  order_index: z.number().default(0),
  published: z.boolean().default(false),
});

export type TeamMember = z.infer<typeof TeamMemberSchema>;

// Page Schema
export const PageSchema = z.object({
  id: z.number().optional(),
  slug: z.string().min(1),
  title: z.string().min(1),
  content: z.string().optional(),
  meta_description: z.string().optional(),
  published: z.boolean().default(false),
});

export type Page = z.infer<typeof PageSchema>;

// Testimonial Schema
export const TestimonialSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1),
  position: z.string().optional(),
  company: z.string().optional(),
  content: z.string(),
  image: z.string().optional(),
  rating: z.number().min(1).max(5).default(5),
  published: z.boolean().default(false),
});

export type Testimonial = z.infer<typeof TestimonialSchema>;

// Media Schema
export const MediaSchema = z.object({
  id: z.number().optional(),
  filename: z.string(),
  original_name: z.string().optional(),
  url: z.string(),
  mime_type: z.string().optional(),
  size: z.number().optional(),
  alt_text: z.string().optional(),
});

export type Media = z.infer<typeof MediaSchema>;

// Job Posting Schema
export const JobPostingSchema = z.object({
  id: z.number().optional(),
  title: z.string().min(1),
  slug: z.string().min(1),
  location: z.string().optional(),
  employment_type: z.string().optional(),
  categories: z.string().optional(),
  description: z.string().optional(),
  requirements: z.string().optional(),
  skills: z.string().optional(),
  salary_range: z.string().optional(),
  apply_url: z.string().optional(),
  remote: z.boolean().default(false),
  published: z.boolean().default(false),
});

export type JobPosting = z.infer<typeof JobPostingSchema>;

// SEO Schema (shared across content types)
export const SEOSchema = z.object({
  meta_title: z.string().optional(),
  meta_description: z.string().optional(),
  meta_keywords: z.string().optional(),
  canonical_url: z.string().optional(),
  og_title: z.string().optional(),
  og_description: z.string().optional(),
  og_image: z.string().optional(),
  og_type: z.string().optional(),
  schema_markup: z.string().optional(), // JSON string
});

// eBook Schema
export const EbookSchema = z.object({
  id: z.number().optional(),
  slug: z.string().min(1),
  title: z.string().min(1),
  excerpt: z.string().optional(),
  description: z.string().optional(),
  content: z.string().optional(),
  cover_image: z.string().optional(),
  pdf_url: z.string().optional(),
  pdf_size: z.number().optional(),
  author: z.string().optional(),
  category_id: z.number().optional(),
  category_ids: z.string().optional(), // JSON array
  tags: z.string().optional(),
  featured: z.boolean().default(false),
  gated: z.boolean().default(true),
  download_count: z.number().default(0),
  published: z.boolean().default(false),
  publish_date: z.string().optional(),
  scheduled_publish_date: z.string().optional(),
  meta_title: z.string().optional(),
  meta_description: z.string().optional(),
  meta_keywords: z.string().optional(),
  canonical_url: z.string().optional(),
  og_title: z.string().optional(),
  og_description: z.string().optional(),
  og_image: z.string().optional(),
  og_type: z.string().optional(),
  schema_markup: z.string().optional(),
  google_analytics_id: z.string().optional(),
  custom_tracking_script: z.string().optional(),
  created_by: z.number().optional(),
});

export type Ebook = z.infer<typeof EbookSchema>;

// Case Study Schema
export const CaseStudySchema = z.object({
  id: z.number().optional(),
  slug: z.string().min(1),
  title: z.string().min(1),
  excerpt: z.string().optional(),
  description: z.string().optional(),
  content: z.string().optional(),
  featured_image: z.string().optional(),
  pdf_url: z.string().optional(),
  pdf_size: z.number().optional(),
  client_name: z.string().optional(),
  client_logo: z.string().optional(),
  industry: z.string().optional(),
  challenge: z.string().optional(),
  solution: z.string().optional(),
  results: z.string().optional(),
  testimonial: z.string().optional(),
  category_id: z.number().optional(),
  category_ids: z.string().optional(),
  tags: z.string().optional(),
  featured: z.boolean().default(false),
  gated: z.boolean().default(true),
  download_count: z.number().default(0),
  published: z.boolean().default(false),
  publish_date: z.string().optional(),
  scheduled_publish_date: z.string().optional(),
  meta_title: z.string().optional(),
  meta_description: z.string().optional(),
  meta_keywords: z.string().optional(),
  canonical_url: z.string().optional(),
  og_title: z.string().optional(),
  og_description: z.string().optional(),
  og_image: z.string().optional(),
  og_type: z.string().optional(),
  schema_markup: z.string().optional(),
  google_analytics_id: z.string().optional(),
  custom_tracking_script: z.string().optional(),
  created_by: z.number().optional(),
});

export type CaseStudy = z.infer<typeof CaseStudySchema>;

// Whitepaper Schema
export const WhitepaperSchema = z.object({
  id: z.number().optional(),
  slug: z.string().min(1),
  title: z.string().min(1),
  excerpt: z.string().optional(),
  description: z.string().optional(),
  content: z.string().optional(),
  cover_image: z.string().optional(),
  pdf_url: z.string().min(1), // Required for whitepapers
  pdf_size: z.number().optional(),
  author: z.string().optional(),
  pages: z.number().optional(),
  reading_time: z.number().optional(),
  category_id: z.number().optional(),
  category_ids: z.string().optional(),
  tags: z.string().optional(),
  featured: z.boolean().default(false),
  gated: z.boolean().default(true),
  download_count: z.number().default(0),
  published: z.boolean().default(false),
  publish_date: z.string().optional(),
  scheduled_publish_date: z.string().optional(),
  meta_title: z.string().optional(),
  meta_description: z.string().optional(),
  meta_keywords: z.string().optional(),
  canonical_url: z.string().optional(),
  og_title: z.string().optional(),
  og_description: z.string().optional(),
  og_image: z.string().optional(),
  og_type: z.string().optional(),
  schema_markup: z.string().optional(),
  google_analytics_id: z.string().optional(),
  custom_tracking_script: z.string().optional(),
  created_by: z.number().optional(),
});

export type Whitepaper = z.infer<typeof WhitepaperSchema>;

// Lead Schema
export const LeadSchema = z.object({
  id: z.number().optional(),
  first_name: z.string().min(1),
  last_name: z.string().optional(),
  email: z.string().email(),
  phone: z.string().optional(),
  company: z.string().optional(),
  job_title: z.string().optional(),
  role: z.string().optional(),
  industry: z.string().optional(),
  content_type: z.enum(['ebook', 'case_study', 'whitepaper']),
  content_id: z.number(),
  content_title: z.string().optional(),
  lead_source: z.string().optional(),
  campaign: z.string().optional(),
  medium: z.string().optional(),
  referrer: z.string().optional(),
  utm_source: z.string().optional(),
  utm_medium: z.string().optional(),
  utm_campaign: z.string().optional(),
  utm_term: z.string().optional(),
  utm_content: z.string().optional(),
  status: z.enum(['new', 'contacted', 'qualified', 'converted', 'lost']).default('new'),
  notes: z.string().optional(),
  assigned_to: z.number().optional(),
  crm_id: z.string().optional(),
  crm_synced: z.boolean().default(false),
  consent_marketing: z.boolean().default(false),
  consent_data_processing: z.boolean().default(true),
  ip_address: z.string().optional(),
  user_agent: z.string().optional(),
});

export type Lead = z.infer<typeof LeadSchema>;

// Category Schema (Enhanced)
export const CategorySchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
  content_type: z.enum(['blog', 'ebook', 'case_study', 'whitepaper', 'all']).default('blog'),
  color: z.string().optional(),
  icon: z.string().optional(),
  order_index: z.number().default(0),
  parent_id: z.number().optional(),
});

export type Category = z.infer<typeof CategorySchema>;





