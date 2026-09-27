/**
 * Kullanılabilirlik (satışta/tükendi) fan-out: eşleşen her platforma job olarak
 * gönderilir ve hemen çalıştırılır. Bir platform hata verirse merkezi durum geri
 * alınmaz; hata link satırına yazılır, UI "Tekrar Dene" gösterir.
 */
import { integrationServiceClient } from '@/lib/integrations/service'
import { enqueueJob, runJob } from '@/lib/integrations/jobs'
import { toSafeErrorMessage } from '@/lib/integrations/errors'
import { PLATFORM_LABELS, type MarketplacePlatform } from '@/lib/integrations/types'
import { effectiveChannelPrice } from '@/lib/pricing/effective'

// eslint-disable-next-line
type Row = Record<string, any>

export interface ChannelSyncResult {
  linkId: string
  platform: MarketplacePlatform
  label: string
  ok: boolean
  error?: string
}

export async function syncProductAvailability(productId: string, options: { linkIds?: string[] } = {}): Promise<ChannelSyncResult[]> {
  const sb = integrationServiceClient()
  const { data: product } = await sb.from('products').select('id, restaurant_id, is_available').eq('id', productId).maybeSingle()
  if (!product) return []
  const p = product as Row

  let query = sb.from('product_channel_links').select('id, integration_id, external_product_id, integrations(platform, status, tenant_id, restaurant_id)').eq('local_product_id', productId)
  if (options.linkIds && options.linkIds.length) query = query.in('id', options.linkIds)
  const { data: links } = await query

  const results: ChannelSyncResult[] = []
  for (const link of (links || []) as Row[]) {
    const integ = link.integrations as Row | null
    const platform = (integ?.platform || 'trendyol_food') as MarketplacePlatform
    const label = PLATFORM_LABELS[platform]
    let ok = false
    let error: string | undefined

    try {
      if (!integ || integ.status !== 'active') throw new Error(`${label} bağlantısı devre dışı`)
      const { id: jobId } = await enqueueJob({
        tenantId: integ.tenant_id,
        restaurantId: integ.restaurant_id,
        integrationId: link.integration_id,
        type: 'sync_availability',
        payload: { productId, linkId: link.id, externalProductId: link.external_product_id, available: Boolean(p.is_available) },
      })
      if (!jobId) throw new Error('İş kuyruğa eklenemedi')
      const outcome = await runJob(jobId)
      ok = outcome.status === 'completed'
      error = ok ? undefined : outcome.error || 'Bilinmeyen hata'
    } catch (e) {
      error = toSafeErrorMessage(e)
    }

    await sb
      .from('product_channel_links')
      .update({ last_availability_sync_at: new Date().toISOString(), last_availability_sync_ok: ok, last_sync_error: ok ? null : error ?? null } as never)
      .eq('id', link.id)
    results.push({ linkId: link.id, platform, label, ok, error })
  }
  return results
}

/** Birden fazla ürün için (sipariş kabulü sonrası) sırayla senkron. */
export async function syncProductsAvailability(productIds: string[]): Promise<Record<string, ChannelSyncResult[]>> {
  const out: Record<string, ChannelSyncResult[]> = {}
  for (const id of Array.from(new Set(productIds))) {
    out[id] = await syncProductAvailability(id)
  }
  return out
}

/**
 * Kanal fiyatı fan-out: use_master_price → QR fiyatı, price_override → özel fiyat.
 * Gönderilecek fiyat yoksa (ikisi de kapalı) kanal atlanır; platform fiyatı korunur.
 */
export async function syncProductPrice(productId: string, options: { linkIds?: string[]; onlyMasterLinked?: boolean } = {}): Promise<ChannelSyncResult[]> {
  const sb = integrationServiceClient()
  const { data: product } = await sb.from('products').select('id, restaurant_id, price').eq('id', productId).maybeSingle()
  if (!product) return []
  const p = product as Row

  let query = sb.from('product_channel_links').select('id, integration_id, external_product_id, use_master_price, price_override, integrations(platform, status, tenant_id, restaurant_id)').eq('local_product_id', productId)
  if (options.linkIds && options.linkIds.length) query = query.in('id', options.linkIds)
  if (options.onlyMasterLinked) query = query.eq('use_master_price', true)
  const { data: links } = await query

  const results: ChannelSyncResult[] = []
  for (const link of (links || []) as Row[]) {
    const integ = link.integrations as Row | null
    const platform = (integ?.platform || 'trendyol_food') as MarketplacePlatform
    const label = PLATFORM_LABELS[platform]
    const price = effectiveChannelPrice({ useMasterPrice: Boolean(link.use_master_price), priceOverride: link.price_override === null || link.price_override === undefined ? null : Number(link.price_override), masterPrice: Number(p.price) })
    if (price === null) continue
    let ok = false
    let error: string | undefined
    try {
      if (!integ || integ.status !== 'active') throw new Error(`${label} bağlantısı devre dışı`)
      const { id: jobId } = await enqueueJob({
        tenantId: integ.tenant_id,
        restaurantId: integ.restaurant_id,
        integrationId: link.integration_id,
        type: 'sync_price',
        payload: { productId, linkId: link.id, externalProductId: link.external_product_id, price },
      })
      if (!jobId) throw new Error('İş kuyruğa eklenemedi')
      const outcome = await runJob(jobId)
      ok = outcome.status === 'completed'
      error = ok ? undefined : outcome.error || 'Bilinmeyen hata'
    } catch (e) {
      error = toSafeErrorMessage(e)
    }
    await sb
      .from('product_channel_links')
      .update({ synced_price: ok ? price : undefined, last_price_sync_at: new Date().toISOString(), last_price_sync_ok: ok, last_price_sync_error: ok ? null : error ?? null } as never)
      .eq('id', link.id)
    results.push({ linkId: link.id, platform, label, ok, error })
  }
  return results
}
