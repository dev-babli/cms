# Fix Database Authentication Error

## Error
```
Failed to create post: password authentication failed for user "postgres"
```

## Cause
The PostgreSQL connection string has incorrect credentials or the password needs URL encoding.

## Solution

### Step 1: Check Your Supabase Connection String

1. Go to your Supabase Dashboard
2. Navigate to **Settings** → **Database**
3. Find **Connection string** → **URI**
4. Copy the connection string

### Step 2: Verify Password Encoding

If your password contains special characters (like `@`, `#`, `%`, etc.), they need to be URL-encoded:

| Character | Encoded |
|-----------|---------|
| `@` | `%40` |
| `#` | `%23` |
| `%` | `%25` |
| `&` | `%26` |
| `+` | `%2B` |
| `=` | `%3D` |
| `?` | `%3F` |

**Example:**
- Password: `soumeet@132006`
- Encoded: `soumeet%40132006`

### Step 3: Update Vercel Environment Variables

1. Go to your Vercel project (CMS)
2. Navigate to **Settings** → **Environment Variables**
3. Find `DATABASE_URL`
4. Update with correct connection string:

```
postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres
```

**Important**: 
- Replace `[PASSWORD]` with URL-encoded password
- Use the **Connection Pooling** URL (port 5432) for better performance
- Or use **Direct connection** (port 6543) if pooler doesn't work

### Step 4: Test Connection

After updating, redeploy your CMS or test locally:

```bash
# Test connection locally
cd cms
node -e "
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});
pool.query('SELECT NOW()').then(r => {
  console.log('✅ Connected!', r.rows[0]);
  process.exit(0);
}).catch(e => {
  console.error('❌ Error:', e.message);
  process.exit(1);
});
"
```

## Alternative: Get New Connection String

If the password is lost or incorrect:

1. Go to Supabase Dashboard
2. **Settings** → **Database**
3. Click **Reset Database Password**
4. Copy the new connection string
5. Update in Vercel

## Quick Fix Script

Create a test file to verify your connection:

```javascript
// test-db-connection.js
require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('supabase') 
    ? { rejectUnauthorized: false } 
    : false,
});

async function test() {
  try {
    const result = await pool.query('SELECT NOW()');
    console.log('✅ Database connected!', result.rows[0]);
    await pool.end();
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.error('\n💡 Check:');
    console.error('  1. DATABASE_URL is correct');
    console.error('  2. Password is URL-encoded');
    console.error('  3. Database is accessible');
    process.exit(1);
  }
}

test();
```

Run: `node cms/test-db-connection.js`
