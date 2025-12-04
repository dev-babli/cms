#!/usr/bin/env node

/**
 * Migration: Add scheduled_publish_date column to blog_posts table
 * 
 * This script adds the missing scheduled_publish_date column to the blog_posts table.
 * Run this if you get: "column scheduled_publish_date does not exist"
 */

require('dotenv').config({ path: '.env.local' });

const { query } = require('../lib/db');

async function addScheduledPublishDate() {
  console.log('🔄 Adding scheduled_publish_date column to blog_posts...\n');

  try {
    // Check if column already exists
    const checkColumn = await query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'blog_posts' 
      AND column_name = 'scheduled_publish_date'
    `);

    if (checkColumn.rows.length > 0) {
      console.log('✅ Column scheduled_publish_date already exists!\n');
      return;
    }

    // Add the column
    await query(`
      ALTER TABLE blog_posts 
      ADD COLUMN scheduled_publish_date TIMESTAMP
    `);

    console.log('✅ Successfully added scheduled_publish_date column to blog_posts!\n');
    
    // Also check and add to other content tables if needed
    const tables = ['ebooks', 'case_studies', 'whitepapers'];
    
    for (const table of tables) {
      try {
        const checkTable = await query(`
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_name = $1 
          AND column_name = 'scheduled_publish_date'
        `, [table]);

        if (checkTable.rows.length === 0) {
          await query(`
            ALTER TABLE ${table} 
            ADD COLUMN IF NOT EXISTS scheduled_publish_date TIMESTAMP
          `);
          console.log(`✅ Added scheduled_publish_date to ${table}`);
        } else {
          console.log(`✅ ${table} already has scheduled_publish_date`);
        }
      } catch (error) {
        // Table might not exist, that's okay
        console.log(`⚠️  Skipping ${table} (table may not exist)`);
      }
    }

    console.log('\n🎉 Migration complete!\n');
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  }
}

// Run migration
addScheduledPublishDate()
  .then(() => {
    console.log('✅ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });

