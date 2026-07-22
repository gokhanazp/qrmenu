-- 019: Yorum yapan müşterinin iletişim bilgisi (contact) gizliliği
-- Sorun: public SELECT politikası yayınlanmış yorumların TÜM kolonlarını (contact dahil)
-- anon role'e açıyordu; kötü niyetli biri REST API'den contact bilgilerini toplayabilirdi.
-- Çözüm: kolon-bazlı yetki. anon sadece güvenli kolonları okuyabilir; contact yalnızca
-- restoran sahibi (authenticated + RLS) ve admin tarafından görülebilir.

REVOKE SELECT ON reviews FROM anon;
REVOKE SELECT ON reviews FROM PUBLIC;

-- Sahibi/admin: tüm kolonlar (RLS satır bazında kendi restoranıyla sınırlar)
GRANT SELECT ON reviews TO authenticated;

-- Anon (public menü): contact HARİÇ güvenli kolonlar
GRANT SELECT (id, restaurant_id, topic, rating, message, author_name, is_published, created_at)
ON reviews TO anon;
