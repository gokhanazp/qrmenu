/**
 * Yemeksepeti (Delivery Hero Partner API) sipariş normalizasyonu (saf).
 *
 * Doğrulanan: webhook statüleri RECEIVED, READY_FOR_PICKUP, DISPATCHED, CANCELLED,
 * DELIVERED; payload'da order_id, store_id, items[] (sku, quantity, price), müşteri
 * telefonu. Alan adlarının tam listesi dokümanda örnekle verilmediği için ayrıştırma
 * savunmacıdır; ham yük her zaman raw_payload'da saklanır.
 */
import type { CancelReason, NormalizedOrder, NormalizedOrderItem, NormalizedOrderStatus } from '../types'

// eslint-disable-next-line
type Row = Record<string, any>

/** Dokümanda doğrulanan iptal sebepleri */
export const YEMEKSEPETI_CANCEL_REASONS: CancelReason[] = [
  { code: 'ITEM_UNAVAILABLE', label: 'Ürün mevcut değil' },
  { code: 'TOO_BUSY', label: 'Çok yoğun' },
  { code: 'CLOSED', label: 'Mağaza kapalı' },
]

export function mapYemeksepetiStatus(status: string): NormalizedOrderStatus {
  switch (String(status).toUpperCase()) {
    case 'RECEIVED': return 'new'
    case 'READY_FOR_PICKUP': return 'ready'
    case 'DISPATCHED': return 'ready'
    case 'DELIVERED': return 'completed'
    case 'CANCELLED': return 'cancelled'
    default: return 'new'
  }
}

function num(v: unknown, fallback = 0): number {
  const n = typeof v === 'number' ? v : v ? Number(v) : NaN
  return Number.isFinite(n) ? n : fallback
}

function pick(obj: Row, keys: string[]): unknown {
  for (const k of keys) if (obj[k] !== undefined && obj[k] !== null) return obj[k]
  return undefined
}

export function normalizeYemeksepetiOrder(payload: Row): NormalizedOrder {
  const order = (payload.order && typeof payload.order === 'object' ? payload.order : payload) as Row
  const status = String(pick(order, ['status', 'order_status']) ?? 'RECEIVED')
  const rawItems = (pick(order, ['items', 'products', 'order_items']) as Row[] | undefined) || []
  const items: NormalizedOrderItem[] = rawItems.map((it) => {
    const quantity = Math.max(1, Math.round(num(pick(it, ['quantity', 'qty', 'amount']), 1)))
    const pricing = (it.pricing && typeof it.pricing === 'object' ? it.pricing : {}) as Row
    const unitPrice = num(pick(it, ['unit_price', 'price']) ?? pick(pricing, ['unit_price', 'price']))
    const totalRaw = pick(it, ['total_price', 'total']) ?? pick(pricing, ['total_price', 'total'])
    return {
      externalProductId: it.sku !== undefined ? String(it.sku) : it.remote_id !== undefined ? String(it.remote_id) : null,
      externalItemId: it.id !== undefined ? String(it.id) : it.sku !== undefined ? String(it.sku) : null,
      name: String(pick(it, ['title', 'name']) ?? 'Ürün'),
      quantity,
      unitPrice,
      totalPrice: totalRaw !== undefined ? num(totalRaw) : Math.round(unitPrice * quantity * 100) / 100,
      options: Array.isArray(it.options) ? it.options : Array.isArray(it.toppings) ? it.toppings : [],
      note: typeof it.comment === 'string' && it.comment.trim() ? it.comment.trim() : null,
    }
  })
  const customer = (pick(order, ['customer']) || {}) as Row
  const delivery = (pick(order, ['delivery', 'delivery_address', 'address']) || {}) as Row
  const price = (pick(order, ['price', 'pricing', 'totals']) || {}) as Row
  const total = num(pick(order, ['total', 'total_price', 'grand_total']) ?? pick(price, ['grand_total', 'total', 'total_price']), items.reduce((s, i) => s + i.totalPrice, 0))
  const deliveryFee = num(pick(order, ['delivery_fee']) ?? pick(price, ['delivery_fee']))
  const discount = num(pick(order, ['discount']) ?? pick(price, ['discount']))
  const addressParts = [delivery.street, delivery.number, delivery.building, delivery.floor, delivery.flat, delivery.city, delivery.address_text, delivery.formatted_address].filter((x) => typeof x === 'string' && x.trim())
  const created = pick(order, ['created_at', 'placed_at', 'order_time', 'created'])
  const modified = pick(order, ['updated_at', 'modified_at', 'timestamp'])

  return {
    externalOrderId: String(pick(order, ['order_id', 'id', 'code'])),
    externalOrderNumber: pick(order, ['code', 'short_code', 'order_number']) ? String(pick(order, ['code', 'short_code', 'order_number'])) : null,
    platformStatus: status,
    status: mapYemeksepetiStatus(status),
    modifiedAt: modified ? new Date(String(modified)).toISOString() : null,
    deliveryAddress: addressParts.length ? addressParts.join(', ') : null,
    customerName: [customer.first_name, customer.last_name].filter(Boolean).join(' ') || (typeof customer.name === 'string' ? customer.name : null),
    customerPhone: (pick(customer, ['mobile_phone', 'phone', 'phone_number']) as string | undefined) ?? null,
    deliveryType: String(pick(order, ['expedition_type', 'delivery_type']) ?? '').toLowerCase().includes('pickup') ? 'pickup' : 'delivery',
    paymentType: (pick(order, ['payment_type', 'payment_method']) as string | undefined) ?? null,
    subtotal: Math.max(0, Math.round((total - deliveryFee + discount) * 100) / 100),
    discount,
    deliveryFee,
    total,
    currency: String(pick(order, ['currency']) ?? 'TRY'),
    customerNote: typeof order.comment === 'string' && order.comment.trim() ? order.comment.trim() : null,
    createdAt: created && !Number.isNaN(new Date(String(created)).getTime()) ? new Date(String(created)).toISOString() : new Date().toISOString(),
    items,
    rawPayload: payload,
  }
}

/** PUT /v2/chains/{chain}/orders/{id} gövdeleri (dokümandaki alan adları) */
export function yemeksepetiStatusBody(status: 'READY_FOR_PICKUP' | 'DISPATCHED'): Record<string, unknown> {
  return { status }
}
export function yemeksepetiCancelBody(reason: string): Record<string, unknown> {
  return { status: 'CANCELLED', cancellation: { reason } }
}
/** PUT /v2/chains/{chain}/vendors/{vendor}/catalog gövdesi */
export function yemeksepetiCatalogBody(products: { sku: string; active?: boolean; price?: number; quantity?: number }[]): Record<string, unknown> {
  return {
    products: products.map((p) => {
      const row: Record<string, unknown> = { sku: p.sku }
      if (p.active !== undefined) row.active = p.active
      if (p.price !== undefined) row.price = p.price
      if (p.quantity !== undefined) row.quantity = p.quantity
      return row
    }),
  }
}
