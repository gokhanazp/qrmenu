-- Add header and footer color customization fields to restaurants table
ALTER TABLE restaurants
ADD COLUMN IF NOT EXISTS header_bg_color TEXT DEFAULT '#ffffff',
ADD COLUMN IF NOT EXISTS footer_bg_color TEXT DEFAULT '#ffffff';

-- Update existing restaurants with default values based on their current background_color
UPDATE restaurants
SET 
  header_bg_color = COALESCE(background_color, '#ffffff'),
  footer_bg_color = COALESCE(background_color, '#ffffff')
WHERE header_bg_color IS NULL OR footer_bg_color IS NULL;
