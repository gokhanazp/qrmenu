/**
 * Rapor toplamları — saf. Komisyon oranı hardcode edilmez; ileride
 * platform_commission_settings eklenince ciro-net hesabı buraya bağlanır.
 */
import type { OrderSource, OrderStatus } from '@/lib/orders/types'

export interface ReportOrderRow {
  restaurant_id: string
  source: OrderSource
  status: OrderStatus
  total: number
  created_at: string
  items?: { name: string; quantity: number; total_price: number }[]
}

export interface SourceStats {
  source: OrderSource
  orders: number
  revenue: number
  cancelled: number
}

export interface DayStats {
  day: string // YYYY-MM-DD (İstanbul)
  orders: number
  revenue: number
}

export interface ReportSummary {
  orders: number
  revenue: number
  cancelled: number
  averageOrder: number
  bySource: SourceStats[]
  byDay: DayStats[]
  topProducts: { name: string; quantity: number; revenue: number }[]
  byRestaurant: { restaurantId: string; orders: number; revenue: number }[]
}

/** Tamamlanmış/aktif siparişler ciroya girer; iptaller sayılır ama ciroya girmez. */
export function countsTowardRevenue(status: OrderStatus): boolean {
  return status !== 'cancelled'
}

export function istanbulDay(iso: string): string {
  const d = new Date(new Date(iso).getTime() + 3 * 60 * 60 * 1000)
  return d.toISOString().slice(0, 10)
}

export function aggregateOrders(rows: ReportOrderRow[]): ReportSummary {
  const bySource = new Map<OrderSource, SourceStats>()
  const byDay = new Map<string, DayStats>()
  const products = new Map<string, { name: string; quantity: number; revenue: number }>()
  const byRestaurant = new Map<string, { restaurantId: string; orders: number; revenue: number }>()
  let orders = 0
  let revenue = 0
  let cancelled = 0

  for (const row of rows) {
    const revenueOk = countsTowardRevenue(row.status)
    const total = Number(row.total) || 0
    const src = bySource.get(row.source) || { source: row.source, orders: 0, revenue: 0, cancelled: 0 }
    const day = istanbulDay(row.created_at)
    const dayStat = byDay.get(day) || { day, orders: 0, revenue: 0 }
    const rest = byRestaurant.get(row.restaurant_id) || { restaurantId: row.restaurant_id, orders: 0, revenue: 0 }

    if (revenueOk) {
      orders++
      revenue += total
      src.orders++
      src.revenue += total
      dayStat.orders++
      dayStat.revenue += total
      rest.orders++
      rest.revenue += total
      for (const item of row.items || []) {
        const key = item.name.trim().toLocaleLowerCase('tr-TR')
        const p = products.get(key) || { name: item.name, quantity: 0, revenue: 0 }
        p.quantity += Number(item.quantity) || 0
        p.revenue += Number(item.total_price) || 0
        products.set(key, p)
      }
    } else {
      cancelled++
      src.cancelled++
    }
    bySource.set(row.source, src)
    // Gün ve şube kırılımı yalnızca ciroya giren siparişlerden oluşur
    if (revenueOk) {
      byDay.set(day, dayStat)
      byRestaurant.set(row.restaurant_id, rest)
    }
  }

  const round = (n: number) => Math.round(n * 100) / 100
  return {
    orders,
    revenue: round(revenue),
    cancelled,
    averageOrder: orders ? round(revenue / orders) : 0,
    bySource: Array.from(bySource.values()).map((s) => ({ ...s, revenue: round(s.revenue) })).sort((a, b) => b.revenue - a.revenue),
    byDay: Array.from(byDay.values()).map((d) => ({ ...d, revenue: round(d.revenue) })).sort((a, b) => a.day.localeCompare(b.day)),
    topProducts: Array.from(products.values()).map((p) => ({ ...p, revenue: round(p.revenue) })).sort((a, b) => b.quantity - a.quantity || b.revenue - a.revenue).slice(0, 10),
    byRestaurant: Array.from(byRestaurant.values()).map((r) => ({ ...r, revenue: round(r.revenue) })).sort((a, b) => b.revenue - a.revenue),
  }
}
