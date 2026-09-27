'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { isMissingSchemaError, resolveRestaurantContext } from '@/lib/auth/restaurant-context'
import { CONTENT_MANAGER_ROLES, roleIn } from '@/lib/auth/roles'
import { hasFeature, isFeatureKey } from '@/lib/features'
import { PLATFORM_CAPABILITIES } from '@/lib/integrations/capabilities'
import { isMarketplacePlatform } from '@/lib/integrations/credentials'
import { toSafeErrorMessage } from '@/lib/integrations/errors'
import { exactNameMatches, primaryCategoryName, suggestMatches, type ExactMatchPair, type MatchSuggestion } from '@/lib/integrations/matching'
import { createAdapter } from '@/lib/integrations/registry'
import { getResolvedIntegrationByRestaurant, integrationServiceClient } from '@/lib/integrations/service'
import { syncProductPrice, type ChannelSyncResult } from '@/lib/inventory/sync'
import { AVAILABLE_PLATFORMS, PLATFORM_LABELS, type HealthStatus, type MarketplacePlatform } from '@/lib/integrations/types'

// eslint-disable-next-line
type Row = Record<string, any>

export interface PlatformSummary {
  platform: MarketplacePlatform
  label: string
  featureEnabled: boolean
  connected: boolean
  integrationId: string | null
  healthStatus: HealthStatus | null
  lastSyncedAt: string | null
  supportsProductRead: boolean
  supportsProductCreate: boolean
  total: number
  mapped: number
  unmapped: number
}

export interface ExternalProductView {
  id: string
  platform: MarketplacePlatform
  integrationId: string
  externalProductId: string
  externalSku: string | null
  name: string
  price: number | null
  available: boolean
  category: string | null
  imageUrl: string | null
  source: 'sync' | 'manual'
  lastSyncedAt: string | null
  linkId: string | null
  localProductId: string | null
  suggestions: (MatchSuggestion & { localName: string; localPrice: number })[]
}

export interface LocalProductView {
  id: string
  name: string
  price: number
  imageUrl: string | null
  isActive: boolean
  categoryName: string | null
  channels: Partial<Record<MarketplacePlatform, { linkId: string; externalName: string; externalPrice: number | null; available: boolean; externalProductId: string; useMasterPrice: boolean; priceOverride: number | null; syncedPrice: number | null; lastPriceSyncOk: boolean | null; lastPriceSyncError: string | null; lastPriceSyncAt: string | null }>>
}

export interface PlatformProductsData {
  restaurantName: string
  canManage: boolean
  marketplaceEnabled: boolean
  schemaReady: boolean
  platforms: PlatformSummary[]
  external: ExternalProductView[]
  locals: LocalProductView[]
  categories: { id: string; name: string }[]
  error?: string
}

export async function getPlatformProductsData(): Promise<PlatformProductsData> {
  const base: PlatformProductsData = {
    restaurantName: '', canManage: false, marketplaceEnabled: false, schemaReady: true,
    platforms: [], external: [], locals: [], categories: [],
  }
  const result = await resolveRestaurantContext()
  if (!result.ok) return { ...base, error: result.error }
  const { ctx } = result
  base.restaurantName = ctx.restaurant.name
  base.canManage = roleIn(ctx.role, CONTENT_MANAGER_ROLES)
  base.marketplaceEnabled = hasFeature(ctx.features, 'marketplace')
  if (!base.marketplaceEnabled) return base

  const supabase = await createClient()
  const [integrationsRes, externalRes, linksRes, productsRes, categoriesRes] = await Promise.all([
    supabase.from('integrations').select('id, platform, status, health_status, last_successful_sync_at').eq('restaurant_id', ctx.restaurantId),
    supabase.from('external_products').select('*').eq('restaurant_id', ctx.restaurantId).order('name'),
    supabase.from('product_channel_links').select('*').eq('restaurant_id', ctx.restaurantId),
    supabase.from('products').select('id, name, price, image_url, is_active, category_id, categories(name)').eq('restaurant_id', ctx.restaurantId).order('sort_order'),
    supabase.from('categories').select('id, name').eq('restaurant_id', ctx.restaurantId).order('sort_order'),
  ])

  for (const res of [integrationsRes, externalRes, linksRes]) {
    if (res.error) {
      if (isMissingSchemaError(res.error)) return { ...base, schemaReady: false }
      return { ...base, error: res.error.message }
    }
  }

  const integrations = (integrationsRes.data || []) as Row[]
  const externalRows = (externalRes.data || []) as Row[]
  const links = (linksRes.data || []) as Row[]
  const products = (productsRes.data || []) as Row[]
  const categories = ((categoriesRes.data || []) as Row[]).map((c) => ({ id: c.id, name: c.name }))

  const linkByExternalRow = new Map<string, Row>()
  const linksByLocal = new Map<string, Row[]>()
  for (const l of links) {
    linkByExternalRow.set(l.external_product_row_id, l)
    const arr = linksByLocal.get(l.local_product_id) || []
    arr.push(l)
    linksByLocal.set(l.local_product_id, arr)
  }
  const externalById = new Map<string, Row>(externalRows.map((e) => [e.id, e]))
  const integrationById = new Map<string, Row>(integrations.map((i) => [i.id, i]))
  const localCandidates = products.map((p) => ({ id: p.id, name: p.name, sku: null }))
  const localById = new Map<string, Row>(products.map((p) => [p.id, p]))

  const external: ExternalProductView[] = externalRows.map((e) => {
    const link = linkByExternalRow.get(e.id) || null
    const suggestions = link
      ? []
      : suggestMatches({ name: e.name, sku: e.external_sku }, localCandidates).map((s) => ({
          ...s,
          localName: localById.get(s.localProductId)?.name || '',
          localPrice: Number(localById.get(s.localProductId)?.price || 0),
        }))
    return {
      id: e.id,
      platform: e.platform,
      integrationId: e.integration_id,
      externalProductId: e.external_product_id,
      externalSku: e.external_sku ?? null,
      name: e.name,
      price: e.price === null || e.price === undefined ? null : Number(e.price),
      available: Boolean(e.available),
      category: e.category ?? null,
      imageUrl: e.image_url ?? null,
      source: e.source,
      lastSyncedAt: e.last_synced_at ?? null,
      linkId: link?.id ?? null,
      localProductId: link?.local_product_id ?? null,
      suggestions,
    }
  })

  const locals: LocalProductView[] = products.map((p) => {
    const channels: LocalProductView['channels'] = {}
    for (const l of linksByLocal.get(p.id) || []) {
      const e = externalById.get(l.external_product_row_id)
      const integ = integrationById.get(l.integration_id)
      if (!e || !integ) continue
      channels[integ.platform as MarketplacePlatform] = {
        linkId: l.id,
        externalName: e.name,
        externalPrice: e.price === null || e.price === undefined ? null : Number(e.price),
        available: Boolean(e.available),
        externalProductId: e.external_product_id,
        useMasterPrice: Boolean(l.use_master_price),
        priceOverride: l.price_override === null || l.price_override === undefined ? null : Number(l.price_override),
        syncedPrice: l.synced_price === null || l.synced_price === undefined ? null : Number(l.synced_price),
        lastPriceSyncOk: l.last_price_sync_ok ?? null,
        lastPriceSyncError: l.last_price_sync_error ?? null,
        lastPriceSyncAt: l.last_price_sync_at ?? null,
      }
    }
    return {
      id: p.id,
      name: p.name,
      price: Number(p.price),
      imageUrl: p.image_url ?? null,
      isActive: Boolean(p.is_active),
      categoryName: (p.categories as Row | null)?.name ?? null,
      channels,
    }
  })

  const platforms: PlatformSummary[] = AVAILABLE_PLATFORMS.map((platform) => {
    const integ = integrations.find((i) => i.platform === platform)
    const rows = external.filter((e) => e.platform === platform)
    const mapped = rows.filter((e) => e.linkId).length
    return {
      platform,
      label: PLATFORM_LABELS[platform],
      featureEnabled: isFeatureKey(platform) ? hasFeature(ctx.features, platform) : false,
      connected: Boolean(integ && integ.status === 'active'),
      integrationId: integ?.id ?? null,
      healthStatus: (integ?.health_status as HealthStatus) ?? null,
      lastSyncedAt: rows.reduce<string | null>((max, e) => (e.lastSyncedAt && (!max || e.lastSyncedAt > max) ? e.lastSyncedAt : max), null),
      supportsProductRead: PLATFORM_CAPABILITIES[platform].supportsProductRead,
      supportsProductCreate: PLATFORM_CAPABILITIES[platform].supportsProductCreate,
      total: rows.length,
      mapped,
      unmapped: rows.length - mapped,
    }
  })

  return { ...base, platforms, external, locals, categories }
}

async function requireManager(): Promise<{ ok: true; restaurantId: string; tenantId: string | null } | { ok: false; error: string }> {
  const result = await resolveRestaurantContext()
  if (!result.ok) return { ok: false, error: result.error }
  const { ctx } = result
  if (!roleIn(ctx.role, CONTENT_MANAGER_ROLES)) return { ok: false, error: 'Bu işlem için sahip, yönetici veya şube müdürü yetkisi gerekir' }
  if (!hasFeature(ctx.features, 'marketplace')) return { ok: false, error: 'Pazaryeri özelliği açık değil' }
  return { ok: true, restaurantId: ctx.restaurantId, tenantId: ctx.tenantId }
}

function withTimeout<T>(promise: Promise<T>, ms: number, message: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(message)), ms)
    promise.then((v) => { clearTimeout(timer); resolve(v) }, (e) => { clearTimeout(timer); reject(e) })
  })
}

function dedupeExternalProducts<T extends { externalProductId: string; category: string | null }>(items: T[]): T[] {
  const byId = new Map<string, T>()
  for (const item of items) {
    const existing = byId.get(item.externalProductId)
    if (!existing) {
      byId.set(item.externalProductId, item)
      continue
    }
    if (item.category && existing.category !== item.category) {
      existing.category = existing.category ? `${existing.category}, ${item.category}` : item.category
    }
  }
  return Array.from(byId.values())
}

/** Platformdaki mevcut ürünleri çek ve snapshot'la (yerel ürünlere DOKUNMAZ). */
export async function importPlatformProducts(input: { platform: string }): Promise<{ success: boolean; error?: string; fetched?: number; created?: number; updated?: number }> {
  const access = await requireManager()
  if (!access.ok) return { success: false, error: access.error }
  if (!isMarketplacePlatform(input.platform)) return { success: false, error: 'Geçersiz platform' }
  const platform = input.platform

  try {
    const integration = await getResolvedIntegrationByRestaurant(access.restaurantId, platform)
    if (!integration) return { success: false, error: `${PLATFORM_LABELS[platform]} bağlantısı yok; önce Entegrasyonlar sayfasından kimlik bilgilerini girin` }
    if (integration.status !== 'active') return { success: false, error: `${PLATFORM_LABELS[platform]} bağlantısı devre dışı` }

    const adapter = createAdapter(platform, integration.credentials, integration.environment)
    // Aynı platform ürün ID'si tek upsert komutunda iki kez geçemez (Postgres kısıtı)
    const products = dedupeExternalProducts(
      await withTimeout(adapter.getProducts(), 45_000, `${PLATFORM_LABELS[platform]} ürün listesi 45 saniyede yanıt vermedi`)
    )
    const sb = integrationServiceClient()
    const now = new Date().toISOString()

    const { data: existing } = await sb.from('external_products').select('external_product_id').eq('integration_id', integration.id)
    const existingIds = new Set(((existing || []) as Row[]).map((e) => e.external_product_id))

    const rows = products.map((p) => ({
      integration_id: integration.id,
      external_product_id: p.externalProductId,
      external_sku: p.externalSku,
      name: p.name || '(isimsiz)',
      description: p.description,
      price: p.price,
      quantity: p.quantity,
      available: p.available,
      category: p.category,
      image_url: (p.rawPayload as Row | null)?.image_url ?? (p.rawPayload as Row | null)?.imageUrl ?? null,
      raw_payload: p.rawPayload ?? null,
      source: 'sync',
      last_synced_at: now,
    }))

    // 500'lük parçalarla upsert
    for (let i = 0; i < rows.length; i += 500) {
      const { error } = await sb.from('external_products').upsert(rows.slice(i, i + 500) as never, { onConflict: 'integration_id,external_product_id' })
      if (error) throw new Error(error.message)
    }
    await sb.from('integrations').update({ last_successful_sync_at: now, last_error: null } as never).eq('id', integration.id)

    const created = rows.filter((r) => !existingIds.has(r.external_product_id)).length
    revalidatePath('/panel/products/platform')
    return { success: true, fetched: rows.length, created, updated: rows.length - created }
  } catch (error) {
    return { success: false, error: toSafeErrorMessage(error) }
  }
}

/** Yerel ürün ↔ platform ürünü eşleştir (kullanıcı onayıyla). */
export async function linkProduct(input: { localProductId: string; externalRowId: string }): Promise<{ success: boolean; error?: string }> {
  const access = await requireManager()
  if (!access.ok) return { success: false, error: access.error }
  try {
    const sb = integrationServiceClient()
    const [{ data: local }, { data: ext }] = await Promise.all([
      sb.from('products').select('id, restaurant_id').eq('id', input.localProductId).maybeSingle(),
      sb.from('external_products').select('id, restaurant_id, integration_id').eq('id', input.externalRowId).maybeSingle(),
    ])
    const l = local as Row | null
    const e = ext as Row | null
    if (!l || l.restaurant_id !== access.restaurantId) return { success: false, error: 'Yerel ürün bu restorana ait değil' }
    if (!e || e.restaurant_id !== access.restaurantId) return { success: false, error: 'Platform ürünü bu restorana ait değil' }

    const { error } = await sb.from('product_channel_links').insert({
      local_product_id: l.id,
      integration_id: e.integration_id,
      external_product_row_id: e.id,
    } as never)
    if (error) {
      if (error.code === '23505') return { success: false, error: 'Bu ürünlerden biri zaten eşleştirilmiş; önce mevcut eşleşmeyi kaldırın' }
      return { success: false, error: error.message }
    }
    revalidatePath('/panel/products/platform')
    return { success: true }
  } catch (error) {
    return { success: false, error: toSafeErrorMessage(error) }
  }
}

export async function unlinkProduct(input: { linkId: string }): Promise<{ success: boolean; error?: string }> {
  const access = await requireManager()
  if (!access.ok) return { success: false, error: access.error }
  const sb = integrationServiceClient()
  const { error } = await sb.from('product_channel_links').delete().eq('id', input.linkId).eq('restaurant_id', access.restaurantId)
  if (error) return { success: false, error: error.message }
  revalidatePath('/panel/products/platform')
  return { success: true }
}

/** Platform ürününden yeni QRMenuList (master) ürünü oluştur ve eşleştir. */
export async function createLocalProductFromExternal(input: { externalRowId: string; categoryId?: string | null; price?: number | null }): Promise<{ success: boolean; error?: string; productId?: string }> {
  const access = await requireManager()
  if (!access.ok) return { success: false, error: access.error }
  try {
    const sb = integrationServiceClient()
    const { data: ext } = await sb.from('external_products').select('*').eq('id', input.externalRowId).maybeSingle()
    const e = ext as Row | null
    if (!e || e.restaurant_id !== access.restaurantId) return { success: false, error: 'Platform ürünü bulunamadı' }

    let categoryId: string | null = null
    if (input.categoryId) {
      const { data: cat } = await sb.from('categories').select('id').eq('id', input.categoryId).eq('restaurant_id', access.restaurantId).maybeSingle()
      if (!cat) return { success: false, error: 'Kategori bu restorana ait değil' }
      categoryId = (cat as Row).id
    }
    const price = input.price !== undefined && input.price !== null && Number(input.price) >= 0 ? Number(input.price) : e.price !== null && e.price !== undefined ? Number(e.price) : 0

    const { data: maxRow } = await sb.from('products').select('sort_order').eq('restaurant_id', access.restaurantId).order('sort_order', { ascending: false }).limit(1).maybeSingle()
    const sortOrder = ((maxRow as Row | null)?.sort_order ?? 0) + 1

    const { data: created, error } = await sb
      .from('products')
      .insert({
        restaurant_id: access.restaurantId,
        category_id: categoryId,
        name: e.name,
        description: e.description ?? null,
        price,
        image_url: e.image_url ?? null,
        sort_order: sortOrder,
        is_active: true,
        is_featured: false,
        is_daily_special: false,
      } as never)
      .select('id')
      .single()
    if (error) return { success: false, error: error.message }
    const productId = (created as Row).id as string

    const { error: linkError } = await sb.from('product_channel_links').insert({
      local_product_id: productId,
      integration_id: e.integration_id,
      external_product_row_id: e.id,
    } as never)
    if (linkError) return { success: false, error: `Ürün oluşturuldu ama eşleştirilemedi: ${linkError.message}`, productId }

    revalidatePath('/panel/products/platform')
    revalidatePath('/panel/products')
    return { success: true, productId }
  } catch (error) {
    return { success: false, error: toSafeErrorMessage(error) }
  }
}

/** API'den çekilemeyen platformlar için platform ürününü elle kaydet. */
export async function addManualExternalProduct(input: { platform: string; externalProductId: string; name: string; price?: number | null }): Promise<{ success: boolean; error?: string }> {
  const access = await requireManager()
  if (!access.ok) return { success: false, error: access.error }
  if (!isMarketplacePlatform(input.platform)) return { success: false, error: 'Geçersiz platform' }
  const externalId = (input.externalProductId || '').trim()
  const name = (input.name || '').trim()
  if (!externalId || !name) return { success: false, error: 'Platform ürün ID ve ad zorunludur' }
  try {
    const integration = await getResolvedIntegrationByRestaurant(access.restaurantId, input.platform)
    if (!integration) return { success: false, error: `${PLATFORM_LABELS[input.platform]} bağlantısı yok` }
    const sb = integrationServiceClient()
    const { error } = await sb.from('external_products').upsert({
      integration_id: integration.id,
      external_product_id: externalId,
      name,
      price: input.price ?? null,
      source: 'manual',
    } as never, { onConflict: 'integration_id,external_product_id' })
    if (error) return { success: false, error: error.message }
    revalidatePath('/panel/products/platform')
    return { success: true }
  } catch (error) {
    return { success: false, error: toSafeErrorMessage(error) }
  }
}

/**
 * Kanal fiyatı: use_master_price=true → QR fiyatı; false → price_override (boşsa platformdaki fiyat).
 * Platforma gönderim Faz 6 (fiyat güncelleme gövdesi doğrulanınca).
 */
export async function setChannelPrice(input: { linkId: string; useMasterPrice: boolean; priceOverride?: number | null }): Promise<{ success: boolean; error?: string; sync?: ChannelSyncResult[] }> {
  const access = await requireManager()
  if (!access.ok) return { success: false, error: access.error }
  const sb = integrationServiceClient()
  const override = input.useMasterPrice ? null : input.priceOverride === undefined || input.priceOverride === null || Number.isNaN(Number(input.priceOverride)) ? null : Math.max(0, Number(input.priceOverride))
  const { data, error } = await sb
    .from('product_channel_links')
    .update({ use_master_price: input.useMasterPrice, price_override: override } as never)
    .eq('id', input.linkId)
    .eq('restaurant_id', access.restaurantId)
    .select('id, local_product_id')
  if (error) return { success: false, error: error.message }
  if (!data || data.length === 0) return { success: false, error: 'Eşleşme bulunamadı' }
  // Kaydedilen kanal fiyatını platforma hemen gönder
  const sync = await syncProductPrice((data[0] as Row).local_product_id, { linkIds: [input.linkId] })
  revalidatePath('/panel/products/platform')
  return { success: true, sync }
}

/** QR menü (master) fiyatını bu ekrandan düzenle; "QR fiyatıyla aynı" kanallara gönderilir. */
export async function setMasterPrice(input: { productId: string; price: number }): Promise<{ success: boolean; error?: string; sync?: ChannelSyncResult[] }> {
  const access = await requireManager()
  if (!access.ok) return { success: false, error: access.error }
  const price = Number(input.price)
  if (!Number.isFinite(price) || price < 0) return { success: false, error: 'Geçersiz fiyat' }
  const sb = integrationServiceClient()
  const { data, error } = await sb.from('products').update({ price } as never).eq('id', input.productId).eq('restaurant_id', access.restaurantId).select('id')
  if (error) return { success: false, error: error.message }
  if (!data || data.length === 0) return { success: false, error: 'Ürün bulunamadı' }
  const sync = await syncProductPrice(input.productId, { onlyMasterLinked: true })
  revalidatePath('/panel/products')
  revalidatePath('/panel/products/platform')
  revalidatePath('/restorant/[slug]', 'page')
  revalidatePath('/restorant/[slug]/category/[categoryId]', 'page')
  return { success: true, sync }
}

// ---------------------------------------------------------------------------
// Toplu işlemler: birebir isim eşleştirme (önizleme + onay) ve tümünü aktarma.
// Görseller depoya KOPYALANMAZ; platformun adresi doğrudan kullanılır.
// ---------------------------------------------------------------------------

export async function previewExactMatches(input: { platform: string }): Promise<{ success: boolean; error?: string; pairs?: ExactMatchPair[] }> {
  const access = await requireManager()
  if (!access.ok) return { success: false, error: access.error }
  if (!isMarketplacePlatform(input.platform)) return { success: false, error: 'Geçersiz platform' }
  const sb = integrationServiceClient()
  const integration = await getResolvedIntegrationByRestaurant(access.restaurantId, input.platform)
  if (!integration) return { success: false, error: 'Bağlantı yok' }
  const [{ data: externals }, { data: links }, { data: locals }] = await Promise.all([
    sb.from('external_products').select('id, name').eq('integration_id', integration.id),
    sb.from('product_channel_links').select('external_product_row_id, local_product_id').eq('integration_id', integration.id),
    sb.from('products').select('id, name').eq('restaurant_id', access.restaurantId),
  ])
  const linkedExt = new Set(((links || []) as Row[]).map((l) => l.external_product_row_id))
  const linkedLocal = new Set(((links || []) as Row[]).map((l) => l.local_product_id))
  const pairs = exactNameMatches(
    ((externals || []) as Row[]).filter((e) => !linkedExt.has(e.id)).map((e) => ({ id: e.id, name: e.name })),
    ((locals || []) as Row[]).filter((l) => !linkedLocal.has(l.id)).map((l) => ({ id: l.id, name: l.name }))
  )
  return { success: true, pairs }
}

export async function applyExactMatches(input: { platform: string; pairs: { externalRowId: string; localProductId: string }[] }): Promise<{ success: boolean; error?: string; linked?: number; failed?: number }> {
  const access = await requireManager()
  if (!access.ok) return { success: false, error: access.error }
  let linked = 0
  let failed = 0
  for (const pair of input.pairs.slice(0, 500)) {
    const r = await linkProduct({ localProductId: pair.localProductId, externalRowId: pair.externalRowId })
    if (r.success) linked++
    else failed++
  }
  revalidatePath('/panel/products/platform')
  return { success: true, linked, failed }
}

/**
 * Yeni restoran kurulumu: platformdaki eşleşmemiş TÜM ürünleri kategorileriyle
 * QRMenuList'e aktarır (kategori yoksa oluşturur) ve eşleştirir. Zaten eşleşmiş
 * ürünlere dokunmaz; tekrar çalıştırmak güvenlidir.
 */
export async function importAllExternalToLocal(input: { platform: string }): Promise<{ success: boolean; error?: string; created?: number; categoriesCreated?: number; skipped?: number; failed?: number }> {
  const access = await requireManager()
  if (!access.ok) return { success: false, error: access.error }
  if (!isMarketplacePlatform(input.platform)) return { success: false, error: 'Geçersiz platform' }
  const sb = integrationServiceClient()
  const integration = await getResolvedIntegrationByRestaurant(access.restaurantId, input.platform)
  if (!integration) return { success: false, error: 'Bağlantı yok' }

  const [{ data: externals }, { data: links }, { data: categories }, { data: maxRow }] = await Promise.all([
    sb.from('external_products').select('*').eq('integration_id', integration.id).order('name'),
    sb.from('product_channel_links').select('external_product_row_id').eq('integration_id', integration.id),
    sb.from('categories').select('id, name, sort_order').eq('restaurant_id', access.restaurantId),
    sb.from('products').select('sort_order').eq('restaurant_id', access.restaurantId).order('sort_order', { ascending: false }).limit(1).maybeSingle(),
  ])
  const linked = new Set(((links || []) as Row[]).map((l) => l.external_product_row_id))
  const pending = ((externals || []) as Row[]).filter((e) => !linked.has(e.id))
  const categoryByKey = new Map<string, string>()
  let categorySort = Math.max(0, ...((categories || []) as Row[]).map((c) => Number(c.sort_order) || 0))
  for (const c of (categories || []) as Row[]) categoryByKey.set(String(c.name).toLocaleLowerCase('tr-TR').trim(), c.id)
  let sortOrder = ((maxRow as Row | null)?.sort_order ?? 0)
  let created = 0
  let categoriesCreated = 0
  let failed = 0

  for (const e of pending) {
    try {
      let categoryId: string | null = null
      const catName = primaryCategoryName(e.category)
      if (catName) {
        const key = catName.toLocaleLowerCase('tr-TR').trim()
        categoryId = categoryByKey.get(key) || null
        if (!categoryId) {
          categorySort += 1
          const { data: cat, error: catError } = await sb.from('categories').insert({ restaurant_id: access.restaurantId, name: catName, sort_order: categorySort, is_active: true } as never).select('id').single()
          if (catError) throw new Error(catError.message)
          categoryId = (cat as Row).id as string
          categoryByKey.set(key, categoryId)
          categoriesCreated++
        }
      }
      sortOrder += 1
      const { data: product, error: prodError } = await sb.from('products').insert({
        restaurant_id: access.restaurantId,
        category_id: categoryId,
        name: e.name,
        description: e.description ?? null,
        price: e.price !== null && e.price !== undefined ? Number(e.price) : 0,
        image_url: e.image_url ?? null,
        sort_order: sortOrder,
        is_active: true,
        is_available: e.available !== false,
        is_featured: false,
        is_daily_special: false,
      } as never).select('id').single()
      if (prodError) throw new Error(prodError.message)
      const { error: linkError } = await sb.from('product_channel_links').insert({ local_product_id: (product as Row).id, integration_id: integration.id, external_product_row_id: e.id } as never)
      if (linkError) throw new Error(linkError.message)
      created++
    } catch (err) {
      console.error('importAllExternalToLocal item error:', toSafeErrorMessage(err))
      failed++
    }
  }

  revalidatePath('/panel/products/platform')
  revalidatePath('/panel/products')
  revalidatePath('/panel/categories')
  return { success: true, created, categoriesCreated, skipped: ((externals || []) as Row[]).length - pending.length, failed }
}
