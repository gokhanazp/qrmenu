# Supabase Database Setup

Bu klasör, QR Menü SaaS projesinin Supabase database migration dosyalarını içerir.

## Migration Dosyaları

1. **001_initial_schema.sql** - Tüm tabloları, indexleri ve temel fonksiyonları oluşturur
2. **002_rls_policies.sql** - Row Level Security (RLS) politikalarını ekler
3. **003_triggers_and_functions.sql** - Database trigger'ları ve yardımcı fonksiyonları ekler
4. **004_storage_setup.sql** - Storage bucket ve politikalarını oluşturur

## Kurulum Adımları

### 1. Supabase Projesine Giriş Yapın

1. [Supabase Dashboard](https://app.supabase.com)'a gidin
2. Projenizi seçin
3. Sol menüden **SQL Editor**'ü açın

### 2. Migration'ları Sırayla Çalıştırın

Her migration dosyasını sırayla çalıştırın:

#### Adım 1: Initial Schema
```sql
-- 001_initial_schema.sql dosyasının içeriğini kopyalayıp SQL Editor'e yapıştırın
-- "Run" butonuna tıklayın
```

#### Adım 2: RLS Policies
```sql
-- 002_rls_policies.sql dosyasının içeriğini kopyalayıp SQL Editor'e yapıştırın
-- "Run" butonuna tıklayın
```

#### Adım 3: Triggers and Functions
```sql
-- 003_triggers_and_functions.sql dosyasının içeriğini kopyalayıp SQL Editor'e yapıştırın
-- "Run" butonuna tıklayın
```

#### Adım 4: Storage Setup
```sql
-- 004_storage_setup.sql dosyasının içeriğini kopyalayıp SQL Editor'e yapıştırın
-- "Run" butonuna tıklayın
```

### 3. İlk Admin Kullanıcısını Ekleyin

Migration'lar tamamlandıktan sonra, ilk admin kullanıcısını manuel olarak ekleyin:

1. Supabase Dashboard'da **Authentication > Users** bölümüne gidin
2. Bir kullanıcı oluşturun (veya mevcut kullanıcınızın ID'sini kopyalayın)
3. SQL Editor'de şu komutu çalıştırın:

```sql
INSERT INTO admin_users (user_id)
VALUES ('your-user-uuid-here');
```

## Doğrulama

Migration'ların başarılı olduğunu doğrulamak için:

### Tabloları Kontrol Edin
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

Beklenen tablolar:
- admin_users
- categories
- payments
- products
- restaurants
- scan_events
- subscriptions

### RLS Politikalarını Kontrol Edin
```sql
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

### Fonksiyonları Kontrol Edin
```sql
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public'
AND routine_type = 'FUNCTION'
ORDER BY routine_name;
```

Beklenen fonksiyonlar:
- create_default_subscription
- generate_unique_slug
- get_restaurant_scan_stats
- get_scan_metrics
- is_admin
- update_updated_at_column
- validate_category_restaurant
- validate_product_restaurant

### Storage Bucket'ı Kontrol Edin
```sql
SELECT * FROM storage.buckets WHERE id = 'restaurant-images';
```

## Environment Variables

Migration'lar tamamlandıktan sonra, `.env.local` dosyanızı oluşturun:

```bash
# .env.example dosyasını kopyalayın
cp .env.example .env.local

# Supabase bilgilerinizi ekleyin
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
IP_HASH_SALT=your-random-salt-string
```

Supabase anahtarlarınızı bulmak için:
1. Supabase Dashboard > **Settings** > **API**
2. **Project URL** ve **anon/public** key'i kopyalayın
3. **service_role** key'i kopyalayın (güvenli tutun!)

## Test

Database kurulumunu test etmek için:

```sql
-- Test restoranı oluştur
INSERT INTO restaurants (owner_user_id, name, slug, is_active)
VALUES (
  auth.uid(), -- Mevcut kullanıcı
  'Test Restoranı',
  'test-restorani',
  true
);

-- Subscription otomatik oluşturuldu mu kontrol et
SELECT * FROM subscriptions WHERE restaurant_id IN (
  SELECT id FROM restaurants WHERE slug = 'test-restorani'
);

-- Test kategorisi ekle
INSERT INTO categories (restaurant_id, name, sort_order)
SELECT id, 'Ana Yemekler', 1
FROM restaurants WHERE slug = 'test-restorani';

-- Test ürünü ekle
INSERT INTO products (restaurant_id, category_id, name, price)
SELECT 
  r.id,
  c.id,
  'Test Ürünü',
  49.90
FROM restaurants r
JOIN categories c ON c.restaurant_id = r.id
WHERE r.slug = 'test-restorani'
LIMIT 1;
```

## Sorun Giderme

### Hata: "relation already exists"
Migration'ı daha önce çalıştırdıysanız, önce tabloları silin:
```sql
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS subscriptions CASCADE;
DROP TABLE IF EXISTS scan_events CASCADE;
DROP TABLE IF EXISTS admin_users CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS restaurants CASCADE;
```

### Hata: "function already exists"
Fonksiyonları yeniden oluşturmak için `CREATE OR REPLACE FUNCTION` kullanın (migration dosyalarında zaten var).

### RLS Hataları
RLS politikalarını kontrol edin:
```sql
-- Tüm RLS politikalarını listele
SELECT * FROM pg_policies WHERE schemaname = 'public';

-- Belirli bir tablo için RLS'i kontrol et
SELECT relname, relrowsecurity 
FROM pg_class 
WHERE relname IN ('restaurants', 'categories', 'products');
```

## Yardım

Daha fazla bilgi için:
- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- Proje planları: `/plans` klasörü