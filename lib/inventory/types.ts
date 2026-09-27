/**
 * Merkezi stok — saf yardımcılar.
 */
export const INVENTORY_TX_TYPES = ['order_sale', 'order_cancel_restore', 'manual_adjustment', 'stock_in', 'stock_out', 'correction'] as const
export type InventoryTxType = (typeof INVENTORY_TX_TYPES)[number]

export const INVENTORY_TX_LABELS: Record<InventoryTxType, string> = {
  order_sale: 'Sipariş satışı',
  order_cancel_restore: 'İptal iadesi',
  manual_adjustment: 'Elle düzeltme',
  stock_in: 'Stok girişi',
  stock_out: 'Stok çıkışı',
  correction: 'Sayım düzeltmesi',
}

/** Sipariş düşüm/iade idempotency anahtarları (DB fonksiyonlarıyla birebir aynı biçim). */
export function orderDeductKey(orderId: string, productId: string): string {
  return `order:${orderId}:product:${productId}:deduct`
}
export function orderRestoreKey(orderId: string, productId: string): string {
  return `order:${orderId}:product:${productId}:restore`
}

export interface ProductAvailabilityState {
  is_available: boolean
  track_stock: boolean
  stock_quantity: number | null
  availability_manual_override: boolean
}

/**
 * Stok değişimi sonrası beklenen kullanılabilirlik (apply_inventory_transaction ile aynı kural):
 *  - stok 0 → tükendi
 *  - stok > 0 ve şu an tükendi ve elle engel yoksa → satışta
 *  - aksi hâlde mevcut değer
 */
export function deriveAvailability(state: ProductAvailabilityState, nextQuantity: number): boolean {
  if (!state.track_stock) return state.is_available
  if (nextQuantity <= 0) return false
  if (!state.is_available && !state.availability_manual_override) return true
  return state.is_available
}

export type StockDeductTiming = 'accept' | 'create'

/** direct_order feature config'inden stok düşüm anı; varsayılan kabul anı. */
export function stockDeductTiming(config: Record<string, unknown> | null | undefined): StockDeductTiming {
  return config?.stock_deduct_on === 'create' ? 'create' : 'accept'
}

export function formatStockLabel(state: ProductAvailabilityState, locale: 'tr' | 'en' = 'tr'): string {
  if (!state.is_available) return locale === 'en' ? 'Sold out' : 'Tükendi'
  if (state.track_stock) return `${state.stock_quantity ?? 0}`
  return locale === 'en' ? 'In stock' : 'Satışta'
}
