# Cloudflare Workers'a Deploy (Vercel'den geçiş)

Proje `@opennextjs/cloudflare` adaptörü ile Cloudflare Workers üzerinde çalışır.
Supabase (DB, Auth, Storage) değişmedi; sadece hosting değişti.

## Neler değişti

| Vercel | Cloudflare |
|---|---|
| Next.js 14 | **Next.js 15.5** (adaptör Next 14'ü artık desteklemiyor). `params`/`searchParams` artık `Promise` → codemod ile güncellendi |
| `vercel.json` header'ları | `public/_headers` (statik asset cache) |
| Vercel image optimization | Cloudflare Images (`IMAGES` binding) |
| ISR cache | Statik asset cache (SSG/blog sayfaları). Restoran sayfaları zaten dinamik; ISR sayfası yok, R2/D1 gerekmiyor |
| Vercel Cron / harici cron | Cloudflare Cron Trigger (`wrangler.jsonc > triggers.crons`, her 15 dk) → `custom-worker.ts` içindeki `scheduled` handler `/api/cron/integration-jobs`'u çağırır |
| Vercel env vars | Build: `NEXT_PUBLIC_*` · Runtime: `wrangler secret put` |

Yeni dosyalar: `wrangler.jsonc`, `open-next.config.ts`, `custom-worker.ts`, `public/_headers`, `.dev.vars.example`.

## Plan notu

Workers **Free** planında istek başına CPU limiti 10 ms; Next.js SSR sayfaları
(panel, restoran menüsü) bunu aşabilir. Canlı kullanım için **Workers Paid
($5/ay)** önerilir. Worker paketi ~2 MB (gzip), her iki planın limitinin altında.

## 1. Lokal hazırlık (bir kez)

```bash
git checkout cloudflare-migration
rm -rf node_modules .next
npm install                # Next 15 + React 19 + wrangler gelir
npx wrangler login         # tarayıcıda Cloudflare hesabına giriş
```

## 2. Cloudflare Images

Dashboard → **Images** bölümünün hesapta aktif olduğundan emin ol
(aylık 5.000 benzersiz dönüşüm ücretsiz).

## 3. Gizli değişkenler (runtime)

```bash
npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY
npx wrangler secret put INTEGRATION_SECRET_KEY   # ⚠️ Vercel'deki ile AYNI olmalı
npx wrangler secret put CRON_SECRET
```

> `INTEGRATION_SECRET_KEY` değişirse veritabanındaki şifreli platform
> credential'ları (Yemeksepeti, Trendyol Go...) çözülemez. Vercel'den birebir kopyala.

İlk `secret put` worker henüz yoksa onu oluşturmayı önerir; "yes" de.

## 4. Build-time değişkenler (`NEXT_PUBLIC_*`)

`NEXT_PUBLIC_*` değerleri **build sırasında koda gömülür**. `.env.local`
içinde `NEXT_PUBLIC_SITE_URL=http://localhost:3000` olduğu için lokalden
deploy ederken bunu komut satırında ezmek gerekir (shell env, `.env.local`'ı ezer):

```bash
NEXT_PUBLIC_SITE_URL=https://www.qrmenulist.com npm run deploy
```

`NEXT_PUBLIC_SUPABASE_URL` ve `NEXT_PUBLIC_SUPABASE_ANON_KEY` `.env.local`'dan
okunur (production Supabase değerleri olduklarından emin ol).

## 5. Deploy

```bash
NEXT_PUBLIC_SITE_URL=https://www.qrmenulist.com npm run deploy
```

Bu komut: Next build → OpenNext bundle → statik sayfa cache'ini assets'e koyar → worker'ı yükler.
İlk sonuç `https://qrmenulist.<hesap>.workers.dev` adresinde olur. **Domain'i
bağlamadan önce burada test et**: ana sayfa, giriş, panel, bir restoran menüsü,
görsel yükleme, QR indirme, sipariş.

Lokal Workers ortamında denemek için: `.dev.vars.example` → `.dev.vars` kopyala, `npm run preview`.

## 6. Domain'i Cloudflare'e bağla (DNS zaten Cloudflare'de)

1. Dashboard → DNS: `www` ve `@` için Vercel'i gösteren kayıtları (`cname.vercel-dns.com`, `76.76.21.21`) **sil**.
2. Workers & Pages → `qrmenulist` → Settings → **Domains & Routes** → Add → Custom domain:
   `www.qrmenulist.com` ve `qrmenulist.com`.
3. Apex → www yönlendirmesi Vercel'de yapılıyorduysa: Rules → **Redirect Rules** →
   `qrmenulist.com/*` → `https://www.qrmenulist.com/${1}` (301).
4. SSL/TLS modu **Full (strict)** olsun.

Domain aynı kaldığı için Supabase Auth URL ayarlarında değişiklik gerekmez.

## 7. Geçiş sonrası

- Cron: Workers → `qrmenulist` → Settings → Triggers bölümünde `*/15 * * * *` görünmeli;
  log'larda `[cron] integration-jobs ok` satırları çıkar. Endpoint'i harici bir servis
  (cron-job.org vb.) çağırıyorduysa onu kapat, iş iki kez çalışmasın.
- Yemeksepeti webhook URL'i aynı domain olduğu için değişmez.
- Birkaç gün sorunsuz çalıştıktan sonra Vercel projesini sil.

## Geri dönüş

DNS kayıtlarını tekrar Vercel'e yönlendirmek yeterli (Vercel projesi silinmediyse).
Worker'da önceki sürüme dönmek için: `npx wrangler rollback`.

## Otomatik deploy (opsiyonel)

Workers & Pages → `qrmenulist` → Settings → **Builds** → GitHub repo'yu bağla.
Build command: `npx opennextjs-cloudflare build` · Deploy command: `npx opennextjs-cloudflare deploy`.
Build variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SITE_URL`.
