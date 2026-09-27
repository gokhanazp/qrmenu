-- FAZ 4: 026 tek parça. Supabase Dashboard > SQL Editor > New query > yapıştır > Run.
-- Geri alma: supabase/rollback/026_rollback.sql

-- 026: Platform ürünleri ve eşleştirme (Faz 4)
--
-- external_products     : pazaryeri ürünlerinin snapshot'ı. Yerel ürüne ASLA yazmaz.
-- product_channel_links : yerel (master) ürün ↔ platform ürünü eşleşmesi. Bir
--                         platform ürünü tek yerel ürüne, bir yerel ürün platform
--                         başına tek platform ürününe bağlanır. Üç kaydın da aynı
--                         restorana ait olması trigger ile zorlanır; restoranlar
--                         arası eşleştirme fiziksel olarak imkânsızdır.
-- Yazma yalnızca sunucu (service role) üzerinden; üyeler okur.
--
-- Geri alma: supabase/rollback/026_rollback.sql

CREATE TABLE IF NOT EXISTS external_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
  restaurant_id uuid NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  integration_id uuid NOT NULL REFERENCES integrations(id) ON DELETE CASCADE,
  platform text NOT NULL CHECK (platform IN ('trendyol_food', 'yemeksepeti', 'getir_food', 'migros_food')),
  external_product_id text NOT NULL,
  external_sku text,
  name text NOT NULL,
  description text,
  price numeric(10,2),
  quantity integer,
  available boolean NOT NULL DEFAULT true,
  category text,
  image_url text,
  raw_payload jsonb,
  source text NOT NULL DEFAULT 'sync' CHECK (source IN ('sync', 'manual')),
  last_synced_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (integration_id, external_product_id)
);

CREATE INDEX IF NOT EXISTS idx_external_products_restaurant ON external_products(restaurant_id, platform);
CREATE INDEX IF NOT EXISTS idx_external_products_tenant ON external_products(tenant_id, restaurant_id);

DROP TRIGGER IF EXISTS set_external_products_updated_at ON external_products;
CREATE TRIGGER set_external_products_updated_at
  BEFORE UPDATE ON external_products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- tenant/restaurant/platform her zaman entegrasyondan türetilir
CREATE OR REPLACE FUNCTION set_external_product_scope()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  i integrations%ROWTYPE;
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.integration_id <> NEW.integration_id THEN
    RAISE EXCEPTION 'Cannot change integration_id of existing external product';
  END IF;
  SELECT * INTO i FROM integrations WHERE id = NEW.integration_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Integration % not found', NEW.integration_id;
  END IF;
  NEW.tenant_id := i.tenant_id;
  NEW.restaurant_id := i.restaurant_id;
  NEW.platform := i.platform;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_external_product_scope ON external_products;
CREATE TRIGGER trigger_set_external_product_scope
  BEFORE INSERT OR UPDATE ON external_products
  FOR EACH ROW EXECUTE FUNCTION set_external_product_scope();

ALTER TABLE external_products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "member_view_external_products" ON external_products;
CREATE POLICY "member_view_external_products" ON external_products FOR SELECT TO authenticated
USING (has_restaurant_access(restaurant_id));

-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS product_channel_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
  restaurant_id uuid NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  local_product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  integration_id uuid NOT NULL REFERENCES integrations(id) ON DELETE CASCADE,
  external_product_row_id uuid NOT NULL REFERENCES external_products(id) ON DELETE CASCADE,
  external_product_id text NOT NULL,
  use_master_price boolean NOT NULL DEFAULT false,
  price_override numeric(10,2) CHECK (price_override IS NULL OR price_override >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (integration_id, external_product_row_id),
  UNIQUE (local_product_id, integration_id)
);

CREATE INDEX IF NOT EXISTS idx_channel_links_local ON product_channel_links(local_product_id, integration_id);
CREATE INDEX IF NOT EXISTS idx_channel_links_restaurant ON product_channel_links(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_channel_links_external ON product_channel_links(integration_id, external_product_id);

DROP TRIGGER IF EXISTS set_channel_links_updated_at ON product_channel_links;
CREATE TRIGGER set_channel_links_updated_at
  BEFORE UPDATE ON product_channel_links
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- KRİTİK KURAL: yerel ürün, entegrasyon ve platform ürünü AYNI restorana ait olmalı
CREATE OR REPLACE FUNCTION validate_channel_link()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  i integrations%ROWTYPE;
  p_restaurant uuid;
  e external_products%ROWTYPE;
BEGIN
  SELECT * INTO i FROM integrations WHERE id = NEW.integration_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Integration not found'; END IF;

  SELECT restaurant_id INTO p_restaurant FROM products WHERE id = NEW.local_product_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Local product not found'; END IF;

  SELECT * INTO e FROM external_products WHERE id = NEW.external_product_row_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'External product not found'; END IF;

  IF p_restaurant <> i.restaurant_id OR e.restaurant_id <> i.restaurant_id OR e.integration_id <> i.id THEN
    RAISE EXCEPTION 'Cross-restaurant product mapping is not allowed';
  END IF;

  NEW.tenant_id := i.tenant_id;
  NEW.restaurant_id := i.restaurant_id;
  NEW.external_product_id := e.external_product_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_validate_channel_link ON product_channel_links;
CREATE TRIGGER trigger_validate_channel_link
  BEFORE INSERT OR UPDATE ON product_channel_links
  FOR EACH ROW EXECUTE FUNCTION validate_channel_link();

ALTER TABLE product_channel_links ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "member_view_channel_links" ON product_channel_links;
CREATE POLICY "member_view_channel_links" ON product_channel_links FOR SELECT TO authenticated
USING (has_restaurant_access(restaurant_id));

-- Doğrulama:
SELECT (SELECT count(*) FROM external_products) AS external_products, (SELECT count(*) FROM product_channel_links) AS links;
