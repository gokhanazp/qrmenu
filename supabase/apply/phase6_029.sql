-- FAZ 6: 029 tek parça. Supabase Dashboard > SQL Editor > New query > yapıştır > Run.

-- 029: Sunucu (service role) fonksiyon yetkileri (Faz 6)
--
-- 025/027'de PUBLIC/anon/authenticated'dan alınan EXECUTE yetkileri service_role'e
-- açıkça verilir: platform siparişi numarası (next_order_number) ve sipariş kabul/iptal
-- kancaları (deduct/restore) sunucu tarafında service role ile çağrılır.
GRANT EXECUTE ON FUNCTION next_order_number(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION create_public_order(uuid, jsonb, text, text, text, text, text) TO service_role;
GRANT EXECUTE ON FUNCTION apply_inventory_transaction(uuid, text, integer, text, text, uuid, text, integer) TO service_role;
GRANT EXECUTE ON FUNCTION set_product_availability(uuid, boolean) TO service_role;
GRANT EXECUTE ON FUNCTION deduct_order_stock(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION restore_order_stock(uuid) TO service_role;

-- Doğrulama:
SELECT p.proname, has_function_privilege('service_role', p.oid, 'EXECUTE') AS service_role_execute FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace WHERE n.nspname = 'public' AND p.proname IN ('next_order_number','deduct_order_stock','restore_order_stock','apply_inventory_transaction','set_product_availability','create_public_order');
