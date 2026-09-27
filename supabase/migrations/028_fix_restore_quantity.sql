-- 028: İptal iadesi yalnızca GERÇEKTEN düşülen miktarı geri yükler (Faz 5 düzeltmesi)
--
-- Sorun: stok 1 iken 5 adetlik sipariş kabul edilince stok 0'a iner (eksiye düşmez;
-- defterde quantity = -1 yazar). İptalde eski fonksiyon sipariş satırındaki 5'i iade
-- ediyordu → stok 5 olurdu. Doğrusu: düşüm kaydındaki gerçek miktar (1) iade edilir.
-- Düşüm kaydı yoksa (o an stok takibi kapalıysa) iade de yoktur.
--
-- Geri alma: 027'deki sürüm; pratikte gerekmez (davranış yalnızca doğrulaştı).

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

  FOR item IN
    SELECT oi.local_product_id, t.quantity AS deducted
    FROM order_items oi
    LEFT JOIN inventory_transactions t
      ON t.idempotency_key = 'order:' || o.id::text || ':product:' || oi.local_product_id::text || ':deduct'
    WHERE oi.order_id = o.id AND oi.local_product_id IS NOT NULL
  LOOP
    -- düşüm kaydı yoksa veya 0 ise iade edilecek bir şey yok
    IF item.deducted IS NULL OR item.deducted >= 0 THEN
      CONTINUE;
    END IF;
    res := apply_inventory_transaction(
      item.local_product_id, 'order_cancel_restore', -item.deducted, 'order:' || o.source,
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
