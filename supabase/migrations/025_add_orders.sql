-- 025: Merkezi sipariş modeli (Faz 2)
--
-- Tüm kaynaklar (qrmenulist, trendyol_food, yemeksepeti, ...) tek orders tablosuna
-- normalize edilir. QR menü siparişi anonim müşteriden yalnızca
-- create_public_order() RPC'si ile girer: fiyatlar istemciden değil products
-- tablosundan alınır, restoranın sipariş özelliği açık olmalıdır.
--
-- Stok düşümü bu fazda YOK (Faz 5). Sipariş numarası restoran + gün bazında
-- sayaçtan üretilir: YYMMDD-NNN (İstanbul saati).
--
-- Geri alma: supabase/rollback/025_rollback.sql

CREATE TABLE IF NOT EXISTS restaurant_order_counters (
  restaurant_id uuid NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  day date NOT NULL,
  last_no integer NOT NULL DEFAULT 0,
  PRIMARY KEY (restaurant_id, day)
);
ALTER TABLE restaurant_order_counters ENABLE ROW LEVEL SECURITY;
-- politika yok: yalnızca SECURITY DEFINER fonksiyon ve service role kullanır

CREATE OR REPLACE FUNCTION next_order_number(r_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  today date := (now() AT TIME ZONE 'Europe/Istanbul')::date;
  n integer;
BEGIN
  INSERT INTO restaurant_order_counters (restaurant_id, day, last_no)
  VALUES (r_id, today, 1)
  ON CONFLICT (restaurant_id, day)
  DO UPDATE SET last_no = restaurant_order_counters.last_no + 1
  RETURNING last_no INTO n;
  RETURN to_char(today, 'YYMMDD') || '-' || lpad(n::text, 3, '0');
END;
$$;

CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
  restaurant_id uuid NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  integration_id uuid REFERENCES integrations(id) ON DELETE SET NULL,
  source text NOT NULL CHECK (source IN ('qrmenulist', 'trendyol_food', 'yemeksepeti', 'getir_food', 'migros_food')),
  external_order_id text,
  external_order_number text,
  platform_status text,
  order_number text NOT NULL,
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'accepted', 'preparing', 'ready', 'completed', 'cancelled')),
  customer_name text,
  customer_phone text,
  delivery_type text NOT NULL DEFAULT 'delivery' CHECK (delivery_type IN ('delivery', 'pickup', 'dine_in')),
  delivery_address text,
  payment_type text,
  subtotal numeric(10,2) NOT NULL DEFAULT 0 CHECK (subtotal >= 0),
  discount numeric(10,2) NOT NULL DEFAULT 0 CHECK (discount >= 0),
  delivery_fee numeric(10,2) NOT NULL DEFAULT 0 CHECK (delivery_fee >= 0),
  total numeric(10,2) NOT NULL DEFAULT 0 CHECK (total >= 0),
  currency text NOT NULL DEFAULT 'TRY',
  customer_note text,
  cancel_reason text,
  raw_payload jsonb,
  stock_deducted_at timestamptz,
  stock_restored_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  accepted_at timestamptz,
  preparing_at timestamptz,
  ready_at timestamptz,
  completed_at timestamptz,
  cancelled_at timestamptz,
  UNIQUE (restaurant_id, order_number)
);

CREATE INDEX IF NOT EXISTS idx_orders_tenant_created ON orders(tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_restaurant_created ON orders(restaurant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_restaurant_status ON orders(restaurant_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status_created ON orders(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_source_external ON orders(source, external_order_id);
-- Aynı platform siparişi iki kez oluşmasın (webhook/polling tekrarları)
CREATE UNIQUE INDEX IF NOT EXISTS uq_orders_integration_external
  ON orders(integration_id, external_order_id) WHERE integration_id IS NOT NULL AND external_order_id IS NOT NULL;

DROP TRIGGER IF EXISTS set_orders_updated_at ON orders;
CREATE TRIGGER set_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE FUNCTION set_order_tenant()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  t_id uuid;
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.restaurant_id <> NEW.restaurant_id THEN
    RAISE EXCEPTION 'Cannot change restaurant_id of existing order';
  END IF;
  SELECT tenant_id INTO t_id FROM restaurants WHERE id = NEW.restaurant_id;
  IF t_id IS NULL THEN
    RAISE EXCEPTION 'Restaurant % has no tenant', NEW.restaurant_id;
  END IF;
  NEW.tenant_id := t_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_order_tenant ON orders;
CREATE TRIGGER trigger_set_order_tenant
  BEFORE INSERT OR UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION set_order_tenant();

CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  local_product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  external_product_id text,
  name text NOT NULL,
  quantity integer NOT NULL CHECK (quantity > 0),
  unit_price numeric(10,2) NOT NULL CHECK (unit_price >= 0),
  total_price numeric(10,2) NOT NULL CHECK (total_price >= 0),
  options jsonb NOT NULL DEFAULT '[]'::jsonb,
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product ON order_items(local_product_id);

-- RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "member_view_orders" ON orders;
CREATE POLICY "member_view_orders" ON orders FOR SELECT TO authenticated
USING (has_restaurant_access(restaurant_id));

DROP POLICY IF EXISTS "staff_update_orders" ON orders;
CREATE POLICY "staff_update_orders" ON orders FOR UPDATE TO authenticated
USING (has_restaurant_role(restaurant_id, ARRAY['super_admin', 'owner', 'admin', 'branch_manager', 'staff', 'kitchen']))
WITH CHECK (has_restaurant_role(restaurant_id, ARRAY['super_admin', 'owner', 'admin', 'branch_manager', 'staff', 'kitchen']));
-- INSERT politikası yok: QR siparişi create_public_order(), platform siparişi service role.

DROP POLICY IF EXISTS "member_view_order_items" ON order_items;
CREATE POLICY "member_view_order_items" ON order_items FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM orders o WHERE o.id = order_items.order_id AND has_restaurant_access(o.restaurant_id)));

-- ---------------------------------------------------------------------
-- Anonim QR siparişi: fiyatlar DB'den, restoran sipariş özelliği açık olmalı.
-- p_items: [{"id": "<product uuid>", "qty": 2}, ...]
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION create_public_order(
  p_restaurant_id uuid,
  p_items jsonb,
  p_payment_type text,
  p_delivery_address text,
  p_customer_note text DEFAULT NULL,
  p_customer_name text DEFAULT NULL,
  p_customer_phone text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  r restaurants%ROWTYPE;
  prod products%ROWTYPE;
  item jsonb;
  qty integer;
  sub numeric(10,2) := 0;
  line_total numeric(10,2);
  lines jsonb := '[]'::jsonb;
  o_id uuid;
  o_no text;
BEGIN
  SELECT * INTO r FROM restaurants WHERE id = p_restaurant_id AND is_active = true;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'restaurant_not_found';
  END IF;
  IF NOT COALESCE(r.ordering_enabled, false) OR COALESCE(btrim(r.whatsapp), '') = '' THEN
    RAISE EXCEPTION 'ordering_disabled';
  END IF;
  IF p_items IS NULL OR jsonb_typeof(p_items) <> 'array' OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'empty_cart';
  END IF;
  IF jsonb_array_length(p_items) > 50 THEN
    RAISE EXCEPTION 'too_many_items';
  END IF;
  IF p_payment_type NOT IN ('cash_on_delivery', 'card_on_delivery') THEN
    RAISE EXCEPTION 'invalid_payment';
  END IF;
  IF COALESCE(btrim(p_delivery_address), '') = '' THEN
    RAISE EXCEPTION 'address_required';
  END IF;

  FOR item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
    qty := LEAST(99, GREATEST(1, COALESCE((item->>'qty')::integer, 1)));
    SELECT * INTO prod FROM products
      WHERE id = (item->>'id')::uuid AND restaurant_id = p_restaurant_id AND is_active = true;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'product_not_found';
    END IF;
    line_total := round(prod.price * qty, 2);
    sub := sub + line_total;
    lines := lines || jsonb_build_object(
      'product_id', prod.id,
      'name', prod.name,
      'qty', qty,
      'unit_price', prod.price,
      'total', line_total
    );
  END LOOP;

  o_no := next_order_number(p_restaurant_id);

  INSERT INTO orders (
    restaurant_id, source, order_number, status,
    customer_name, customer_phone, delivery_type, delivery_address, payment_type,
    subtotal, discount, delivery_fee, total, currency, customer_note, raw_payload
  ) VALUES (
    p_restaurant_id, 'qrmenulist', o_no, 'new',
    left(p_customer_name, 120), left(p_customer_phone, 40), 'delivery', left(btrim(p_delivery_address), 500), p_payment_type,
    sub, 0, 0, sub, 'TRY', NULLIF(left(btrim(p_customer_note), 500), ''), jsonb_build_object('items', p_items)
  ) RETURNING id INTO o_id;

  INSERT INTO order_items (order_id, local_product_id, name, quantity, unit_price, total_price)
  SELECT o_id, (l->>'product_id')::uuid, l->>'name', (l->>'qty')::integer, (l->>'unit_price')::numeric, (l->>'total')::numeric
  FROM jsonb_array_elements(lines) l;

  RETURN jsonb_build_object('order_id', o_id, 'order_number', o_no, 'total', sub, 'items', lines);
END;
$$;

GRANT EXECUTE ON FUNCTION create_public_order(uuid, jsonb, text, text, text, text, text) TO anon, authenticated;
REVOKE EXECUTE ON FUNCTION next_order_number(uuid) FROM PUBLIC, anon, authenticated;

-- Realtime (Faz 7'de panel abone olur; publication'a şimdi eklemek zararsız)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime')
     AND NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'orders') THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE orders';
  END IF;
END $$;
