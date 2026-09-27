'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { isMissingSchemaError, resolveRestaurantContext } from '@/lib/auth/restaurant-context'
import { OPERATIONS_ROLES, roleIn } from '@/lib/auth/roles'
import { hasFeature } from '@/lib/features'
import { integrationServiceClient } from '@/lib/integrations/service'
import { toSafeErrorMessage } from '@/lib/integrations/errors'
import { PLATFORM_LABELS, type MarketplacePlatform } from '@/lib/integrations/types'
import { syncProductAvailability, type ChannelSyncResult } from '@/lib/inventory/sync'
import type { InventoryTxType } from '@/lib/inventory/types'

// eslint-disable-next-line
type Row = Record<string, any>

export interface StockChannel {
  linkId: string
  platform: MarketplacePlatform
  label: string
  externalName: string
  externalAvailable: boolean
  lastSyncAt: string | null
  lastSyncOk: boolean | null
  lastSyncError: string | null
}

export interface StockTransaction {
  id: string
  type: InventoryTxType
  quantity: number
  previousQuantity: number | null
  newQuantity: number | null
  source: string
  note: string | null
  createdAt: string
}

export interface StockProduct {
  id: string
  name: string
  categoryName: string | null
  price: number
  isActive: boolean
  isAvailable: boolean
  trackStock: boolean
  stockQuantity: number | null
  sku: string | null
  manualOverride: boolean
  channels: StockChannel[]
  transactions: StockTransaction[]
}

export interface StockData {
  restaurantName: string
  featureEnabled: boolean
  schemaReady: boolean
  canOperate: boolean
  products: StockProduct[]
  error?: string
}

export async function getStockData(): Promise<StockData> {
  const base: StockData = { restaurantName: '', featureEnabled: false, schemaReady: true, canOperate: false, products: [] }
  const result = await resolveRestaurantContext()
  if (!result.ok) return { ...base, error: result.error }
  const { ctx } = result
  base.restaurantName = ctx.restaurant.name
  base.featureEnabled = hasFeature(ctx.features, 'stock')
  base.canOperate = roleIn(ctx.role, OPERATIONS_ROLES)
  if (!base.featureEnabled) return base

  const supabase = await createClient()
  const [productsRes, linksRes, txRes] = await Promise.all([
    supabase.from('products').select('id, name, price, is_active, is_available, track_stock, stock_quantity, sku, availability_manual_override, categories(name)').eq('restaurant_id', ctx.restaurantId).order('sort_order'),
    supabase.from('product_channel_links').select('id, local_product_id, integration_id, last_availability_sync_at, last_availability_sync_ok, last_sync_error, external_products(name, available), integrations(platform)').eq('restaurant_id', ctx.restaurantId),
    supabase.from('inventory_transactions').select('id, product_id, type, quantity, previous_quantity, new_quantity, source, note, created_at').eq('restaurant_id', ctx.restaurantId).order('created_at', { ascending: false }).limit(200),
  ])
  if (productsRes.error) {
    if (isMissingSchemaError(productsRes.error)) return { ...base, schemaReady: false }
    return { ...base, error: productsRes.error.message }
  }
  const links = linksRes.error ? [] : ((linksRes.data || []) as Row[])
  const txs = txRes.error ? [] : ((txRes.data || []) as Row[])

  const channelsByProduct = new Map<string, StockChannel[]>()
  for (const l of links) {
    const platform = ((l.integrations as Row | null)?.platform || 'trendyol_food') as MarketplacePlatform
    const ext = l.external_products as Row | null
    const list = channelsByProduct.get(l.local_product_id) || []
    list.push({
      linkId: l.id,
      platform,
      label: PLATFORM_LABELS[platform],
      externalName: ext?.name || '',
      externalAvailable: Boolean(ext?.available),
      lastSyncAt: l.last_availability_sync_at ?? null,
      lastSyncOk: l.last_availability_sync_ok ?? null,
      lastSyncError: l.last_sync_error ?? null,
    })
    channelsByProduct.set(l.local_product_id, list)
  }
  const txByProduct = new Map<string, StockTransaction[]>()
  for (const t of txs) {
    const list = txByProduct.get(t.product_id) || []
    if (list.length < 8) {
      list.push({ id: t.id, type: t.type, quantity: Number(t.quantity), previousQuantity: t.previous_quantity ?? null, newQuantity: t.new_quantity ?? null, source: t.source, note: t.note ?? null, createdAt: t.created_at })
    }
    txByProduct.set(t.product_id, list)
  }

  return {
    ...base,
    products: ((productsRes.data || []) as Row[]).map((p) => ({
      id: p.id,
      name: p.name,
      categoryName: (p.categories as Row | null)?.name ?? null,
      price: Number(p.price),
      isActive: Boolean(p.is_active),
      isAvailable: p.is_available !== false,
      trackStock: Boolean(p.track_stock),
      stockQuantity: p.stock_quantity ?? null,
      sku: p.sku ?? null,
      manualOverride: Boolean(p.availability_manual_override),
      channels: channelsByProduct.get(p.id) || [],
      transactions: txByProduct.get(p.id) || [],
    })),
  }
}

async function requireOperator(): Promise<{ ok: true; restaurantId: string } | { ok: false; error: string }> {
  const result = await resolveRestaurantContext()
  if (!result.ok) return { ok: false, error: result.error }
  const { ctx } = result
  if (!hasFeature(ctx.features, 'stock')) return { ok: false, error: 'Stok özelliği açık değil' }
  if (!roleIn(ctx.role, OPERATIONS_ROLES)) return { ok: false, error: 'Stok işlemi için personel veya üstü yetki gerekir' }
  return { ok: true, restaurantId: ctx.restaurantId }
}

async function assertOwnProduct(productId: string, restaurantId: string): Promise<Row | null> {
  const sb = integrationServiceClient()
  const { data } = await sb.from('products').select('id, restaurant_id, is_available, track_stock, stock_quantity').eq('id', productId).maybeSingle()
  const p = data as Row | null
  return p && p.restaurant_id === restaurantId ? p : null
}

export interface StockActionResult {
  success: boolean
  error?: string
  stockQuantity?: number | null
  isAvailable?: boolean
  sync?: ChannelSyncResult[]
}

function finish(): void {
  revalidatePath('/panel/stock')
  revalidatePath('/panel/products')
}

export async function setTrackStock(input: { productId: string; track: boolean; quantity?: number | null }): Promise<StockActionResult> {
  const access = await requireOperator()
  if (!access.ok) return { success: false, error: access.error }
  const product = await assertOwnProduct(input.productId, access.restaurantId)
  if (!product) return { success: false, error: 'Ürün bulunamadı' }
  try {
    const sb = integrationServiceClient()
    const { error } = await sb.from('products').update({ track_stock: input.track } as never).eq('id', product.id)
    if (error) return { success: false, error: error.message }
    let sync: ChannelSyncResult[] | undefined
    let stockQuantity = product.stock_quantity ?? null
    let isAvailable = Boolean(product.is_available)
    if (input.track && input.quantity !== undefined && input.quantity !== null) {
      const { data, error: rpcError } = await sb.rpc('apply_inventory_transaction', {
        p_product_id: product.id, p_type: 'correction', p_delta: 0, p_source: 'panel', p_note: 'Stok takibi açıldı', p_absolute: Math.max(0, Math.round(Number(input.quantity))),
      } as never)
      if (rpcError) return { success: false, error: rpcError.message }
      const r = (data || {}) as Row
      stockQuantity = r.stock_quantity ?? stockQuantity
      isAvailable = r.is_available ?? isAvailable
      if (r.availability_changed) sync = await syncProductAvailability(product.id)
    }
    finish()
    return { success: true, stockQuantity, isAvailable, sync }
  } catch (e) {
    return { success: false, error: toSafeErrorMessage(e) }
  }
}

export async function adjustStock(input: { productId: string; delta?: number; absolute?: number; note?: string }): Promise<StockActionResult> {
  const access = await requireOperator()
  if (!access.ok) return { success: false, error: access.error }
  const product = await assertOwnProduct(input.productId, access.restaurantId)
  if (!product) return { success: false, error: 'Ürün bulunamadı' }
  if (!product.track_stock) return { success: false, error: 'Bu üründe stok takibi kapalı' }
  try {
    const supabase = await createClient() // kullanıcı oturumu: DB fonksiyonu rolü kendisi doğrular
    const isAbsolute = input.absolute !== undefined && input.absolute !== null
    const { data, error } = await supabase.rpc('apply_inventory_transaction', {
      p_product_id: product.id,
      p_type: isAbsolute ? 'correction' : 'manual_adjustment',
      p_delta: isAbsolute ? 0 : Math.round(Number(input.delta || 0)),
      p_source: 'panel',
      p_note: (input.note || '').trim().slice(0, 200) || null,
      p_absolute: isAbsolute ? Math.max(0, Math.round(Number(input.absolute))) : null,
    } as never)
    if (error) return { success: false, error: error.message.includes('forbidden') ? 'Yetkiniz yok' : error.message }
    const r = (data || {}) as Row
    let sync: ChannelSyncResult[] | undefined
    if (r.availability_changed) sync = await syncProductAvailability(product.id)
    finish()
    return { success: true, stockQuantity: r.stock_quantity ?? null, isAvailable: Boolean(r.is_available), sync }
  } catch (e) {
    return { success: false, error: toSafeErrorMessage(e) }
  }
}

/** "Tükendi Yap" / "Satışa Aç": merkezi durum önce yazılır, sonra platformlara gönderilir. */
export async function setAvailability(input: { productId: string; available: boolean }): Promise<StockActionResult> {
  const access = await requireOperator()
  if (!access.ok) return { success: false, error: access.error }
  const product = await assertOwnProduct(input.productId, access.restaurantId)
  if (!product) return { success: false, error: 'Ürün bulunamadı' }
  try {
    const supabase = await createClient()
    const { error } = await supabase.rpc('set_product_availability', { p_product_id: product.id, p_available: input.available } as never)
    if (error) return { success: false, error: error.message.includes('forbidden') ? 'Yetkiniz yok' : error.message }
    const sync = await syncProductAvailability(product.id)
    finish()
    revalidatePath('/restorant/[slug]', 'page')
    return { success: true, isAvailable: input.available, stockQuantity: product.stock_quantity ?? null, sync }
  } catch (e) {
    return { success: false, error: toSafeErrorMessage(e) }
  }
}

export async function retryChannelSync(input: { linkId: string }): Promise<StockActionResult> {
  const access = await requireOperator()
  if (!access.ok) return { success: false, error: access.error }
  const sb = integrationServiceClient()
  const { data: link } = await sb.from('product_channel_links').select('id, local_product_id, restaurant_id').eq('id', input.linkId).maybeSingle()
  const l = link as Row | null
  if (!l || l.restaurant_id !== access.restaurantId) return { success: false, error: 'Eşleşme bulunamadı' }
  const sync = await syncProductAvailability(l.local_product_id, { linkIds: [l.id] })
  finish()
  return { success: true, sync }
}

export async function setProductSku(input: { productId: string; sku: string }): Promise<{ success: boolean; error?: string }> {
  const access = await requireOperator()
  if (!access.ok) return { success: false, error: access.error }
  const product = await assertOwnProduct(input.productId, access.restaurantId)
  if (!product) return { success: false, error: 'Ürün bulunamadı' }
  const sb = integrationServiceClient()
  const sku = (input.sku || '').trim().slice(0, 100) || null
  const { error } = await sb.from('products').update({ sku } as never).eq('id', product.id)
  if (error) return { success: false, error: error.message }
  finish()
  return { success: true }
}

// ---------------------------------------------------------------------------
// Toplu işlemler
// ---------------------------------------------------------------------------

export interface BulkResult {
  success: boolean
  error?: string
  done?: number
  failed?: number
  syncErrors?: number
}

export async function bulkSetTrackStock(input: { productIds: string[]; track: boolean; quantity?: number | null }): Promise<BulkResult> {
  const access = await requireOperator()
  if (!access.ok) return { success: false, error: access.error }
  let done = 0
  let failed = 0
  let syncErrors = 0
  for (const productId of Array.from(new Set(input.productIds)).slice(0, 300)) {
    const r = await setTrackStock({ productId, track: input.track, quantity: input.track ? input.quantity ?? null : null })
    if (r.success) { done++; syncErrors += (r.sync || []).filter((x) => !x.ok).length } else failed++
  }
  return { success: true, done, failed, syncErrors }
}

export async function bulkSetAvailability(input: { productIds: string[]; available: boolean }): Promise<BulkResult> {
  const access = await requireOperator()
  if (!access.ok) return { success: false, error: access.error }
  let done = 0
  let failed = 0
  let syncErrors = 0
  for (const productId of Array.from(new Set(input.productIds)).slice(0, 300)) {
    const r = await setAvailability({ productId, available: input.available })
    if (r.success) { done++; syncErrors += (r.sync || []).filter((x) => !x.ok).length } else failed++
  }
  return { success: true, done, failed, syncErrors }
}
