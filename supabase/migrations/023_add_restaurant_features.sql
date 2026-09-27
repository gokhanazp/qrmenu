-- 023: Restoran bazlı özellik (feature) sistemi
--
-- Onlarca boolean kolon yerine anahtar/değer tablosu. Özellikler QRMenuList
-- yönetimi (admin_users) tarafından açılır; restoran üyeleri okur.
--
-- feature_key örnekleri:
--   direct_order, marketplace, trendyol_food, yemeksepeti, stock, reports, multi_branch
--
-- NOT: 'whatsapp_order' için kaynak mevcut restaurants.ordering_enabled kolonu
-- olarak KALIR (public sayfa ve admin toggle değişmez). lib/features.ts ikisini
-- tek FeatureSet'te birleştirir.
--
-- Public SELECT: herkese açık menü sayfası sipariş/stok bayraklarını okumak
-- zorunda (anon). config alanında gizli bilgi TUTULMAZ.
--
-- Geri alma: supabase/rollback/022_023_rollback.sql

CREATE TABLE IF NOT EXISTS restaurant_features (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  feature_key text NOT NULL CHECK (feature_key ~ '^[a-z][a-z0-9_]*$'),
  enabled boolean NOT NULL DEFAULT true,
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (restaurant_id, feature_key)
);

CREATE INDEX IF NOT EXISTS idx_restaurant_features_restaurant ON restaurant_features(restaurant_id);

DROP TRIGGER IF EXISTS set_restaurant_features_updated_at ON restaurant_features;
CREATE TRIGGER set_restaurant_features_updated_at
  BEFORE UPDATE ON restaurant_features
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE restaurant_features IS 'Restoran başına açık/kapalı özellikler ve ayarları (admin yönetir)';

ALTER TABLE restaurant_features ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_view_restaurant_features" ON restaurant_features;
CREATE POLICY "public_view_restaurant_features" ON restaurant_features FOR SELECT TO public
USING (
  EXISTS (SELECT 1 FROM restaurants WHERE id = restaurant_features.restaurant_id AND is_active = true)
);

DROP POLICY IF EXISTS "member_view_restaurant_features" ON restaurant_features;
CREATE POLICY "member_view_restaurant_features" ON restaurant_features FOR SELECT TO authenticated
USING (has_restaurant_access(restaurant_id));

DROP POLICY IF EXISTS "admin_manage_restaurant_features" ON restaurant_features;
CREATE POLICY "admin_manage_restaurant_features" ON restaurant_features FOR ALL TO authenticated
USING (is_admin())
WITH CHECK (is_admin());
