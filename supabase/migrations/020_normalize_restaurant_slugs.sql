-- 020: Restoran slug'larını küçük harfe normalize et
--
-- SORUN
-- Google için /restorant/Hilton-Garden-Inn-Pendik ve
-- /restorant/hilton-garden-inn-pendik İKİ FARKLI SAYFADIR. Aynı içerik iki
-- adreste indekslenince link ve tıklama sinyalleri bölünür, hangisinin
-- sıralanacağına Google karar verir.
--
-- Veritabanında elle girilmiş büyük harfli slug'lar var. `generate_unique_slug`
-- fonksiyonu zaten `lower()` uyguluyor (001_initial_schema.sql), dolayısıyla
-- bunlar fonksiyondan değil, doğrudan INSERT/UPDATE ile girmiş.
--
-- GÜVENLİK
-- Basılı QR kodları kırılmaz: middleware.ts /restorant/* isteklerinde URL'i
-- 308 ile küçük harfe yönlendiriyor ve getPublicRestaurant slug'ı `ilike` ile
-- (büyük/küçük harf duyarsız) arıyor. Yani hem eski büyük harfli link hem
-- yeni küçük harfli link çalışmaya devam eder.
--
-- ÇAKIŞMA
-- Küçük harfe çevirince iki kayıt aynı slug'a düşerse UPDATE hata verir.
-- Aşağıdaki blok böyle bir durumu önce raporlar, sonra çakışmayanları
-- güncelleyip çakışanları elle çözülmek üzere bırakır.

DO $$
DECLARE
  conflicting record;
  conflict_count int := 0;
BEGIN
  -- 1) Küçük harfe çevrildiğinde çakışacak slug'ları raporla
  FOR conflicting IN
    SELECT lower(slug) AS normalized, count(*) AS n, array_agg(slug) AS slugs
    FROM restaurants
    GROUP BY lower(slug)
    HAVING count(*) > 1
  LOOP
    conflict_count := conflict_count + 1;
    RAISE WARNING
      'Slug çakışması: "%" -> %. Bu kayıtlar elle düzeltilmeli, otomatik güncellenmedi.',
      conflicting.normalized, conflicting.slugs;
  END LOOP;

  -- 2) Çakışmayan büyük harfli slug'ları normalize et
  UPDATE restaurants r
  SET slug = lower(r.slug)
  WHERE r.slug <> lower(r.slug)
    AND NOT EXISTS (
      SELECT 1
      FROM restaurants other
      WHERE other.id <> r.id
        AND lower(other.slug) = lower(r.slug)
    );

  IF conflict_count = 0 THEN
    RAISE NOTICE 'Tüm slug''lar normalize edildi, çakışma yok.';
  END IF;
END $$;

-- 3) Bundan sonra büyük harfli slug girilmesini veritabanı seviyesinde engelle.
--    Uygulama katmanı (lib/utils/slug.ts) zaten küçük harf üretiyor; bu, elle
--    yapılan INSERT/UPDATE'lere karşı son savunma hattı.
ALTER TABLE restaurants
  DROP CONSTRAINT IF EXISTS restaurants_slug_lowercase;

ALTER TABLE restaurants
  ADD CONSTRAINT restaurants_slug_lowercase
  CHECK (slug = lower(slug))
  NOT VALID;

-- NOT VALID: mevcut çakışan kayıtlar (varsa) migration'ı düşürmesin.
-- Çakışmaları elle çözdükten sonra şunu çalıştırıp kısıtı tam geçerli yap:
--   ALTER TABLE restaurants VALIDATE CONSTRAINT restaurants_slug_lowercase;
