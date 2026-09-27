ALTER TABLE product_channel_links
  DROP COLUMN IF EXISTS synced_price,
  DROP COLUMN IF EXISTS last_price_sync_at,
  DROP COLUMN IF EXISTS last_price_sync_ok,
  DROP COLUMN IF EXISTS last_price_sync_error;
