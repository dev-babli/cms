# ⚠️ SQLite on Vercel - Important Note

## The Problem

**SQLite does NOT work well on Vercel's serverless environment** because:

1. **Read-only filesystem**: Vercel's filesystem is read-only except for `/tmp`
2. **No persistence**: Data in `/tmp` is lost between deployments
3. **Cold starts**: Each serverless function gets a fresh filesystem
4. **Native binaries**: `better-sqlite3` requires native compilation which can be problematic

## Current Workaround

The code has been updated to:
- Use `/tmp/content.db` on Vercel (writable location)
- Add error handling to prevent 500 errors
- Gracefully handle database initialization failures

**However, this is still not ideal for production** because:
- Data will be lost on each deployment
- Multiple serverless functions won't share the same database
- No data persistence

## Recommended Solutions

### Option 1: Use Vercel Postgres (Recommended)
1. Add Vercel Postgres to your project
2. Update `cms/lib/db.ts` to use PostgreSQL instead of SQLite
3. Use `@vercel/postgres` or `pg` package

### Option 2: Use External Database
- **PlanetScale** (MySQL-compatible, serverless)
- **Supabase** (PostgreSQL, free tier available)
- **Railway** (PostgreSQL, easy setup)
- **Neon** (Serverless Postgres)

### Option 3: Use Vercel KV (for simple data)
- Good for session storage
- Not ideal for complex relational data

## Quick Fix for Testing

For now, the CMS will:
- Work for testing (data resets on each deployment)
- Show login page even if database fails
- Not crash with 500 errors

## Migration Path

To migrate from SQLite to PostgreSQL:

1. Install PostgreSQL client:
   ```bash
   npm install pg @types/pg
   ```

2. Update `cms/lib/db.ts`:
   ```typescript
   import { Pool } from 'pg';
   
   const pool = new Pool({
     connectionString: process.env.DATABASE_URL,
   });
   ```

3. Update all database queries to use PostgreSQL syntax
4. Run migrations to create tables

## Status

- ✅ Error handling added
- ✅ Vercel path detection added
- ⚠️ Data persistence not guaranteed
- ⚠️ Production-ready database needed

---

**For production deployment, please migrate to PostgreSQL or another persistent database solution.**

