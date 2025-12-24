# Supabase Database Schema - QR Menü SaaS

Bu doküman, projenin Supabase PostgreSQL veritabanı şemasını, RLS politikalarını ve yardımcı fonksiyonlarını içerir.

---

## 1. Database Tables

### 1.1 restaurants

```sql
CREATE TABLE restaurants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  logo_url text,
  hero_url text,
  slogan text,
  is_active boolean DEFAULT true NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Indexes
CREATE INDEX idx_restaurants_owner ON restaurants(owner_user_id);
CREATE INDEX idx_restaurants_slug ON restaurants(slug);
CREATE INDEX idx_restaurants_active ON restaurants(is_active);

-- Enable RLS
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;

-- Trigger for updated_at
CREATE TRIGGER set_restaurants_updated_at
  BEFORE UPDATE ON restaurants
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### 1.2 categories

```sql
CREATE TABLE categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  name text NOT NULL,
  sort_order integer DEFAULT 0 NOT NULL,
  is_active boolean DEFAULT true NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Indexes
CREATE INDEX idx_categories_restaurant ON categories(restaurant_id);
CREATE INDEX idx_categories_sort ON categories(restaurant_id, sort_order);
CREATE INDEX idx_categories_active ON categories(restaurant_id, is_active);

-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Trigger for updated_at
CREATE TRIGGER set_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### 1.3 products

```sql
CREATE TABLE products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  name text NOT NULL,
  description text,
  price numeric(10,2) NOT NULL CHECK (price >= 0),
  image_url text,
  sort_order integer DEFAULT 0 NOT NULL,
  is_active boolean DEFAULT true NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Indexes
CREATE INDEX idx_products_restaurant ON products(restaurant_id);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_sort ON products(restaurant_id, sort_order);
CREATE INDEX idx_products_active ON products(restaurant_id, is_active);

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Trigger for updated_at
CREATE TRIGGER set_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### 1.4 admin_users

```sql
CREATE TABLE admin_users (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Index
CREATE INDEX idx_admin_users_user ON admin_users(user_id);

-- Enable RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
```

### 1.5 scan_events

```sql
CREATE TABLE scan_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  scanned_at timestamptz DEFAULT now() NOT NULL,
  user_agent text,
  referrer text,
  ip_hash text,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Indexes
CREATE INDEX idx_scan_events_restaurant ON scan_events(restaurant_id);
CREATE INDEX idx_scan_events_date ON scan_events(restaurant_id, scanned_at DESC);
CREATE INDEX idx_scan_events_scanned_at ON scan_events(scanned_at DESC);

-- Enable RLS
ALTER TABLE scan_events ENABLE ROW LEVEL SECURITY;
```

### 1.6 subscriptions

```sql
CREATE TABLE subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid UNIQUE NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  plan text NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'past_due', 'canceled', 'trialing')),
  current_period_start timestamptz,
  current_period_end timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Indexes
CREATE INDEX idx_subscriptions_restaurant ON subscriptions(restaurant_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_plan ON subscriptions(plan);

-- Enable RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Trigger for updated_at
CREATE TRIGGER set_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### 1.7 payments

```sql
CREATE TABLE payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  amount numeric(10,2) NOT NULL CHECK (amount >= 0),
  currency text DEFAULT 'TRY' NOT NULL,
  status text NOT NULL CHECK (status IN ('paid', 'failed', 'refunded', 'pending')),
  provider text DEFAULT 'manual' NOT NULL,
  provider_payment_id text,
  paid_at timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Indexes
CREATE INDEX idx_payments_restaurant ON payments(restaurant_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_date ON payments(created_at DESC);
CREATE INDEX idx_payments_paid_at ON payments(paid_at DESC);

-- Enable RLS
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
```

---

## 2. Helper Functions

### 2.1 Updated At Trigger Function

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### 2.2 Slug Generation Function

```sql
CREATE OR REPLACE FUNCTION generate_unique_slug(base_name text)
RETURNS text AS $$
DECLARE
  slug_candidate text;
  counter integer := 0;
BEGIN
  -- Türkçe karakter dönüşümü ve temizleme
  slug_candidate := lower(base_name);
  
  -- Türkçe karakterleri değiştir
  slug_candidate := translate(slug_candidate, 'şğıöüçŞĞİÖÜÇ', 'sgiouc');
  
  -- Özel karakterleri temizle (sadece harf, rakam ve boşluk kalsın)
  slug_candidate := regexp_replace(slug_candidate, '[^a-z0-9\s-]', '', 'g');
  
  -- Birden fazla boşluğu tek tire ile değiştir
  slug_candidate := regexp_replace(slug_candidate, '\s+', '-', 'g');
  
  -- Birden fazla tireyi tek tire ile değiştir
  slug_candidate := regexp_replace(slug_candidate, '-+', '-', 'g');
  
  -- Baş ve sondaki tireleri temizle
  slug_candidate := trim(both '-' from slug_candidate);
  
  -- Boş slug kontrolü
  IF slug_candidate = '' THEN
    slug_candidate := 'restoran';
  END IF;
  
  -- Benzersizlik kontrolü ve sayaç ekleme
  WHILE EXISTS (SELECT 1 FROM restaurants WHERE slug = slug_candidate) LOOP
    counter := counter + 1;
    slug_candidate := regexp_replace(slug_candidate, '-\d+$', '') || '-' || counter;
  END LOOP;
  
  RETURN slug_candidate;
END;
$$ LANGUAGE plpgsql;
```

### 2.3 Admin Check Function

```sql
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users 
    WHERE user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 2.4 Scan Metrics Function

```sql
CREATE OR REPLACE FUNCTION get_scan_metrics(
  rest_id uuid, 
  days integer DEFAULT 30
)
RETURNS TABLE (
  date date,
  scan_count bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    DATE(scanned_at AT TIME ZONE 'Europe/Istanbul') as date,
    COUNT(*) as scan_count
  FROM scan_events
  WHERE restaurant_id = rest_id
    AND scanned_at >= NOW() - (days || ' days')::interval
  GROUP BY DATE(scanned_at AT TIME ZONE 'Europe/Istanbul')
  ORDER BY date DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 2.5 Restaurant Scan Stats Function

```sql
CREATE OR REPLACE FUNCTION get_restaurant_scan_stats(rest_id uuid)
RETURNS TABLE (
  scans_today bigint,
  scans_7d bigint,
  scans_30d bigint,
  scans_total bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) FILTER (
      WHERE DATE(scanned_at AT TIME ZONE 'Europe/Istanbul') = CURRENT_DATE
    ) as scans_today,
    COUNT(*) FILTER (
      WHERE scanned_at >= NOW() - INTERVAL '7 days'
    ) as scans_7d,
    COUNT(*) FILTER (
      WHERE scanned_at >= NOW() - INTERVAL '30 days'
    ) as scans_30d,
    COUNT(*) as scans_total
  FROM scan_events
  WHERE restaurant_id = rest_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 3. Row Level Security (RLS) Policies

### 3.1 restaurants Policies

```sql
-- Public: Sadece aktif restoranları görebilir
CREATE POLICY "public_view_active_restaurants"
ON restaurants FOR SELECT
TO public
USING (is_active = true);

-- Owner: Kendi restoranını görebilir
CREATE POLICY "owner_view_own_restaurant"
ON restaurants FOR SELECT
TO authenticated
USING (owner_user_id = auth.uid());

-- Owner: Kendi restoranını güncelleyebilir
CREATE POLICY "owner_update_own_restaurant"
ON restaurants FOR UPDATE
TO authenticated
USING (owner_user_id = auth.uid())
WITH CHECK (owner_user_id = auth.uid());

-- Owner: Yeni restoran oluşturabilir
CREATE POLICY "authenticated_create_restaurant"
ON restaurants FOR INSERT
TO authenticated
WITH CHECK (owner_user_id = auth.uid());

-- Admin: Tüm restoranları görebilir
CREATE POLICY "admin_view_all_restaurants"
ON restaurants FOR SELECT
TO authenticated
USING (is_admin());

-- Admin: Tüm restoranları güncelleyebilir
CREATE POLICY "admin_update_all_restaurants"
ON restaurants FOR UPDATE
TO authenticated
USING (is_admin());
```

### 3.2 categories Policies

```sql
-- Public: Aktif restoranın aktif kategorilerini görebilir
CREATE POLICY "public_view_active_categories"
ON categories FOR SELECT
TO public
USING (
  is_active = true 
  AND EXISTS (
    SELECT 1 FROM restaurants 
    WHERE id = categories.restaurant_id 
    AND is_active = true
  )
);

-- Owner: Kendi restoranının kategorilerini görebilir
CREATE POLICY "owner_view_own_categories"
ON categories FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM restaurants 
    WHERE id = categories.restaurant_id 
    AND owner_user_id = auth.uid()
  )
);

-- Owner: Kendi restoranına kategori ekleyebilir
CREATE POLICY "owner_insert_own_categories"
ON categories FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM restaurants 
    WHERE id = categories.restaurant_id 
    AND owner_user_id = auth.uid()
  )
);

-- Owner: Kendi restoranının kategorilerini güncelleyebilir
CREATE POLICY "owner_update_own_categories"
ON categories FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM restaurants 
    WHERE id = categories.restaurant_id 
    AND owner_user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM restaurants 
    WHERE id = categories.restaurant_id 
    AND owner_user_id = auth.uid()
  )
);

-- Owner: Kendi restoranının kategorilerini silebilir
CREATE POLICY "owner_delete_own_categories"
ON categories FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM restaurants 
    WHERE id = categories.restaurant_id 
    AND owner_user_id = auth.uid()
  )
);

-- Admin: Tüm kategorileri görebilir
CREATE POLICY "admin_view_all_categories"
ON categories FOR SELECT
TO authenticated
USING (is_admin());
```

### 3.3 products Policies

```sql
-- Public: Aktif restoranın aktif ürünlerini görebilir
CREATE POLICY "public_view_active_products"
ON products FOR SELECT
TO public
USING (
  is_active = true 
  AND EXISTS (
    SELECT 1 FROM restaurants 
    WHERE id = products.restaurant_id 
    AND is_active = true
  )
);

-- Owner: Kendi restoranının ürünlerini görebilir
CREATE POLICY "owner_view_own_products"
ON products FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM restaurants 
    WHERE id = products.restaurant_id 
    AND owner_user_id = auth.uid()
  )
);

-- Owner: Kendi restoranına ürün ekleyebilir
CREATE POLICY "owner_insert_own_products"
ON products FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM restaurants 
    WHERE id = products.restaurant_id 
    AND owner_user_id = auth.uid()
  )
);

-- Owner: Kendi restoranının ürünlerini güncelleyebilir
CREATE POLICY "owner_update_own_products"
ON products FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM restaurants 
    WHERE id = products.restaurant_id 
    AND owner_user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM restaurants 
    WHERE id = products.restaurant_id 
    AND owner_user_id = auth.uid()
  )
);

-- Owner: Kendi restoranının ürünlerini silebilir
CREATE POLICY "owner_delete_own_products"
ON products FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM restaurants 
    WHERE id = products.restaurant_id 
    AND owner_user_id = auth.uid()
  )
);

-- Admin: Tüm ürünleri görebilir
CREATE POLICY "admin_view_all_products"
ON products FOR SELECT
TO authenticated
USING (is_admin());
```

### 3.4 scan_events Policies

```sql
-- NOT: Public insert izni YOK - scan events sadece server-side (service role) ile yazılır

-- Owner: Kendi restoranının scan eventlerini görebilir
CREATE POLICY "owner_view_own_scan_events"
ON scan_events FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM restaurants 
    WHERE id = scan_events.restaurant_id 
    AND owner_user_id = auth.uid()
  )
);

-- Admin: Tüm scan eventleri görebilir
CREATE POLICY "admin_view_all_scan_events"
ON scan_events FOR SELECT
TO authenticated
USING (is_admin());
```

### 3.5 subscriptions Policies

```sql
-- Owner: Kendi aboneliğini görebilir
CREATE POLICY "owner_view_own_subscription"
ON subscriptions FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM restaurants 
    WHERE id = subscriptions.restaurant_id 
    AND owner_user_id = auth.uid()
  )
);

-- Admin: Tüm abonelikleri görebilir
CREATE POLICY "admin_view_all_subscriptions"
ON subscriptions FOR SELECT
TO authenticated
USING (is_admin());

-- Admin: Tüm abonelikleri güncelleyebilir
CREATE POLICY "admin_update_all_subscriptions"
ON subscriptions FOR UPDATE
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- Admin: Yeni abonelik oluşturabilir
CREATE POLICY "admin_insert_subscriptions"
ON subscriptions FOR INSERT
TO authenticated
WITH CHECK (is_admin());
```

### 3.6 payments Policies

```sql
-- Owner: Kendi ödemelerini görebilir
CREATE POLICY "owner_view_own_payments"
ON payments FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM restaurants 
    WHERE id = payments.restaurant_id 
    AND owner_user_id = auth.uid()
  )
);

-- Admin: Tüm ödemeleri görebilir
CREATE POLICY "admin_view_all_payments"
ON payments FOR SELECT
TO authenticated
USING (is_admin());

-- Admin: Ödeme kaydı oluşturabilir
CREATE POLICY "admin_insert_payments"
ON payments FOR INSERT
TO authenticated
WITH CHECK (is_admin());

-- Admin: Ödemeleri güncelleyebilir
CREATE POLICY "admin_update_payments"
ON payments FOR UPDATE
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());
```

### 3.7 admin_users Policies

```sql
-- Sadece adminler admin listesini görebilir
CREATE POLICY "admin_view_admin_users"
ON admin_users FOR SELECT
TO authenticated
USING (is_admin());

-- Sadece adminler yeni admin ekleyebilir
CREATE POLICY "admin_insert_admin_users"
ON admin_users FOR INSERT
TO authenticated
WITH CHECK (is_admin());

-- Sadece adminler admin silebilir
CREATE POLICY "admin_delete_admin_users"
ON admin_users FOR DELETE
TO authenticated
USING (is_admin());
```

---

## 4. Database Triggers

### 4.1 Auto-create Subscription on Restaurant Insert

```sql
CREATE OR REPLACE FUNCTION create_default_subscription()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO subscriptions (restaurant_id, plan, status)
  VALUES (NEW.id, 'free', 'active');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_create_default_subscription
  AFTER INSERT ON restaurants
  FOR EACH ROW
  EXECUTE FUNCTION create_default_subscription();
```

### 4.2 Validate Category Restaurant Match

```sql
CREATE OR REPLACE FUNCTION validate_category_restaurant()
RETURNS TRIGGER AS $$
BEGIN
  -- Kategori silinirken veya güncellenirken restaurant_id değişmemeli
  IF TG_OP = 'UPDATE' AND OLD.restaurant_id != NEW.restaurant_id THEN
    RAISE EXCEPTION 'Cannot change restaurant_id of existing category';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_validate_category_restaurant
  BEFORE UPDATE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION validate_category_restaurant();
```

### 4.3 Validate Product Restaurant Match

```sql
CREATE OR REPLACE FUNCTION validate_product_restaurant()
RETURNS TRIGGER AS $$
BEGIN
  -- Ürün güncellenirken restaurant_id değişmemeli
  IF TG_OP = 'UPDATE' AND OLD.restaurant_id != NEW.restaurant_id THEN
    RAISE EXCEPTION 'Cannot change restaurant_id of existing product';
  END IF;
  
  -- Eğer category_id varsa, aynı restorana ait olmalı
  IF NEW.category_id IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM categories 
      WHERE id = NEW.category_id 
      AND restaurant_id = NEW.restaurant_id
    ) THEN
      RAISE EXCEPTION 'Category must belong to the same restaurant';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_validate_product_restaurant
  BEFORE INSERT OR UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION validate_product_restaurant();
```

---

## 5. Storage Buckets

### 5.1 Create restaurant-images Bucket

```sql
-- Supabase Dashboard'dan veya SQL ile:
INSERT INTO storage.buckets (id, name, public)
VALUES ('restaurant-images', 'restaurant-images', true);
```

### 5.2 Storage Policies

```sql
-- Public: Tüm dosyaları okuyabilir
CREATE POLICY "public_view_restaurant_images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'restaurant-images');

-- Owner: Kendi restoranının klasörüne upload yapabilir
CREATE POLICY "owner_upload_own_images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'restaurant-images' 
  AND (storage.foldername(name))[1] IN (
    SELECT id::text FROM restaurants WHERE owner_user_id = auth.uid()
  )
);

-- Owner: Kendi restoranının dosyalarını güncelleyebilir
CREATE POLICY "owner_update_own_images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'restaurant-images' 
  AND (storage.foldername(name))[1] IN (
    SELECT id::text FROM restaurants WHERE owner_user_id = auth.uid()
  )
);

-- Owner: Kendi restoranının dosyalarını silebilir
CREATE POLICY "owner_delete_own_images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'restaurant-images' 
  AND (storage.foldername(name))[1] IN (
    SELECT id::text FROM restaurants WHERE owner_user_id = auth.uid()
  )
);

-- Admin: Tüm dosyaları yönetebilir
CREATE POLICY "admin_manage_all_images"
ON storage.objects FOR ALL
TO authenticated
USING (
  bucket_id = 'restaurant-images' 
  AND is_admin()
)
WITH CHECK (
  bucket_id = 'restaurant-images' 
  AND is_admin()
);
```

---

## 6. Initial Data (Optional)

### 6.1 Create First Admin User

```sql
-- İlk admin kullanıcısını manuel olarak ekleyin
-- user_id'yi Supabase Auth'dan alın
INSERT INTO admin_users (user_id)
VALUES ('your-user-uuid-here');
```

### 6.2 Sample Restaurant Data (Development Only)

```sql
-- Test restoranı
INSERT INTO restaurants (id, owner_user_id, name, slug, slogan, is_active)
VALUES (
  'sample-restaurant-uuid',
  'sample-owner-uuid',
  'Test Restoranı',
  'test-restorani',
  'Lezzetin adresi',
  true
);

-- Test kategorileri
INSERT INTO categories (restaurant_id, name, sort_order, is_active)
VALUES 
  ('sample-restaurant-uuid', 'Ana Yemekler', 1, true),
  ('sample-restaurant-uuid', 'İçecekler', 2, true),
  ('sample-restaurant-uuid', 'Tatlılar', 3, true);

-- Test ürünleri
INSERT INTO products (restaurant_id, category_id, name, description, price, sort_order, is_active)
SELECT 
  'sample-restaurant-uuid',
  c.id,
  'Örnek Ürün',
  'Lezzetli bir ürün',
  49.90,
  1,
  true
FROM categories c
WHERE c.restaurant_id = 'sample-restaurant-uuid'
LIMIT 1;
```

---

## 7. Database Maintenance

### 7.1 Vacuum and Analyze

```sql
-- Periyodik olarak çalıştırılmalı (Supabase otomatik yapar)
VACUUM ANALYZE restaurants;
VACUUM ANALYZE categories;
VACUUM ANALYZE products;
VACUUM ANALYZE scan_events;
```

### 7.2 Index Monitoring

```sql
-- Kullanılmayan indexleri bul
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes
WHERE idx_scan = 0
ORDER BY schemaname, tablename;
```

### 7.3 Table Size Monitoring

```sql
-- Tablo boyutlarını kontrol et
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

---

## 8. Migration Strategy

### 8.1 Schema Versioning

Tüm schema değişiklikleri migration dosyaları ile yönetilmeli:

```
migrations/
├── 001_initial_schema.sql
├── 002_add_updated_at_triggers.sql
├── 003_add_rls_policies.sql
├── 004_add_storage_policies.sql
└── 005_add_helper_functions.sql
```

### 8.2 Rollback Strategy

Her migration için rollback scripti hazırlanmalı:

```sql
-- Migration: 001_initial_schema.sql
-- Rollback: 001_initial_schema_rollback.sql

DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS subscriptions CASCADE;
DROP TABLE IF EXISTS scan_events CASCADE;
DROP TABLE IF EXISTS admin_users CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS restaurants CASCADE;
```

---

## 9. Security Checklist

✅ RLS tüm tablolarda aktif
✅ Admin check function SECURITY DEFINER
✅ Scan events sadece service role ile yazılabilir
✅ Storage policies owner bazlı
✅ Cascade delete ilişkileri doğru
✅ Check constraints (price >= 0, enum values)
✅ Unique constraints (slug, subscription.restaurant_id)
✅ Foreign key constraints tüm ilişkilerde
✅ Indexes performans için optimize
✅ Trigger validations (restaurant_id değişmez)

---

## 10. Performance Optimization

### 10.1 Query Optimization Tips

```sql
-- ✅ İyi: Index kullanır
SELECT * FROM products 
WHERE restaurant_id = 'uuid' 
AND is_active = true
ORDER BY sort_order;

-- ❌ Kötü: Full table scan
SELECT * FROM products 
WHERE LOWER(name) LIKE '%search%';

-- ✅ İyi: Aggregate ile
SELECT 
  restaurant_id,
  COUNT(*) as total_scans
FROM scan_events
WHERE scanned_at >= NOW() - INTERVAL '7 days'
GROUP BY restaurant_id;
```

### 10.2 Connection Pooling

Supabase otomatik connection pooling sağlar, ancak:
- Max connections: 15 (free tier)
- Connection timeout: 30s
- Idle timeout: 10min

---

Bu schema dokümanı, projenin tüm database gereksinimlerini kapsar. Supabase SQL Editor'de sırayla çalıştırılarak kurulum tamamlanabilir.