-- FAZ 3: 024 tek parça. Supabase Dashboard > SQL Editor > New query > yapıştır > Run.
-- Geri alma: supabase/rollback/024_rollback.sql

-- 024: Entegrasyon altyapısı (Faz 3)
--
-- integrations        : restoran + platform başına bir bağlantı; credential'lar
--                       uygulama katmanında AES-256-GCM ile şifrelenir, DB'de
--                       yalnızca ciphertext durur. authenticated rolü bu kolonu
--                       OKUYAMAZ (kolon bazlı GRANT). Yazma yalnızca sunucu
--                       (service role) üzerinden yapılır.
-- integration_jobs    : ileride queue/worker'a taşınabilecek iş kuyruğu.
-- integration_events  : webhook/polling olaylarının idempotency kaydı.
--
-- Geri alma: supabase/rollback/024_rollback.sql

CREATE TABLE IF NOT EXISTS integrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
  restaurant_id uuid NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  platform text NOT NULL CHECK (platform IN ('trendyol_food', 'yemeksepeti', 'getir_food', 'migros_food')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'disabled')),
  health_status text NOT NULL DEFAULT 'warning' CHECK (health_status IN ('active', 'warning', 'error', 'disabled')),
  environment text NOT NULL DEFAULT 'production' CHECK (environment IN ('production', 'stage')),
  external_chain_id text,
  external_store_id text,
  credentials_encrypted text,
  credentials_meta jsonb NOT NULL DEFAULT '{}'::jsonb,
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  last_health_check_at timestamptz,
  last_successful_sync_at timestamptz,
  last_error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (restaurant_id, platform)
);

CREATE INDEX IF NOT EXISTS idx_integrations_tenant_restaurant ON integrations(tenant_id, restaurant_id);
CREATE INDEX IF NOT EXISTS idx_integrations_platform_status ON integrations(platform, status);

DROP TRIGGER IF EXISTS set_integrations_updated_at ON integrations;
CREATE TRIGGER set_integrations_updated_at
  BEFORE UPDATE ON integrations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- tenant_id her zaman restoranın tenant'ından türetilir; restaurant_id değişemez.
CREATE OR REPLACE FUNCTION set_integration_tenant()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  t_id uuid;
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.restaurant_id <> NEW.restaurant_id THEN
    RAISE EXCEPTION 'Cannot change restaurant_id of existing integration';
  END IF;
  SELECT tenant_id INTO t_id FROM restaurants WHERE id = NEW.restaurant_id;
  IF t_id IS NULL THEN
    RAISE EXCEPTION 'Restaurant % has no tenant', NEW.restaurant_id;
  END IF;
  NEW.tenant_id := t_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_integration_tenant ON integrations;
CREATE TRIGGER trigger_set_integration_tenant
  BEFORE INSERT OR UPDATE ON integrations
  FOR EACH ROW EXECUTE FUNCTION set_integration_tenant();

COMMENT ON COLUMN integrations.credentials_encrypted IS 'AES-256-GCM ciphertext (uygulama anahtarı INTEGRATION_SECRET_KEY). authenticated rolü okuyamaz.';
COMMENT ON COLUMN integrations.credentials_meta IS 'UI için maskeli özet: {"fields":{"apiKey":"••••"}, "updated_at": ...}. Gizli değer içermez.';

-- Kolon bazlı yetki: credentials_encrypted yalnızca service role tarafından okunur/yazılır.
REVOKE ALL ON integrations FROM anon;
REVOKE ALL ON integrations FROM authenticated;
GRANT SELECT (
  id, tenant_id, restaurant_id, platform, status, health_status, environment,
  external_chain_id, external_store_id, credentials_meta, config,
  last_health_check_at, last_successful_sync_at, last_error, created_at, updated_at
) ON integrations TO authenticated;

ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "member_view_integrations" ON integrations;
CREATE POLICY "member_view_integrations" ON integrations FOR SELECT TO authenticated
USING (has_restaurant_access(restaurant_id));
-- INSERT/UPDATE/DELETE politikası YOK: yazma yalnızca sunucu (service role).

-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS integration_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  restaurant_id uuid NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  integration_id uuid REFERENCES integrations(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('health_check', 'import_products', 'sync_stock', 'sync_availability', 'sync_price', 'order_status_update', 'poll_orders')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  result jsonb,
  attempt_count integer NOT NULL DEFAULT 0,
  max_attempts integer NOT NULL DEFAULT 5,
  last_error text,
  run_after timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  started_at timestamptz,
  processed_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_integration_jobs_pending ON integration_jobs(status, run_after) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_integration_jobs_integration ON integration_jobs(integration_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_integration_jobs_restaurant ON integration_jobs(restaurant_id, created_at DESC);

ALTER TABLE integration_jobs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "member_view_integration_jobs" ON integration_jobs;
CREATE POLICY "member_view_integration_jobs" ON integration_jobs FOR SELECT TO authenticated
USING (has_restaurant_access(restaurant_id));

-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS integration_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id uuid NOT NULL REFERENCES integrations(id) ON DELETE CASCADE,
  event_key text NOT NULL,
  event_type text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  received_at timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz,
  error text,
  UNIQUE (integration_id, event_key)
);

CREATE INDEX IF NOT EXISTS idx_integration_events_integration ON integration_events(integration_id, received_at DESC);

ALTER TABLE integration_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "member_view_integration_events" ON integration_events;
CREATE POLICY "member_view_integration_events" ON integration_events FOR SELECT TO authenticated
USING (
  EXISTS (SELECT 1 FROM integrations i WHERE i.id = integration_events.integration_id AND has_restaurant_access(i.restaurant_id))
);

-- Doğrulama:
SELECT (SELECT count(*) FROM integrations) AS integrations, (SELECT count(*) FROM integration_jobs) AS jobs, (SELECT count(*) FROM integration_events) AS events;
