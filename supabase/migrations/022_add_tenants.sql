-- 022: Multi-tenant temeli
--
-- TENANT = müşteri / şirket / marka, RESTAURANT = şube.
-- Mevcut restaurant kaydı şube olarak kullanılır; ayrı branch tablosu yoktur.
--
-- GERİYE UYUMLULUK
--  * restaurants.owner_user_id KALIR. Mevcut RLS politikaları, register() ve
--    impersonation bunu kullanmaya devam eder.
--  * Aşağıdaki politikalar mevcutlara EK'tir (Postgres permissive politikalar
--    OR ile birleşir). Hiçbir mevcut politika değiştirilmez/silinmez.
--  * Her mevcut restoran için 1 tenant + owner üyeliği backfill edilir.
--  * BEFORE INSERT trigger'ı tenant_id boş gelen yeni restoran için otomatik
--    tenant oluşturur; register() ve createRestaurantWithUser() değişmez.
--
-- ROLLER
--  tenant_users.role      : owner | admin | accountant   (tenant geneli)
--  restaurant_users.role  : branch_manager | staff | kitchen (şube bazlı)
--  SUPER_ADMIN            : mevcut admin_users tablosu (is_admin())
--
-- Geri alma: supabase/rollback/022_023_rollback.sql

-- =====================================================================
-- 1) Tablolar
-- =====================================================================
CREATE TABLE IF NOT EXISTS tenants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
  plan text NOT NULL DEFAULT 'standard',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS set_tenants_updated_at ON tenants;
CREATE TRIGGER set_tenants_updated_at
  BEFORE UPDATE ON tenants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE IF NOT EXISTS tenant_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('owner', 'admin', 'accountant')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_tenant_users_user ON tenant_users(user_id);
CREATE INDEX IF NOT EXISTS idx_tenant_users_tenant ON tenant_users(tenant_id);

CREATE TABLE IF NOT EXISTS restaurant_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('branch_manager', 'staff', 'kitchen')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (restaurant_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_restaurant_users_user ON restaurant_users(user_id);
CREATE INDEX IF NOT EXISTS idx_restaurant_users_restaurant ON restaurant_users(restaurant_id);

ALTER TABLE restaurants
  ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES tenants(id) ON DELETE RESTRICT;
CREATE INDEX IF NOT EXISTS idx_restaurants_tenant ON restaurants(tenant_id);

COMMENT ON TABLE tenants IS 'Müşteri / şirket / marka. Restoranlar (şubeler) tenant_id ile bağlanır.';
COMMENT ON TABLE tenant_users IS 'Tenant geneli üyelik: owner, admin, accountant';
COMMENT ON TABLE restaurant_users IS 'Şube bazlı üyelik: branch_manager, staff, kitchen';

-- =====================================================================
-- 2) Yetki fonksiyonları (SECURITY DEFINER: RLS içinden çağrılır, tablo
--    sahibi olarak çalıştığı için politikalarda özyineleme olmaz)
-- =====================================================================

-- Kullanıcının bir tenant'taki rolü. Legacy: tenant'a ait herhangi bir
-- restoranın owner_user_id'si ise 'owner' sayılır.
CREATE OR REPLACE FUNCTION user_tenant_role(t_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT tu.role FROM tenant_users tu
      WHERE tu.tenant_id = t_id AND tu.user_id = auth.uid()
      LIMIT 1),
    (SELECT 'owner' FROM restaurants r
      WHERE r.tenant_id = t_id AND r.owner_user_id = auth.uid()
      LIMIT 1)
  );
$$;

-- Kullanıcının bir restoran üzerindeki etkin rolü.
-- super_admin > owner > admin > branch_manager > staff > kitchen > accountant
CREATE OR REPLACE FUNCTION restaurant_role(r_id uuid)
RETURNS text
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  rest restaurants%ROWTYPE;
  t_role text;
  r_role text;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN NULL;
  END IF;

  IF EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()) THEN
    RETURN 'super_admin';
  END IF;

  SELECT * INTO rest FROM restaurants WHERE id = r_id;
  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  IF rest.owner_user_id = auth.uid() THEN
    RETURN 'owner';
  END IF;

  IF rest.tenant_id IS NOT NULL THEN
    SELECT tu.role INTO t_role FROM tenant_users tu
      WHERE tu.tenant_id = rest.tenant_id AND tu.user_id = auth.uid()
      LIMIT 1;
  END IF;

  SELECT ru.role INTO r_role FROM restaurant_users ru
    WHERE ru.restaurant_id = r_id AND ru.user_id = auth.uid()
    LIMIT 1;

  -- Güçlü olan rol kazanır
  IF t_role IN ('owner', 'admin') THEN
    RETURN t_role;
  END IF;
  IF r_role IS NOT NULL THEN
    RETURN r_role;
  END IF;
  RETURN t_role; -- accountant veya NULL
END;
$$;

CREATE OR REPLACE FUNCTION has_restaurant_access(r_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT restaurant_role(r_id) IS NOT NULL;
$$;

CREATE OR REPLACE FUNCTION has_restaurant_role(r_id uuid, roles text[])
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(restaurant_role(r_id) = ANY(roles), false);
$$;

GRANT EXECUTE ON FUNCTION user_tenant_role(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION restaurant_role(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION has_restaurant_access(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION has_restaurant_role(uuid, text[]) TO authenticated;

-- =====================================================================
-- 3) Backfill: her sahip için bir tenant, sahibin tüm restoranları o tenant'a
-- =====================================================================
DO $$
DECLARE
  r record;
  t_id uuid;
  candidate text;
  n integer;
BEGIN
  FOR r IN
    SELECT DISTINCT ON (owner_user_id) owner_user_id, name, slug
    FROM restaurants
    WHERE tenant_id IS NULL
    ORDER BY owner_user_id, created_at
  LOOP
    candidate := r.slug;
    n := 0;
    WHILE EXISTS (SELECT 1 FROM tenants WHERE slug = candidate) LOOP
      n := n + 1;
      candidate := r.slug || '-' || n;
    END LOOP;

    INSERT INTO tenants (name, slug) VALUES (r.name, candidate) RETURNING id INTO t_id;

    INSERT INTO tenant_users (tenant_id, user_id, role)
    VALUES (t_id, r.owner_user_id, 'owner')
    ON CONFLICT (tenant_id, user_id) DO NOTHING;

    UPDATE restaurants
    SET tenant_id = t_id
    WHERE owner_user_id = r.owner_user_id AND tenant_id IS NULL;
  END LOOP;
END $$;

-- =====================================================================
-- 4) Trigger: tenant_id boş gelen yeni restoran için otomatik tenant
-- =====================================================================
CREATE OR REPLACE FUNCTION ensure_restaurant_tenant()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  t_id uuid;
  candidate text;
  n integer := 0;
BEGIN
  IF NEW.tenant_id IS NOT NULL THEN
    -- Admin şubeyi belirli bir tenant'a bağladı; üyelikleri admin yönetir.
    RETURN NEW;
  END IF;

  -- Sahibin zaten owner olduğu bir tenant varsa onu kullan
  SELECT tu.tenant_id INTO t_id
  FROM tenant_users tu
  WHERE tu.user_id = NEW.owner_user_id AND tu.role = 'owner'
  ORDER BY tu.created_at
  LIMIT 1;

  IF t_id IS NULL THEN
    candidate := COALESCE(NULLIF(NEW.slug, ''), 'tenant');
    WHILE EXISTS (SELECT 1 FROM tenants WHERE slug = candidate) LOOP
      n := n + 1;
      candidate := COALESCE(NULLIF(NEW.slug, ''), 'tenant') || '-' || n;
    END LOOP;
    INSERT INTO tenants (name, slug) VALUES (NEW.name, candidate) RETURNING id INTO t_id;
  END IF;

  NEW.tenant_id := t_id;

  INSERT INTO tenant_users (tenant_id, user_id, role)
  VALUES (t_id, NEW.owner_user_id, 'owner')
  ON CONFLICT (tenant_id, user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_ensure_restaurant_tenant ON restaurants;
CREATE TRIGGER trigger_ensure_restaurant_tenant
  BEFORE INSERT ON restaurants
  FOR EACH ROW EXECUTE FUNCTION ensure_restaurant_tenant();

-- =====================================================================
-- 5) RLS
-- =====================================================================
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_users ENABLE ROW LEVEL SECURITY;

-- tenants
DROP POLICY IF EXISTS "member_view_tenants" ON tenants;
CREATE POLICY "member_view_tenants" ON tenants FOR SELECT TO authenticated
USING (
  is_admin()
  OR user_tenant_role(id) IS NOT NULL
  OR EXISTS (SELECT 1 FROM restaurants r WHERE r.tenant_id = tenants.id AND has_restaurant_access(r.id))
);

DROP POLICY IF EXISTS "owner_update_tenants" ON tenants;
CREATE POLICY "owner_update_tenants" ON tenants FOR UPDATE TO authenticated
USING (is_admin() OR user_tenant_role(id) IN ('owner', 'admin'))
WITH CHECK (is_admin() OR user_tenant_role(id) IN ('owner', 'admin'));

DROP POLICY IF EXISTS "admin_insert_tenants" ON tenants;
CREATE POLICY "admin_insert_tenants" ON tenants FOR INSERT TO authenticated
WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admin_delete_tenants" ON tenants;
CREATE POLICY "admin_delete_tenants" ON tenants FOR DELETE TO authenticated
USING (is_admin());

-- tenant_users
DROP POLICY IF EXISTS "member_view_tenant_users" ON tenant_users;
CREATE POLICY "member_view_tenant_users" ON tenant_users FOR SELECT TO authenticated
USING (is_admin() OR user_tenant_role(tenant_id) IS NOT NULL);

DROP POLICY IF EXISTS "owner_manage_tenant_users" ON tenant_users;
CREATE POLICY "owner_manage_tenant_users" ON tenant_users FOR ALL TO authenticated
USING (is_admin() OR user_tenant_role(tenant_id) IN ('owner', 'admin'))
WITH CHECK (is_admin() OR user_tenant_role(tenant_id) IN ('owner', 'admin'));

-- restaurant_users
DROP POLICY IF EXISTS "member_view_restaurant_users" ON restaurant_users;
CREATE POLICY "member_view_restaurant_users" ON restaurant_users FOR SELECT TO authenticated
USING (has_restaurant_access(restaurant_id));

DROP POLICY IF EXISTS "manager_manage_restaurant_users" ON restaurant_users;
CREATE POLICY "manager_manage_restaurant_users" ON restaurant_users FOR ALL TO authenticated
USING (has_restaurant_role(restaurant_id, ARRAY['super_admin', 'owner', 'admin', 'branch_manager']))
WITH CHECK (has_restaurant_role(restaurant_id, ARRAY['super_admin', 'owner', 'admin', 'branch_manager']));

-- Mevcut tablolara EK üyelik politikaları (owner_* ve admin_* politikaları aynen kalır)

-- restaurants
DROP POLICY IF EXISTS "member_view_restaurants" ON restaurants;
CREATE POLICY "member_view_restaurants" ON restaurants FOR SELECT TO authenticated
USING (has_restaurant_access(id));

DROP POLICY IF EXISTS "manager_update_restaurants" ON restaurants;
CREATE POLICY "manager_update_restaurants" ON restaurants FOR UPDATE TO authenticated
USING (has_restaurant_role(id, ARRAY['super_admin', 'owner', 'admin', 'branch_manager']))
WITH CHECK (has_restaurant_role(id, ARRAY['super_admin', 'owner', 'admin', 'branch_manager']));

-- categories
DROP POLICY IF EXISTS "member_view_categories" ON categories;
CREATE POLICY "member_view_categories" ON categories FOR SELECT TO authenticated
USING (has_restaurant_access(restaurant_id));

DROP POLICY IF EXISTS "manager_insert_categories" ON categories;
CREATE POLICY "manager_insert_categories" ON categories FOR INSERT TO authenticated
WITH CHECK (has_restaurant_role(restaurant_id, ARRAY['super_admin', 'owner', 'admin', 'branch_manager']));

DROP POLICY IF EXISTS "manager_update_categories" ON categories;
CREATE POLICY "manager_update_categories" ON categories FOR UPDATE TO authenticated
USING (has_restaurant_role(restaurant_id, ARRAY['super_admin', 'owner', 'admin', 'branch_manager']))
WITH CHECK (has_restaurant_role(restaurant_id, ARRAY['super_admin', 'owner', 'admin', 'branch_manager']));

DROP POLICY IF EXISTS "manager_delete_categories" ON categories;
CREATE POLICY "manager_delete_categories" ON categories FOR DELETE TO authenticated
USING (has_restaurant_role(restaurant_id, ARRAY['super_admin', 'owner', 'admin', 'branch_manager']));

-- products
DROP POLICY IF EXISTS "member_view_products" ON products;
CREATE POLICY "member_view_products" ON products FOR SELECT TO authenticated
USING (has_restaurant_access(restaurant_id));

DROP POLICY IF EXISTS "manager_insert_products" ON products;
CREATE POLICY "manager_insert_products" ON products FOR INSERT TO authenticated
WITH CHECK (has_restaurant_role(restaurant_id, ARRAY['super_admin', 'owner', 'admin', 'branch_manager']));

DROP POLICY IF EXISTS "manager_update_products" ON products;
CREATE POLICY "manager_update_products" ON products FOR UPDATE TO authenticated
USING (has_restaurant_role(restaurant_id, ARRAY['super_admin', 'owner', 'admin', 'branch_manager', 'staff']))
WITH CHECK (has_restaurant_role(restaurant_id, ARRAY['super_admin', 'owner', 'admin', 'branch_manager', 'staff']));

DROP POLICY IF EXISTS "manager_delete_products" ON products;
CREATE POLICY "manager_delete_products" ON products FOR DELETE TO authenticated
USING (has_restaurant_role(restaurant_id, ARRAY['super_admin', 'owner', 'admin', 'branch_manager']));

-- reviews
DROP POLICY IF EXISTS "member_view_reviews" ON reviews;
CREATE POLICY "member_view_reviews" ON reviews FOR SELECT TO authenticated
USING (has_restaurant_access(restaurant_id));

DROP POLICY IF EXISTS "manager_update_reviews" ON reviews;
CREATE POLICY "manager_update_reviews" ON reviews FOR UPDATE TO authenticated
USING (has_restaurant_role(restaurant_id, ARRAY['super_admin', 'owner', 'admin', 'branch_manager']))
WITH CHECK (has_restaurant_role(restaurant_id, ARRAY['super_admin', 'owner', 'admin', 'branch_manager']));

DROP POLICY IF EXISTS "manager_delete_reviews" ON reviews;
CREATE POLICY "manager_delete_reviews" ON reviews FOR DELETE TO authenticated
USING (has_restaurant_role(restaurant_id, ARRAY['super_admin', 'owner', 'admin', 'branch_manager']));

-- scan_events / subscriptions / payments: üyeler okur
DROP POLICY IF EXISTS "member_view_scan_events" ON scan_events;
CREATE POLICY "member_view_scan_events" ON scan_events FOR SELECT TO authenticated
USING (has_restaurant_access(restaurant_id));

DROP POLICY IF EXISTS "member_view_subscriptions" ON subscriptions;
CREATE POLICY "member_view_subscriptions" ON subscriptions FOR SELECT TO authenticated
USING (has_restaurant_access(restaurant_id));

DROP POLICY IF EXISTS "member_view_payments" ON payments;
CREATE POLICY "member_view_payments" ON payments FOR SELECT TO authenticated
USING (has_restaurant_access(restaurant_id));
