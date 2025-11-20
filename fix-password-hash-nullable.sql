-- Fix: Make password_hash nullable since we're using Supabase Auth
-- Users created via Supabase Auth don't need password_hash in our custom table

-- Make password_hash nullable
ALTER TABLE users 
ALTER COLUMN password_hash DROP NOT NULL;

-- Add a comment explaining why it's nullable
COMMENT ON COLUMN users.password_hash IS 'Nullable for users authenticated via Supabase Auth. Only used for legacy users or custom auth.';

