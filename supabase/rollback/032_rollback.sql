-- 032 geri alma
ALTER TABLE restaurants DROP CONSTRAINT IF EXISTS restaurants_logo_size_check;
ALTER TABLE restaurants DROP COLUMN IF EXISTS logo_size;
