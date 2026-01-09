/**
 * Verify Database Tables Exist
 * 
 * This script checks if all required tables exist in the database.
 * Run with: npx tsx scripts/verify-tables.ts
 */

import { query } from '../lib/db';

const REQUIRED_TABLES = [
  'blog_posts',
  'pages',
  'services',
  'team_members',
  'testimonials',
  'media',
  'users',
  'user_sessions',
  'categories',
  'job_postings',
  'news_announcements',
  'ebooks',
  'case_studies',
  'whitepapers',
  'leads',
  'lead_downloads',
  'notifications',
  'content_templates',
  'content_categories',
  'analytics_events',
];

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

async function main() {
  console.log('🔍 Checking database tables...\n');

  const results: { table: string; exists: boolean }[] = [];

  for (const table of REQUIRED_TABLES) {
    const exists = await checkTableExists(table);
    results.push({ table, exists });
    
    if (exists) {
      console.log(`✅ ${table}`);
    } else {
      console.log(`❌ ${table} - MISSING`);
    }
  }

  console.log('\n' + '='.repeat(50));
  
  const missing = results.filter(r => !r.exists);
  const existing = results.filter(r => r.exists);

  console.log(`\n📊 Summary:`);
  console.log(`   ✅ Existing: ${existing.length}/${REQUIRED_TABLES.length}`);
  console.log(`   ❌ Missing: ${missing.length}/${REQUIRED_TABLES.length}`);

  if (missing.length > 0) {
    console.log(`\n❌ Missing Tables:`);
    missing.forEach(r => console.log(`   - ${r.table}`));
    console.log(`\n💡 Solution:`);
    console.log(`   1. Open Supabase Dashboard → SQL Editor`);
    console.log(`   2. Copy the contents of consolidated-migrations.sql`);
    console.log(`   3. Paste and run the migration`);
    console.log(`   4. Run this script again to verify`);
    process.exit(1);
  } else {
    console.log(`\n✅ All tables exist! Database is ready.`);
    process.exit(0);
  }
}

main().catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});





