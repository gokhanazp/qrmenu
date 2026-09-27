/**
 * Restoran bağlamı (server-only).
 *
 * Panel ve server action'lar için TEK erişim noktası:
 *   - oturumdaki kullanıcı
 *   - erişebildiği restoranlar (sahip + tenant üyeliği + şube üyeliği)
 *   - aktif restoran (cookie ile seçilir, her istekte üyelik DB'den doğrulanır)
 *   - etkin rol ve açık özellikler
 *
 * Eski davranış korunur: tek restoranı olan sahip için sonuç, bugünkü
 * `owner_user_id = auth.uid()` sorgusuyla birebir aynıdır.
 *
 * Migration 022/023 henüz uygulanmamışsa (tablo/fonksiyon yok) sessizce eski
 * sahip modeline düşer ve bir kez uyarı loglar; uygulama çalışmaya devam eder.
 *
 * Impersonation cookie'si ("impersonating_restaurant") YALNIZCA süper admin
 * için dikkate alınır; imzasız olduğu için başka kullanıcılarda yok sayılır.
 */
import { cache } from 'react'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { buildFeatureSet, type FeatureRow, type FeatureSet } from '@/lib/features'
import { isRestaurantRole, roleIn, strongerRole, type RestaurantRole } from './roles'

export const ACTIVE_RESTAURANT_COOKIE = 'active_restaurant_id'
export const IMPERSONATION_COOKIE = 'impersonating_restaurant'

type ServerClient = Awaited<ReturnType<typeof createClient>>

export type RestaurantRow = Record<string, any>

export interface AccessibleRestaurant {
  id: string
  name: string
  slug: string
  tenant_id: string | null
  is_active: boolean
  role: RestaurantRole
}

export interface RestaurantContext {
  userId: string
  userEmail: string | null
  restaurant: RestaurantRow
  restaurantId: string
  tenantId: string | null
  role: RestaurantRole
  isSuperAdmin: boolean
  isImpersonating: boolean
  restaurants: AccessibleRestaurant[]
  features: FeatureSet
  /** tenant tabloları mevcut mu (migration 022 uygulandı mı) */
  schemaReady: boolean
}

export type RestaurantContextResult =
  | { ok: true; ctx: RestaurantContext }
  | { ok: false; code: 'unauthorized' | 'not_found' | 'query'; error: string }

export const ALL_ROLES: RestaurantRole[] = [
  'super_admin',
  'owner',
  'admin',
  'accountant',
  'branch_manager',
  'staff',
  'kitchen',
]

let warnedMissingSchema = false

/** Tablo / fonksiyon henüz yok (migration uygulanmamış) hatası mı? */
export function isMissingSchemaError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false
  const e = error as { code?: string; message?: string }
  if (e.code && ['42P01', '42883', '42703', 'PGRST200', 'PGRST202', 'PGRST204', 'PGRST205'].includes(e.code)) {
    return true
  }
  const msg = (e.message || '').toLowerCase()
  return msg.includes('does not exist') || msg.includes('schema cache') || msg.includes('could not find')
}

function warnMissingSchema(what: string) {
  if (warnedMissingSchema) return
  warnedMissingSchema = true
  console.warn(
    `[restaurant-context] ${what}: migration 022/023 henüz uygulanmamış görünüyor; eski sahip modeliyle devam ediliyor.`
  )
}

async function checkIsAdmin(supabase: ServerClient): Promise<boolean> {
  const { data } = await supabase.rpc('is_admin')
  return Boolean(data)
}

function toAccessible(row: RestaurantRow, role: RestaurantRole): AccessibleRestaurant {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    tenant_id: row.tenant_id ?? null,
    is_active: row.is_active ?? true,
    role,
  }
}

/**
 * Kullanıcının erişebildiği restoranlar. Sahiplik her zaman okunur; tenant ve
 * şube üyelikleri tablo yoksa atlanır.
 */
export async function getAccessibleRestaurants(
  supabase: ServerClient,
  userId: string
): Promise<{ restaurants: AccessibleRestaurant[]; schemaReady: boolean; error?: string }> {
  const byId = new Map<string, AccessibleRestaurant>()
  const add = (row: RestaurantRow, role: RestaurantRole) => {
    const existing = byId.get(row.id)
    const merged = strongerRole(existing?.role ?? null, role) ?? role
    byId.set(row.id, toAccessible(row, merged))
  }

  // 1) Sahip olunan restoranlar (eski model, her zaman)
  const owned = await supabase
    .from('restaurants')
    .select('*')
    .eq('owner_user_id', userId)
    .order('created_at', { ascending: true })
  if (owned.error) {
    return { restaurants: [], schemaReady: false, error: owned.error.message }
  }
  for (const row of (owned.data || []) as RestaurantRow[]) add(row, 'owner')

  let schemaReady = true

  // 2) Tenant üyelikleri
  const tenantMemberships = await supabase
    .from('tenant_users')
    .select('tenant_id, role')
    .eq('user_id', userId)
  if (tenantMemberships.error) {
    if (!isMissingSchemaError(tenantMemberships.error)) {
      return { restaurants: Array.from(byId.values()), schemaReady: true, error: tenantMemberships.error.message }
    }
    schemaReady = false
    warnMissingSchema('tenant_users')
  } else if (tenantMemberships.data && tenantMemberships.data.length > 0) {
    const roleByTenant = new Map<string, RestaurantRole>()
    for (const m of tenantMemberships.data as { tenant_id: string; role: string }[]) {
      if (isRestaurantRole(m.role)) roleByTenant.set(m.tenant_id, m.role)
    }
    const tenantRestaurants = await supabase
      .from('restaurants')
      .select('*')
      .in('tenant_id', Array.from(roleByTenant.keys()))
      .order('created_at', { ascending: true })
    if (!tenantRestaurants.error) {
      for (const row of (tenantRestaurants.data || []) as RestaurantRow[]) {
        const role = row.tenant_id ? roleByTenant.get(row.tenant_id) : undefined
        if (role) add(row, role)
      }
    }
  }

  // 3) Şube üyelikleri
  if (schemaReady) {
    const branchMemberships = await supabase
      .from('restaurant_users')
      .select('restaurant_id, role')
      .eq('user_id', userId)
    if (branchMemberships.error) {
      if (!isMissingSchemaError(branchMemberships.error)) {
        return { restaurants: Array.from(byId.values()), schemaReady: true, error: branchMemberships.error.message }
      }
      schemaReady = false
      warnMissingSchema('restaurant_users')
    } else if (branchMemberships.data && branchMemberships.data.length > 0) {
      const roleByRestaurant = new Map<string, RestaurantRole>()
      for (const m of branchMemberships.data as { restaurant_id: string; role: string }[]) {
        if (isRestaurantRole(m.role)) roleByRestaurant.set(m.restaurant_id, m.role)
      }
      const branchRestaurants = await supabase
        .from('restaurants')
        .select('*')
        .in('id', Array.from(roleByRestaurant.keys()))
        .order('created_at', { ascending: true })
      if (!branchRestaurants.error) {
        for (const row of (branchRestaurants.data || []) as RestaurantRow[]) {
          const role = roleByRestaurant.get(row.id)
          if (role) add(row, role)
        }
      }
    }
  }

  return { restaurants: Array.from(byId.values()), schemaReady }
}

/**
 * Kullanıcının bir restoran üzerindeki etkin rolü (DB fonksiyonu restaurant_role).
 * Fonksiyon yoksa eski model: süper admin veya sahip.
 */
export async function getRestaurantRole(
  supabase: ServerClient,
  restaurantId: string
): Promise<RestaurantRole | null> {
  const { data, error } = await supabase.rpc('restaurant_role', { r_id: restaurantId } as never)
  if (!error) {
    return isRestaurantRole(data) ? data : null
  }
  if (!isMissingSchemaError(error)) {
    console.error('restaurant_role rpc error:', error.message)
    return null
  }
  warnMissingSchema('restaurant_role')

  if (await checkIsAdmin(supabase)) return 'super_admin'
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null
  const { data: restaurant } = await supabase
    .from('restaurants')
    .select('owner_user_id')
    .eq('id', restaurantId)
    .maybeSingle()
  return restaurant && (restaurant as RestaurantRow).owner_user_id === user.id ? 'owner' : null
}

export async function loadRestaurantFeatures(
  supabase: ServerClient,
  restaurant: RestaurantRow
): Promise<FeatureSet> {
  const { data, error } = await supabase
    .from('restaurant_features')
    .select('feature_key, enabled, config')
    .eq('restaurant_id', restaurant.id)
  if (error) {
    if (isMissingSchemaError(error)) warnMissingSchema('restaurant_features')
    else console.error('restaurant_features error:', error.message)
    return buildFeatureSet(restaurant, [])
  }
  return buildFeatureSet(restaurant, (data || []) as FeatureRow[])
}

function parseImpersonationCookie(value: string | undefined): string | null {
  if (!value) return null
  try {
    const parsed = JSON.parse(value) as { restaurantId?: string }
    return parsed?.restaurantId || null
  } catch {
    return null
  }
}

/**
 * İstek başına bir kez çözümlenir (React cache).
 */
export const resolveRestaurantContext = cache(async (): Promise<RestaurantContextResult> => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, code: 'unauthorized', error: 'Unauthorized' }

  const cookieStore = await cookies()

  // Süper admin impersonation
  const impersonatedId = parseImpersonationCookie(cookieStore.get(IMPERSONATION_COOKIE)?.value)
  if (impersonatedId && (await checkIsAdmin(supabase))) {
    const { data: restaurant, error } = await supabase
      .from('restaurants')
      .select('*')
      .eq('id', impersonatedId)
      .maybeSingle()
    if (error) return { ok: false, code: 'query', error: error.message }
    if (restaurant) {
      const row = restaurant as RestaurantRow
      const features = await loadRestaurantFeatures(supabase, row)
      return {
        ok: true,
        ctx: {
          userId: user.id,
          userEmail: user.email ?? null,
          restaurant: row,
          restaurantId: row.id,
          tenantId: row.tenant_id ?? null,
          role: 'super_admin',
          isSuperAdmin: true,
          isImpersonating: true,
          restaurants: [toAccessible(row, 'super_admin')],
          features,
          schemaReady: true,
        },
      }
    }
  }

  const access = await getAccessibleRestaurants(supabase, user.id)
  if (access.error) return { ok: false, code: 'query', error: access.error }
  if (access.restaurants.length === 0) {
    return { ok: false, code: 'not_found', error: 'Restoran bulunamadı. Lütfen tekrar kayıt olun.' }
  }

  const activeId = cookieStore.get(ACTIVE_RESTAURANT_COOKIE)?.value
  const chosen =
    access.restaurants.find((r) => r.id === activeId) ??
    access.restaurants.find((r) => r.role === 'owner') ??
    access.restaurants[0]

  const { data: restaurant, error } = await supabase
    .from('restaurants')
    .select('*')
    .eq('id', chosen.id)
    .maybeSingle()
  if (error) return { ok: false, code: 'query', error: error.message }
  if (!restaurant) return { ok: false, code: 'not_found', error: 'Restoran bulunamadı' }

  const row = restaurant as RestaurantRow
  const features = await loadRestaurantFeatures(supabase, row)

  return {
    ok: true,
    ctx: {
      userId: user.id,
      userEmail: user.email ?? null,
      restaurant: row,
      restaurantId: row.id,
      tenantId: row.tenant_id ?? null,
      role: chosen.role,
      isSuperAdmin: false,
      isImpersonating: false,
      restaurants: access.restaurants,
      features,
      schemaReady: access.schemaReady,
    },
  }
})

export type RoleAssertion = { ok: true; role: RestaurantRole } | { ok: false; error: string }

/**
 * Server action'larda istemciden gelen restaurant_id için zorunlu kontrol.
 * Frontend filtresine güvenilmez; rol DB'den okunur.
 */
export async function assertRestaurantRole(
  restaurantId: string | null | undefined,
  allowed: RestaurantRole[]
): Promise<RoleAssertion> {
  if (!restaurantId) return { ok: false, error: 'Restoran belirtilmedi' }
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'Unauthorized' }

  const role = await getRestaurantRole(supabase, restaurantId)
  if (!role) return { ok: false, error: 'Bu restorana erişim yetkiniz yok' }
  if (!roleIn(role, allowed)) return { ok: false, error: 'Bu işlem için yetkiniz yok' }
  return { ok: true, role }
}

export async function assertRestaurantAccess(restaurantId: string | null | undefined): Promise<RoleAssertion> {
  return assertRestaurantRole(restaurantId, ALL_ROLES)
}
