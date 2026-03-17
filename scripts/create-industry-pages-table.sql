-- Create industry_pages table to manage Industry page hero content via CMS
-- This is designed for PostgreSQL (Supabase compatible).

CREATE TABLE IF NOT EXISTS industry_pages (
  id BIGSERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,

  hero_title TEXT NOT NULL,
  hero_subtitle TEXT NULL,
  hero_description TEXT NULL,
  hero_button_text TEXT NULL,
  hero_button_link TEXT NULL,
  hero_background_image TEXT NULL,
  hero_text_color TEXT NULL, -- 'auto' | 'white' | 'black'
  hero_features JSONB NULL,  -- array of strings

  published BOOLEAN NOT NULL DEFAULT FALSE,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Update updated_at automatically (function is defined in consolidated migrations)
DROP TRIGGER IF EXISTS update_industry_pages_updated_at ON industry_pages;
CREATE TRIGGER update_industry_pages_updated_at
BEFORE UPDATE ON industry_pages
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

