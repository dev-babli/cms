import { createClient } from '@supabase/supabase-js';

// Supabase URL (can be public)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';

// Client-side Supabase client (uses anon key - safe to be public)
export const supabase = createClient(
  supabaseUrl,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  }
);

// Server-side Supabase client (for API routes - uses service role key for security)
export const createServerClient = () => {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  
  // Prefer service role key for server-side (more secure)
  // Falls back to anon key if service role not available
  const key = serviceRoleKey || anonKey;
  
  if (!key) {
    console.warn('⚠️ Supabase key not found. Use SUPABASE_SERVICE_ROLE_KEY (recommended) or SUPABASE_ANON_KEY.');
  }
  
  return createClient(
    supabaseUrl,
    key || '',
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        // Use admin API if service role key is available
        ...(serviceRoleKey && {
          // Service role key bypasses RLS - use with caution!
        }),
      },
    }
  );
};

