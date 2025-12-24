-- Add customization fields to restaurants table
ALTER TABLE restaurants
ADD COLUMN IF NOT EXISTS layout_style TEXT DEFAULT 'grid' CHECK (layout_style IN ('grid', 'list')),
ADD COLUMN IF NOT EXISTS background_color TEXT DEFAULT '#ffffff',
ADD COLUMN IF NOT EXISTS surface_color TEXT DEFAULT '#f9fafb',
ADD COLUMN IF NOT EXISTS text_color TEXT DEFAULT '#111827',
ADD COLUMN IF NOT EXISTS primary_color TEXT DEFAULT '#FF6B35',
ADD COLUMN IF NOT EXISTS about_us TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS instagram TEXT,
ADD COLUMN IF NOT EXISTS facebook TEXT,
ADD COLUMN IF NOT EXISTS twitter TEXT;

-- Remove old theme column if exists
ALTER TABLE restaurants DROP COLUMN IF EXISTS theme;

-- Add comment
COMMENT ON COLUMN restaurants.layout_style IS 'Menu layout style: grid (2 columns) or list (1 column)';
COMMENT ON COLUMN restaurants.background_color IS 'Main background color in hex format';
COMMENT ON COLUMN restaurants.surface_color IS 'Card/surface background color in hex format';
COMMENT ON COLUMN restaurants.text_color IS 'Main text color in hex format';
COMMENT ON COLUMN restaurants.primary_color IS 'Primary/accent color in hex format';