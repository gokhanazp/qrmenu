-- Add composite index for featured products query optimization
CREATE INDEX IF NOT EXISTS idx_products_featured 
ON products(restaurant_id, is_featured, is_active, sort_order) 
WHERE is_featured = true AND is_active = true;

-- Add composite index for category products query optimization
CREATE INDEX IF NOT EXISTS idx_products_category_active 
ON products(restaurant_id, category_id, is_active, sort_order) 
WHERE is_active = true;

-- Add index for scan events aggregation queries
CREATE INDEX IF NOT EXISTS idx_scan_events_restaurant_date 
ON scan_events(restaurant_id, DATE(scanned_at));