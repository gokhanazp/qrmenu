/**
 * Sipariş yaşam döngüsü → stok köprüsü (Faz 5).
 *
 * Kabul: deduct_order_stock(order) — ürün başına bir kez, yalnızca track_stock=true
 * ürünlerde düşer. İptal: restore_order_stock(order) — yalnızca düşülmüşse ve bir kez.
 * Kullanılabilirliği değişen ürünler eşleşen platformlara gönderilir.
 *
 * Hatalar sipariş akışını kesmez; loglanır (stok gerçeği defterde kalır).
 */
import { integrationServiceClient } from '@/lib/integrations/service'
import { syncProductsAvailability } from './sync'

export interface OrderStockContext {
  orderId: string
  restaurantId: string
  tenantId: string | null
  source: string
}

// eslint-disable-next-line
type Row = Record<string, any>

async function runStockRpc(fn: 'deduct_order_stock' | 'restore_order_stock', orderId: string): Promise<string[]> {
  const sb = integrationServiceClient()
  const { data, error } = await sb.rpc(fn, { p_order_id: orderId } as never)
  if (error) {
    // Migration 027 uygulanmamışsa fonksiyon yoktur; sessizce geç
    if (/does not exist|schema cache|could not find/i.test(error.message)) return []
    console.error(`${fn} error:`, error.message)
    return []
  }
  const res = (data || {}) as Row
  return Array.isArray(res.changed_products) ? (res.changed_products as string[]) : []
}

export async function onOrderAccepted(ctx: OrderStockContext): Promise<void> {
  try {
    const changed = await runStockRpc('deduct_order_stock', ctx.orderId)
    if (changed.length) await syncProductsAvailability(changed)
  } catch (e) {
    console.error('onOrderAccepted stock error:', e)
  }
}

export async function onOrderCancelled(ctx: OrderStockContext): Promise<void> {
  try {
    const changed = await runStockRpc('restore_order_stock', ctx.orderId)
    if (changed.length) await syncProductsAvailability(changed)
  } catch (e) {
    console.error('onOrderCancelled stock error:', e)
  }
}

/** direct_order config "stock_deduct_on: create" için: sipariş oluşur oluşmaz düş. */
export async function onOrderCreated(ctx: OrderStockContext): Promise<void> {
  return onOrderAccepted(ctx)
}
