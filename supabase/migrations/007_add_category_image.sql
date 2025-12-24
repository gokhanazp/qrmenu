-- Add image_url column to categories table
ALTER TABLE categories ADD COLUMN image_url text;

-- Add index for image_url
CREATE INDEX idx_categories_image ON categories(image_url) WHERE image_url IS NOT NULL;