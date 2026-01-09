/**
 * Check and Create Database Tables
 * 
 * This script checks if required tables exist and creates them if missing.
 * Run with: npx tsx scripts/check-and-create-tables.ts
 */

import { query } from '../lib/db';

async function checkTableExists(tableName: string): Promise<boolean> {
  try {
    const result = await query(
      `SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = $1
      )`,
      [tableName]
    );
    return result.rows[0]?.exists || false;
  } catch (error) {
    console.error(`Error checking table ${tableName}:`, error);
    return false;
  }
}

async function createBlogPostsTable() {
  const sql = `
    CREATE TABLE IF NOT EXISTS blog_posts (
      id SERIAL PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      excerpt TEXT,
      content TEXT,
      author TEXT,
      featured_image TEXT,
      banner_image TEXT,
      category TEXT,
      tags TEXT,
      published BOOLEAN DEFAULT false,
      publish_date TIMESTAMP,
      scheduled_publish_date TIMESTAMP,
      -- SEO Fields
      meta_title TEXT,
      meta_description TEXT,
      meta_keywords TEXT,
      canonical_url TEXT,
      og_title TEXT,
      og_description TEXT,
      og_image TEXT,
      og_type TEXT DEFAULT 'article',
      schema_markup TEXT,
      custom_tracking_script TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Create index on slug
    CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
    
    -- Create trigger for updated_at
    DROP TRIGGER IF EXISTS update_blog_posts_updated_at ON blog_posts;
    CREATE TRIGGER update_blog_posts_updated_at 
      BEFORE UPDATE ON blog_posts
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  `;

  try {
    await query(sql);
    console.log('✅ blog_posts table created/verified');
  } catch (error: any) {
    // If update_updated_at_column function doesn't exist, create it first
    if (error?.message?.includes('update_updated_at_column')) {
      await query(`
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
        END;
        $$ language 'plpgsql';
      `);
      // Retry table creation
      await query(sql);
      console.log('✅ blog_posts table created/verified');
    } else {
      throw error;
    }
  }
}

async function main() {
  console.log('🔍 Checking database tables...\n');

  try {
    // Check if blog_posts exists
    const blogPostsExists = await checkTableExists('blog_posts');
    
    if (!blogPostsExists) {
      console.log('❌ blog_posts table not found');
      console.log('📝 Creating blog_posts table...');
      await createBlogPostsTable();
    } else {
      console.log('✅ blog_posts table exists');
    }

    console.log('\n✅ Database check complete!');
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
}

main();





