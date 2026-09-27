-- 030: Kanal fiyatı senkron durumu (product_channel_links)
-- Kanal fiyatı kaydedilince veya QR fiyatı değişince platforma gönderilen fiyat ve sonucu.
ALTER TABLE product_channel_links
  ADD COLUMN IF NOT EXISTS synced_price numeric(10,2),
  ADD COLUMN IF NOT EXISTS last_price_sync_at timestamptz,
  ADD COLUMN IF NOT EXISTS last_price_sync_ok boolean,
  ADD COLUMN IF NOT EXISTS last_price_sync_error text;
