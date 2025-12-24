# QR Menü SaaS - Planlama Dokümanları

Bu klasör, QR Menü SaaS projesinin kapsamlı mimari ve teknik planlamasını içerir.

---

## 📋 Doküman Listesi

### 1. [Architecture Plan](./architecture-plan.md)
**Amaç:** Projenin genel mimari tasarımı ve sistem bileşenleri

**İçerik:**
- Sistem mimarisi ve routing yapısı
- Veri modeli ve tablo yapıları
- RLS (Row Level Security) politika mantığı
- Supabase Storage konfigürasyonu
- Ekran tasarımları ve iş akışları
- API routes ve server actions
- Authentication flow
- Güvenlik gereksinimleri
- Performance optimization stratejisi
- SEO stratejisi
- Error handling yaklaşımı
- Deployment konfigürasyonu
- Monitoring ve analytics
- Gelecek geliştirmeler
- Kabul kriterleri

**Kullanım:** Projenin big picture'ını anlamak ve mimari kararları görmek için

---

### 2. [Database Schema](./database-schema.md)
**Amaç:** Supabase PostgreSQL veritabanı şeması ve RLS politikaları

**İçerik:**
- Tüm tablo tanımları (CREATE TABLE statements)
- Index tanımları
- Helper functions (slug generation, admin check, scan metrics)
- RLS policies (tablo bazında detaylı)
- Database triggers
- Storage bucket ve policies
- Initial data scripts
- Database maintenance queries
- Migration strategy
- Security checklist
- Performance optimization tips

**Kullanım:** Supabase SQL Editor'de çalıştırılarak database kurulumu için

---

### 3. [Implementation Roadmap](./implementation-roadmap.md)
**Amaç:** Adım adım implementasyon planı ve faz bazlı geliştirme

**İçerik:**
- 8 ana faz (Foundation → Deployment)
- Her fazın detaylı adımları
- Bağımlılıklar ve gerekli paketler
- Dosya yapısı önerileri
- Test kriterleri
- Öncelik sıralaması (Must Have / Should Have / Nice to Have)
- Risk yönetimi

**Fazlar:**
1. Temel Altyapı (Project setup, Supabase integration, Database schema)
2. Authentication System (Auth UI, Server actions, Middleware)
3. Public Menu Page (Layout, Scan tracking, SEO)
4. Restaurant Panel (Dashboard, Settings, Category/Product management)
5. Admin Panel (Dashboard, Restaurant detail, Admin settings)
6. Polish & Optimization (Error handling, Performance, Testing)
7. Deployment (Vercel config, Monitoring)
8. Documentation & Handoff

**Kullanım:** Geliştirme sırasında hangi adımın ne zaman yapılacağını takip etmek için

---

### 4. [Technical Specifications](./technical-specifications.md)
**Amaç:** Kod seviyesinde teknik detaylar ve type definitions

**İçerik:**
- TypeScript type definitions (Database types, Application types)
- Zod validation schemas (Auth, Restaurant, Category, Product, Admin)
- Server actions interface tanımları
- API routes spesifikasyonları
- Utility functions (slug, IP hash, image, date, currency)
- Environment variables
- Error handling (Custom error types, Error handler)
- Middleware configuration
- Performance optimization (ISR, Image optimization)
- Testing examples (Unit tests, Integration tests)

**Kullanım:** Kod yazarken referans olarak, type safety ve validation için

---

## 🎯 Proje Özeti

### Teknoloji Stack
- **Frontend:** Next.js 14+ (App Router)
- **UI:** shadcn/ui + Tailwind CSS
- **Backend:** Supabase (PostgreSQL + Auth + Storage + RLS)
- **Deployment:** Vercel
- **QR Generation:** Client-side (qrcode.react)

### Temel Özellikler
1. **Multi-tenant SaaS:** Her restoran izole veri
2. **Public Menu:** QR kod ile mobil menü görüntüleme
3. **Restaurant Panel:** Menü yönetimi, QR kod, istatistikler
4. **Admin Panel:** Tüm restoranları yönetme, analitik, abonelik

### Güvenlik
- Row Level Security (RLS) ile tenant izolasyonu
- Admin check function
- Input validation (Zod)
- Rate limiting
- KVKK uyumlu (IP hash)

### Performans
- ISR (Incremental Static Regeneration)
- Image optimization (Next.js Image)
- Lazy loading
- Database indexing
- Caching strategy

---

## 🚀 Hızlı Başlangıç

### 1. Database Setup
```bash
# Supabase SQL Editor'de sırayla çalıştır:
1. Helper functions (database-schema.md → Section 2)
2. Tables (database-schema.md → Section 1)
3. RLS Policies (database-schema.md → Section 3)
4. Triggers (database-schema.md → Section 4)
5. Storage (database-schema.md → Section 5)
```

### 2. Project Setup
```bash
# Next.js projesi oluştur
npx create-next-app@latest qr-menu-saas --typescript --tailwind --app

# Bağımlılıkları yükle
npm install @supabase/supabase-js @supabase/ssr
npm install zod react-hook-form @hookform/resolvers
npm install qrcode.react recharts

# shadcn/ui init
npx shadcn-ui@latest init
```

### 3. Environment Variables
```bash
# .env.local oluştur
NEXT_PUBLIC_SUPABASE_URL=your-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
IP_HASH_SALT=random-salt
```

### 4. Development
```bash
# Implementation Roadmap'i takip et
# Faz 1'den başla: Foundation
# Her fazı tamamla ve test et
# Sonraki faza geç
```

---

## 📊 Proje Metrikleri

### Geliştirme Süresi
- **MVP:** 21-30 gün (tek geliştirici)
- **Faz 1-2:** 4-6 gün (Foundation + Auth)
- **Faz 3-4:** 8-11 gün (Public Menu + Restaurant Panel)
- **Faz 5-6:** 7-9 gün (Admin Panel + Polish)
- **Faz 7-8:** 2-4 gün (Deployment + Docs)

### Kod Metrikleri (Tahmini)
- **Toplam Dosya:** ~150-200 dosya
- **Toplam Satır:** ~15,000-20,000 LOC
- **Component:** ~50-70 component
- **Server Action:** ~20-30 action
- **API Route:** ~5-10 route

### Database Metrikleri
- **Tablo:** 7 tablo
- **RLS Policy:** ~30 policy
- **Function:** 4 function
- **Trigger:** 3 trigger
- **Index:** ~20 index

---

## ✅ Kabul Kriterleri

### Functional
- [x] Restoran kayıt ve slug oluşturma
- [x] Kategori/Ürün CRUD
- [x] Public menü görüntüleme
- [x] QR kod oluşturma ve indirme
- [x] Scan event tracking
- [x] Admin panel (restaurant list, detail)
- [x] Tenant izolasyonu

### Non-Functional
- [x] Public menü < 2s yükleme
- [x] Mobile-first responsive
- [x] RLS policies aktif
- [x] KVKK uyumlu
- [x] SEO optimize
- [x] Error handling
- [x] Vercel deploy

---

## 🔐 Güvenlik Kontrol Listesi

- [ ] RLS tüm tablolarda aktif
- [ ] Admin check function SECURITY DEFINER
- [ ] Scan events sadece service role ile yazılabilir
- [ ] Storage policies owner bazlı
- [ ] Input validation (Zod)
- [ ] Rate limiting aktif
- [ ] IP hash (raw IP saklanmıyor)
- [ ] Environment variables güvenli
- [ ] HTTPS zorunlu (production)
- [ ] SQL injection koruması (Supabase client)

---

## 📚 Ek Kaynaklar

### Dokümantasyon
- [Next.js 14 Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [shadcn/ui Docs](https://ui.shadcn.com)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)

### Öğrenme Kaynakları
- [Next.js App Router Tutorial](https://nextjs.org/learn)
- [Supabase Auth with Next.js](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)

---

## 🤝 Katkıda Bulunma

Bu planlama dokümanları, projenin başarılı bir şekilde geliştirilmesi için hazırlanmıştır. Geliştirme sırasında:

1. Her fazı sırayla tamamlayın
2. Her adımı test edin
3. Sorun yaşarsanız ilgili dokümanı kontrol edin
4. Gerekirse planı güncelleyin

---

## 📞 Destek

Sorularınız için:
- Architecture Plan → Mimari kararlar
- Database Schema → Database sorunları
- Implementation Roadmap → Geliştirme sırası
- Technical Specifications → Kod detayları

---

**Son Güncelleme:** 2025-12-23
**Versiyon:** 1.0.0
**Durum:** ✅ Planlama Tamamlandı - Geliştirmeye Hazır