-- 032: Menü başlığındaki logo boyutu (panelden seçilir)
-- Değer: sm / md / lg / xl ya da özel ölçü "GENİŞLİKxYÜKSEKLİK" (örn. 240x90)
-- Supabase Dashboard > SQL Editor ile çalıştırın. Daha önce çalıştırıldıysa tekrar çalıştırmak güvenlidir.
-- Geri alma: supabase/rollback/032_rollback.sql

ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS logo_size text NOT NULL DEFAULT 'md';
ALTER TABLE restaurants DROP CONSTRAINT IF EXISTS restaurants_logo_size_check;
ALTER TABLE restaurants ADD CONSTRAINT restaurants_logo_size_check
  CHECK (logo_size ~ '^(sm|md|lg|xl|[0-9]{2,3}x[0-9]{2,3})$');
