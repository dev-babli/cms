/**
 * Scheduled Publishing Service
 * Automatically publishes content when scheduled_publish_date is reached
 */

import db from '../db';
import { blogPosts, ebooks, caseStudies } from './api';

interface PublishResult {
    content_type: string;
    content_id: number;
    title: string;
    published: boolean;
    error?: string;
}

/**
 * Publish all scheduled content that has reached its publish date
 */
export async function publishScheduledContent(): Promise<PublishResult[]> {
    const results: PublishResult[] = [];
    const now = new Date().toISOString();

    try {
        // Publish scheduled blog posts
        const scheduledBlogs = await db.prepare(`
      SELECT id, title, scheduled_publish_date 
      FROM blog_posts 
      WHERE scheduled_publish_date IS NOT NULL 
        AND scheduled_publish_date <= ? 
        AND published = false
    `).all(now);

        for (const blog of scheduledBlogs as any[]) {
            try {
                await blogPosts.update(blog.id, {
                    published: true,
                    publish_date: blog.scheduled_publish_date,
                });
                results.push({
                    content_type: 'blog',
                    content_id: blog.id,
                    title: blog.title,
                    published: true,
                });
            } catch (error: any) {
                results.push({
                    content_type: 'blog',
                    content_id: blog.id,
                    title: blog.title,
                    published: false,
                    error: error.message,
                });
            }
        }

        // Publish scheduled eBooks
        const scheduledEbooks = await db.prepare(`
      SELECT id, title, scheduled_publish_date 
      FROM ebooks 
      WHERE scheduled_publish_date IS NOT NULL 
        AND scheduled_publish_date <= ? 
        AND published = false
    `).all(now);

        for (const ebook of scheduledEbooks as any[]) {
            try {
                await ebooks.update(ebook.id, {
                    published: true,
                    publish_date: ebook.scheduled_publish_date,
                });
                results.push({
                    content_type: 'ebook',
                    content_id: ebook.id,
                    title: ebook.title,
                    published: true,
                });
            } catch (error: any) {
                results.push({
                    content_type: 'ebook',
                    content_id: ebook.id,
                    title: ebook.title,
                    published: false,
                    error: error.message,
                });
            }
        }

        // Publish scheduled Case Studies
        const scheduledCaseStudies = await db.prepare(`
      SELECT id, title, scheduled_publish_date 
      FROM case_studies 
      WHERE scheduled_publish_date IS NOT NULL 
        AND scheduled_publish_date <= ? 
        AND published = false
    `).all(now);

        for (const caseStudy of scheduledCaseStudies as any[]) {
            try {
                await caseStudies.update(caseStudy.id, {
                    published: true,
                    publish_date: caseStudy.scheduled_publish_date,
                });
                results.push({
                    content_type: 'case_study',
                    content_id: caseStudy.id,
                    title: caseStudy.title,
                    published: true,
                });
            } catch (error: any) {
                results.push({
                    content_type: 'case_study',
                    content_id: caseStudy.id,
                    title: caseStudy.title,
                    published: false,
                    error: error.message,
                });
            }
        }

        return results;
    } catch (error: any) {
        console.error('Error in scheduled publishing:', error);
        throw error;
    }
}

/**
 * Get count of scheduled content waiting to be published
 */
export async function getScheduledContentCount(): Promise<number> {
    const now = new Date().toISOString();

    try {
        const [blogs, ebooks, caseStudies] = await Promise.all([
            db.prepare(`
        SELECT COUNT(*) as count 
        FROM blog_posts 
        WHERE scheduled_publish_date IS NOT NULL 
          AND scheduled_publish_date <= ? 
          AND published = false
      `).get(now),
            db.prepare(`
        SELECT COUNT(*) as count 
        FROM ebooks 
        WHERE scheduled_publish_date IS NOT NULL 
          AND scheduled_publish_date <= ? 
          AND published = false
      `).get(now),
            db.prepare(`
        SELECT COUNT(*) as count 
        FROM case_studies 
        WHERE scheduled_publish_date IS NOT NULL 
          AND scheduled_publish_date <= ? 
          AND published = false
      `).get(now),
        ]);

        const total =
            ((blogs as any)?.count || 0) +
            ((ebooks as any)?.count || 0) +
            ((caseStudies as any)?.count || 0);

        return total;
    } catch (error: any) {
        console.error('Error counting scheduled content:', error);
        return 0;
    }
}

