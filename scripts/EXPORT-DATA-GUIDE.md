# 📤 Export Data from Source Database

## ✅ Schema Fixed!

Your `schema.sql` file is now ready (18.13 KB). Now we need to export the **data**.

## 🎯 Option 1: Using Supabase Dashboard (Easiest)

### Method A: Export via Table Editor

1. **Go to Source Dashboard** → **Table Editor**
2. **For each table** (blog_posts, users, categories, etc.):
   - Click on the table name
   - Click the **"..."** menu (top right)
   - Select **"Export"** → **"CSV"** or **"SQL"**
   - Save the file
   - Combine all exports into one `data.sql` file

### Method B: Export via SQL Editor (Recommended)

1. **Go to Source Dashboard** → **SQL Editor** → **New Query**

2. **Run this query** to generate INSERT statements for all tables:

```sql
-- Export all data as INSERT statements
DO $$
DECLARE
    r RECORD;
    table_name TEXT;
    insert_sql TEXT;
BEGIN
    FOR r IN 
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public'
        ORDER BY tablename
    LOOP
        table_name := r.tablename;
        
        -- Generate INSERT statements for this table
        EXECUTE format('
            SELECT string_agg(
                format(''INSERT INTO %I (%s) VALUES (%s);'',
                    %L,
                    string_agg(quote_ident(column_name), '', ''),
                    string_agg(
                        CASE 
                            WHEN data_type IN (''text'', ''varchar'', ''char'') 
                            THEN quote_literal(column_name::text)
                            WHEN data_type IN (''timestamp'', ''date'') 
                            THEN quote_literal(column_name::text)
                            WHEN data_type = ''boolean''
                            THEN column_name::text
                            ELSE column_name::text
                        END,
                        '', ''
                    )
                ),
                E''\n''
            )
            FROM information_schema.columns
            WHERE table_schema = ''public'' AND table_name = %L
        ', table_name, table_name);
    END LOOP;
END $$;
```

**OR** use this simpler approach - export each table:

```sql
-- Export blog_posts
COPY (SELECT * FROM blog_posts) TO STDOUT WITH CSV HEADER;

-- Export users  
COPY (SELECT * FROM users) TO STDOUT WITH CSV HEADER;

-- Export categories
COPY (SELECT * FROM categories) TO STDOUT WITH CSV HEADER;

-- Export case_studies
COPY (SELECT * FROM case_studies) TO STDOUT WITH CSV HEADER;

-- Export news
COPY (SELECT * FROM news) TO STDOUT WITH CSV HEADER;

-- Export whitepapers
COPY (SELECT * FROM whitepapers) TO STDOUT WITH CSV HEADER;

-- Export team_members
COPY (SELECT * FROM team_members) TO STDOUT WITH CSV HEADER;

-- Export testimonials
COPY (SELECT * FROM testimonials) TO STDOUT WITH CSV HEADER;

-- Export media
COPY (SELECT * FROM media) TO STDOUT WITH CSV HEADER;

-- Export pages
COPY (SELECT * FROM pages) TO STDOUT WITH CSV HEADER;

-- Export services
COPY (SELECT * FROM services) TO STDOUT WITH CSV HEADER;
```

3. **Copy the results** and save to `data.sql`

### Method C: Generate INSERT Statements

Run this in SQL Editor to generate INSERT statements:

```sql
-- For blog_posts
SELECT 'INSERT INTO blog_posts (' || 
       string_agg(column_name, ', ') || 
       ') VALUES (' || 
       string_agg('''' || column_name || '''', ', ') || 
       ');' 
FROM information_schema.columns 
WHERE table_name = 'blog_posts' AND table_schema = 'public';
```

Then manually replace column names with actual values, or use a script.

## 🎯 Option 2: Use pg_dump (If Installed)

If you have PostgreSQL client tools installed:

```powershell
# Get connection string from: Settings → Database → Connection string (URI)
$sourceConn = "postgresql://postgres:[PASSWORD]@db.[SOURCE_REF].supabase.co:5432/postgres"

# Export data
pg_dump $sourceConn --data-only --no-owner --no-acl -f "cms\scripts\supabase_backup_20260105_193147\data.sql"
```

**Install PostgreSQL Tools:**
- Download: https://www.postgresql.org/download/windows/
- Or: `choco install postgresql` (if you have Chocolatey)

## 🎯 Option 3: Quick Data Export Script

I can create a PowerShell script that exports data via Supabase API. Would you like me to create that?

## 📝 Recommended: Manual Export via Dashboard

**Easiest method:**

1. **Source Dashboard** → **SQL Editor**
2. **Run this query** for each table:

```sql
-- Get all data from blog_posts
SELECT * FROM blog_posts;
```

3. **Copy results** (right-click → Copy)
4. **Convert to INSERT statements** or save as CSV
5. **Repeat for all tables**

## ✅ After Export

1. **Verify data.sql has content**:
   ```powershell
   Get-ChildItem "cms\scripts\supabase_backup_20260105_193147\data.sql" | Select-Object Name, @{Name="Size(KB)";Expression={[math]::Round($_.Length/1KB,2)}}
   ```

2. **Continue with import** to target database

## 🚀 Quick Action

**Right now, the easiest way:**

1. Go to **Source Dashboard** → **Table Editor**
2. For each table, click **"..."** → **"Export"** → **"SQL"**
3. Combine all exports into `data.sql`
4. Or use SQL Editor with COPY commands (see Method B above)

---

**Need help with a specific table?** Let me know which tables you have and I'll generate the exact export queries!





