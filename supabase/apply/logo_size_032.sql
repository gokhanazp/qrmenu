-- 032: Menü başlığındaki logo boyutu (panelden seçilir: sm / md / lg / xl)
-- Supabase Dashboard > SQL Editor ile çalıştırın. Geri alma: supabase/rollback/032_rollback.sql

ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS logo_size text NOT NULL DEFAULT 'md';
ALTER TABLE restaurants DROP CONSTRAINT IF EXISTS restaurants_logo_size_check;
ALTER TABLE restaurants ADD CONSTRAINT restaurants_logo_size_check CHECK (logo_size IN ('sm', 'md', 'lg', 'xl'));
