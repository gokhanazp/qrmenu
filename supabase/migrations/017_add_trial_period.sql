-- 017: 2 aylık ücretsiz deneme süresi (freemium)
-- Yeni restoranlar 2 ay ücretsiz kullanır; süre dolunca Pro'ya geçmeleri gerekir.
-- Pro geçişi admin panelden manuel yapılır (ödeme, site iletişim numarası üzerinden alınır).

-- 1) Deneme bitiş tarihi kolonu
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS trial_ends_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_subscriptions_trial_ends ON subscriptions(trial_ends_at);

-- 2) MEVCUT tüm restoranları Pro yap (grandfathering)
-- Böylece bu migration sonrası hiçbir mevcut restoranın menüsü aniden kapanmaz.
-- Pro olmayacaklar admin panelden manuel olarak "free" yapılıp süresi dolduğunda kapanacak.
UPDATE subscriptions
SET plan = 'pro', status = 'active', updated_at = now()
WHERE plan <> 'pro';

-- Aboneliği hiç olmayan mevcut restoranlara da Pro abonelik oluştur
INSERT INTO subscriptions (restaurant_id, plan, status)
SELECT r.id, 'pro', 'active'
FROM restaurants r
WHERE NOT EXISTS (
  SELECT 1 FROM subscriptions s WHERE s.restaurant_id = r.id
);

-- 3) Trigger'ı güncelle: bundan sonra oluşturulan YENİ restoranlar 2 ay ücretsiz deneme alsın
CREATE OR REPLACE FUNCTION create_default_subscription()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO subscriptions (restaurant_id, plan, status, current_period_start, trial_ends_at)
  VALUES (NEW.id, 'free', 'trialing', now(), now() + interval '2 months');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4) Public erişim: anonim ziyaretçi (QR okutan müşteri) menünün açık olup olmadığını
-- belirlemek için abonelik plan/durum/deneme bilgisini okuyabilmeli.
-- (Hassas veri değildir; ödeme bilgileri ayrı 'payments' tablosunda ve gizli kalır.)
DROP POLICY IF EXISTS "public_view_subscriptions" ON subscriptions;
CREATE POLICY "public_view_subscriptions"
ON subscriptions FOR SELECT
TO public
USING (
  EXISTS (
    SELECT 1 FROM restaurants
    WHERE id = subscriptions.restaurant_id
    AND is_active = true
  )
);
