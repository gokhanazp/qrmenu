-- Add daily special field to products table
ALTER TABLE products
ADD COLUMN IF NOT EXISTS is_daily_special BOOLEAN DEFAULT false;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_products_daily_special 
ON products(restaurant_id, is_daily_special) 
WHERE is_daily_special = true;

-- Add comment
COMMENT ON COLUMN products.is_daily_special IS 'Mark product as daily special to show on homepage';