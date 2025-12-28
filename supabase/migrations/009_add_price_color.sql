-- Add price_color column to restaurants table
ALTER TABLE restaurants
ADD COLUMN IF NOT EXISTS price_color TEXT DEFAULT '#ef4444';

-- Update existing restaurants to use red color for prices
UPDATE restaurants
SET price_color = '#ef4444'
WHERE price_color IS NULL;