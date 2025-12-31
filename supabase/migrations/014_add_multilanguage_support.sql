-- Add multi-language support for restaurants, categories, and products

-- Add supported_languages to restaurants table
-- This will store which languages the restaurant supports (e.g., ['tr', 'en'])
ALTER TABLE restaurants
ADD COLUMN IF NOT EXISTS supported_languages TEXT[] DEFAULT ARRAY['tr']::TEXT[];

-- Add English fields to categories table
ALTER TABLE categories
ADD COLUMN IF NOT EXISTS name_en TEXT;

-- Add English fields to products table
ALTER TABLE products
ADD COLUMN IF NOT EXISTS name_en TEXT,
ADD COLUMN IF NOT EXISTS description_en TEXT;

-- Update existing restaurants to have Turkish as default language
UPDATE restaurants
SET supported_languages = ARRAY['tr']::TEXT[]
WHERE supported_languages IS NULL;

-- Add comments
COMMENT ON COLUMN restaurants.supported_languages IS 'Array of supported language codes (e.g., tr, en)';
COMMENT ON COLUMN categories.name_en IS 'Category name in English';
COMMENT ON COLUMN products.name_en IS 'Product name in English';
COMMENT ON COLUMN products.description_en IS 'Product description in English';