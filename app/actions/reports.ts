'use server'

import { createClient } from '@/lib/supabase/server'
import { normalizeCurrency } from '@/lib/utils/currency'
import { resolveRestaurantContext } from '@/lib/auth/restaurant-context'
import { REPORT_ROLES, roleIn } from '@/lib/auth/roles'
import { hasFeature } from '@/lib/features'
import { aggregateOrders, type ReportOrderRow, type ReportSummary } from '@/lib/reports/aggregate'

// eslint-disable-next-line
type Row = Record<string, any>

export interface ReportsFilter {
  days?: number
  /** 'all' = erişilebilir tüm şubeler (tenant), yoksa aktif şube */
  scope?: 'current' | 'all'
}

export interface ReportsData {
  restaurantName: string
  currency: string
  featureEnabled: boolean
  canViewAllBranches: boolean
  restaurants: { id: string; name: string }[]
  days: number
  scope: 'current' | 'all'
  summary: ReportSummary | null
  error?: string
}

function istanbulStart(daysBack: number): string {
  const now = new Date()
  const ist = new Date(now.getTime() + 3 * 60 * 60 * 1000)
  const startUtcMs = Date.UTC(ist.getUTCFullYear(), ist.getUTCMonth(), ist.getUTCDate()) - 3 * 60 * 60 * 1000 - (daysBack - 1) * 24 * 60 * 60 * 1000
  return new Date(startUtcMs).toISOString()
}

export async function getReports(filter: ReportsFilter = {}): Promise<ReportsData> {
  const days = filter.days && [1, 7, 30].includes(filter.days) ? filter.days : 1
  const scope = filter.scope === 'all' ? 'all' : 'current'
  const base: ReportsData = { restaurantName: '', currency: 'TRY', featureEnabled: false, canViewAllBranches: false, restaurants: [], days, scope, summary: null }
  const result = await resolveRestaurantContext()
  if (!result.ok) return { ...base, error: result.error }
  const { ctx } = result
  base.restaurantName = ctx.restaurant.name
  base.currency = normalizeCurrency((ctx.restaurant as { currency?: string }).currency)
  base.featureEnabled = hasFeature(ctx.features, 'reports')
  base.restaurants = ctx.restaurants.map((r) => ({ id: r.id, name: r.name }))
  base.canViewAllBranches = ctx.restaurants.length > 1
  if (!base.featureEnabled) return base
  if (!roleIn(ctx.role, REPORT_ROLES)) return { ...base, error: 'Raporlar için yetkiniz yok' }

  const restaurantIds = scope === 'all' ? ctx.restaurants.map((r) => r.id) : [ctx.restaurantId]
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('orders')
    .select('restaurant_id, source, status, total, created_at, order_items(name, quantity, total_price)')
    .in('restaurant_id', restaurantIds)
    .gte('created_at', istanbulStart(days))
    .order('created_at', { ascending: false })
    .limit(5000)
  if (error) return { ...base, error: /does not exist|schema cache|could not find/i.test(error.message) ? 'Sipariş tabloları henüz oluşturulmamış' : error.message }

  const rows: ReportOrderRow[] = ((data || []) as Row[]).map((r) => ({
    restaurant_id: r.restaurant_id,
    source: r.source,
    status: r.status,
    total: Number(r.total),
    created_at: r.created_at,
    items: ((r.order_items || []) as Row[]).map((i) => ({ name: i.name, quantity: Number(i.quantity), total_price: Number(i.total_price) })),
  }))
  return { ...base, summary: aggregateOrders(rows) }
}
