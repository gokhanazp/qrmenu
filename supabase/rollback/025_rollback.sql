-- 025 GERİ ALMA
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'orders') THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime DROP TABLE orders';
  END IF;
END $$;
DROP FUNCTION IF EXISTS create_public_order(uuid, jsonb, text, text, text, text, text);
DROP TABLE IF EXISTS order_items CASCADE;
DROP TRIGGER IF EXISTS trigger_set_order_tenant ON orders;
DROP FUNCTION IF EXISTS set_order_tenant();
DROP TABLE IF EXISTS orders CASCADE;
DROP FUNCTION IF EXISTS next_order_number(uuid);
DROP TABLE IF EXISTS restaurant_order_counters CASCADE;
