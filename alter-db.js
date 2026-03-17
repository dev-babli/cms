const { Pool } = require('pg');
require('dotenv').config({ path: './.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function main() {
  try {
    await pool.query(`ALTER TABLE blog_posts ADD COLUMN hero_text_color TEXT DEFAULT 'auto'`);
    console.log("Added hero_text_color to blog_posts");
  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    await pool.end();
  }
}

main();