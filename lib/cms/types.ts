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
});

export type BlogPost = z.infer<typeof BlogPostSchema>;

// Service Schema
export const ServiceSchema = z.object({
  id: z.number().optional(),
  slug: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  content: z.string().optional(),
  icon: z.string().optional(),
  featured_image: z.string().optional(),
  price: z.string().optional(),
  features: z.string().optional(),
  published: z.boolean().default(false),
});

export type Service = z.infer<typeof ServiceSchema>;

// Team Member Schema
export const TeamMemberSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1),
  position: z.string().optional(),
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



