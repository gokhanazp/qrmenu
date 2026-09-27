'use server'

/**
 * Süper admin: sistem özeti ve entegrasyon izleme.
 */
import { createClient } from '@/lib/supabase/server'
import { isAdmin } from './admin'
import { isMissingSchemaError } from '@/lib/auth/restaurant-context'
import { PLATFORM_LABELS, type HealthStatus, type MarketplacePlatform } from '@/lib/integrations/types'

// eslint-disable-next-line
type Row = Record<string, any>

export interface AdminOverview {
  tenants: number
  restaurants: number
  integrations: number
  integrationErrors: number
  ordersToday: number
  revenueToday: number
  ordersTodayBySource: { source: string; orders: number; revenue: number }[]
  schemaReady: boolean
  error?: string
}

function istanbulTodayStart(): string {
  const now = new Date()
  const ist = new Date(now.getTime() + 3 * 60 * 60 * 1000)
  return new Date(Date.UTC(ist.getUTCFullYear(), ist.getUTCMonth(), ist.getUTCDate()) - 3 * 60 * 60 * 1000).toISOString()
}

export async function getAdminOverview(): Promise<AdminOverview> {
  const empty: AdminOverview = { tenants: 0, restaurants: 0, integrations: 0, integrationErrors: 0, ordersToday: 0, revenueToday: 0, ordersTodayBySource: [], schemaReady: true }
  const { isAdmin: ok } = await isAdmin()
  if (!ok) return { ...empty, error: 'Unauthorized' }
  const supabase = await createClient()
  const [tenants, restaurants, integrations, orders] = await Promise.all([
    supabase.from('tenants').select('*', { count: 'exact', head: true }),
    supabase.from('restaurants').select('*', { count: 'exact', head: true }),
    supabase.from('integrations').select('id, health_status, status'),
    supabase.from('orders').select('source, status, total').gte('created_at', istanbulTodayStart()),
  ])
  if (tenants.error && isMissingSchemaError(tenants.error)) return { ...empty, restaurants: restaurants.count || 0, schemaReady: false }
  const integRows = (integrations.data || []) as Row[]
  const orderRows = (orders.data || []) as Row[]
  const bySource = new Map<string, { source: string; orders: number; revenue: number }>()
  let ordersToday = 0
  let revenueToday = 0
  for (const o of orderRows) {
    if (o.status === 'cancelled') continue
    ordersToday++
    revenueToday += Number(o.total) || 0
    const s = bySource.get(o.source) || { source: o.source, orders: 0, revenue: 0 }
    s.orders++
    s.revenue += Number(o.total) || 0
    bySource.set(o.source, s)
  }
  return {
    tenants: tenants.count || 0,
    restaurants: restaurants.count || 0,
    integrations: integRows.filter((i) => i.status === 'active').length,
    integrationErrors: integRows.filter((i) => i.status === 'active' && i.health_status === 'error').length,
    ordersToday,
    revenueToday: Math.round(revenueToday * 100) / 100,
    ordersTodayBySource: Array.from(bySource.values()).map((s) => ({ ...s, revenue: Math.round(s.revenue * 100) / 100 })),
    schemaReady: true,
  }
}

export interface AdminIntegrationRow {
  id: string
  platform: MarketplacePlatform
  label: string
  restaurantId: string
  restaurantName: string
  restaurantSlug: string
  tenantName: string | null
  status: 'active' | 'disabled'
  healthStatus: HealthStatus
  environment: string
  lastHealthCheckAt: string | null
  lastSuccessfulSyncAt: string | null
  lastPollAt: string | null
  lastError: string | null
  ordersTotal: number
  failedJobs: number
}

export async function getAllIntegrations(): Promise<{ integrations: AdminIntegrationRow[]; schemaReady: boolean; error?: string }> {
  const { isAdmin: ok } = await isAdmin()
  if (!ok) return { integrations: [], schemaReady: true, error: 'Unauthorized' }
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('integrations')
    .select('id, platform, restaurant_id, status, health_status, environment, last_health_check_at, last_successful_sync_at, last_error, config, restaurants(name, slug, tenant_id, tenants(name))')
    .order('updated_at', { ascending: false })
  if (error) return { integrations: [], schemaReady: !isMissingSchemaError(error), error: isMissingSchemaError(error) ? undefined : error.message }
  const rows = (data || []) as Row[]
  const ids = rows.map((r) => r.id)
  const [ordersRes, jobsRes] = await Promise.all([
    ids.length ? supabase.from('orders').select('integration_id').in('integration_id', ids) : Promise.resolve({ data: [] as Row[] }),
    ids.length ? supabase.from('integration_jobs').select('integration_id').in('integration_id', ids).eq('status', 'failed') : Promise.resolve({ data: [] as Row[] }),
  ])
  const orderCount = new Map<string, number>()
  for (const o of (ordersRes.data || []) as Row[]) orderCount.set(o.integration_id, (orderCount.get(o.integration_id) || 0) + 1)
  const failedCount = new Map<string, number>()
  for (const j of (jobsRes.data || []) as Row[]) failedCount.set(j.integration_id, (failedCount.get(j.integration_id) || 0) + 1)

  return {
    schemaReady: true,
    integrations: rows.map((r) => {
      const rest = (r.restaurants || {}) as Row
      return {
        id: r.id,
        platform: r.platform,
        label: PLATFORM_LABELS[r.platform as MarketplacePlatform] || r.platform,
        restaurantId: r.restaurant_id,
        restaurantName: rest.name || '',
        restaurantSlug: rest.slug || '',
        tenantName: (rest.tenants as Row | null)?.name ?? null,
        status: r.status,
        healthStatus: r.health_status,
        environment: r.environment,
        lastHealthCheckAt: r.last_health_check_at ?? null,
        lastSuccessfulSyncAt: r.last_successful_sync_at ?? null,
        lastPollAt: ((r.config as Row | null)?.last_poll_at as string | undefined) ?? null,
        lastError: r.last_error ?? null,
        ordersTotal: orderCount.get(r.id) || 0,
        failedJobs: failedCount.get(r.id) || 0,
      }
    }),
  }
}
