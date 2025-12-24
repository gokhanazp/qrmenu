# Testing & Security Validation Guide

Bu dokümanda projenin test ve güvenlik doğrulama süreçleri açıklanmaktadır.

## 1. Security Checklist

### Authentication & Authorization ✅

#### Row Level Security (RLS)
- [x] Tüm tablolarda RLS aktif
- [x] Restaurants: Owner sadece kendi restoranını görebilir
- [x] Categories: Owner sadece kendi kategorilerini yönetebilir
- [x] Products: Owner sadece kendi ürünlerini yönetebilir
- [x] Admin: Admin tüm verileri görebilir
- [x] Public: Sadece aktif veriler görünür

#### Multi-tenant Isolation
- [x] Restaurant ID bazlı veri izolasyonu
- [x] Owner user ID kontrolü
- [x] Admin yetkisi kontrolü (admin_users tablosu)
- [x] Public sayfalar sadece aktif verileri gösterir

#### Authentication Flow
- [x] Email/Password ile giriş
- [x] Session yönetimi (Supabase Auth)
- [x] Middleware ile route koruması (/panel, /admin)
- [x] Logout fonksiyonu

### Data Validation ✅

#### Input Validation
- [x] Slug generation (Türkçe karakter dönüşümü)
- [x] Slug uniqueness kontrolü
- [x] Price validation (>= 0)
- [x] Required field kontrolü
- [x] Image upload validation (format, boyut)

#### Database Constraints
- [x] Foreign key constraints
- [x] Unique constraints (slug, subscription)
- [x] Check constraints (price, plan, status)
- [x] NOT NULL constraints

### File Upload Security ✅

#### Storage Buckets
- [x] Public buckets (restaurant-images, category-images, product-images)
- [x] RLS policies (sadece owner upload edebilir)
- [x] File type validation (jpg, png, webp)
- [x] File size limit (5MB)

### API Security ✅

#### Server Actions
- [x] 'use server' directive
- [x] Authentication kontrolü
- [x] Authorization kontrolü (owner/admin)
- [x] Error handling

#### Rate Limiting
- [ ] TODO: Scan event rate limiting (10 dk içinde 1 sayma)
- [ ] TODO: API rate limiting (Vercel)

## 2. Manual Testing Checklist

### Public Menu (Anonymous User)

#### Restaurant Page
- [ ] Slug ile restoran açılıyor
- [ ] Sadece aktif restoran görünüyor
- [ ] Logo ve hero banner görünüyor
- [ ] Kategoriler listeleniyor
- [ ] Featured products görünüyor
- [ ] Scan event kaydediliyor
- [ ] Mobil responsive çalışıyor
- [ ] SEO meta tags doğru

#### Category Page
- [ ] Kategori detay sayfası açılıyor
- [ ] Sadece aktif ürünler görünüyor
- [ ] Ürün görselleri yükleniyor
- [ ] Fiyatlar doğru formatta
- [ ] Geri butonu çalışıyor
- [ ] Mobil responsive çalışıyor

### Restaurant Owner Panel

#### Authentication
- [ ] Kayıt olma çalışıyor
- [ ] Slug otomatik oluşuyor
- [ ] Giriş yapma çalışıyor
- [ ] Çıkış yapma çalışıyor
- [ ] Session korunuyor

#### Dashboard
- [ ] Restoran bilgileri görünüyor
- [ ] QR kod görünüyor
- [ ] QR kod indiriliyor
- [ ] Public link çalışıyor
- [ ] İstatistikler görünüyor (opsiyonel)

#### Restaurant Settings
- [ ] Restoran adı güncellenebiliyor
- [ ] Slug güncellenebiliyor (uniqueness kontrolü)
- [ ] Logo yüklenebiliyor
- [ ] Hero banner yüklenebiliyor
- [ ] Slogan güncellenebiliyor
- [ ] Aktif/pasif toggle çalışıyor

#### Category Management
- [ ] Kategori listesi görünüyor
- [ ] Yeni kategori eklenebiliyor
- [ ] Kategori düzenlenebiliyor
- [ ] Kategori silinebiliyor
- [ ] Kategori görseli yüklenebiliyor
- [ ] Sıralama çalışıyor
- [ ] Aktif/pasif toggle çalışıyor

#### Product Management
- [ ] Ürün listesi görünüyor
- [ ] Yeni ürün eklenebiliyor
- [ ] Ürün düzenlenebiliyor
- [ ] Ürün silinebiliyor
- [ ] Ürün görseli yüklenebiliyor
- [ ] Kategori seçimi çalışıyor
- [ ] Featured toggle çalışıyor
- [ ] Sıralama çalışıyor
- [ ] Aktif/pasif toggle çalışıyor

### Admin Panel

#### Authentication
- [ ] Admin giriş yapabiliyor
- [ ] Non-admin erişemiyor
- [ ] Admin yetkisi kontrolü çalışıyor

#### Restaurant List
- [ ] Tüm restoranlar listeleniyor
- [ ] Filtreler çalışıyor (plan, status, active)
- [ ] Arama çalışıyor (name, slug)
- [ ] Scan istatistikleri görünüyor
- [ ] Sıralama çalışıyor

#### Restaurant Detail
- [ ] Restoran bilgileri görünüyor
- [ ] Public link çalışıyor
- [ ] Scan trend grafiği görünüyor
- [ ] Subscription güncellenebiliyor
- [ ] Plan değiştirilebiliyor
- [ ] Status değiştirilebiliyor
- [ ] Aktif/pasif toggle çalışıyor

## 3. Security Testing

### Multi-tenant Isolation Test

#### Test 1: Restaurant Owner Access
```sql
-- Owner A'nın Owner B'nin restoranını göremediğini test et
-- RLS policy test
SELECT * FROM restaurants WHERE owner_user_id != auth.uid();
-- Sonuç: Boş olmalı
```

#### Test 2: Category Access
```sql
-- Owner A'nın Owner B'nin kategorilerini göremediğini test et
SELECT c.* FROM categories c
JOIN restaurants r ON c.restaurant_id = r.id
WHERE r.owner_user_id != auth.uid();
-- Sonuç: Boş olmalı
```

#### Test 3: Product Access
```sql
-- Owner A'nın Owner B'nin ürünlerini göremediğini test et
SELECT p.* FROM products p
JOIN restaurants r ON p.restaurant_id = r.id
WHERE r.owner_user_id != auth.uid();
-- Sonuç: Boş olmalı
```

### Admin Access Test

#### Test 4: Admin Can See All
```sql
-- Admin tüm restoranları görebilmeli
SELECT COUNT(*) FROM restaurants;
-- Sonuç: Tüm restoranlar
```

#### Test 5: Non-Admin Cannot Access Admin Panel
- Admin olmayan kullanıcı /admin'e erişmeye çalışsın
- Sonuç: Redirect to /panel

### Public Access Test

#### Test 6: Only Active Data Visible
```sql
-- Public sadece aktif restoranları görebilmeli
SELECT * FROM restaurants WHERE is_active = false;
-- Sonuç: RLS policy nedeniyle boş
```

#### Test 7: Inactive Products Hidden
- Inactive ürün oluştur
- Public menüde görünmemeli
- Owner panelde görünmeli

## 4. Performance Testing

### Load Testing
- [ ] Public menü sayfası < 2.5s LCP
- [ ] Image loading optimize
- [ ] Database query performance
- [ ] Concurrent user handling

### Caching Testing
- [ ] ISR revalidation çalışıyor (5 dakika)
- [ ] CDN cache headers doğru
- [ ] Image cache çalışıyor

## 5. Browser Testing

### Desktop
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge

### Mobile
- [ ] iOS Safari
- [ ] Android Chrome
- [ ] Responsive design
- [ ] Touch interactions

## 6. Accessibility Testing

- [ ] Keyboard navigation
- [ ] Screen reader compatibility
- [ ] Color contrast
- [ ] Alt text for images
- [ ] ARIA labels

## 7. Error Handling Testing

### Error Pages
- [ ] 404 page çalışıyor
- [ ] Error boundary çalışıyor
- [ ] Loading states görünüyor
- [ ] Empty states görünüyor

### Form Validation
- [ ] Required field errors
- [ ] Invalid input errors
- [ ] Upload errors
- [ ] Network errors

## 8. Known Issues & Limitations

### Current Limitations
1. Email confirmation disabled (development)
2. No rate limiting on scan events
3. No automated tests (manual testing only)
4. No CI/CD pipeline

### Future Improvements
1. Add automated tests (Jest, Playwright)
2. Add rate limiting
3. Add monitoring (Sentry)
4. Add analytics (Vercel Analytics)
5. Add CI/CD (GitHub Actions)

## 9. Security Best Practices

### Do's ✅
- Always use RLS policies
- Validate all inputs
- Use server actions for mutations
- Check authentication in middleware
- Use environment variables for secrets
- Sanitize user inputs
- Use HTTPS only

### Don'ts ❌
- Never expose API keys
- Never trust client-side validation
- Never bypass RLS
- Never store sensitive data in localStorage
- Never use raw SQL without parameterization
- Never expose internal errors to users

## 10. Deployment Security

### Environment Variables
- [ ] NEXT_PUBLIC_SUPABASE_URL
- [ ] NEXT_PUBLIC_SUPABASE_ANON_KEY
- [ ] NEXT_PUBLIC_SITE_URL

### Vercel Settings
- [ ] Environment variables configured
- [ ] HTTPS enforced
- [ ] Security headers configured
- [ ] Rate limiting enabled (optional)

## 11. Monitoring & Logging

### Production Monitoring
- [ ] Error tracking (Sentry)
- [ ] Performance monitoring (Vercel Analytics)
- [ ] Database monitoring (Supabase Dashboard)
- [ ] Uptime monitoring

### Logging
- [ ] Server action errors logged
- [ ] Database errors logged
- [ ] Authentication errors logged
- [ ] File upload errors logged