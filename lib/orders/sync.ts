/**
 * Platform siparişlerinin merkezi orders tablosuna alınması (sunucu).
 *
 *  - upsertPlatformOrder : normalize edilmiş siparişi (integration_id, external_order_id)
 *                          tekilliğiyle yazar; aynı olay integration_events ile bir kez işlenir.
 *  - pollOrdersForIntegration : webhook'u olmayan platformlar (Trendyol) için artımlı çekim.
 *  - pushOrderStatus     : panelden yapılan durum değişikliğini platforma iletir.
 *
 * Stok: platform siparişinde düşüm "kabul" anında (Trendyol: Picking / panelde Kabul);
 * Yemeksepeti'nde RECEIVED zaten onaylı sipariş olduğu için varışta (config ile değişir).
 */
import { getResolvedIntegration, integrationServiceClient } from '@/lib/integrations/service'
import { createAdapter } from '@/lib/integrations/registry'
import { PLATFORM_CAPABILITIES } from '@/lib/integrations/capabilities'
import { toSafeErrorMessage } from '@/lib/integrations/errors'
import type { NormalizedOrder, NormalizedOrderStatus, ResolvedIntegration } from '@/lib/integrations/types'
import { onOrderAccepted, onOrderCancelled } from '@/lib/inventory/hooks'
import { timestampColumnFor } from './types'

// eslint-disable-next-line
type Row = Record<string, any>

const STATUS_RANK: Record<NormalizedOrderStatus, number> = { new: 0, accepted: 1, preparing: 2, ready: 3, completed: 4, cancelled: 5 }

/** Olayı kaydeder; daha önce görüldüyse false döner (idempotency). */
export async function recordIntegrationEvent(integrationId: string, eventKey: string, eventType: string, payload: unknown): Promise<boolean> {
  const sb = integrationServiceClient()
  const { error } = await sb.from('integration_events').insert({ integration_id: integrationId, event_key: eventKey, event_type: eventType, payload: payload ?? {} } as never)
  if (!error) return true
  if (error.code === '23505') return false
  throw new Error(error.message)
}

function shouldDeductOnArrival(integration: ResolvedIntegration, status: NormalizedOrderStatus): boolean {
  // İlk görüşte kabul edilmiş/hazırlanan sipariş: düş. Tamamlanmış/iptal (geçmiş kayıt): düşme.
  if (status === 'accepted' || status === 'preparing' || status === 'ready') return true
  if (integration.platform === 'yemeksepeti' && status === 'new') {
    return String(integration.config.stock_deduct_on ?? 'RECEIVED').toUpperCase() === 'RECEIVED'
  }
  return false
}

export interface UpsertOrderResult {
  orderId: string | null
  created: boolean
  statusChanged: boolean
  skipped: boolean
}

export async function upsertPlatformOrder(integration: ResolvedIntegration, order: NormalizedOrder): Promise<UpsertOrderResult> {
  const sb = integrationServiceClient()
  const eventKey = `${order.externalOrderId}:${order.platformStatus}:${order.modifiedAt ?? ''}`
  const isNewEvent = await recordIntegrationEvent(integration.id, eventKey, `order_${order.platformStatus || 'unknown'}`.toLowerCase(), {
    externalOrderId: order.externalOrderId, status: order.status, platformStatus: order.platformStatus, total: order.total,
  })

  const { data: existingRows } = await sb
    .from('orders')
    .select('id, status, stock_deducted_at')
    .eq('integration_id', integration.id)
    .eq('external_order_id', order.externalOrderId)
    .limit(1)
  const existing = (existingRows || [])[0] as Row | undefined
  const stockCtx = (orderId: string) => ({ orderId, restaurantId: integration.restaurantId, tenantId: integration.tenantId, source: integration.platform })

  if (!existing) {
    const { data: numberData, error: numberError } = await sb.rpc('next_order_number', { r_id: integration.restaurantId } as never)
    if (numberError) throw new Error(`Sipariş numarası üretilemedi: ${numberError.message}`)

    const { data: links } = await sb.from('product_channel_links').select('external_product_id, local_product_id').eq('integration_id', integration.id)
    const localByExternal = new Map<string, string>(((links || []) as Row[]).map((l) => [String(l.external_product_id), l.local_product_id]))

    const patch: Row = {
      restaurant_id: integration.restaurantId,
      integration_id: integration.id,
      source: integration.platform,
      external_order_id: order.externalOrderId,
      external_order_number: order.externalOrderNumber,
      platform_status: order.platformStatus,
      order_number: String(numberData),
      status: order.status,
      customer_name: order.customerName,
      customer_phone: order.customerPhone,
      delivery_type: order.deliveryType === 'pickup' ? 'pickup' : 'delivery',
      delivery_address: order.deliveryAddress,
      payment_type: order.paymentType,
      subtotal: order.subtotal,
      discount: order.discount,
      delivery_fee: order.deliveryFee,
      total: order.total,
      currency: order.currency || 'TRY',
      customer_note: order.customerNote,
      raw_payload: order.rawPayload ?? null,
      created_at: order.createdAt,
    }
    const tsCol = timestampColumnFor(order.status)
    if (tsCol) patch[tsCol] = new Date().toISOString()
    if (order.status === 'cancelled') patch.cancel_reason = 'Platform: ' + order.platformStatus

    const { data: inserted, error } = await sb.from('orders').insert(patch as never).select('id').single()
    if (error) {
      if (error.code === '23505') return { orderId: null, created: false, statusChanged: false, skipped: true } // yarış: başka çalıştırıcı yazdı
      throw new Error(error.message)
    }
    const orderId = (inserted as Row).id as string
    if (order.items.length) {
      const { error: itemsError } = await sb.from('order_items').insert(order.items.map((it) => ({
        order_id: orderId,
        local_product_id: it.externalProductId ? localByExternal.get(it.externalProductId) ?? null : null,
        external_product_id: it.externalProductId,
        name: it.name,
        quantity: it.quantity,
        unit_price: it.unitPrice,
        total_price: it.totalPrice,
        options: it.options,
        note: it.note,
      })) as never)
      if (itemsError) console.error('order_items insert error:', itemsError.message)
    }
    if (shouldDeductOnArrival(integration, order.status)) await onOrderAccepted(stockCtx(orderId))
    return { orderId, created: true, statusChanged: true, skipped: false }
  }

  if (!isNewEvent) return { orderId: existing.id, created: false, statusChanged: false, skipped: true }

  const patch: Row = { platform_status: order.platformStatus, raw_payload: order.rawPayload ?? null }
  const current = existing.status as NormalizedOrderStatus
  const terminal = current === 'completed' || current === 'cancelled'
  let statusChanged = false
  if (!terminal && STATUS_RANK[order.status] > STATUS_RANK[current]) {
    patch.status = order.status
    const tsCol = timestampColumnFor(order.status)
    if (tsCol) patch[tsCol] = new Date().toISOString()
    if (order.status === 'cancelled') patch.cancel_reason = 'Platform: ' + order.platformStatus
    statusChanged = true
  }
  const { error } = await sb.from('orders').update(patch as never).eq('id', existing.id)
  if (error) throw new Error(error.message)

  if (statusChanged) {
    if (order.status === 'accepted' || (order.status !== 'cancelled' && STATUS_RANK[order.status] >= STATUS_RANK.accepted && !existing.stock_deducted_at)) {
      await onOrderAccepted(stockCtx(existing.id))
    }
    if (order.status === 'cancelled') await onOrderCancelled(stockCtx(existing.id))
  }
  return { orderId: existing.id, created: false, statusChanged, skipped: false }
}

export interface PollResult {
  integrationId: string
  platform: string
  fetched: number
  created: number
  updated: number
  error?: string
}

/** Artımlı çekim: son çekimden 5 dk öncesinden itibaren değişen paketler. */
export async function pollOrdersForIntegration(integrationId: string): Promise<PollResult> {
  const sb = integrationServiceClient()
  const integration = await getResolvedIntegration(integrationId)
  if (!integration) return { integrationId, platform: 'unknown', fetched: 0, created: 0, updated: 0, error: 'Entegrasyon bulunamadı' }
  const result: PollResult = { integrationId, platform: integration.platform, fetched: 0, created: 0, updated: 0 }
  if (integration.status !== 'active') return { ...result, error: 'Entegrasyon devre dışı' }
  if (!PLATFORM_CAPABILITIES[integration.platform].supportsOrderRead) return { ...result, error: 'Platform sipariş okumayı desteklemiyor' }

  const startedAt = Date.now()
  try {
    const lastPoll = integration.config.last_poll_at ? Date.parse(String(integration.config.last_poll_at)) : NaN
    const since = Number.isFinite(lastPoll) ? lastPoll - 5 * 60 * 1000 : Date.now() - 24 * 60 * 60 * 1000
    const adapter = createAdapter(integration.platform, integration.credentials, integration.environment)
    const orders = await adapter.getOrders({ modifiedSince: since })
    result.fetched = orders.length
    for (const order of orders) {
      const r = await upsertPlatformOrder(integration, order)
      if (r.created) result.created++
      else if (r.statusChanged) result.updated++
    }
    await sb.from('integrations').update({
      config: { ...integration.config, last_poll_at: new Date(startedAt).toISOString() },
      last_successful_sync_at: new Date().toISOString(),
      last_error: null,
    } as never).eq('id', integration.id)
  } catch (error) {
    result.error = toSafeErrorMessage(error)
    await sb.from('integrations').update({ last_error: `Sipariş çekme: ${result.error}` } as never).eq('id', integration.id)
  }
  return result
}

function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  return new Promise<T>((resolve) => {
    const timer = setTimeout(() => resolve(fallback), ms)
    promise.then((v) => { clearTimeout(timer); resolve(v) }, () => { clearTimeout(timer); resolve(fallback) })
  })
}

/** Panel açıkken cron'a gerek kalmadan çekim: son çekim maxAge'den eskiyse. */
export async function maybePollOrdersForRestaurant(restaurantId: string, options: { maxAgeMs?: number; timeoutMs?: number; force?: boolean } = {}): Promise<PollResult[]> {
  const sb = integrationServiceClient()
  const { data } = await sb.from('integrations').select('id, platform, status, config').eq('restaurant_id', restaurantId).eq('status', 'active')
  const results: PollResult[] = []
  for (const row of (data || []) as Row[]) {
    const caps = PLATFORM_CAPABILITIES[row.platform as keyof typeof PLATFORM_CAPABILITIES]
    if (!caps?.supportsOrderRead || caps.supportsWebhook) continue
    const last = row.config?.last_poll_at ? Date.parse(String(row.config.last_poll_at)) : 0
    if (!options.force && Date.now() - last < (options.maxAgeMs ?? 60_000)) continue
    results.push(await withTimeout(pollOrdersForIntegration(row.id), options.timeoutMs ?? 12_000, { integrationId: row.id, platform: row.platform, fetched: 0, created: 0, updated: 0, error: 'Zaman aşımı; arka planda devam ediyor' }))
  }
  return results
}

/** Cron: tüm aktif polling entegrasyonları. */
export async function pollAllActiveIntegrations(): Promise<PollResult[]> {
  const sb = integrationServiceClient()
  const { data } = await sb.from('integrations').select('id, platform').eq('status', 'active')
  const results: PollResult[] = []
  for (const row of (data || []) as Row[]) {
    const caps = PLATFORM_CAPABILITIES[row.platform as keyof typeof PLATFORM_CAPABILITIES]
    if (!caps?.supportsOrderRead || caps.supportsWebhook) continue
    results.push(await pollOrdersForIntegration(row.id))
  }
  return results
}

export interface PushOptions {
  reasonCode?: string
  preparationTimeMinutes?: number
}

/** Panel → platform durum bildirimi. Başarısızsa yerel durum DEĞİŞTİRİLMEZ (çağıran karar verir). */
export async function pushOrderStatus(order: Row, to: NormalizedOrderStatus, options: PushOptions = {}): Promise<{ ok: boolean; error?: string; skipped?: boolean }> {
  if (!order.integration_id || !order.external_order_id) return { ok: true, skipped: true }
  try {
    const integration = await getResolvedIntegration(order.integration_id)
    if (!integration) return { ok: false, error: 'Entegrasyon bulunamadı' }
    if (integration.status !== 'active') return { ok: false, error: 'Entegrasyon devre dışı' }
    const caps = PLATFORM_CAPABILITIES[integration.platform]
    const adapter = createAdapter(integration.platform, integration.credentials, integration.environment)
    const ext = String(order.external_order_id)
    switch (to) {
      case 'accepted':
        if (!caps.supportsOrderAccept) return { ok: true, skipped: true }
        await adapter.acceptOrder(ext, { preparationTimeMinutes: options.preparationTimeMinutes })
        return { ok: true }
      case 'cancelled':
        if (!caps.supportsOrderReject) return { ok: true, skipped: true }
        await adapter.rejectOrder(ext, { reasonCode: options.reasonCode, raw: order.raw_payload } as never)
        return { ok: true }
      case 'ready':
      case 'completed':
        if (!caps.supportsOrderStatusUpdate) return { ok: true, skipped: true }
        await adapter.updateOrderStatus(ext, to, { raw: order.raw_payload, deliveryType: (order.raw_payload as Row | null)?.deliveryType })
        return { ok: true }
      default:
        return { ok: true, skipped: true }
    }
  } catch (error) {
    return { ok: false, error: toSafeErrorMessage(error) }
  }
}
