# QRMenuList → Çok Kanallı Sipariş & Stok Platformu — Mimari Plan

Onay tarihi: 2026-09-25. Kaynak analiz: 21 migration, canlı Supabase şeması, server action'lar, sepet/WhatsApp kodu, Trendyol Go (developers.tgoapps.com) ve Yemeksepeti (developer.yemeksepeti.com) resmi dokümantasyonu.

Hedef: mevcut müşterileri bozmadan QR Menü + WhatsApp Sipariş + Trendyol Yemek + Yemeksepeti + tek sipariş paneli + merkezi ürün/stok + ürün eşleştirme + çoklu şube + multi-tenant SaaS.

## A. Mevcut mimari (özet)

- Next.js 14 App Router, TypeScript, Tailwind, Supabase (Postgres/Auth/Storage), Vercel. Backend = server actions. Queue/worker/Realtime yok.
- Auth: Supabase e-posta/şifre. Roller: restoran sahibi (`restaurants.owner_user_id`) ve süper admin (`admin_users`). Admin impersonation cookie'si imzasız; RLS son savunma.
- Kullanıcı ↔ restoran 1:1 (kodda `maybeSingle`). Tenant kavramı yoktu.
- Tablolar: restaurants, categories, products, subscriptions, payments, scan_events, reviews, admin_users.
- WhatsApp: `ordering_enabled` + `whatsapp`; sepet localStorage; "Sepeti Onayla" = düz wa.me linki, sunucuya istek yok, sipariş kaydı yok.
- RLS: owner / is_admin / public aktif kayıt; politikalar permissive (OR).
- DDL Supabase Dashboard SQL Editor ile uygulanır (CLI link yok).
- Tespit edilen hata: admin ürün formu `is_available` kolonuna yazıyor, kolon yok (Faz 5'te kolon eklenince düzelir).

## B. Ürün modeli

- `products.restaurant_id` zorunlu; kategori aynı restorana ait (trigger). Restoranlar arası izole.
- Yalnızca `is_active`; stok/SKU/"tükendi" yok; tek fiyat.

## C. Tenant mimarisi (Faz 1 — uygulandı)

- Restaurant = şube. `tenants`, `tenant_users` (owner/admin/accountant), `restaurant_users` (branch_manager/staff/kitchen), `restaurants.tenant_id`.
- `owner_user_id` kalır; backfill 1 tenant/sahip; `ensure_restaurant_tenant` trigger'ı yeni restoranlara otomatik tenant.
- SQL: `restaurant_role()`, `has_restaurant_access()`, `has_restaurant_role()`; ek RLS politikaları (mevcutlar aynen).
- Sunucu: `lib/auth/restaurant-context.ts` tek erişim noktası; aktif şube cookie'si her istekte üyelikle doğrulanır; impersonation yalnızca süper admin için.
- `restaurant_features(restaurant_id, feature_key, enabled, config)`; `whatsapp_order` kaynağı `ordering_enabled` kolonu olarak kalır; `lib/features.ts` birleştirir.
- Abonelik restoran bazlı kalır.

## D. Ürün mimarisi (Faz 4–5)

- Master ürün = `products`. Yeni kolonlar: is_available, track_stock, stock_quantity, sku, availability_manual_override.
- `integrations` (restoran+platform; credentials AES-GCM ciphertext, anahtar env).
- `external_products` (platform snapshot, yerel ürüne yazmaz).
- `product_channel_links` (mapping + use_master_price + price_override; üç kaydın restaurant_id eşitliği trigger ile).
- `inventory_transactions` ledger + `apply_inventory_transaction()` (FOR UPDATE, unique idempotency_key). Stok 0 → is_available=false; >0 ve manuel engel yoksa true.

## E. Migration planı

| No | İçerik | Durum |
|---|---|---|
| 022 | tenants, tenant_users, restaurant_users, restaurants.tenant_id, backfill, trigger, rol fonksiyonları, ek RLS | yazıldı |
| 023 | restaurant_features + RLS | yazıldı |
| 024 | integrations, integration_jobs, integration_events (credential kolonu yalnızca service role) | yazıldı |
| 025 | orders, order_items, restaurant_order_counters, create_public_order() RPC, Realtime publication | Faz 2 |
| 026 | external_products, product_channel_links (restoran eşitliği trigger ile; yazma yalnızca service role) | yazıldı |
| 027 | products stok kolonları, inventory_transactions, apply/deduct/restore fonksiyonları, set_product_availability | yazıldı |
| 028 | restore_order_stock: yalnızca gerçekten düşülen miktarı iade eder (düzeltme) | yazıldı |
| 029 | service_role fonksiyon yetkileri (Faz 6) | yazıldı |

Geri alma: `supabase/rollback/`.

## F. Geriye uyumluluk

- QR-only: public sayfa yalnızca "Tükendi" rozeti için değişir (varsayılan true). URL, slug, QR, ISR, abonelik, login değişmez. Feature yoksa panel menüsüne öğe eklenmez.
- WhatsApp: `ordering_enabled` ve admin toggle aynı. Onay butonu önce sipariş kaydeder, sipariş numarasını mesaja ekler, sonra aynı wa.me linkini açar. Sunucu hatası WhatsApp'ı engellemez. Fiyatlar DB'den yeniden hesaplanır.
- Stok düşme: QR siparişte varsayılan "Kabul Et" anında (`direct_order` config `stock_deduct_on: accept | create`).

## G. Entegrasyon (doğrulanmış)

### Trendyol Yemek = Uber Eats Trendyol Go (developers.tgoapps.com)
- Prod `https://api.tgoapis.com`, stage `https://stageapi.tgoapis.com`. Basic Auth (API Key:Secret), supplierId başına tek anahtar, şubeler ortak. Header: `User-Agent: "{supplierId} - SelfIntegration"`, `x-agentname`, `x-executor-user`. Limit 50 istek / 10 sn / endpoint. Stage IP izni.
- Sipariş: `GET /integrator/order/meal/suppliers/{supplierId}/packages` (storeId, packageStatuses, packageModificationStartDate/EndDate, page, size≤50); `/packages/{packageId}`.
- Kabul `PUT .../packages/picked` {packageId, preparationTime}; hazır `PUT .../packages/invoiced`; iptal `PUT .../packages/unsupplied` {packageId, itemIdList, reasonId}; kendi kurye: `.../packages/{id}/manual-shipped`, `/manual-delivered`.
- Menü `GET /integrator/product/meal/suppliers/{supplierId}/stores/{storeId}/products`; ürün durumu `PUT .../stores/{storeId}/products/{productId}/status` {ACTIVE|PASSIVE}; fiyat `POST .../suppliers/{supplierId}/products/price` (restaurantId, productId, sellingPrice) → batchRequestId; `GET .../batch-requests/{id}`.
- Mağaza `PUT /integrator/store/meal/suppliers/{supplierId}/stores/{storeId}/status` {OPEN|CLOSED}; `GET .../stores`.
- YOK: ürün oluşturma, stok adedi. DOĞRULANMADI: Yemek için webhook (yalnızca Hızlı Market'te belgeli) → polling.
- Statüler: Created, Picking, Invoiced, Shipped, Delivered, Cancelled, UnSupplied. `appName=Galaxy` = GetirYemek by Uber Eats.

### Yemeksepeti (Delivery Hero Partner API)
- Token `POST https://yemeksepeti.partner.deliveryhero.io/v2/oauth/token` (client_id/secret, 2 saat, Bearer). Kimlik: chain_id, vendor_id.
- Sipariş: webhook zorunlu (RECEIVED, READY_FOR_PICKUP, DISPATCHED, CANCELLED, DELIVERED); `PUT/GET /v2/chains/{chain_id}/orders/{order_id}`; `GET /v2/chains/{chain_id}/vendors/{vendor_id}`.
- Katalog: `GET /catalog`, `GET /categories`, `PUT /catalog` (sku, price, active, quantity, maximum_sales_quantity), `POST /catalog` (DH ekibi onaylı), `POST /catalog/export`, `GET /catalog/jobs/{id}`.
- Mağaza: `PUT/GET /v2/chains/{chain_id}/status` (OPEN, CLOSED_TODAY, CLOSED_UNTIL).
- UYARI: Bu API "Local Shops" (Partner Picking) programına ait. Restoran hesapları için DH'nin ayrı POS middleware'i vardır. Müşterinin programı Account Manager'dan teyit edilecek (Faz 6 öncesi).

Capability bayrakları: supportsProductCreate (TY false, YS manuel onaylı), supportsStockQuantity (TY false, YS true), supportsWebhook (TY false, YS true), supportsOrderAccept (TY true, YS false), supportsManualShip (TY koşullu).

## H. Fazlar

1. Multi-tenant, roller, feature, RLS, ESLint + vitest — **uygulandı**
2. orders/order_items, QR siparişinin DB'ye kaydı, WhatsApp korunur, sipariş ekranı
3. integrations, adapter/capability, credential UI, health, cron job runner
4. platform ürün import, external_products, eşleştirme UI, isim/SKU önerisi (asla otomatik)
5. merkezi stok, ledger, availability, kanal fiyatı, public "Tükendi"
6. gerçek Trendyol Go ve Yemeksepeti adapter'ları (yalnızca doğrulanmış endpoint'ler)
7. Realtime, raporlar, süper admin özet, monitoring

Her faz sonunda: `npm run typecheck`, `npm run build`, `npm run lint`, `npm test`, Type A/B manuel doğrulama.

## I. Riskler ve önlemler

- Tenant sızıntısı: her yeni tablo tenant_id+restaurant_id; RLS has_restaurant_access; istemci id'sine güvenilmez.
- Ürün karışması: mapping trigger'ı (restaurant_id eşitliği), unique kısıtlar, öneri yalnızca aynı restoran.
- Çift stok düşümü: ledger + unique idempotency_key + satır kilidi.
- Duplicate sipariş/webhook: unique (integration_id, external_order_id), integration_events unique event_key.
- İptal iadesi: yalnızca deduct kaydı varsa ve restore yoksa.
- Secret ifşası: ciphertext DB, anahtar env, UI maskeli, loglarda yok.
- WhatsApp akışı: sunucu hatası akışı kesmez; popup engeli için pencere senkron açılır.
- Platform kısmi hata: merkezi durum önce yazılır, job'lar platform başına, "Tekrar Dene".
- Rate limit: supplier başına tek polling, 60 sn.
