/**
 * Environment variable validation
 * Validates required environment variables on app startup
 */

interface EnvConfig {
  SUPABASE_URL?: string;
  NEXT_PUBLIC_SUPABASE_URL?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY?: string;
  DATABASE_URL?: string;
}

export function validateEnvironmentVariables(): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required for Supabase Auth
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  if (!supabaseUrl) {
    errors.push('SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL is required');
  }

  // Service role key is required for server-side operations
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    warnings.push('SUPABASE_SERVICE_ROLE_KEY is recommended for server-side operations');
  }

  // Anon key is optional (only needed for client-side)
  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    errors.push('Either NEXT_PUBLIC_SUPABASE_ANON_KEY or SUPABASE_SERVICE_ROLE_KEY is required');
  }

  // Database URL is required
  if (!process.env.DATABASE_URL) {
    errors.push('DATABASE_URL is required');
  }

  // Note: NEXTAUTH_SECRET and NEXTAUTH_URL are no longer needed
  // Supabase Auth handles all session management

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate environment variables and log results
 * Call this on app startup
 */
export function validateAndLogEnv(): void {
  const { valid, errors, warnings } = validateEnvironmentVariables();

  if (errors.length > 0) {
    console.error('❌ Environment variable errors:');
    errors.forEach((error) => console.error(`   - ${error}`));
    
    if (process.env.NODE_ENV === 'production') {
      console.error('\n⚠️  App may not function correctly in production without these variables.');
    }
  }

  if (warnings.length > 0) {
    console.warn('⚠️  Environment variable warnings:');
    warnings.forEach((warning) => console.warn(`   - ${warning}`));
  }

  if (valid && errors.length === 0) {
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ Environment variables validated');
    }
  }
}


