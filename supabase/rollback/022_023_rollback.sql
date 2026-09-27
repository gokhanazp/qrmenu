-- 022 + 023 GERİ ALMA
-- Yalnızca 022/023 ile eklenenleri kaldırır. Mevcut owner_*/admin_*/public_*
-- politikalarına ve mevcut tablolara dokunmaz.

-- 023
DROP TABLE IF EXISTS restaurant_features CASCADE;

-- 022: ek politikalar
DROP POLICY IF EXISTS "member_view_payments" ON payments;
DROP POLICY IF EXISTS "member_view_subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "member_view_scan_events" ON scan_events;
DROP POLICY IF EXISTS "manager_delete_reviews" ON reviews;
DROP POLICY IF EXISTS "manager_update_reviews" ON reviews;
DROP POLICY IF EXISTS "member_view_reviews" ON reviews;
DROP POLICY IF EXISTS "manager_delete_products" ON products;
DROP POLICY IF EXISTS "manager_update_products" ON products;
DROP POLICY IF EXISTS "manager_insert_products" ON products;
DROP POLICY IF EXISTS "member_view_products" ON products;
DROP POLICY IF EXISTS "manager_delete_categories" ON categories;
DROP POLICY IF EXISTS "manager_update_categories" ON categories;
DROP POLICY IF EXISTS "manager_insert_categories" ON categories;
DROP POLICY IF EXISTS "member_view_categories" ON categories;
DROP POLICY IF EXISTS "manager_update_restaurants" ON restaurants;
DROP POLICY IF EXISTS "member_view_restaurants" ON restaurants;

-- 022: trigger, kolon, tablolar, fonksiyonlar
DROP TRIGGER IF EXISTS trigger_ensure_restaurant_tenant ON restaurants;
DROP FUNCTION IF EXISTS ensure_restaurant_tenant();

ALTER TABLE restaurants DROP COLUMN IF EXISTS tenant_id;

DROP TABLE IF EXISTS restaurant_users CASCADE;
DROP TABLE IF EXISTS tenant_users CASCADE;
DROP TABLE IF EXISTS tenants CASCADE;

DROP FUNCTION IF EXISTS has_restaurant_role(uuid, text[]);
DROP FUNCTION IF EXISTS has_restaurant_access(uuid);
DROP FUNCTION IF EXISTS restaurant_role(uuid);
DROP FUNCTION IF EXISTS user_tenant_role(uuid);
