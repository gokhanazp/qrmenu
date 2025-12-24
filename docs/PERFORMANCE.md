# Performance Optimization Guide

Bu dokümanda projenin performans optimizasyonları açıklanmaktadır.

## 1. Next.js Configuration

### Image Optimization
- **Format**: WebP ve AVIF formatları otomatik olarak kullanılır
- **Cache TTL**: 30 gün (2,592,000 saniye)
- **Device Sizes**: Responsive görseller için optimize edilmiş boyutlar
- **Compression**: Otomatik sıkıştırma aktif

### Build Optimization
- **React Strict Mode**: Aktif
- **Compression**: Gzip/Brotli sıkıştırma aktif
- **Package Imports**: Supabase paketleri optimize edildi

## 2. Caching Strategy

### Public Menu Pages
- **Revalidation**: 5 dakika (300 saniye)
- **Strategy**: ISR (Incremental Static Regeneration)
- **Cache Headers**: 
  - `s-maxage=300` (CDN cache 5 dakika)
  - `stale-while-revalidate=600` (10 dakika stale content)

### Static Assets
- **Next.js Images**: 1 yıl cache (immutable)
- **Static Files**: 1 yıl cache (immutable)
- **Fonts**: 1 yıl cache (immutable)

## 3. Image Loading Strategy

### Priority Images
- Logo (header)
- Hero banner
- Category header images

Bu görseller `priority` prop'u ile hemen yüklenir.

### Lazy Loading
- Kategori kartlarındaki görseller
- Ürün görselleri
- Featured product görselleri

Bu görseller viewport'a yaklaştıkça yüklenir.

### Sizes Attribute
Responsive görseller için `sizes` attribute kullanılır:
```tsx
sizes="(max-width: 768px) 100vw, 448px"
```

## 4. Database Optimization

### Indexes
Tüm sık kullanılan sorgular için index'ler oluşturuldu:

#### Restaurants
- `owner_user_id` (owner lookup)
- `slug` (public menu lookup)
- `is_active` (active restaurants filter)

#### Categories
- `restaurant_id` (restaurant categories)
- `restaurant_id, sort_order` (sorted categories)
- `restaurant_id, is_active` (active categories)

#### Products
- `restaurant_id` (restaurant products)
- `category_id` (category products)
- `restaurant_id, sort_order` (sorted products)
- `restaurant_id, is_active` (active products)
- **Featured Products**: Composite index with WHERE clause
- **Category Products**: Composite index for active products

#### Scan Events
- `restaurant_id` (restaurant scans)
- `restaurant_id, scanned_at DESC` (time-series queries)
- `scanned_at DESC` (global analytics)
- `restaurant_id, DATE(scanned_at)` (daily aggregations)

### Query Optimization
- RLS policies optimize edildi
- Composite index'ler kullanıldı
- WHERE clause'lu partial index'ler eklendi

## 5. Vercel Deployment

### Edge Network
- Global CDN ile düşük latency
- Edge caching aktif
- Automatic HTTPS

### Headers Configuration
`vercel.json` ile cache headers yapılandırıldı:
- Public menu: 5 dakika CDN cache
- Images: 1 yıl cache
- Static assets: 1 yıl cache

## 6. Performance Metrics

### Target Metrics
- **LCP** (Largest Contentful Paint): < 2.5s
- **FID** (First Input Delay): < 100ms
- **CLS** (Cumulative Layout Shift): < 0.1
- **TTFB** (Time to First Byte): < 600ms

### Monitoring
Vercel Analytics ile otomatik monitoring:
- Core Web Vitals
- Real User Monitoring (RUM)
- Performance insights

## 7. Best Practices

### Do's ✅
- Next.js Image component kullan
- Revalidation stratejisi belirle
- Database index'leri optimize et
- Cache headers doğru ayarla
- Priority images belirle

### Don'ts ❌
- `<img>` tag kullanma (Next.js Image kullan)
- Gereksiz client-side rendering
- Index'siz sık kullanılan sorgular
- Cache headers olmadan static content
- Tüm görsellere priority verme

## 8. Future Optimizations

### Phase 2
- [ ] Service Worker ile offline support
- [ ] Progressive Web App (PWA)
- [ ] Image CDN (Cloudinary/Imgix)
- [ ] Database connection pooling
- [ ] Redis cache layer

### Phase 3
- [ ] Edge Functions for dynamic content
- [ ] GraphQL for complex queries
- [ ] Real-time updates with WebSocket
- [ ] Advanced analytics with BigQuery