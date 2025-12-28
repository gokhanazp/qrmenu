-- Add icon color customization fields to restaurants table
ALTER TABLE restaurants
ADD COLUMN IF NOT EXISTS icon_color TEXT DEFAULT '#111827',
ADD COLUMN IF NOT EXISTS hamburger_bg_color TEXT DEFAULT '#ffffff';

-- Update existing restaurants with default values
UPDATE restaurants
SET 
  icon_color = COALESCE(icon_color, '#111827'),
  hamburger_bg_color = COALESCE(hamburger_bg_color, '#ffffff')
WHERE icon_color IS NULL OR hamburger_bg_color IS NULL;