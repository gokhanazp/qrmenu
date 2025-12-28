-- Add QR logo background color column to restaurants table
ALTER TABLE restaurants
ADD COLUMN IF NOT EXISTS qr_logo_bg_color TEXT DEFAULT '#FFFFFF';

-- Update existing restaurants to have default white background
UPDATE restaurants
SET qr_logo_bg_color = '#FFFFFF'
WHERE qr_logo_bg_color IS NULL;

-- Add comment
COMMENT ON COLUMN restaurants.qr_logo_bg_color IS 'Background color for logo on QR code (hex format)';