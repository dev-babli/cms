-- Migration: Add Supabase Auth integration support
-- This adds a column to link custom users with Supabase Auth users

-- Add supabase_user_id column to link with Supabase Auth
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS supabase_user_id UUID;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_supabase_id ON users(supabase_user_id);

-- Make password_hash nullable since we're using Supabase Auth
-- Users created via Supabase Auth don't need password_hash in our custom table
DO $$
BEGIN
    -- Check if password_hash column exists and is NOT NULL
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'password_hash'
        AND is_nullable = 'NO'
    ) THEN
        ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;
        RAISE NOTICE 'Made password_hash nullable for Supabase Auth integration.';
    ELSE
        RAISE NOTICE 'password_hash column is already nullable or does not exist.';
    END IF;
END $$;

-- Add password_reset_tokens table for custom password reset (if using hybrid)
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_reset_tokens_user ON password_reset_tokens(user_id);

-- Note: Supabase Auth will handle its own auth.users table
-- This migration just adds linking support

