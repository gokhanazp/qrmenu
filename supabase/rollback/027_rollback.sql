-- 027 GERİ ALMA
DROP FUNCTION IF EXISTS restore_order_stock(uuid);
DROP FUNCTION IF EXISTS deduct_order_stock(uuid);
DROP FUNCTION IF EXISTS set_product_availability(uuid, boolean);
DROP FUNCTION IF EXISTS apply_inventory_transaction(uuid, text, integer, text, text, uuid, text, integer);
DROP TABLE IF EXISTS inventory_transactions CASCADE;
ALTER TABLE product_channel_links
  DROP COLUMN IF EXISTS last_availability_sync_at,
  DROP COLUMN IF EXISTS last_availability_sync_ok,
  DROP COLUMN IF EXISTS last_sync_error;
DROP INDEX IF EXISTS idx_products_unavailable;
DROP INDEX IF EXISTS idx_products_sku;
ALTER TABLE products
  DROP COLUMN IF EXISTS availability_manual_override,
  DROP COLUMN IF EXISTS sku,
  DROP COLUMN IF EXISTS stock_quantity,
  DROP COLUMN IF EXISTS track_stock,
  DROP COLUMN IF EXISTS is_available;
