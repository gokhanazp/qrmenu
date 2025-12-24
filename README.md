# 🍽️ QR Menü SaaS - Restoranlar için Dijital Menü Sistemi

Modern, hızlı ve kullanıcı dostu bir QR menü çözümü. Restoranlar için multi-tenant SaaS platformu.

## 📋 İçindekiler

- [Özellikler](#-özellikler)
- [Teknoloji Stack](#-teknoloji-stack)
- [Kurulum](#-kurulum)
- [Kullanım](#-kullanım)
- [Deployment](#-deployment)
- [Dokümantasyon](#-dokümantasyon)
- [Lisans](#-lisans)

## ✨ Özellikler

### 🏪 Restoran Paneli
- ✅ Menü yönetimi (kategori ve ürünler)
- ✅ QR kod oluşturma ve indirme
- ✅ Görsel yükleme (logo, banner, ürün fotoğrafları)
- ✅ Öne çıkan ürünler
- ✅ Sıralama ve aktif/pasif yönetimi
- ✅ Restoran ayarları (slug, slogan, vb.)

### 📱 Public Menü
- ✅ Mobil-first responsive tasarım
- ✅ QR kod ile hızlı erişim
- ✅ Kategori bazlı gezinme
- ✅ Öne çıkan ürünler bölümü
- ✅ Premium dark mode tasarım
- ✅ SEO optimize

### 👨‍💼 Admin Paneli
- ✅ Tüm restoranları yönetme
- ✅ Scan istatistikleri ve analytics
- ✅ Abonelik yönetimi
- ✅ Trend grafikleri
- ✅ Restoran detay görünümü

### 🔒 Güvenlik
- ✅ Multi-tenant veri izolasyonu
- ✅ Row Level Security (RLS)
- ✅ Email/Password authentication
- ✅ Role-based access control
- ✅ Secure file uploads

### ⚡ Performance
- ✅ Next.js 14 App Router
- ✅ ISR (Incremental Static Regeneration)
- ✅ Image optimization (WebP, AVIF)
- ✅ CDN caching
- ✅ Database indexing

## 🛠️ Teknoloji Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn UI
- **Icons**: Material Symbols

### Backend
- **Database**: PostgreSQL (Supabase)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **API**: Next.js Server Actions

### Deployment
- **Hosting**: Vercel
- **Database**: Supabase Cloud
- **CDN**: Vercel Edge Network

## 🚀 Kurulum

### Gereksinimler
- Node.js 18+ veya 20+
- npm veya yarn
- Supabase hesabı

### 1. Repository'yi Clone'la
```bash
git clone https://github.com/username/restorant-qrmenu.git
cd restorant-qrmenu
```

### 2. Dependencies'i Yükle
```bash
npm install
```

### 3. Environment Variables
`.env.local` dosyası oluştur:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 4. Supabase Setup
1. [Supabase](https://supabase.com) hesabı oluştur
2. Yeni proje oluştur
3. SQL Editor'den migration'ları çalıştır:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_rls_policies.sql`
   - `supabase/migrations/003_triggers_and_functions.sql`
   - `supabase/migrations/004_storage_setup.sql`
   - Diğer migration dosyaları...

4. Storage buckets oluştur:
   - `restaurant-images` (public)
   - `category-images` (public)
   - `product-images` (public)

5. Auth ayarları:
   - Email confirmation: Disable (development)
   - Site URL: `http://localhost:3000`

### 5. Development Server'ı Başlat
```bash
npm run dev
```

Tarayıcıda aç: [http://localhost:3000](http://localhost:3000)

## 📖 Kullanım

### Restoran Sahibi Olarak

1. **Kayıt Ol**: `/auth/register`
   - Email ve şifre ile kayıt ol
   - Restoran adı ve slug otomatik oluşturulur

2. **Giriş Yap**: `/auth/login`
   - Email ve şifre ile giriş yap

3. **Dashboard**: `/panel`
   - QR kod görüntüle ve indir
   - Hızlı istatistikler

4. **Restoran Ayarları**: `/panel/settings`
   - Logo ve banner yükle
   - Slogan ekle
   - Slug güncelle

5. **Kategori Yönetimi**: `/panel/categories`
   - Yeni kategori ekle
   - Kategori görseli yükle
   - Sıralama ve aktif/pasif

6. **Ürün Yönetimi**: `/panel/products`
   - Yeni ürün ekle
   - Ürün görseli yükle
   - Öne çıkan ürün işaretle
   - Kategori ata

### Admin Olarak

1. **Admin Kullanıcı Oluştur**:
```sql
-- Supabase SQL Editor
INSERT INTO admin_users (user_id)
VALUES ('USER_UUID_FROM_AUTH_USERS');
```

2. **Admin Panel**: `/admin`
   - Tüm restoranları listele
   - Filtrele ve ara
   - Detaylı istatistikler

3. **Restoran Detay**: `/admin/restaurants/[id]`
   - Scan trend grafiği
   - Abonelik yönetimi
   - Plan güncelleme

### Müşteri Olarak

1. **QR Kod Tara**: Restoran QR kodunu tara
2. **Menü Görüntüle**: `/restorant/[slug]`
   - Kategorileri gör
   - Öne çıkan ürünleri gör
3. **Kategori Detay**: `/restorant/[slug]/category/[id]`
   - Kategori ürünlerini gör

## 🌐 Deployment

### Vercel'e Deploy

1. **GitHub'a Push**:
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

2. **Vercel'e Import**:
   - [Vercel Dashboard](https://vercel.com) → New Project
   - GitHub repository'yi seç
   - Environment variables ekle
   - Deploy

3. **Production Supabase**:
   - Production Supabase projesi oluştur
   - Migration'ları çalıştır
   - Environment variables güncelle

Detaylı deployment guide: [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)

## 📚 Dokümantasyon

### Planlama Dokümanları
- [Architecture Plan](plans/architecture-plan.md) - Sistem mimarisi
- [Database Schema](plans/database-schema.md) - Veritabanı şeması
- [Technical Specifications](plans/technical-specifications.md) - Teknik detaylar
- [Implementation Roadmap](plans/implementation-roadmap.md) - Geliştirme yol haritası

### Teknik Dokümanlar
- [Performance Guide](docs/PERFORMANCE.md) - Performans optimizasyonları
- [Testing Guide](docs/TESTING.md) - Test ve güvenlik
- [Deployment Guide](docs/DEPLOYMENT.md) - Deployment adımları

## 🏗️ Proje Yapısı

```
restorant-qrmenu/
├── app/                      # Next.js App Router
│   ├── actions/             # Server Actions
│   ├── admin/               # Admin Panel
│   ├── auth/                # Authentication
│   ├── panel/               # Restaurant Panel
│   ├── restorant/           # Public Menu
│   └── layout.tsx           # Root Layout
├── components/              # React Components
│   ├── ui/                  # Shadcn UI Components
│   └── ...                  # Custom Components
├── lib/                     # Utilities
│   ├── supabase/           # Supabase Clients
│   └── utils/              # Helper Functions
├── supabase/               # Supabase Configuration
│   └── migrations/         # Database Migrations
├── docs/                   # Documentation
├── plans/                  # Planning Documents
└── public/                 # Static Assets
```

## 🔑 Önemli Özellikler

### Multi-tenant Architecture
Her restoran kendi verisine sahip, diğer restoranların verisini göremez. Row Level Security (RLS) ile garanti edilir.

### Slug System
Türkçe karakter desteği ile SEO-friendly URL'ler:
- `Şık Restoran` → `sik-restoran`
- Otomatik uniqueness kontrolü
- Güncelleme desteği

### Image Upload
- Format: JPG, PNG, WebP
- Max size: 5MB
- Automatic optimization
- CDN delivery

### QR Code Generation
- Dynamic QR codes
- PNG download
- High resolution
- Custom branding

### Analytics
- Scan tracking
- Daily/weekly/monthly stats
- Trend charts
- Restaurant comparison

## 🧪 Testing

### Manual Testing
Test checklist: [docs/TESTING.md](docs/TESTING.md)

### Security Testing
- RLS policies test
- Multi-tenant isolation
- Authentication flow
- Authorization checks

## 🐛 Bilinen Sorunlar

1. Email confirmation development'ta disabled
2. Scan event rate limiting yok
3. Automated tests yok (manual testing)

## 🚧 Gelecek Özellikler

### Phase 2
- [ ] Stripe payment integration
- [ ] Email notifications
- [ ] Advanced analytics
- [ ] Multi-language support
- [ ] Dark/Light mode toggle

### Phase 3
- [ ] Mobile app (React Native)
- [ ] Table ordering
- [ ] Kitchen display system
- [ ] Inventory management
- [ ] Customer reviews

## 🤝 Katkıda Bulunma

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📝 Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakın.

## 👥 İletişim

- **Email**: support@qrmenu.com
- **Website**: https://qrmenu.com
- **GitHub**: https://github.com/username/restorant-qrmenu

## 🙏 Teşekkürler

- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.com/)
- [Vercel](https://vercel.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Shadcn UI](https://ui.shadcn.com/)

---

Made with ❤️ for restaurants