/**
 * Merkezi sipariş modeli — saf tipler, etiketler ve durum geçiş kuralları.
 */
import type { RestaurantRole } from '@/lib/auth/roles'

export const ORDER_STATUSES = ['new', 'accepted', 'preparing', 'ready', 'completed', 'cancelled'] as const
export type OrderStatus = (typeof ORDER_STATUSES)[number]

export const ACTIVE_ORDER_STATUSES: OrderStatus[] = ['new', 'accepted', 'preparing', 'ready']

export const ORDER_SOURCES = ['qrmenulist', 'trendyol_food', 'yemeksepeti', 'getir_food', 'migros_food'] as const
export type OrderSource = (typeof ORDER_SOURCES)[number]

export const ORDER_STATUS_LABELS: Record<'tr' | 'en', Record<OrderStatus, string>> = {
  tr: { new: 'Yeni', accepted: 'Kabul Edildi', preparing: 'Hazırlanıyor', ready: 'Hazır', completed: 'Tamamlandı', cancelled: 'İptal' },
  en: { new: 'New', accepted: 'Accepted', preparing: 'Preparing', ready: 'Ready', completed: 'Completed', cancelled: 'Cancelled' },
}

export const ORDER_SOURCE_LABELS: Record<OrderSource, string> = {
  qrmenulist: 'QR Menü',
  trendyol_food: 'Trendyol Yemek',
  yemeksepeti: 'Yemeksepeti',
  getir_food: 'Getir Yemek',
  migros_food: 'Migros Yemek',
}

export const PAYMENT_TYPE_LABELS: Record<'tr' | 'en', Record<string, string>> = {
  tr: { cash_on_delivery: 'Kapıda Nakit', card_on_delivery: 'Kapıda Kart', online: 'Online Ödeme', PAY_WITH_CARD: 'Online Kart' },
  en: { cash_on_delivery: 'Cash on delivery', card_on_delivery: 'Card on delivery', online: 'Online payment', PAY_WITH_CARD: 'Online card' },
}

/** İzin verilen geçişler. */
export const ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  new: ['accepted', 'cancelled'],
  accepted: ['preparing', 'ready', 'cancelled'],
  preparing: ['ready', 'cancelled'],
  ready: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
}

export function isOrderStatus(value: string): value is OrderStatus {
  return (ORDER_STATUSES as readonly string[]).includes(value)
}

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return ORDER_TRANSITIONS[from].includes(to)
}

/** Mutfak yalnızca hazırlama akışını ilerletir; kabul/red/iptal yapamaz. */
const KITCHEN_ALLOWED: [OrderStatus, OrderStatus][] = [
  ['accepted', 'preparing'],
  ['preparing', 'ready'],
]

export function canRoleTransition(role: RestaurantRole | null | undefined, from: OrderStatus, to: OrderStatus): boolean {
  if (!role) return false
  if (!canTransition(from, to)) return false
  if (role === 'kitchen') return KITCHEN_ALLOWED.some(([f, t]) => f === from && t === to)
  if (role === 'accountant') return false
  return true
}

/** Geçişte doldurulacak zaman damgası kolonu. */
export function timestampColumnFor(status: OrderStatus): string | null {
  switch (status) {
    case 'accepted': return 'accepted_at'
    case 'preparing': return 'preparing_at'
    case 'ready': return 'ready_at'
    case 'completed': return 'completed_at'
    case 'cancelled': return 'cancelled_at'
    default: return null
  }
}

/** Sepetteki ödeme seçeneğini sipariş kaydındaki değere çevirir. */
export function cartPaymentToOrderPayment(method: 'cash' | 'card'): 'cash_on_delivery' | 'card_on_delivery' {
  return method === 'card' ? 'card_on_delivery' : 'cash_on_delivery'
}

/** "12 dk", "2 sa 5 dk" gibi sipariş yaşı. */
export function formatOrderAge(createdAt: string, now: Date = new Date(), locale: 'tr' | 'en' = 'tr'): string {
  const minutes = Math.max(0, Math.floor((now.getTime() - new Date(createdAt).getTime()) / 60000))
  const m = locale === 'en' ? 'min' : 'dk'
  const h = locale === 'en' ? 'h' : 'sa'
  if (minutes < 60) return `${minutes} ${m}`
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  if (hours < 24) return rest ? `${hours} ${h} ${rest} ${m}` : `${hours} ${h}`
  const days = Math.floor(hours / 24)
  return locale === 'en' ? `${days} d` : `${days} gün`
}
