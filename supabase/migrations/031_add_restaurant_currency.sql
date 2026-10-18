-- 031: Restoran bazında para birimi + header arka plan görseli
-- Supabase Dashboard > SQL Editor ile çalıştırın. Geri alma: supabase/rollback/031_rollback.sql

ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS currency text NOT NULL DEFAULT 'TRY';
ALTER TABLE restaurants DROP CONSTRAINT IF EXISTS restaurants_currency_check;
ALTER TABLE restaurants ADD CONSTRAINT restaurants_currency_check CHECK (currency ~ '^[A-Z]{3}$');
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS header_bg_url text;

-- QR siparişleri restoranın para birimiyle kaydedilsin (tek değişiklik: currency sütunu)
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
    sub, 0, 0, sub, COALESCE(r.currency, 'TRY'), NULLIF(left(btrim(p_customer_note), 500), ''), jsonb_build_object('items', p_items)
  ) RETURNING id INTO o_id;

  INSERT INTO order_items (order_id, local_product_id, name, quantity, unit_price, total_price)
  SELECT o_id, (l->>'product_id')::uuid, l->>'name', (l->>'qty')::integer, (l->>'unit_price')::numeric, (l->>'total')::numeric
  FROM jsonb_array_elements(lines) l;

  RETURN jsonb_build_object('order_id', o_id, 'order_number', o_no, 'total', sub, 'items', lines);
END;
$$;
