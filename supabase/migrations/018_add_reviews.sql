-- 018: Müşteri yorumları / öneri-şikayet sistemi
-- QR menüyü okutan müşteriler yorum/öneri/şikayet bırakır; restoran sahibi onaylayınca
-- (is_published=true) public menüde görünür. Şikayetler/onaysızlar gizli kalır.

CREATE TABLE reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  topic text NOT NULL DEFAULT 'oneri' CHECK (topic IN ('oneri', 'sikayet', 'diger')),
  rating integer CHECK (rating BETWEEN 1 AND 5),
  message text NOT NULL CHECK (char_length(message) BETWEEN 1 AND 1000),
  author_name text,
  contact text,
  is_published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_reviews_restaurant ON reviews(restaurant_id);
CREATE INDEX idx_reviews_published ON reviews(restaurant_id, is_published);
CREATE INDEX idx_reviews_created ON reviews(created_at DESC);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Güvenlik: Public insert'te yayın durumu ASLA true olamaz (doğrudan API çağrısına karşı).
-- Ayrıca author_name/contact uzunluğunu sınırla.
CREATE OR REPLACE FUNCTION force_review_defaults()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.is_published := false;
  IF NEW.author_name IS NOT NULL THEN
    NEW.author_name := left(NEW.author_name, 80);
  END IF;
  IF NEW.contact IS NOT NULL THEN
    NEW.contact := left(NEW.contact, 120);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_force_review_defaults
  BEFORE INSERT ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION force_review_defaults();

-- Public: aktif restorana yorum ekleyebilir (is_published trigger ile false'a kilitli)
CREATE POLICY "public_insert_reviews"
ON reviews FOR INSERT
TO public
WITH CHECK (
  EXISTS (
    SELECT 1 FROM restaurants
    WHERE id = reviews.restaurant_id
    AND is_active = true
  )
);

-- Public: sadece yayınlanmış yorumları görebilir (aktif restoran)
CREATE POLICY "public_view_published_reviews"
ON reviews FOR SELECT
TO public
USING (
  is_published = true
  AND EXISTS (
    SELECT 1 FROM restaurants
    WHERE id = reviews.restaurant_id
    AND is_active = true
  )
);

-- Owner: kendi restoranının tüm yorumlarını görebilir
CREATE POLICY "owner_view_own_reviews"
ON reviews FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM restaurants
    WHERE id = reviews.restaurant_id
    AND owner_user_id = auth.uid()
  )
);

-- Owner: kendi restoranının yorumlarını güncelleyebilir (yayınla/kaldır)
CREATE POLICY "owner_update_own_reviews"
ON reviews FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM restaurants
    WHERE id = reviews.restaurant_id
    AND owner_user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM restaurants
    WHERE id = reviews.restaurant_id
    AND owner_user_id = auth.uid()
  )
);

-- Owner: kendi restoranının yorumlarını silebilir
CREATE POLICY "owner_delete_own_reviews"
ON reviews FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM restaurants
    WHERE id = reviews.restaurant_id
    AND owner_user_id = auth.uid()
  )
);

-- Admin: tüm yorumları görebilir / güncelleyebilir / silebilir
CREATE POLICY "admin_view_all_reviews"
ON reviews FOR SELECT
TO authenticated
USING (is_admin());

CREATE POLICY "admin_update_all_reviews"
ON reviews FOR UPDATE
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

CREATE POLICY "admin_delete_all_reviews"
ON reviews FOR DELETE
TO authenticated
USING (is_admin());
