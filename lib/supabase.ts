import { createClient } from '@supabase/supabase-js';

// Supabase URL (can be public)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';

// Validate and create Supabase client
if (!supabaseUrl) {
  if (typeof window === 'undefined') {
    // Server-side: provide helpful error
    console.error('❌ NEXT_PUBLIC_SUPABASE_URL is not set!');
    console.error('📝 Please check your .env.local file and restart the dev server.');
    console.error('💡 The .env.local file should contain: NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co');
  }
}

// Client-side Supabase client (uses anon key - safe to be public)
// Note: If URL is empty, Supabase will throw an error - this is intentional to catch config issues early
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

// Server-side Supabase client (for API routes)
export const createServerClient = () => {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  
  // Use service role key for admin operations, anon key for regular auth
  const key = serviceRoleKey || anonKey;
  
  if (!supabaseUrl) {
    const errorMsg = process.env.NODE_ENV === 'production'
      ? 'Server configuration error. Please contact support.'
      : 'SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL is not set! Please check your .env.local file.';
    console.error('❌', errorMsg);
    // In development, provide helpful error message
    if (process.env.NODE_ENV === 'development') {
      throw new Error('Supabase URL is not configured. Please set NEXT_PUBLIC_SUPABASE_URL in your .env.local file.');
    }
    throw new Error('Supabase URL is not configured');
  }
  
  if (!key) {
    const errorMsg = process.env.NODE_ENV === 'production'
      ? 'Server configuration error. Please contact support.'
      : 'Supabase key not found. Please set SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file.';
    console.error('❌', errorMsg);
    // In development, provide helpful error message
    if (process.env.NODE_ENV === 'development') {
      throw new Error('Supabase API key is not configured. Please set SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file.');
    }
    throw new Error('Supabase API key is not configured');
  }
  
  return createClient(
    supabaseUrl,
    key,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
    }
  );
};

