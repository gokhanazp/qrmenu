# QR Menü SaaS - Mimari Tasarım Dokümanı

## Proje Özeti

Multi-tenant QR Menü SaaS platformu - Restoranların menülerini yönetip QR kod ile paylaşabildiği, admin paneli ile merkezi yönetim sağlayan bir sistem.

**Teknoloji Stack:**
- Frontend: Next.js 14+ (App Router)
- UI: shadcn/ui + Tailwind CSS
- Backend: Supabase (PostgreSQL + Auth + Storage + RLS)
- Deployment: Vercel
- QR Generation: Client-side (qrcode.react)

---

## 1. Sistem Mimarisi

### 1.1 Genel Mimari

```
┌─────────────────────────────────────────────────────────────┐
│                        VERCEL EDGE                          │
│                     (Next.js 14 App)                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │   Public     │  │  Restaurant  │  │    Admin     │    │
│  │    Menu      │  │    Panel     │  │    Panel     │    │
│  │ /restorant/* │  │   /panel     │  │   /admin     │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      SUPABASE                               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │  PostgreSQL  │  │     Auth     │  │   Storage    │    │
│  │   + RLS      │  │  (Email/Pwd) │  │   (Images)   │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Routing Yapısı

**Public Routes (No Auth Required):**
- `/restorant/[slug]` - Public menu görüntüleme
- `/auth/login` - Giriş sayfası
- `/auth/register` - Kayıt sayfası

**Protected Routes (Restaurant Owner):**
- `/panel` - Dashboard (QR kod, istatistikler)
- `/panel/ayarlar` - Restoran ayarları
- `/panel/kategoriler` - Kategori yönetimi
- `/panel/urunler` - Ürün yönetimi

**Admin Routes (Super Admin Only):**
- `/admin` - Admin dashboard (restoran listesi)
- `/admin/restoranlar/[id]` - Restoran detay ve analitik
- `/admin/ayarlar` - Admin ayarları

---

## 2. Veri Modeli

### 2.1 Database Schema

#### restaurants
```
id                  uuid PRIMARY KEY DEFAULT gen_random_uuid()
owner_user_id       uuid NOT NULL REFERENCES auth.users(id)
name                text NOT NULL
slug                text UNIQUE NOT NULL
logo_url            text
hero_url            text
slogan              text
is_active           boolean DEFAULT true
created_at          timestamptz DEFAULT now()

INDEXES:
- idx_restaurants_owner (owner_user_id)
- idx_restaurants_slug (slug)
- idx_restaurants_active (is_active)
```

#### categories
```
id                  uuid PRIMARY KEY DEFAULT gen_random_uuid()
restaurant_id       uuid NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE
name                text NOT NULL
sort_order          integer DEFAULT 0
is_active           boolean DEFAULT true
created_at          timestamptz DEFAULT now()

INDEXES:
- idx_categories_restaurant (restaurant_id)
- idx_categories_sort (restaurant_id, sort_order)
```

#### products
```
id                  uuid PRIMARY KEY DEFAULT gen_random_uuid()
restaurant_id       uuid NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE
category_id         uuid REFERENCES categories(id) ON DELETE SET NULL
name                text NOT NULL
description         text
price               numeric(10,2) NOT NULL
image_url           text
sort_order          integer DEFAULT 0
is_active           boolean DEFAULT true
created_at          timestamptz DEFAULT now()

INDEXES:
- idx_products_restaurant (restaurant_id)
- idx_products_category (category_id)
- idx_products_sort (restaurant_id, sort_order)
```

#### admin_users
```
user_id             uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE
created_at          timestamptz DEFAULT now()

INDEXES:
- idx_admin_users_user (user_id)
```

#### scan_events
```
id                  uuid PRIMARY KEY DEFAULT gen_random_uuid()
restaurant_id       uuid NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE
scanned_at          timestamptz DEFAULT now()
user_agent          text
referrer            text
ip_hash             text

INDEXES:
- idx_scan_events_restaurant (restaurant_id)
- idx_scan_events_date (restaurant_id, scanned_at DESC)
```

#### subscriptions
```
id                      uuid PRIMARY KEY DEFAULT gen_random_uuid()
restaurant_id           uuid UNIQUE NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE
plan                    text NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro'))
status                  text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'past_due', 'canceled', 'trialing'))
current_period_start    timestamptz
current_period_end      timestamptz
updated_at              timestamptz DEFAULT now()

INDEXES:
- idx_subscriptions_restaurant (restaurant_id)
- idx_subscriptions_status (status)
```

#### payments
```
id                      uuid PRIMARY KEY DEFAULT gen_random_uuid()
restaurant_id           uuid NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE
amount                  numeric(10,2) NOT NULL
currency                text DEFAULT 'TRY'
status                  text NOT NULL CHECK (status IN ('paid', 'failed', 'refunded', 'pending'))
provider                text DEFAULT 'manual'
provider_payment_id     text
paid_at                 timestamptz
created_at              timestamptz DEFAULT now()

INDEXES:
- idx_payments_restaurant (restaurant_id)
- idx_payments_status (status)
- idx_payments_date (created_at DESC)
```

### 2.2 Database Functions

#### Slug Generation Function
```sql
CREATE OR REPLACE FUNCTION generate_unique_slug(base_name text)
RETURNS text AS $$
DECLARE
  slug_candidate text;
  counter integer := 0;
BEGIN
  -- Türkçe karakter dönüşümü ve temizleme
  slug_candidate := lower(base_name);
  slug_candidate := translate(slug_candidate, 'şğıöüç', 'sgiouc');
  slug_candidate := regexp_replace(slug_candidate, '[^a-z0-9\s-]', '', 'g');
  slug_candidate := regexp_replace(slug_candidate, '\s+', '-', 'g');
  slug_candidate := regexp_replace(slug_candidate, '-+', '-', 'g');
  slug_candidate := trim(both '-' from slug_candidate);
  
  -- Benzersizlik kontrolü
  WHILE EXISTS (SELECT 1 FROM restaurants WHERE slug = slug_candidate) LOOP
    counter := counter + 1;
    slug_candidate := slug_candidate || '-' || counter;
  END LOOP;
  
  RETURN slug_candidate;
END;
$$ LANGUAGE plpgsql;
```

#### Scan Metrics Function
```sql
CREATE OR REPLACE FUNCTION get_scan_metrics(rest_id uuid, days integer DEFAULT 30)
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
$$ LANGUAGE plpgsql;
```

---

## 3. Row Level Security (RLS) Policies

### 3.1 Admin Check Helper Function
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

### 3.2 RLS Policies by Table

#### restaurants
```sql
-- Public: Sadece aktif restoranları görebilir
CREATE POLICY "Public can view active restaurants"
ON restaurants FOR SELECT
TO public
USING (is_active = true);

-- Owner: Kendi restoranını görebilir
CREATE POLICY "Owners can view own restaurant"
ON restaurants FOR SELECT
TO authenticated
USING (owner_user_id = auth.uid());

-- Owner: Kendi restoranını güncelleyebilir
CREATE POLICY "Owners can update own restaurant"
ON restaurants FOR UPDATE
TO authenticated
USING (owner_user_id = auth.uid())
WITH CHECK (owner_user_id = auth.uid());

-- Owner: Yeni restoran oluşturabilir
CREATE POLICY "Authenticated users can create restaurant"
ON restaurants FOR INSERT
TO authenticated
WITH CHECK (owner_user_id = auth.uid());

-- Admin: Tüm restoranları görebilir ve güncelleyebilir
CREATE POLICY "Admins can view all restaurants"
ON restaurants FOR SELECT
TO authenticated
USING (is_admin());

CREATE POLICY "Admins can update all restaurants"
ON restaurants FOR UPDATE
TO authenticated
USING (is_admin());
```

#### categories
```sql
-- Public: Aktif restoranın aktif kategorilerini görebilir
CREATE POLICY "Public can view active categories"
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

-- Owner: Kendi restoranının kategorilerini yönetebilir
CREATE POLICY "Owners can manage own categories"
ON categories FOR ALL
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

-- Admin: Tüm kategorileri görebilir
CREATE POLICY "Admins can view all categories"
ON categories FOR SELECT
TO authenticated
USING (is_admin());
```

#### products
```sql
-- Public: Aktif restoranın aktif ürünlerini görebilir
CREATE POLICY "Public can view active products"
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

-- Owner: Kendi restoranının ürünlerini yönetebilir
CREATE POLICY "Owners can manage own products"
ON products FOR ALL
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

-- Admin: Tüm ürünleri görebilir
CREATE POLICY "Admins can view all products"
ON products FOR SELECT
TO authenticated
USING (is_admin());
```

#### scan_events
```sql
-- Server-side insert için service role kullanılacak
-- Public insert izni YOK (kötüye kullanım önlemi)

-- Owner: Kendi restoranının scan eventlerini görebilir
CREATE POLICY "Owners can view own scan events"
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
CREATE POLICY "Admins can view all scan events"
ON scan_events FOR SELECT
TO authenticated
USING (is_admin());
```

#### subscriptions
```sql
-- Owner: Kendi aboneliğini görebilir
CREATE POLICY "Owners can view own subscription"
ON subscriptions FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM restaurants 
    WHERE id = subscriptions.restaurant_id 
    AND owner_user_id = auth.uid()
  )
);

-- Admin: Tüm abonelikleri görebilir ve güncelleyebilir
CREATE POLICY "Admins can manage all subscriptions"
ON subscriptions FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());
```

#### payments
```sql
-- Owner: Kendi ödemelerini görebilir
CREATE POLICY "Owners can view own payments"
ON payments FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM restaurants 
    WHERE id = payments.restaurant_id 
    AND owner_user_id = auth.uid()
  )
);

-- Admin: Tüm ödemeleri görebilir ve yönetebilir
CREATE POLICY "Admins can manage all payments"
ON payments FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());
```

#### admin_users
```sql
-- Sadece adminler admin listesini görebilir
CREATE POLICY "Admins can view admin users"
ON admin_users FOR SELECT
TO authenticated
USING (is_admin());

-- Sadece adminler yeni admin ekleyebilir
CREATE POLICY "Admins can insert admin users"
ON admin_users FOR INSERT
TO authenticated
WITH CHECK (is_admin());
```

---

## 4. Supabase Storage Configuration

### 4.1 Bucket Yapısı

**Bucket: `restaurant-images`**
- Public access: true (public menü için)
- File size limit: 5MB
- Allowed MIME types: image/jpeg, image/png, image/webp

**Klasör Organizasyonu:**
```
restaurant-images/
├── {restaurant_id}/
│   ├── logo.{ext}
│   ├── hero.{ext}
│   └── products/
│       ├── {product_id}.{ext}
│       └── ...
```

### 4.2 Storage Policies

```sql
-- Owner: Kendi restoranının klasörüne upload yapabilir
CREATE POLICY "Owners can upload to own folder"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'restaurant-images' 
  AND (storage.foldername(name))[1] IN (
    SELECT id::text FROM restaurants WHERE owner_user_id = auth.uid()
  )
);

-- Owner: Kendi restoranının dosyalarını silebilir
CREATE POLICY "Owners can delete own files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'restaurant-images' 
  AND (storage.foldername(name))[1] IN (
    SELECT id::text FROM restaurants WHERE owner_user_id = auth.uid()
  )
);

-- Public: Tüm dosyaları okuyabilir
CREATE POLICY "Public can view all files"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'restaurant-images');

-- Admin: Tüm dosyaları yönetebilir
CREATE POLICY "Admins can manage all files"
ON storage.objects FOR ALL
TO authenticated
USING (
  bucket_id = 'restaurant-images' 
  AND is_admin()
);
```

---

## 5. Ekran Tasarımları ve İş Akışları

### 5.1 Public Menu Page (`/restorant/[slug]`)

**Amaç:** Müşterilerin QR kod ile eriştiği mobil-öncelikli menü sayfası

**Veri Akışı:**
1. URL'den slug parametresi alınır
2. Server Component ile restaurant + categories + products fetch edilir (RLS ile sadece aktif olanlar)
3. Scan event kaydı için API route çağrılır (server-side)
4. SEO meta tags dinamik oluşturulur

**Görsel Bileşenler:**
- Hero Section: Logo + Banner + Slogan
- Category Tabs/Chips: Yatay scroll, sticky
- Product Grid: Kart bazlı, lazy-load images
- Product Card: Image + Name + Description + Price
- Empty State: "Menü hazırlanıyor" mesajı

**Özel Gereksinimler:**
- Mobile-first responsive design
- Touch-friendly UI (min 44px tap targets)
- Fast loading (< 2s FCP)
- Offline fallback (optional PWA)
- Image optimization (Next.js Image component)

### 5.2 Restaurant Panel

#### 5.2.1 Dashboard (`/panel`)

**Bileşenler:**
- QR Code Display: Canvas ile client-side generate
- QR Download Button: PNG export
- Public Link: Copy to clipboard
- Quick Stats Cards:
  - Bugün: scan_events count (today)
  - Son 7 Gün: scan_events count (7d)
  - Toplam: scan_events count (all)
- Quick Actions: Kategori ekle, Ürün ekle

**Veri Kaynakları:**
- Restaurant: Supabase query (owner check)
- Scan metrics: Aggregate queries with timezone

#### 5.2.2 Restaurant Settings (`/panel/ayarlar`)

**Form Alanları:**
- Restaurant Name (text input)
- Slug (read-only, auto-generated)
- Logo Upload (file input, preview)
- Hero Banner Upload (file input, preview)
- Slogan (textarea)
- Is Active (toggle switch)

**İş Kuralları:**
- Logo/Hero upload: max 5MB, jpg/png/webp
- Slug değiştirilemez (SEO ve QR kod tutarlılığı için)
- Is Active false yapılırsa public menü 404 döner

#### 5.2.3 Category Management (`/panel/kategoriler`)

**Liste Görünümü:**
- Tablo: Name, Sort Order, Active Status, Actions
- Drag-drop sıralama (sort_order güncelleme)
- Inline edit veya modal

**CRUD İşlemleri:**
- Create: Modal form (name, sort_order, is_active)
- Update: Inline edit veya modal
- Delete: Confirmation dialog (cascade products?)
- Toggle Active: Switch component

#### 5.2.4 Product Management (`/panel/urunler`)

**Liste Görünümü:**
- Grid veya Tablo: Image, Name, Category, Price, Active, Actions
- Filtreleme: Category, Active status
- Arama: Name, Description

**CRUD İşlemleri:**
- Create: Form (name, description, price, category, image, sort_order, is_active)
- Update: Form veya inline edit
- Delete: Confirmation dialog
- Image Upload: Drag-drop veya file input, preview

### 5.3 Admin Panel

#### 5.3.1 Admin Dashboard (`/admin`)

**Restaurant List Table:**

**Kolonlar:**
- Restaurant Name
- Slug
- Owner Email (join auth.users)
- Plan (free/pro)
- Status (active/inactive/past_due)
- Scans Today
- Scans 7d
- Scans Total
- Is Active
- Created At
- Actions (View Detail)

**Filtreler:**
- Plan dropdown
- Status dropdown
- Active toggle
- Search (name/slug)
- Date range (created_at)

**Metrikler (Aggregate):**
- Total Restaurants
- Active Subscriptions
- Total Scans (today/7d/all)
- Revenue (if payments tracked)

#### 5.3.2 Restaurant Detail (`/admin/restoranlar/[id]`)

**Sections:**

1. **Restaurant Info Card:**
   - Name, Slug, Owner
   - Public Menu Link (clickable)
   - Created At, Updated At
   - Is Active toggle

2. **Scan Analytics:**
   - Chart: Son 30 gün günlük scan trend (line/bar chart)
   - Stats Cards: Today, 7d, 30d, Total
   - Table: Günlük breakdown

3. **Subscription Management:**
   - Current Plan (dropdown: free/pro)
   - Status (dropdown: active/inactive/past_due/canceled/trialing)
   - Period Start/End (date pickers)
   - Update Button

4. **Payment History (if payments table):**
   - Table: Date, Amount, Currency, Status, Provider
   - Pagination

5. **Quick Actions:**
   - View Public Menu
   - Impersonate Owner (optional, security risk)
   - Deactivate/Activate Restaurant

---

## 6. API Routes ve Server Actions

### 6.1 Server Actions (Next.js 14)

**Restaurant Actions:**
- `createRestaurant(formData)` - Yeni restoran oluştur, slug generate
- `updateRestaurant(id, formData)` - Restoran güncelle
- `uploadRestaurantImage(restaurantId, file, type)` - Logo/hero upload

**Category Actions:**
- `createCategory(restaurantId, data)` - Kategori oluştur
- `updateCategory(id, data)` - Kategori güncelle
- `deleteCategory(id)` - Kategori sil
- `reorderCategories(restaurantId, orders)` - Sıralama güncelle

**Product Actions:**
- `createProduct(restaurantId, data)` - Ürün oluştur
- `updateProduct(id, data)` - Ürün güncelle
- `deleteProduct(id)` - Ürün sil
- `uploadProductImage(productId, file)` - Ürün görseli upload

**Admin Actions:**
- `updateSubscription(restaurantId, data)` - Abonelik güncelle
- `createPayment(restaurantId, data)` - Ödeme kaydı oluştur
- `addAdminUser(userId)` - Admin yetkisi ver

### 6.2 API Routes

**Scan Tracking:**
- `POST /api/scan` - Scan event kaydet (server-side, service role)
  - Body: { restaurantId, userAgent, referrer }
  - IP hash server-side hesaplanır
  - Rate limiting: 1 scan/10min per IP+restaurant

**Analytics:**
- `GET /api/admin/analytics` - Genel sistem metrikleri
- `GET /api/admin/restaurants/[id]/scans` - Restoran scan detayları

**Webhooks (Future):**
- `POST /api/webhooks/stripe` - Stripe webhook handler

---

## 7. Authentication Flow

### 7.1 Registration Flow

```
User → /auth/register
  ↓
Email + Password + Restaurant Name
  ↓
Supabase Auth: Create User
  ↓
Database Trigger: Create Restaurant (owner_user_id = new user)
  ↓
Generate Slug from Restaurant Name
  ↓
Create Default Subscription (plan: free, status: active)
  ↓
Redirect → /panel (Dashboard)
```

### 7.2 Login Flow

```
User → /auth/login
  ↓
Email + Password
  ↓
Supabase Auth: Sign In
  ↓
Check Admin Status (admin_users table)
  ↓
If Admin → Redirect /admin
If Owner → Redirect /panel
```

### 7.3 Session Management

- Next.js middleware: Auth check for protected routes
- Supabase client: Auto-refresh tokens
- Server Components: getUser() from cookies
- Client Components: useUser() hook

---

## 8. Güvenlik Gereksinimleri

### 8.1 Multi-Tenant Isolation

**Zorunlu Kontroller:**
1. Her query'de restaurant_id filtresi (RLS ile garanti)
2. Owner check: auth.uid() = restaurants.owner_user_id
3. Admin check: EXISTS in admin_users
4. Slug uniqueness: Database constraint + function

### 8.2 Input Validation

**Server-Side Validation:**
- Restaurant name: 3-100 karakter
- Slug: lowercase, alphanumeric + hyphen
- Price: pozitif numeric, max 2 decimal
- Image: MIME type check, size limit
- Email: valid format

**Client-Side Validation:**
- Zod schemas for forms
- Real-time feedback
- Duplicate slug check (debounced)

### 8.3 Rate Limiting

**Endpoints:**
- `/api/scan`: 1 req/10min per IP+restaurant
- `/auth/login`: 5 req/15min per IP
- `/auth/register`: 3 req/hour per IP

**Implementation:**
- Vercel Edge Config veya Upstash Redis
- IP-based throttling

### 8.4 KVKK Compliance

**Kişisel Veri Minimizasyonu:**
- IP adresi: SHA-256 hash (raw IP saklanmaz)
- User agent: Anonim (browser/OS bilgisi, detay yok)
- Scan events: Retention policy (1 yıl sonra arşiv/sil)

**Kullanıcı Hakları:**
- Veri silme: Restoran silinirse cascade delete
- Veri taşınabilirliği: Export API (future)

---

## 9. Performance Optimization

### 9.1 Caching Strategy

**Static Generation (SSG):**
- Public menu pages: ISR (revalidate: 60s)
- Restaurant slug list: ISR (revalidate: 3600s)

**Server-Side Rendering (SSR):**
- Admin dashboard (real-time data)
- Restaurant panel (user-specific)

**Client-Side Caching:**
- React Query: Stale-while-revalidate
- Image caching: Next.js Image component

### 9.2 Database Optimization

**Indexes:**
- restaurants: (owner_user_id), (slug), (is_active)
- categories: (restaurant_id, sort_order)
- products: (restaurant_id, sort_order), (category_id)
- scan_events: (restaurant_id, scanned_at DESC)

**Query Optimization:**
- Select only needed columns
- Use joins instead of multiple queries
- Aggregate queries for metrics
- Pagination for large lists

### 9.3 Image Optimization

**Next.js Image Component:**
- Automatic WebP conversion
- Responsive sizes
- Lazy loading
- Blur placeholder

**Upload Optimization:**
- Client-side resize before upload (max 1920px)
- Compress with quality: 85
- Generate thumbnails (future)

---

## 10. SEO Strategy

### 10.1 Public Menu SEO

**Meta Tags:**
```typescript
{
  title: `${restaurant.name} - Menü`,
  description: restaurant.slogan || `${restaurant.name} dijital menüsü`,
  openGraph: {
    title: restaurant.name,
    description: restaurant.slogan,
    images: [restaurant.hero_url || restaurant.logo_url],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: restaurant.name,
    description: restaurant.slogan,
    images: [restaurant.hero_url],
  }
}
```

**Structured Data (JSON-LD):**
```json
{
  "@context": "https://schema.org",
  "@type": "Restaurant",
  "name": "Restaurant Name",
  "image": "logo_url",
  "url": "https://domain.com/restorant/slug",
  "menu": "https://domain.com/restorant/slug",
  "servesCuisine": "Turkish"
}
```

### 10.2 Technical SEO

- Sitemap: Dynamic generation for all active restaurants
- Robots.txt: Allow public menus, disallow panel/admin
- Canonical URLs: Prevent duplicate content
- Mobile-friendly: Responsive design, touch targets
- Page speed: Core Web Vitals optimization

---

## 11. Error Handling

### 11.1 Error Types

**Client Errors (4xx):**
- 400 Bad Request: Invalid input
- 401 Unauthorized: Not logged in
- 403 Forbidden: Insufficient permissions
- 404 Not Found: Restaurant/product not found
- 429 Too Many Requests: Rate limit exceeded

**Server Errors (5xx):**
- 500 Internal Server Error: Unexpected error
- 503 Service Unavailable: Supabase down

### 11.2 Error UI

**Public Menu:**
- 404: "Restoran bulunamadı" + Ana sayfa linki
- 500: "Bir hata oluştu" + Yenile butonu
- Empty state: "Menü hazırlanıyor"

**Restaurant Panel:**
- Toast notifications: Success/error feedback
- Form validation errors: Inline messages
- Network errors: Retry button

**Admin Panel:**
- Error boundary: Fallback UI
- Detailed error logs (admin only)

---

## 12. Testing Strategy

### 12.1 Unit Tests

**Test Coverage:**
- Utility functions: slug generation, validation
- Server actions: CRUD operations
- RLS policies: Permission checks

**Tools:**
- Jest + React Testing Library
- Supabase local dev for DB tests

### 12.2 Integration Tests

**Critical Flows:**
- Registration → Restaurant creation → Slug generation
- Menu CRUD → Public menu update
- Scan event → Analytics update
- Admin subscription update → Restaurant access

### 12.3 E2E Tests

**User Journeys:**
- Restaurant owner: Register → Add category → Add product → View public menu
- Customer: Scan QR → View menu → Navigate categories
- Admin: Login → View dashboard → Update subscription

**Tools:**
- Playwright or Cypress

---

## 13. Deployment Configuration

### 13.1 Vercel Configuration

**Environment Variables:**
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SITE_URL=
```

**Build Settings:**
- Framework: Next.js
- Build Command: `npm run build`
- Output Directory: `.next`
- Install Command: `npm install`

**Edge Functions:**
- Scan tracking API: Edge runtime
- Image optimization: Automatic

### 13.2 Domain Configuration

**Custom Domain:**
- Primary: `yourdomain.com`
- Restaurant subdomains (future): `{slug}.yourdomain.com`

**SSL:**
- Automatic via Vercel

---

## 14. Monitoring ve Analytics

### 14.1 Application Monitoring

**Vercel Analytics:**
- Page views
- Core Web Vitals
- Error tracking

**Custom Metrics:**
- Scan events per day
- Active restaurants
- Subscription conversions

### 14.2 Database Monitoring

**Supabase Dashboard:**
- Query performance
- Connection pool usage
- Storage usage

**Alerts:**
- High error rate
- Slow queries (> 1s)
- Storage limit approaching

---

## 15. Future Enhancements

### 15.1 Phase 2 Features

**Restaurant Features:**
- Multi-language menus
- Allergen information
- Nutritional values
- Table reservation integration

**Admin Features:**
- Bulk operations
- CSV import/export
- Email notifications
- Advanced analytics dashboard

**Payment Integration:**
- Stripe subscription automation
- Invoice generation
- Payment reminders

### 15.2 Phase 3 Features

**Advanced Features:**
- Mobile app (React Native)
- Waiter call button
- Order management system
- Customer reviews
- Loyalty program

**Technical Improvements:**
- CDN for images
- Real-time updates (Supabase Realtime)
- PWA with offline support
- A/B testing framework

---

## 16. Kabul Kriterleri

### 16.1 Functional Requirements

✅ Restoran kayıt olabilir ve slug otomatik oluşur
✅ Restoran panelinden kategori/ürün CRUD yapılabilir
✅ Public menü sayfası mobil uyumlu görüntülenir
✅ QR kod panelde görüntülenir ve PNG olarak indirilebilir
✅ Scan eventleri kaydedilir ve istatistikler gösterilir
✅ Admin panelde tüm restoranlar listelenir
✅ Admin restoran detayında analitik ve abonelik yönetimi vardır
✅ Tenant izolasyonu: Bir restoran diğerinin verisini göremez

### 16.2 Non-Functional Requirements

✅ Public menü < 2s yüklenir (FCP)
✅ Mobile-first responsive design
✅ RLS policies tüm tablolarda aktif
✅ KVKK uyumlu (IP hash, minimal data)
✅ SEO optimize (meta tags, structured data)
✅ Error handling ve empty states
✅ Vercel'e deploy edilebilir

---

## 17. Teknik Borç ve Bilinen Sınırlamalar

### 17.1 MVP Sınırlamaları

- Ödeme entegrasyonu manuel (Stripe otomasyonu yok)
- Scan event rate limiting basit (Redis yok)
- Image CDN yok (Supabase Storage direkt)
- Email notifications yok
- Multi-language support yok

### 17.2 Gelecek İyileştirmeler

- Redis cache layer ekle
- Image CDN (Cloudflare/Cloudinary)
- Stripe webhook automation
- Email service (Resend/SendGrid)
- Advanced analytics (Mixpanel/Amplitude)

---

## Sonuç

Bu mimari tasarım, multi-tenant QR Menü SaaS platformu için kapsamlı bir blueprint sağlar. Next.js 14 App Router, Supabase ve Vercel kombinasyonu ile modern, ölçeklenebilir ve güvenli bir sistem oluşturulabilir.

**Kritik Başarı Faktörleri:**
1. RLS policies doğru implementasyonu (tenant isolation)
2. Slug generation ve uniqueness garantisi
3. Mobile-first UI/UX
4. Performance optimization (caching, image optimization)
5. Security best practices (input validation, rate limiting)

**Sonraki Adımlar:**
1. Supabase database schema ve RLS policies oluşturma
2. Next.js project setup ve base configuration
3. Authentication system implementation
4. Public menu page development
5. Restaurant panel development
6. Admin panel development
7. Testing ve deployment