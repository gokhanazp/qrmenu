-- FAZ 5: 027 tek parça. Supabase Dashboard > SQL Editor > New query > yapıştır > Run.
-- Geri alma: supabase/rollback/027_rollback.sql

-- 027: Merkezi stok ve kullanılabilirlik (Faz 5)
--
-- products
--   is_available                : SATIŞTA / TÜKENDİ (menüde görünür, sipariş verilemez). is_active listeleme anahtarı olarak KALIR.
--   track_stock                 : false = yalnızca satışta/tükendi; true = stock_quantity izlenir
--   stock_quantity              : master stok (eşleşen tüm kanallar bu havuzu paylaşır)
--   sku                         : eşleştirme önerisi için
--   availability_manual_override: "Tükendi Yap" ile kapatıldı; stok tekrar >0 olsa da otomatik açılmaz
--
-- inventory_transactions: defter. Stok ASLA doğrudan UPDATE edilmez; her değişim
--   apply_inventory_transaction() ile satır kilidi altında ve idempotency_key ile yazılır.
--   Sipariş düşümü/iadesi ürün başına birer kez uygulanır (order:{id}:product:{pid}:deduct|restore).
--
-- Geriye uyumluluk: varsayılanlar (true/false/null) ile Type A/B müşteride hiçbir davranış değişmez.
-- Admin ürün formlarındaki is_available kolonu hatası bu migration ile kapanır.
--
-- Geri alma: supabase/rollback/027_rollback.sql

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS is_available boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS track_stock boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS stock_quantity integer CHECK (stock_quantity IS NULL OR stock_quantity >= 0),
  ADD COLUMN IF NOT EXISTS sku text,
  ADD COLUMN IF NOT EXISTS availability_manual_override boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_products_sku ON products(restaurant_id, sku) WHERE sku IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_products_unavailable ON products(restaurant_id) WHERE is_available = false;

COMMENT ON COLUMN products.is_available IS 'false = TÜKENDİ: menüde görünür, sipariş verilemez';
COMMENT ON COLUMN products.track_stock IS 'true ise stock_quantity izlenir; 0 olunca otomatik tükendi';
COMMENT ON COLUMN products.availability_manual_override IS 'Elle tükendi yapıldı; stok gelse de otomatik açılmaz';

ALTER TABLE product_channel_links
  ADD COLUMN IF NOT EXISTS last_availability_sync_at timestamptz,
  ADD COLUMN IF NOT EXISTS last_availability_sync_ok boolean,
  ADD COLUMN IF NOT EXISTS last_sync_error text;

-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS inventory_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
  restaurant_id uuid NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  order_id uuid REFERENCES orders(id) ON DELETE SET NULL,
  type text NOT NULL CHECK (type IN ('order_sale', 'order_cancel_restore', 'manual_adjustment', 'stock_in', 'stock_out', 'correction')),
  quantity integer NOT NULL,
  previous_quantity integer,
  new_quantity integer,
  source text NOT NULL DEFAULT 'panel',
  idempotency_key text UNIQUE,
  note text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_inventory_tx_product ON inventory_transactions(product_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_inventory_tx_restaurant ON inventory_transactions(restaurant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_inventory_tx_order ON inventory_transactions(order_id);

ALTER TABLE inventory_transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "member_view_inventory_transactions" ON inventory_transactions;
CREATE POLICY "member_view_inventory_transactions" ON inventory_transactions FOR SELECT TO authenticated
USING (has_restaurant_access(restaurant_id));
-- yazma yalnızca aşağıdaki fonksiyonlar üzerinden

-- ---------------------------------------------------------------------
-- Tek giriş noktası: satır kilidi + idempotency + otomatik tükendi/satışta
-- p_delta: işaretli miktar (-2 satış, +2 iade). p_absolute verilirse stok o değere ayarlanır.
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION apply_inventory_transaction(
  p_product_id uuid,
  p_type text,
  p_delta integer,
  p_source text DEFAULT 'panel',
  p_idempotency_key text DEFAULT NULL,
  p_order_id uuid DEFAULT NULL,
  p_note text DEFAULT NULL,
  p_absolute integer DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  prod products%ROWTYPE;
  t_id uuid;
  prev integer;
  nxt integer;
  avail boolean;
BEGIN
  SELECT * INTO prod FROM products WHERE id = p_product_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'product_not_found';
  END IF;

  -- Yetki: panel kullanıcısı ise operasyon rolü şart; service role (auth.uid() NULL) sistemdir
  IF auth.uid() IS NOT NULL AND NOT has_restaurant_role(prod.restaurant_id, ARRAY['super_admin', 'owner', 'admin', 'branch_manager', 'staff']) THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  IF p_idempotency_key IS NOT NULL AND EXISTS (SELECT 1 FROM inventory_transactions WHERE idempotency_key = p_idempotency_key) THEN
    RETURN jsonb_build_object('applied', false, 'reason', 'duplicate', 'stock_quantity', prod.stock_quantity, 'is_available', prod.is_available, 'availability_changed', false);
  END IF;

  IF NOT prod.track_stock THEN
    RETURN jsonb_build_object('applied', false, 'reason', 'not_tracked', 'stock_quantity', prod.stock_quantity, 'is_available', prod.is_available, 'availability_changed', false);
  END IF;

  SELECT tenant_id INTO t_id FROM restaurants WHERE id = prod.restaurant_id;

  prev := COALESCE(prod.stock_quantity, 0);
  IF p_absolute IS NOT NULL THEN
    nxt := GREATEST(0, p_absolute);
  ELSE
    nxt := GREATEST(0, prev + p_delta);
  END IF;

  INSERT INTO inventory_transactions (tenant_id, restaurant_id, product_id, order_id, type, quantity, previous_quantity, new_quantity, source, idempotency_key, note, created_by)
  VALUES (t_id, prod.restaurant_id, prod.id, p_order_id, p_type, nxt - prev, prev, nxt, p_source, p_idempotency_key, p_note, auth.uid());

  avail := prod.is_available;
  IF nxt = 0 THEN
    avail := false;
  ELSIF nxt > 0 AND NOT prod.is_available AND NOT prod.availability_manual_override THEN
    avail := true;
  END IF;

  UPDATE products SET stock_quantity = nxt, is_available = avail WHERE id = prod.id;

  RETURN jsonb_build_object(
    'applied', true,
    'previous_quantity', prev,
    'stock_quantity', nxt,
    'is_available', avail,
    'availability_changed', avail IS DISTINCT FROM prod.is_available
  );
END;
$$;

-- Manuel TÜKENDİ / SATIŞTA (stok takibinden bağımsız; sipariş kabulü etkilenmez)
CREATE OR REPLACE FUNCTION set_product_availability(p_product_id uuid, p_available boolean)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  prod products%ROWTYPE;
BEGIN
  SELECT * INTO prod FROM products WHERE id = p_product_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'product_not_found'; END IF;
  IF auth.uid() IS NOT NULL AND NOT has_restaurant_role(prod.restaurant_id, ARRAY['super_admin', 'owner', 'admin', 'branch_manager', 'staff']) THEN
    RAISE EXCEPTION 'forbidden';
  END IF;
  UPDATE products
  SET is_available = p_available,
      -- elle kapatıldıysa engel konur; elle açıldıysa engel kalkar
      availability_manual_override = (NOT p_available)
  WHERE id = prod.id;
  RETURN jsonb_build_object('is_available', p_available, 'availability_changed', prod.is_available IS DISTINCT FROM p_available);
END;
$$;

-- Sipariş kabulünde stok düşümü: ürün başına bir kez (idempotent)
CREATE OR REPLACE FUNCTION deduct_order_stock(p_order_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  o orders%ROWTYPE;
  item record;
  res jsonb;
  changed uuid[] := ARRAY[]::uuid[];
  applied integer := 0;
BEGIN
  SELECT * INTO o FROM orders WHERE id = p_order_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'order_not_found'; END IF;
  IF auth.uid() IS NOT NULL AND NOT has_restaurant_role(o.restaurant_id, ARRAY['super_admin', 'owner', 'admin', 'branch_manager', 'staff']) THEN
    RAISE EXCEPTION 'forbidden';
  END IF;
  IF o.stock_deducted_at IS NOT NULL THEN
    RETURN jsonb_build_object('applied', 0, 'reason', 'already_deducted', 'changed_products', '[]'::jsonb);
  END IF;

  FOR item IN SELECT local_product_id, quantity FROM order_items WHERE order_id = o.id AND local_product_id IS NOT NULL LOOP
    res := apply_inventory_transaction(
      item.local_product_id, 'order_sale', -item.quantity, 'order:' || o.source,
      'order:' || o.id::text || ':product:' || item.local_product_id::text || ':deduct', o.id, NULL
    );
    IF (res->>'applied')::boolean THEN
      applied := applied + 1;
      IF (res->>'availability_changed')::boolean THEN changed := array_append(changed, item.local_product_id); END IF;
    END IF;
  END LOOP;

  UPDATE orders SET stock_deducted_at = now() WHERE id = o.id;
  RETURN jsonb_build_object('applied', applied, 'changed_products', to_jsonb(changed));
END;
$$;

-- İptalde iade: yalnızca daha önce düşüldüyse ve bir kez
CREATE OR REPLACE FUNCTION restore_order_stock(p_order_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  o orders%ROWTYPE;
  item record;
  res jsonb;
  changed uuid[] := ARRAY[]::uuid[];
  applied integer := 0;
BEGIN
  SELECT * INTO o FROM orders WHERE id = p_order_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'order_not_found'; END IF;
  IF auth.uid() IS NOT NULL AND NOT has_restaurant_role(o.restaurant_id, ARRAY['super_admin', 'owner', 'admin', 'branch_manager', 'staff']) THEN
    RAISE EXCEPTION 'forbidden';
  END IF;
  IF o.stock_deducted_at IS NULL THEN
    RETURN jsonb_build_object('applied', 0, 'reason', 'never_deducted', 'changed_products', '[]'::jsonb);
  END IF;
  IF o.stock_restored_at IS NOT NULL THEN
    RETURN jsonb_build_object('applied', 0, 'reason', 'already_restored', 'changed_products', '[]'::jsonb);
  END IF;

  FOR item IN SELECT local_product_id, quantity FROM order_items WHERE order_id = o.id AND local_product_id IS NOT NULL LOOP
    res := apply_inventory_transaction(
      item.local_product_id, 'order_cancel_restore', item.quantity, 'order:' || o.source,
      'order:' || o.id::text || ':product:' || item.local_product_id::text || ':restore', o.id, NULL
    );
    IF (res->>'applied')::boolean THEN
      applied := applied + 1;
      IF (res->>'availability_changed')::boolean THEN changed := array_append(changed, item.local_product_id); END IF;
    END IF;
  END LOOP;

  UPDATE orders SET stock_restored_at = now() WHERE id = o.id;
  RETURN jsonb_build_object('applied', applied, 'changed_products', to_jsonb(changed));
END;
$$;

REVOKE EXECUTE ON FUNCTION apply_inventory_transaction(uuid, text, integer, text, text, uuid, text, integer) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION set_product_availability(uuid, boolean) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION deduct_order_stock(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION restore_order_stock(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION apply_inventory_transaction(uuid, text, integer, text, text, uuid, text, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION set_product_availability(uuid, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION deduct_order_stock(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION restore_order_stock(uuid) TO authenticated;

-- Doğrulama:
SELECT (SELECT count(*) FROM products WHERE is_available = false) AS tukendi, (SELECT count(*) FROM inventory_transactions) AS hareket, (SELECT count(*) FROM pg_proc WHERE proname IN ('apply_inventory_transaction','deduct_order_stock','restore_order_stock','set_product_availability')) AS fonksiyon;
