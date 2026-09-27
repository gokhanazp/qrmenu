'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { assertRestaurantRole, resolveRestaurantContext } from '@/lib/auth/restaurant-context'
import { ORDER_VIEW_ROLES, OPERATIONS_ROLES, roleIn } from '@/lib/auth/roles'
import { hasFeature } from '@/lib/features'
import { maybePollOrdersForRestaurant, pushOrderStatus, type PollResult } from '@/lib/orders/sync'
import { onOrderAccepted, onOrderCancelled, onOrderCreated } from '@/lib/inventory/hooks'
import { stockDeductTiming } from '@/lib/inventory/types'
import { loadRestaurantFeatures } from '@/lib/auth/restaurant-context'
import { featureConfig } from '@/lib/features'
import {
  ACTIVE_ORDER_STATUSES,
  canRoleTransition,
  cartPaymentToOrderPayment,
  isOrderStatus,
  timestampColumnFor,
  type OrderSource,
  type OrderStatus,
} from '@/lib/orders/types'

// eslint-disable-next-line
type Row = Record<string, any>

// ---------------------------------------------------------------------------
// PUBLIC: QR menü sepetinden sipariş oluştur (anonim). Fiyatlar DB'den gelir.
// ---------------------------------------------------------------------------

export interface CreateQrOrderInput {
  slug: string
  items: { id: string; qty: number }[]
  paymentMethod: 'cash' | 'card'
  address: string
  note?: string
}

export interface CreatedQrOrder {
  orderNumber: string
  total: number
  items: { name: string; qty: number; unitPrice: number; total: number }[]
}

const RPC_ERROR_MESSAGES: Record<string, { tr: string; en: string }> = {
  restaurant_not_found: { tr: 'Restoran bulunamadı', en: 'Restaurant not found' },
  ordering_disabled: { tr: 'Bu restoranda sipariş özelliği kapalı', en: 'Ordering is disabled for this restaurant' },
  empty_cart: { tr: 'Sepet boş', en: 'Cart is empty' },
  too_many_items: { tr: 'Sepette çok fazla ürün var', en: 'Too many items in cart' },
  invalid_payment: { tr: 'Ödeme yöntemi seçin', en: 'Choose a payment method' },
  address_required: { tr: 'Teslimat adresi gerekli', en: 'Delivery address is required' },
  product_not_found: { tr: 'Sepetteki bir ürün artık menüde yok; sepeti yenileyin', en: 'A product in your cart is no longer available; refresh the cart' },
}

function mapRpcError(message: string, isEnglish: boolean): string {
  for (const key of Object.keys(RPC_ERROR_MESSAGES)) {
    if (message.includes(key)) return RPC_ERROR_MESSAGES[key][isEnglish ? 'en' : 'tr']
  }
  return isEnglish ? 'Order could not be saved' : 'Sipariş kaydedilemedi'
}

export async function createQrOrder(
  input: CreateQrOrderInput,
  options: { isEnglish?: boolean } = {}
): Promise<{ success: true; order: CreatedQrOrder } | { success: false; error: string }> {
  const isEnglish = Boolean(options.isEnglish)
  try {
    const items = (input.items || [])
      .filter((i) => typeof i.id === 'string' && /^[0-9a-f-]{36}$/i.test(i.id))
      .map((i) => ({ id: i.id, qty: Math.min(99, Math.max(1, Math.round(Number(i.qty) || 1))) }))
    if (items.length === 0) return { success: false, error: RPC_ERROR_MESSAGES.empty_cart[isEnglish ? 'en' : 'tr'] }
    if (input.paymentMethod !== 'cash' && input.paymentMethod !== 'card') {
      return { success: false, error: RPC_ERROR_MESSAGES.invalid_payment[isEnglish ? 'en' : 'tr'] }
    }
    const address = (input.address || '').trim()
    if (!address) return { success: false, error: RPC_ERROR_MESSAGES.address_required[isEnglish ? 'en' : 'tr'] }

    const supabase = await createClient()
    const slugPattern = (input.slug || '').replace(/[\\%_]/g, (m) => `\\${m}`)
    const { data: restaurant } = await supabase
      .from('restaurants')
      .select('id')
      .ilike('slug', slugPattern)
      .eq('is_active', true)
      .maybeSingle()
    if (!restaurant) return { success: false, error: RPC_ERROR_MESSAGES.restaurant_not_found[isEnglish ? 'en' : 'tr'] }

    const { data, error } = await supabase.rpc('create_public_order', {
      p_restaurant_id: (restaurant as Row).id,
      p_items: items,
      p_payment_type: cartPaymentToOrderPayment(input.paymentMethod),
      p_delivery_address: address,
      p_customer_note: (input.note || '').trim() || null,
    } as never)

    if (error) {
      console.error('create_public_order error:', error.message)
      return { success: false, error: mapRpcError(error.message, isEnglish) }
    }
    const result = data as Row

    // Varsayılan: stok kabul anında düşer. direct_order config'i "create" ise hemen.
    try {
      const { data: restaurantRow } = await supabase.from('restaurants').select('id, ordering_enabled, whatsapp, tenant_id').eq('id', (restaurant as Row).id).maybeSingle()
      const features = await loadRestaurantFeatures(supabase, (restaurantRow || restaurant) as Row)
      if (stockDeductTiming(featureConfig(features, 'direct_order')) === 'create') {
        await onOrderCreated({ orderId: String(result.order_id), restaurantId: (restaurant as Row).id, tenantId: (restaurantRow as Row | null)?.tenant_id ?? null, source: 'qrmenulist' })
      }
    } catch (e) {
      console.error('stock on create error:', e)
    }

    return {
      success: true,
      order: {
        orderNumber: String(result.order_number),
        total: Number(result.total),
        items: ((result.items || []) as Row[]).map((l) => ({
          name: String(l.name),
          qty: Number(l.qty),
          unitPrice: Number(l.unit_price),
          total: Number(l.total),
        })),
      },
    }
  } catch (err) {
    console.error('createQrOrder exception:', err)
    return { success: false, error: isEnglish ? 'Order could not be saved' : 'Sipariş kaydedilemedi' }
  }
}

// ---------------------------------------------------------------------------
// PANEL: sipariş listesi ve durum güncelleme
// ---------------------------------------------------------------------------

export interface PanelOrderItem {
  id: string
  name: string
  quantity: number
  unitPrice: number
  totalPrice: number
  note: string | null
  options: unknown[]
}

export interface PanelOrder {
  id: string
  orderNumber: string
  source: OrderSource
  externalOrderNumber: string | null
  status: OrderStatus
  platformStatus: string | null
  externalOrderId: string | null
  isPlatformOrder: boolean
  customerName: string | null
  customerPhone: string | null
  deliveryType: string
  deliveryAddress: string | null
  paymentType: string | null
  subtotal: number
  discount: number
  deliveryFee: number
  total: number
  currency: string
  customerNote: string | null
  cancelReason: string | null
  createdAt: string
  acceptedAt: string | null
  readyAt: string | null
  completedAt: string | null
  cancelledAt: string | null
  items: PanelOrderItem[]
}

export interface PanelOrdersFilter {
  /** 'active' = new+accepted+preparing+ready, 'all' veya tek durum */
  status?: 'active' | 'all' | OrderStatus
  source?: 'all' | OrderSource
  /** gün sayısı: 1 = bugün (İstanbul), 7, 30 */
  days?: number
}

export interface PanelOrdersData {
  restaurantId: string | null
  restaurantName: string
  featureEnabled: boolean
  schemaReady: boolean
  canOperate: boolean
  role: string | null
  orders: PanelOrder[]
  counts: Record<OrderStatus, number>
  /** Pazaryeri bağlantısı var: "Platformdan Çek" gösterilir */
  canPoll: boolean
  pollResults?: PollResult[]
  error?: string
}

function toPanelOrder(row: Row): PanelOrder {
  return {
    id: row.id,
    orderNumber: row.order_number,
    source: row.source,
    externalOrderNumber: row.external_order_number ?? null,
    status: row.status,
    platformStatus: row.platform_status ?? null,
    externalOrderId: row.external_order_id ?? null,
    isPlatformOrder: Boolean(row.integration_id) && row.source !== 'qrmenulist',
    customerName: row.customer_name ?? null,
    customerPhone: row.customer_phone ?? null,
    deliveryType: row.delivery_type,
    deliveryAddress: row.delivery_address ?? null,
    paymentType: row.payment_type ?? null,
    subtotal: Number(row.subtotal),
    discount: Number(row.discount),
    deliveryFee: Number(row.delivery_fee),
    total: Number(row.total),
    currency: row.currency,
    customerNote: row.customer_note ?? null,
    cancelReason: row.cancel_reason ?? null,
    createdAt: row.created_at,
    acceptedAt: row.accepted_at ?? null,
    readyAt: row.ready_at ?? null,
    completedAt: row.completed_at ?? null,
    cancelledAt: row.cancelled_at ?? null,
    items: ((row.order_items || []) as Row[])
      .map((i) => ({
        id: i.id,
        name: i.name,
        quantity: Number(i.quantity),
        unitPrice: Number(i.unit_price),
        totalPrice: Number(i.total_price),
        note: i.note ?? null,
        options: Array.isArray(i.options) ? i.options : [],
      })),
  }
}

function istanbulDayStart(daysBack: number): string {
  // Europe/Istanbul UTC+3 sabit (DST yok)
  const now = new Date()
  const ist = new Date(now.getTime() + 3 * 60 * 60 * 1000)
  const startUtcMs = Date.UTC(ist.getUTCFullYear(), ist.getUTCMonth(), ist.getUTCDate()) - 3 * 60 * 60 * 1000 - (daysBack - 1) * 24 * 60 * 60 * 1000
  return new Date(startUtcMs).toISOString()
}

export async function getPanelOrders(filter: PanelOrdersFilter = {}): Promise<PanelOrdersData> {
  const emptyCounts = { new: 0, accepted: 0, preparing: 0, ready: 0, completed: 0, cancelled: 0 } as Record<OrderStatus, number>
  const base: PanelOrdersData = { restaurantId: null, restaurantName: '', featureEnabled: false, schemaReady: true, canOperate: false, role: null, orders: [], counts: emptyCounts, canPoll: false }

  const result = await resolveRestaurantContext()
  if (!result.ok) return { ...base, error: result.error }
  const { ctx } = result
  base.restaurantId = ctx.restaurantId
  base.restaurantName = ctx.restaurant.name
  base.role = ctx.role
  base.featureEnabled = hasFeature(ctx.features, 'direct_order')
  base.canOperate = roleIn(ctx.role, OPERATIONS_ROLES) || ctx.role === 'kitchen'

  if (!roleIn(ctx.role, ORDER_VIEW_ROLES)) return { ...base, error: 'Sipariş ekranı için yetkiniz yok' }
  if (!base.featureEnabled) return base

  // Panel açıkken cron beklemeden pazaryeri siparişlerini çek (60 sn'den eskiyse, en fazla 12 sn)
  let pollResults: PollResult[] | undefined
  if (hasFeature(ctx.features, 'marketplace')) {
    base.canPoll = true
    try {
      pollResults = await maybePollOrdersForRestaurant(ctx.restaurantId)
    } catch (e) {
      console.error('poll error:', e)
    }
  }

  const supabase = await createClient()
  const days = filter.days && [1, 7, 30].includes(filter.days) ? filter.days : 7
  let query = supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('restaurant_id', ctx.restaurantId)
    .gte('created_at', istanbulDayStart(days))
    .order('created_at', { ascending: false })
    .limit(300)

  const status = filter.status || 'active'
  if (status === 'active') query = query.in('status', ACTIVE_ORDER_STATUSES)
  else if (status !== 'all' && isOrderStatus(status)) query = query.eq('status', status)
  if (filter.source && filter.source !== 'all') query = query.eq('source', filter.source)

  const { data, error } = await query
  if (error) {
    if (/does not exist|schema cache|could not find/i.test(error.message)) return { ...base, schemaReady: false }
    return { ...base, error: error.message }
  }

  // Sayaçlar: seçili gün aralığındaki tüm durumlar (kaynak filtresinden bağımsız)
  const { data: countRows } = await supabase
    .from('orders')
    .select('status')
    .eq('restaurant_id', ctx.restaurantId)
    .gte('created_at', istanbulDayStart(days))
  const counts = { ...emptyCounts }
  for (const r of (countRows || []) as Row[]) {
    if (isOrderStatus(r.status)) counts[r.status as OrderStatus]++
  }

  return { ...base, orders: ((data || []) as Row[]).map(toPanelOrder), counts, pollResults }
}

/** "Platformdan Çek": son çekim zamanına bakmadan hemen çeker. */
export async function pollOrdersNow(): Promise<{ success: boolean; error?: string; results?: PollResult[] }> {
  const result = await resolveRestaurantContext()
  if (!result.ok) return { success: false, error: result.error }
  const { ctx } = result
  if (!roleIn(ctx.role, ORDER_VIEW_ROLES)) return { success: false, error: 'Yetkiniz yok' }
  if (!hasFeature(ctx.features, 'marketplace')) return { success: false, error: 'Pazaryeri özelliği açık değil' }
  const results = await maybePollOrdersForRestaurant(ctx.restaurantId, { force: true, timeoutMs: 25_000 })
  revalidatePath('/panel/orders')
  return { success: true, results }
}

export async function updateOrderStatus(input: {
  orderId: string
  status: string
  reason?: string
  /** Platform iptal sebep kodu (Trendyol reasonId / Yemeksepeti reason) */
  reasonCode?: string
  /** Trendyol kabulünde hazırlama süresi (dk) */
  preparationTimeMinutes?: number
}): Promise<{ success: boolean; error?: string }> {
  if (!isOrderStatus(input.status)) return { success: false, error: 'Geçersiz durum' }
  const supabase = await createClient()

  const { data: order, error } = await supabase
    .from('orders')
    .select('id, restaurant_id, tenant_id, source, status, integration_id, external_order_id, raw_payload')
    .eq('id', input.orderId)
    .maybeSingle()
  if (error) return { success: false, error: error.message }
  if (!order) return { success: false, error: 'Sipariş bulunamadı' }
  const row = order as Row

  const access = await assertRestaurantRole(row.restaurant_id, [...OPERATIONS_ROLES, 'kitchen'])
  if (!access.ok) return { success: false, error: access.error }

  const from = row.status as OrderStatus
  const to = input.status
  if (!canRoleTransition(access.role, from, to)) {
    return { success: false, error: `Bu geçiş yapılamaz: ${from} → ${to}` }
  }

  // Platform siparişi: önce platforma ilet; başarısızsa yerel durum değişmez
  if (row.integration_id && row.source !== 'qrmenulist') {
    const push = await pushOrderStatus(row, to, { reasonCode: input.reasonCode, preparationTimeMinutes: input.preparationTimeMinutes })
    if (!push.ok) return { success: false, error: `Platforma iletilemedi: ${push.error}` }
  }

  const patch: Row = { status: to }
  const tsCol = timestampColumnFor(to)
  if (tsCol) patch[tsCol] = new Date().toISOString()
  if (to === 'cancelled') {
    const reasonText = (input.reason || '').trim().slice(0, 300)
    patch.cancel_reason = [input.reasonCode ? `Kod ${input.reasonCode}` : null, reasonText || null].filter(Boolean).join(': ') || null
  }

  // Yalnızca beklenen önceki durumdan geçiş (aynı anda iki kullanıcı basarsa ikincisi düşer)
  const { data: updated, error: updateError } = await supabase
    .from('orders')
    .update(patch as never)
    .eq('id', input.orderId)
    .eq('status', from)
    .select('id')
  if (updateError) return { success: false, error: updateError.message }
  if (!updated || updated.length === 0) return { success: false, error: 'Sipariş bu arada başka biri tarafından güncellendi; sayfayı yenileyin' }

  const stockCtx = { orderId: row.id, restaurantId: row.restaurant_id, tenantId: row.tenant_id ?? null, source: row.source }
  if (to === 'accepted') await onOrderAccepted(stockCtx)
  if (to === 'cancelled') await onOrderCancelled(stockCtx)


  revalidatePath('/panel/orders')
  return { success: true }
}
