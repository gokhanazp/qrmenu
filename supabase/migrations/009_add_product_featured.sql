-- Add is_featured column to products table
ALTER TABLE products
ADD COLUMN is_featured BOOLEAN DEFAULT FALSE;

-- Add index for faster featured product queries
CREATE INDEX idx_products_featured ON products(restaurant_id, is_featured) WHERE is_featured = true;

-- Add comment
COMMENT ON COLUMN products.is_featured IS 'Whether this product should be featured on the homepage';