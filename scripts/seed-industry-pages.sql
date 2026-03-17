-- Seed initial Industry Hero records for the Intellectt website.
-- Run this AFTER create-industry-pages-table.sql has been applied.
--
-- These entries ensure that CMS users immediately see all key Industry pages
-- in the `/admin/industry-pages` list and can edit hero copy and images
-- without needing developers to pre-create rows.

INSERT INTO industry_pages (
  slug,
  hero_title,
  hero_subtitle,
  hero_description,
  hero_button_text,
  hero_button_link,
  hero_background_image,
  hero_text_color,
  hero_features,
  published
)
VALUES
  -- 🏥 Healthcare
  (
    'healthcare-and-life-sciences',
    '🏥 Healthcare & Life Sciences',
    'Secure IT Solutions',
    'Transform healthcare with digital solutions and AI-powered diagnostics.',
    'Talk to our experts',
    '/contact',
    NULL,
    'black',
    NULL,
    FALSE
  ),

  -- 🏭 Manufacturing
  (
    'manufacturing-and-automotive',
    '🏭 Manufacturing & Automotive',
    'Industry 4.0 & Smart Manufacturing',
    'Modernize production with Industry 4.0, IoT, and digital twin solutions.',
    'Talk to our experts',
    '/contact',
    NULL,
    'black',
    NULL,
    FALSE
  ),

  -- 🏦 Banking & Finance
  (
    'banking-and-financial-services',
    '🏦 Banking & Financial Services',
    'Digital & Secure Finance',
    'Drive innovation across retail banking, payments, and risk management.',
    'Talk to our experts',
    '/contact',
    NULL,
    'black',
    NULL,
    FALSE
  ),

  -- ✈️ Aerospace
  (
    'aerospace-and-defense',
    '✈️ Aerospace & Defense',
    'Mission-Critical Engineering',
    'Deliver secure, compliant, and high‑reliability systems for aerospace and defense.',
    'Talk to our experts',
    '/contact',
    NULL,
    'black',
    NULL,
    FALSE
  ),

  -- 🛍️ Retail & E‑commerce
  (
    'retail-and-ecommerce',
    '🛍️ Retail & E‑Commerce',
    'Digital Commerce',
    'Create seamless omnichannel experiences and AI‑driven personalization.',
    'Talk to our experts',
    '/contact',
    NULL,
    'black',
    NULL,
    FALSE
  ),

  -- ⚡ Energy
  (
    'energy-and-utilities',
    '⚡ Energy & Utilities',
    'Smart Grid & Sustainability',
    'Enable smart grids, renewable integration, and intelligent energy management.',
    'Talk to our experts',
    '/contact',
    NULL,
    'black',
    NULL,
    FALSE
  ),

  -- 🎓 Education
  (
    'education-and-training',
    '🎓 Education & Training',
    'Digital Learning Solutions',
    'Reimagine learning with digital platforms, virtual classrooms, and analytics.',
    'Talk to our experts',
    '/contact',
    NULL,
    'black',
    NULL,
    FALSE
  ),

  -- 🚚 Logistics
  (
    'logistics-and-transportation',
    '🚚 Logistics & Transportation',
    'Connected Supply Chains',
    'Optimize logistics with real‑time visibility, automation, and analytics.',
    'Talk to our experts',
    '/contact',
    NULL,
    'black',
    NULL,
    FALSE
  )
ON CONFLICT (slug) DO UPDATE
SET
  hero_title = EXCLUDED.hero_title,
  hero_subtitle = EXCLUDED.hero_subtitle,
  hero_description = EXCLUDED.hero_description;

