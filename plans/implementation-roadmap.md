# QR Menü SaaS - Implementation Roadmap

Bu doküman, projenin adım adım implementasyon planını içerir. Her aşama bağımsız olarak tamamlanabilir ve test edilebilir.

---

## Faz 1: Temel Altyapı (Foundation)

### 1.1 Project Setup
**Hedef:** Next.js 14 projesi kurulumu ve temel konfigürasyon

**Adımlar:**
1. Next.js 14 App Router projesi oluştur
2. TypeScript konfigürasyonu
3. Tailwind CSS kurulumu
4. shadcn/ui init ve temel componentler
5. ESLint ve Prettier konfigürasyonu
6. Git repository ve .gitignore

**Bağımlılıklar:**
- next@14+
- react@18+
- typescript
- tailwindcss
- @radix-ui/react-* (shadcn/ui dependencies)

**Çıktılar:**
- Çalışan Next.js development server
- Temel klasör yapısı
- Tailwind ve shadcn/ui hazır

**Test:**
- `npm run dev` başarılı çalışıyor
- Tailwind stilleri uygulanıyor
- TypeScript hata vermiyor

---

### 1.2 Supabase Integration
**Hedef:** Supabase client kurulumu ve environment setup

**Adımlar:**
1. Supabase client library kurulumu
2. Environment variables tanımlama
3. Supabase client utilities oluşturma
4. Server/Client component için ayrı clientlar

**Bağımlılıklar:**
- @supabase/supabase-js
- @supabase/ssr (Next.js için)

**Dosyalar:**
```
lib/
├── supabase/
│   ├── client.ts          # Client component için
│   ├── server.ts          # Server component için
│   ├── middleware.ts      # Auth middleware
│   └── types.ts           # Database types
```

**Environment Variables:**
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SITE_URL=
```

**Test:**
- Supabase connection başarılı
- Auth session okunabiliyor
- Database query çalışıyor

---

### 1.3 Database Schema Setup
**Hedef:** Supabase'de tüm tabloları, RLS politikalarını ve fonksiyonları oluştur

**Adımlar:**
1. Helper functions oluştur (update_updated_at, generate_unique_slug, is_admin)
2. Tabloları sırayla oluştur (restaurants → categories → products → admin_users → scan_events → subscriptions → payments)
3. Indexes ekle
4. RLS enable et
5. RLS policies oluştur
6. Triggers ekle
7. Storage bucket oluştur
8. Storage policies ekle

**Kaynak:**
- `plans/database-schema.md` dosyasındaki SQL scriptleri

**Test:**
- Tüm tablolar oluşturuldu
- RLS policies aktif
- Test query'leri çalışıyor
- Storage bucket erişilebilir

---

## Faz 2: Authentication System

### 2.1 Auth UI Components
**Hedef:** Login ve Register sayfaları

**Adımlar:**
1. Auth layout oluştur
2. Login form component
3. Register form component
4. Form validation (Zod)
5. Error handling
6. Loading states

**Sayfalar:**
```
app/
├── auth/
│   ├── layout.tsx
│   ├── login/
│   │   └── page.tsx
│   └── register/
│       └── page.tsx
```

**Components:**
```
components/
├── auth/
│   ├── login-form.tsx
│   ├── register-form.tsx
│   └── auth-error.tsx
```

**Test:**
- Login formu çalışıyor
- Register formu çalışıyor
- Validation mesajları gösteriliyor
- Error handling doğru

---

### 2.2 Auth Server Actions
**Hedef:** Authentication işlemleri için server actions

**Adımlar:**
1. Login action
2. Register action (+ restaurant creation + slug generation)
3. Logout action
4. Session management
5. Password reset (opsiyonel)

**Dosyalar:**
```
app/
├── actions/
│   └── auth.ts
```

**İş Kuralları:**
- Register sırasında otomatik restaurant oluştur
- Slug generate_unique_slug() ile oluştur
- Default subscription oluştur (trigger ile)
- Email validation
- Password strength check

**Test:**
- Yeni kullanıcı kaydı başarılı
- Restaurant otomatik oluşuyor
- Slug benzersiz
- Login başarılı
- Session persist ediyor

---

### 2.3 Auth Middleware
**Hedef:** Route protection ve role-based access

**Adımlar:**
1. Next.js middleware oluştur
2. Protected routes tanımla
3. Admin route check
4. Redirect logic

**Dosya:**
```
middleware.ts
```

**Route Protection:**
- `/panel/*` → Authenticated required
- `/admin/*` → Admin required
- `/auth/*` → Redirect if authenticated

**Test:**
- Unauthenticated user `/panel` erişemiyor
- Non-admin user `/admin` erişemiyor
- Authenticated user `/auth` redirect oluyor

---

## Faz 3: Public Menu Page

### 3.1 Public Menu Layout
**Hedef:** Mobil-öncelikli menü sayfası layout

**Adımlar:**
1. Dynamic route setup `/restorant/[slug]`
2. Restaurant data fetch (Server Component)
3. Hero section (logo + banner + slogan)
4. Category tabs/chips
5. Product grid
6. Empty state
7. 404 handling

**Sayfalar:**
```
app/
├── restorant/
│   └── [slug]/
│       ├── page.tsx
│       ├── loading.tsx
│       └── not-found.tsx
```

**Components:**
```
components/
├── menu/
│   ├── menu-hero.tsx
│   ├── category-tabs.tsx
│   ├── product-grid.tsx
│   ├── product-card.tsx
│   └── menu-empty-state.tsx
```

**Test:**
- Slug ile restaurant bulunuyor
- Sadece aktif data gösteriliyor
- Mobil responsive
- Empty state gösteriliyor
- 404 doğru çalışıyor

---

### 3.2 Scan Event Tracking
**Hedef:** Menü görüntüleme sayısını kaydet

**Adımlar:**
1. Scan API route oluştur
2. IP hash fonksiyonu
3. Rate limiting (basit)
4. Client-side tracking call
5. Server-side insert (service role)

**Dosyalar:**
```
app/
├── api/
│   └── scan/
│       └── route.ts
lib/
├── utils/
│   └── ip-hash.ts
```

**İş Kuralları:**
- Her sayfa yüklemesinde 1 scan event
- IP hash ile privacy
- User agent ve referrer kaydet
- Rate limit: 1 scan/10min per IP+restaurant

**Test:**
- Scan event kaydediliyor
- IP hash çalışıyor
- Rate limiting aktif
- RLS policy izin veriyor (service role)

---

### 3.3 SEO Optimization
**Hedef:** Public menü için SEO meta tags

**Adımlar:**
1. Dynamic metadata generation
2. OpenGraph tags
3. Twitter cards
4. Structured data (JSON-LD)
5. Sitemap generation

**Dosyalar:**
```
app/
├── restorant/
│   └── [slug]/
│       └── page.tsx (generateMetadata)
├── sitemap.ts
└── robots.ts
```

**Test:**
- Meta tags doğru
- OG image gösteriliyor
- Structured data valid
- Sitemap erişilebilir

---

## Faz 4: Restaurant Panel

### 4.1 Panel Layout & Dashboard
**Hedef:** Restoran sahibi için dashboard

**Adımlar:**
1. Panel layout (sidebar/header)
2. Dashboard page
3. QR code generation (client-side)
4. QR download functionality
5. Public link display
6. Quick stats (scan metrics)

**Sayfalar:**
```
app/
├── panel/
│   ├── layout.tsx
│   └── page.tsx (dashboard)
```

**Components:**
```
components/
├── panel/
│   ├── sidebar.tsx
│   ├── header.tsx
│   ├── qr-code-display.tsx
│   ├── stats-card.tsx
│   └── quick-actions.tsx
```

**Bağımlılıklar:**
- qrcode.react (QR generation)
- recharts (charts, opsiyonel)

**Test:**
- Dashboard yükleniyor
- QR kod görüntüleniyor
- QR download çalışıyor
- Stats doğru gösteriliyor

---

### 4.2 Restaurant Settings
**Hedef:** Restoran bilgilerini düzenleme

**Adımlar:**
1. Settings form
2. Logo upload
3. Hero banner upload
4. Slug display (read-only)
5. Active toggle
6. Form validation
7. Image preview

**Sayfalar:**
```
app/
├── panel/
│   └── ayarlar/
│       └── page.tsx
```

**Components:**
```
components/
├── panel/
│   ├── restaurant-settings-form.tsx
│   ├── image-upload.tsx
│   └── image-preview.tsx
```

**Server Actions:**
```
app/
├── actions/
│   └── restaurant.ts
```

**Test:**
- Form güncelleme çalışıyor
- Logo upload başarılı
- Hero upload başarılı
- Preview gösteriliyor
- Validation çalışıyor

---

### 4.3 Category Management
**Hedef:** Kategori CRUD işlemleri

**Adımlar:**
1. Category list page
2. Create category modal/form
3. Update category inline/modal
4. Delete category (confirmation)
5. Drag-drop reordering
6. Active toggle

**Sayfalar:**
```
app/
├── panel/
│   └── kategoriler/
│       └── page.tsx
```

**Components:**
```
components/
├── panel/
│   ├── category-list.tsx
│   ├── category-form.tsx
│   ├── category-item.tsx
│   └── delete-confirmation.tsx
```

**Server Actions:**
```
app/
├── actions/
│   └── category.ts
```

**Bağımlılıklar:**
- @dnd-kit/core (drag-drop)

**Test:**
- CRUD işlemleri çalışıyor
- Sıralama kaydediliyor
- Delete confirmation gösteriliyor
- RLS izin veriyor

---

### 4.4 Product Management
**Hedef:** Ürün CRUD işlemleri

**Adımlar:**
1. Product list page (grid/table)
2. Create product form
3. Update product form
4. Delete product
5. Image upload
6. Category selection
7. Price validation
8. Filtering (category, active)
9. Search (name, description)

**Sayfalar:**
```
app/
├── panel/
│   └── urunler/
│       ├── page.tsx
│       ├── yeni/
│       │   └── page.tsx
│       └── [id]/
│           └── duzenle/
│               └── page.tsx
```

**Components:**
```
components/
├── panel/
│   ├── product-list.tsx
│   ├── product-form.tsx
│   ├── product-card.tsx
│   ├── product-filters.tsx
│   └── product-search.tsx
```

**Server Actions:**
```
app/
├── actions/
│   └── product.ts
```

**Test:**
- CRUD işlemleri çalışıyor
- Image upload başarılı
- Filtering çalışıyor
- Search çalışıyor
- Price validation doğru

---

## Faz 5: Admin Panel

### 5.1 Admin Layout & Dashboard
**Hedef:** Admin için restaurant listesi ve genel metrikler

**Adımlar:**
1. Admin layout
2. Admin dashboard
3. Restaurant list table
4. Filters (plan, status, active, search)
5. Pagination
6. Aggregate metrics
7. Admin check middleware

**Sayfalar:**
```
app/
├── admin/
│   ├── layout.tsx
│   └── page.tsx
```

**Components:**
```
components/
├── admin/
│   ├── restaurant-table.tsx
│   ├── restaurant-filters.tsx
│   ├── admin-stats.tsx
│   └── pagination.tsx
```

**Test:**
- Admin erişebiliyor
- Non-admin erişemiyor
- Restaurant listesi gösteriliyor
- Filters çalışıyor
- Pagination çalışıyor

---

### 5.2 Restaurant Detail Page
**Hedef:** Admin için restaurant detay ve analitik

**Adımlar:**
1. Restaurant detail page
2. Restaurant info card
3. Scan analytics chart
4. Scan stats cards
5. Daily breakdown table
6. Subscription management form
7. Payment history table

**Sayfalar:**
```
app/
├── admin/
│   └── restoranlar/
│       └── [id]/
│           └── page.tsx
```

**Components:**
```
components/
├── admin/
│   ├── restaurant-info-card.tsx
│   ├── scan-analytics-chart.tsx
│   ├── scan-stats.tsx
│   ├── subscription-form.tsx
│   └── payment-history.tsx
```

**Bağımlılıklar:**
- recharts (analytics chart)

**Test:**
- Restaurant detay gösteriliyor
- Chart render oluyor
- Subscription update çalışıyor
- Payment history gösteriliyor

---

### 5.3 Admin Settings
**Hedef:** Admin kullanıcı yönetimi (opsiyonel)

**Adımlar:**
1. Admin settings page
2. Admin user list
3. Add admin user
4. Remove admin user

**Sayfalar:**
```
app/
├── admin/
│   └── ayarlar/
│       └── page.tsx
```

**Components:**
```
components/
├── admin/
│   ├── admin-user-list.tsx
│   └── add-admin-form.tsx
```

**Test:**
- Admin listesi gösteriliyor
- Yeni admin eklenebiliyor
- Admin silinebiliyor

---

## Faz 6: Polish & Optimization

### 6.1 Error Handling
**Hedef:** Tüm error senaryoları için UI

**Adımlar:**
1. Global error boundary
2. Not found pages
3. Loading states
4. Toast notifications
5. Form error messages
6. Network error handling

**Components:**
```
components/
├── ui/
│   ├── error-boundary.tsx
│   ├── toast.tsx
│   └── loading-spinner.tsx
app/
├── error.tsx
├── not-found.tsx
└── loading.tsx
```

**Test:**
- Error boundary catch ediyor
- 404 pages gösteriliyor
- Loading states gösteriliyor
- Toast notifications çalışıyor

---

### 6.2 Performance Optimization
**Hedef:** Sayfa yükleme ve render performansı

**Adımlar:**
1. Image optimization (Next.js Image)
2. Lazy loading
3. Code splitting
4. ISR configuration
5. Caching strategy
6. Database query optimization

**Optimizasyonlar:**
- Public menu: ISR (revalidate: 60s)
- Image: Next.js Image component
- Lazy load: React.lazy() for heavy components
- Query: Select only needed columns

**Test:**
- Lighthouse score > 90
- FCP < 2s
- LCP < 2.5s
- CLS < 0.1

---

### 6.3 Testing
**Hedef:** Critical flows için testler

**Adımlar:**
1. Unit tests (utils, helpers)
2. Integration tests (server actions)
3. E2E tests (critical flows)
4. RLS policy tests

**Test Framework:**
- Jest + React Testing Library
- Playwright (E2E)

**Test Coverage:**
- Auth flow
- Restaurant CRUD
- Category/Product CRUD
- Scan tracking
- Admin operations

**Test:**
- Tüm testler geçiyor
- Coverage > 70%

---

## Faz 7: Deployment

### 7.1 Vercel Configuration
**Hedef:** Production deployment

**Adımlar:**
1. Environment variables setup
2. Build configuration
3. Domain configuration
4. SSL setup
5. Analytics setup

**Vercel Settings:**
- Framework: Next.js
- Build Command: `npm run build`
- Output Directory: `.next`
- Node Version: 18.x

**Test:**
- Build başarılı
- Production deploy çalışıyor
- Environment variables doğru
- SSL aktif

---

### 7.2 Monitoring & Analytics
**Hedef:** Production monitoring

**Adımlar:**
1. Vercel Analytics enable
2. Error tracking (Sentry, opsiyonel)
3. Database monitoring (Supabase dashboard)
4. Performance monitoring

**Test:**
- Analytics data geliyor
- Errors track ediliyor
- Database metrics görünüyor

---

## Faz 8: Documentation & Handoff

### 8.1 Documentation
**Hedef:** Proje dokümantasyonu

**Adımlar:**
1. README.md
2. API documentation
3. Database schema docs
4. Deployment guide
5. User guide (admin/owner)

**Dosyalar:**
```
docs/
├── README.md
├── API.md
├── DATABASE.md
├── DEPLOYMENT.md
└── USER_GUIDE.md
```

---

### 8.2 Training & Handoff
**Hedef:** Kullanıcı eğitimi

**Adımlar:**
1. Admin panel walkthrough
2. Restaurant panel walkthrough
3. Common tasks guide
4. Troubleshooting guide

---

## Öncelik Sıralaması

### Must Have (MVP)
1. ✅ Project setup
2. ✅ Database schema
3. ✅ Authentication
4. ✅ Public menu page
5. ✅ Restaurant panel (settings, category, product)
6. ✅ QR code generation
7. ✅ Scan tracking
8. ✅ Admin panel (restaurant list, detail)
9. ✅ Deployment

### Should Have
1. Subscription management
2. Payment tracking
3. Advanced analytics
4. Error handling
5. Performance optimization

### Nice to Have
1. Email notifications
2. Multi-language
3. Advanced filtering
4. Bulk operations
5. CSV import/export

---

## Tahmini Süre (Geliştirme)

**Faz 1: Foundation** - 2-3 gün
**Faz 2: Authentication** - 2-3 gün
**Faz 3: Public Menu** - 3-4 gün
**Faz 4: Restaurant Panel** - 5-7 gün
**Faz 5: Admin Panel** - 4-5 gün
**Faz 6: Polish** - 3-4 gün
**Faz 7: Deployment** - 1-2 gün
**Faz 8: Documentation** - 1-2 gün

**Toplam:** 21-30 gün (tek geliştirici)

---

## Risk Yönetimi

### Teknik Riskler
1. **RLS Policy Karmaşıklığı**
   - Risk: Multi-tenant izolasyon hataları
   - Önlem: Kapsamlı test, her policy için test case

2. **Performance Sorunları**
   - Risk: Yavaş sayfa yüklemeleri
   - Önlem: ISR, caching, image optimization

3. **Slug Çakışmaları**
   - Risk: Benzersiz slug garantisi
   - Önlem: Database function, unique constraint

### İş Riskleri
1. **Scope Creep**
   - Risk: Sürekli yeni özellik istekleri
   - Önlem: MVP odaklı kalma, faz bazlı geliştirme

2. **Deployment Sorunları**
   - Risk: Production'da beklenmeyen hatalar
   - Önlem: Staging environment, kapsamlı test

---

Bu roadmap, projenin sistematik ve test edilebilir şekilde geliştirilmesini sağlar. Her faz bağımsız olarak tamamlanabilir ve test edilebilir.