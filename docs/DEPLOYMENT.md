# Deployment Guide - Vercel

Bu dokümanda projenin Vercel'e deploy edilmesi adım adım açıklanmaktadır.

## 1. Ön Hazırlık

### Gereksinimler
- GitHub hesabı
- Vercel hesabı
- Supabase projesi (production)

### Repository Hazırlığı
```bash
# Git repository oluştur
git init
git add .
git commit -m "Initial commit"

# GitHub'a push et
git remote add origin https://github.com/username/restorant-qrmenu.git
git branch -M main
git push -u origin main
```

## 2. Supabase Production Setup

### 2.1. Yeni Proje Oluştur
1. [Supabase Dashboard](https://app.supabase.com) → New Project
2. Proje adı: `restorant-qrmenu-prod`
3. Database password: Güçlü bir şifre seç
4. Region: Europe (Frankfurt) - en yakın bölge
5. Create Project

### 2.2. Database Migration
```bash
# Supabase CLI ile migration'ları uygula
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push
```

Alternatif: SQL Editor'den manuel olarak:
1. SQL Editor → New Query
2. Her migration dosyasını sırayla çalıştır:
   - `001_initial_schema.sql`
   - `002_rls_policies.sql`
   - `003_triggers_and_functions.sql`
   - `004_storage_setup.sql`
   - `005_fix_subscription_trigger.sql`
   - `006_fix_scan_events_rls.sql`
   - `007_add_category_image.sql`
   - `008_add_category_product_buckets.sql`
   - `009_add_product_featured.sql`
   - `010_add_is_admin_function.sql`
   - `011_add_featured_index.sql`

### 2.3. Storage Buckets
Storage → Create Bucket:
1. `restaurant-images` (public)
2. `category-images` (public)
3. `product-images` (public)

Her bucket için RLS policies ekle (migration 004, 008'de var)

### 2.4. Auth Settings
Authentication → Settings:
- Site URL: `https://your-domain.vercel.app`
- Redirect URLs: `https://your-domain.vercel.app/**`
- Email confirmation: Production'da enable et
- Email templates: Customize et (opsiyonel)

### 2.5. API Keys
Settings → API:
- Project URL: `https://xxx.supabase.co`
- Anon/Public key: `eyJhbGc...`
- Service role key: **GİZLİ TUT** (sadece server-side)

## 3. Vercel Deployment

### 3.1. Vercel'e Import
1. [Vercel Dashboard](https://vercel.com) → Add New → Project
2. Import Git Repository → GitHub'dan seç
3. Repository: `restorant-qrmenu`
4. Framework Preset: Next.js (otomatik algılanır)

### 3.2. Environment Variables
Environment Variables ekle:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...

# Site URL
NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app
```

**ÖNEMLİ**: Production Supabase credentials kullan!

### 3.3. Build Settings
- Build Command: `npm run build` (default)
- Output Directory: `.next` (default)
- Install Command: `npm install` (default)
- Node Version: 18.x veya 20.x

### 3.4. Deploy
1. Deploy → Deploy
2. İlk deployment 2-3 dakika sürer
3. Deployment tamamlandığında URL verilir

## 4. Domain Configuration

### 4.1. Custom Domain (Opsiyonel)
Vercel Dashboard → Settings → Domains:
1. Add Domain: `qrmenu.com`
2. DNS ayarlarını yap:
   - A Record: `76.76.21.21`
   - CNAME: `cname.vercel-dns.com`
3. SSL otomatik aktif olur

### 4.2. Supabase URL Güncelleme
Domain değiştiyse Supabase'de güncelle:
- Auth → URL Configuration
- Site URL: `https://qrmenu.com`
- Redirect URLs: `https://qrmenu.com/**`

## 5. Post-Deployment

### 5.1. İlk Admin Kullanıcı
```sql
-- Supabase SQL Editor
-- Önce kullanıcı kaydı yap (UI'dan)
-- Sonra admin yap:
INSERT INTO admin_users (user_id)
VALUES ('USER_UUID_FROM_AUTH_USERS');
```

### 5.2. Test Restaurant
1. Kayıt ol → Restoran oluştur
2. Kategori ve ürün ekle
3. Public menüyü test et
4. QR kod indir ve test et

### 5.3. Monitoring Setup

#### Vercel Analytics
1. Vercel Dashboard → Analytics → Enable
2. Core Web Vitals otomatik izlenir
3. Real User Monitoring aktif

#### Supabase Monitoring
1. Supabase Dashboard → Database → Performance
2. Query performance izle
3. Connection pooling kontrol et

## 6. Environment-Specific Configuration

### Development
```env
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=local-dev-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Staging (Opsiyonel)
```env
NEXT_PUBLIC_SUPABASE_URL=https://staging.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=staging-key
NEXT_PUBLIC_SITE_URL=https://staging.vercel.app
```

### Production
```env
NEXT_PUBLIC_SUPABASE_URL=https://prod.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=prod-key
NEXT_PUBLIC_SITE_URL=https://qrmenu.com
```

## 7. CI/CD Pipeline

### Automatic Deployments
Vercel otomatik olarak:
- `main` branch → Production
- `develop` branch → Preview (opsiyonel)
- Pull Requests → Preview

### Manual Deployment
```bash
# Vercel CLI ile
npm i -g vercel
vercel --prod
```

## 8. Performance Optimization

### Vercel Settings
1. Analytics → Enable
2. Speed Insights → Enable
3. Edge Config → Configure (opsiyonel)

### Caching
`vercel.json` zaten yapılandırılmış:
- Public menu: 5 dakika ISR
- Images: 1 yıl cache
- Static assets: 1 yıl cache

## 9. Security Checklist

### Pre-Deployment
- [x] Environment variables güvenli
- [x] API keys production
- [x] RLS policies aktif
- [x] HTTPS enforced
- [x] CORS configured

### Post-Deployment
- [ ] Security headers test et
- [ ] SSL certificate kontrol et
- [ ] Rate limiting test et (opsiyonel)
- [ ] Vulnerability scan (Vercel otomatik)

## 10. Troubleshooting

### Build Errors
```bash
# Local'de build test et
npm run build

# Logs kontrol et
vercel logs
```

### Runtime Errors
1. Vercel Dashboard → Logs
2. Supabase Dashboard → Logs
3. Browser Console

### Database Issues
1. Supabase → Database → Logs
2. RLS policies kontrol et
3. Migration status kontrol et

### Common Issues

#### Issue 1: "Bucket not found"
**Çözüm**: Storage buckets oluştur ve RLS policies ekle

#### Issue 2: "Invalid API key"
**Çözüm**: Environment variables kontrol et (production keys)

#### Issue 3: "Unauthorized"
**Çözüm**: RLS policies ve auth kontrol et

#### Issue 4: "Build failed"
**Çözüm**: Dependencies ve TypeScript errors kontrol et

## 11. Rollback Strategy

### Vercel Rollback
1. Deployments → Previous deployment
2. Promote to Production

### Database Rollback
```bash
# Migration geri al
npx supabase db reset
npx supabase db push
```

## 12. Monitoring & Alerts

### Vercel Monitoring
- Deployment status
- Build logs
- Runtime logs
- Analytics

### Supabase Monitoring
- Database performance
- API usage
- Storage usage
- Auth events

### Custom Alerts (Opsiyonel)
- Sentry for error tracking
- Uptime monitoring (UptimeRobot)
- Performance monitoring (Lighthouse CI)

## 13. Backup Strategy

### Database Backup
Supabase otomatik backup:
- Daily backups (7 gün)
- Point-in-time recovery (Pro plan)

Manuel backup:
```bash
# pg_dump ile
pg_dump -h db.xxx.supabase.co -U postgres > backup.sql
```

### Storage Backup
- Supabase Storage otomatik replicate
- Manuel: Download all files

## 14. Scaling Considerations

### Vercel
- Otomatik scaling
- Edge network
- Serverless functions

### Supabase
- Connection pooling
- Read replicas (Pro plan)
- Database optimization

## 15. Cost Estimation

### Vercel
- Hobby: $0/month (personal projects)
- Pro: $20/month (commercial)

### Supabase
- Free: $0/month (2 projects, 500MB DB)
- Pro: $25/month (unlimited projects, 8GB DB)

### Total
- MVP: $0-45/month
- Production: $45-100/month

## 16. Post-Launch Checklist

- [ ] Domain configured
- [ ] SSL active
- [ ] Analytics enabled
- [ ] Monitoring setup
- [ ] Backup strategy
- [ ] Admin user created
- [ ] Test restaurant created
- [ ] Documentation updated
- [ ] Team access configured
- [ ] Support email setup