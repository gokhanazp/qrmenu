-- WhatsApp sipariş özelliği: admin panelden restoran başına açılıp kapanır.
-- Açıkken menüde "Sepete Ekle" butonları ve sepet çubuğu görünür; müşteri
-- sepeti onayladığında sipariş wa.me linkiyle restaurants.whatsapp numarasına
-- hazır mesaj olarak gider (WhatsApp Business API gerekmez).
ALTER TABLE restaurants
ADD COLUMN IF NOT EXISTS ordering_enabled BOOLEAN DEFAULT false NOT NULL;

COMMENT ON COLUMN restaurants.ordering_enabled IS 'Sepet + WhatsApp ile sipariş özelliği aktif mi (admin panelden yönetilir)';
