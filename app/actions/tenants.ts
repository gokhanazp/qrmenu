'use server'

/**
 * Süper admin: tenant (müşteri) ve üyelik yönetimi + restoran özellikleri.
 * Tüm fonksiyonlar is_admin() kontrolünden geçer; RLS ikinci savunma hattıdır.
 */
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import { isAdmin } from './admin'
import { isMissingSchemaError } from '@/lib/auth/restaurant-context'
import { MANAGED_FEATURE_KEYS, isFeatureKey, isWhatsappOrderingEnabled, type FeatureKey } from '@/lib/features'
import { isBranchRole, isTenantRole, type BranchRole, type TenantRole } from '@/lib/auth/roles'
import { generateSlug } from '@/lib/utils/slug'

function getAdminClient() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

async function requireAdmin(): Promise<string | null> {
  const { isAdmin: ok } = await isAdmin()
  return ok ? null : 'Unauthorized'
}

type Row = Record<string, any>

async function getUserEmailMap(userIds: string[]): Promise<Map<string, string>> {
  const map = new Map<string, string>()
  const unique = Array.from(new Set(userIds.filter(Boolean)))
  if (unique.length === 0) return map
  const admin = getAdminClient()
  await Promise.all(
    unique.map(async (id) => {
      const { data } = await admin.auth.admin.getUserById(id)
      if (data?.user?.email) map.set(id, data.user.email)
    })
  )
  return map
}

async function findUserByEmail(email: string): Promise<{ id: string; email: string } | null> {
  const admin = getAdminClient()
  const target = email.trim().toLowerCase()
  const perPage = 200
  for (let page = 1; page <= 25; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage })
    if (error || !data?.users?.length) break
    const found = data.users.find((u) => (u.email || '').toLowerCase() === target)
    if (found) return { id: found.id, email: found.email || target }
    if (data.users.length < perPage) break
  }
  return null
}

async function findOrCreateUser(
  email: string,
  password?: string
): Promise<{ id: string; email: string; created: boolean } | { error: string }> {
  const trimmed = (email || '').trim().toLowerCase()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return { error: 'Geçerli bir e-posta adresi girin' }
  }
  const existing = await findUserByEmail(trimmed)
  if (existing) return { ...existing, created: false }

  if (!password || password.length < 6) {
    return { error: 'Bu e-posta ile kayıtlı kullanıcı yok. Yeni kullanıcı oluşturmak için en az 6 karakterlik şifre girin' }
  }
  const admin = getAdminClient()
  const { data, error } = await admin.auth.admin.createUser({
    email: trimmed,
    password,
    email_confirm: true,
  })
  if (error || !data?.user) {
    return { error: `Kullanıcı oluşturulamadı: ${error?.message || 'bilinmeyen hata'}` }
  }
  return { id: data.user.id, email: data.user.email || trimmed, created: true }
}

// ---------------------------------------------------------------------------
// Tenant listesi / detay
// ---------------------------------------------------------------------------

export interface TenantSummary {
  id: string
  name: string
  slug: string
  plan: string
  status: string
  created_at: string
  restaurantCount: number
  userCount: number
  platformCount: number
  connectedPlatforms: string[]
  integrationErrors: number
  ordersToday: number
  lastSyncAt: string | null
  /** En az bir şubede "Tenant / Çoklu Şube" özelliği açık */
  multiBranch: boolean
  /** Listede varsayılan olarak gösterilsin mi (özellik açık, kurulum aşamasında veya 2+ şube) */
  active: boolean
  restaurants: { id: string; name: string; slug: string; is_active: boolean }[]
}

export async function getTenants(): Promise<{ tenants: TenantSummary[]; schemaReady: boolean; error?: string }> {
  const denied = await requireAdmin()
  if (denied) return { tenants: [], schemaReady: false, error: denied }

  const supabase = await createClient()
  const { data: tenants, error } = await supabase
    .from('tenants')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    if (isMissingSchemaError(error)) return { tenants: [], schemaReady: false }
    return { tenants: [], schemaReady: true, error: error.message }
  }

  const todayStart = (() => { const ist = new Date(Date.now() + 3 * 60 * 60 * 1000); return new Date(Date.UTC(ist.getUTCFullYear(), ist.getUTCMonth(), ist.getUTCDate()) - 3 * 60 * 60 * 1000).toISOString() })()
  const [{ data: restaurants }, { data: members }, { data: features }, integrationsRes, ordersRes] = await Promise.all([
    supabase.from('restaurants').select('id, name, slug, is_active, tenant_id'),
    supabase.from('tenant_users').select('tenant_id, user_id'),
    supabase.from('restaurant_features').select('restaurant_id, feature_key, enabled'),
    supabase.from('integrations').select('tenant_id, platform, status, health_status, last_successful_sync_at'),
    supabase.from('orders').select('tenant_id, status').gte('created_at', todayStart),
  ])
  const integrationsByTenant = new Map<string, Row[]>()
  for (const i of ((integrationsRes.error ? [] : integrationsRes.data) || []) as Row[]) {
    const list = integrationsByTenant.get(i.tenant_id) || []
    list.push(i)
    integrationsByTenant.set(i.tenant_id, list)
  }
  const ordersTodayByTenant = new Map<string, number>()
  for (const o of ((ordersRes.error ? [] : ordersRes.data) || []) as Row[]) {
    if (o.status === 'cancelled') continue
    ordersTodayByTenant.set(o.tenant_id, (ordersTodayByTenant.get(o.tenant_id) || 0) + 1)
  }

  const restaurantsByTenant = new Map<string, Row[]>()
  for (const r of (restaurants || []) as Row[]) {
    if (!r.tenant_id) continue
    const list = restaurantsByTenant.get(r.tenant_id) || []
    list.push(r)
    restaurantsByTenant.set(r.tenant_id, list)
  }
  const memberCount = new Map<string, number>()
  for (const m of (members || []) as Row[]) {
    memberCount.set(m.tenant_id, (memberCount.get(m.tenant_id) || 0) + 1)
  }
  const platformFeatures = new Set<string>()
  const multiBranchRestaurants = new Set<string>()
  for (const f of (features || []) as Row[]) {
    if (!f.enabled) continue
    if (f.feature_key === 'trendyol_food' || f.feature_key === 'yemeksepeti') {
      platformFeatures.add(`${f.restaurant_id}:${f.feature_key}`)
    }
    if (f.feature_key === 'multi_branch') multiBranchRestaurants.add(f.restaurant_id)
  }

  const summaries: TenantSummary[] = ((tenants || []) as Row[]).map((t) => {
    const rs = restaurantsByTenant.get(t.id) || []
    const platformCount = rs.reduce(
      (sum, r) =>
        sum +
        (platformFeatures.has(`${r.id}:trendyol_food`) ? 1 : 0) +
        (platformFeatures.has(`${r.id}:yemeksepeti`) ? 1 : 0),
      0
    )
    const multiBranch = rs.some((r) => multiBranchRestaurants.has(r.id))
    // Backfill ile her restoranın bir tenant'ı var; listede yalnızca özelliği
    // açılanlar, henüz şubesi olmayan yeni tenant'lar ve 2+ şubeli olanlar gösterilir.
    const active = multiBranch || rs.length === 0 || rs.length > 1
    return {
      id: t.id,
      name: t.name,
      slug: t.slug,
      plan: t.plan,
      status: t.status,
      created_at: t.created_at,
      restaurantCount: rs.length,
      userCount: memberCount.get(t.id) || 0,
      platformCount,
      connectedPlatforms: Array.from(new Set((integrationsByTenant.get(t.id) || []).filter((i) => i.status === 'active').map((i) => String(i.platform)))),
      integrationErrors: (integrationsByTenant.get(t.id) || []).filter((i) => i.status === 'active' && i.health_status === 'error').length,
      ordersToday: ordersTodayByTenant.get(t.id) || 0,
      lastSyncAt: (integrationsByTenant.get(t.id) || []).reduce<string | null>((m, i) => (i.last_successful_sync_at && (!m || i.last_successful_sync_at > m) ? i.last_successful_sync_at : m), null),
      multiBranch,
      active,
      restaurants: rs.map((r) => ({ id: r.id, name: r.name, slug: r.slug, is_active: r.is_active })),
    }
  })

  return { tenants: summaries, schemaReady: true }
}

export interface TenantMember {
  userId: string
  email: string
  role: TenantRole
  created_at: string
}

export interface TenantRestaurant {
  id: string
  name: string
  slug: string
  is_active: boolean
  created_at: string
  owner_user_id: string
  ownerEmail: string
  whatsappOrdering: boolean
  features: FeatureKey[]
  users: { userId: string; email: string; role: BranchRole }[]
}

export interface TenantDetail {
  tenant: { id: string; name: string; slug: string; plan: string; status: string; created_at: string }
  restaurants: TenantRestaurant[]
  members: TenantMember[]
}

export async function getTenantDetail(tenantId: string): Promise<{ detail?: TenantDetail; error?: string }> {
  const denied = await requireAdmin()
  if (denied) return { error: denied }

  const supabase = await createClient()
  const { data: tenant, error } = await supabase.from('tenants').select('*').eq('id', tenantId).maybeSingle()
  if (error) return { error: isMissingSchemaError(error) ? 'Migration 022 henüz uygulanmamış' : error.message }
  if (!tenant) return { error: 'Tenant bulunamadı' }

  const { data: restaurants } = await supabase
    .from('restaurants')
    .select('id, name, slug, is_active, created_at, owner_user_id, whatsapp, ordering_enabled')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: true })
  const restaurantRows = (restaurants || []) as Row[]
  const restaurantIds = restaurantRows.map((r) => r.id)

  const [{ data: members }, { data: branchUsers }, { data: features }] = await Promise.all([
    supabase.from('tenant_users').select('user_id, role, created_at').eq('tenant_id', tenantId),
    restaurantIds.length
      ? supabase.from('restaurant_users').select('restaurant_id, user_id, role').in('restaurant_id', restaurantIds)
      : Promise.resolve({ data: [] as Row[] }),
    restaurantIds.length
      ? supabase.from('restaurant_features').select('restaurant_id, feature_key, enabled').in('restaurant_id', restaurantIds)
      : Promise.resolve({ data: [] as Row[] }),
  ])

  const memberRows = (members || []) as Row[]
  const branchRows = (branchUsers || []) as Row[]
  const emails = await getUserEmailMap([
    ...memberRows.map((m) => m.user_id),
    ...branchRows.map((b) => b.user_id),
    ...restaurantRows.map((r) => r.owner_user_id),
  ])

  const featuresByRestaurant = new Map<string, FeatureKey[]>()
  for (const f of (features || []) as Row[]) {
    if (!f.enabled || !isFeatureKey(f.feature_key)) continue
    const list = featuresByRestaurant.get(f.restaurant_id) || []
    list.push(f.feature_key)
    featuresByRestaurant.set(f.restaurant_id, list)
  }

  const t = tenant as Row
  return {
    detail: {
      tenant: { id: t.id, name: t.name, slug: t.slug, plan: t.plan, status: t.status, created_at: t.created_at },
      members: memberRows
        .filter((m) => isTenantRole(m.role))
        .map((m) => ({
          userId: m.user_id,
          email: emails.get(m.user_id) || '(bilinmiyor)',
          role: m.role as TenantRole,
          created_at: m.created_at,
        })),
      restaurants: restaurantRows.map((r) => ({
        id: r.id,
        name: r.name,
        slug: r.slug,
        is_active: r.is_active,
        created_at: r.created_at,
        owner_user_id: r.owner_user_id,
        ownerEmail: emails.get(r.owner_user_id) || '(bilinmiyor)',
        whatsappOrdering: isWhatsappOrderingEnabled(r),
        features: featuresByRestaurant.get(r.id) || [],
        users: branchRows
          .filter((b) => b.restaurant_id === r.id && isBranchRole(b.role))
          .map((b) => ({ userId: b.user_id, email: emails.get(b.user_id) || '(bilinmiyor)', role: b.role as BranchRole })),
      })),
    },
  }
}

export interface TenantOption {
  id: string
  name: string
  ownerUserId: string | null
  ownerEmail: string | null
}

/** Yeni şube formu için tenant seçenekleri (ilk owner üyesiyle). */
export async function getTenantOptions(): Promise<{ tenants: TenantOption[]; schemaReady: boolean }> {
  const denied = await requireAdmin()
  if (denied) return { tenants: [], schemaReady: false }

  const supabase = await createClient()
  const { data: tenants, error } = await supabase.from('tenants').select('id, name').order('name')
  if (error) return { tenants: [], schemaReady: !isMissingSchemaError(error) }

  const { data: owners } = await supabase
    .from('tenant_users')
    .select('tenant_id, user_id, created_at')
    .eq('role', 'owner')
    .order('created_at', { ascending: true })
  const ownerByTenant = new Map<string, string>()
  for (const o of (owners || []) as Row[]) {
    if (!ownerByTenant.has(o.tenant_id)) ownerByTenant.set(o.tenant_id, o.user_id)
  }
  const emails = await getUserEmailMap(Array.from(ownerByTenant.values()))

  return {
    schemaReady: true,
    tenants: ((tenants || []) as Row[]).map((t) => {
      const ownerUserId = ownerByTenant.get(t.id) || null
      return { id: t.id, name: t.name, ownerUserId, ownerEmail: ownerUserId ? emails.get(ownerUserId) || null : null }
    }),
  }
}

// ---------------------------------------------------------------------------
// Tenant yazma işlemleri
// ---------------------------------------------------------------------------

export async function createTenant(input: { name: string; plan?: string }) {
  const denied = await requireAdmin()
  if (denied) return { success: false, error: denied }
  const name = (input.name || '').trim()
  if (name.length < 2) return { success: false, error: 'Tenant adı en az 2 karakter olmalıdır' }

  const supabase = await createClient()
  const base = generateSlug(name)
  let slug = base
  for (let n = 1; n < 100; n++) {
    const { data: existing } = await supabase.from('tenants').select('id').eq('slug', slug).maybeSingle()
    if (!existing) break
    slug = `${base}-${n}`
  }

  const { data, error } = await supabase
    .from('tenants')
    .insert({ name, slug, plan: input.plan || 'standard' } as never)
    .select('id')
    .single()
  if (error) return { success: false, error: error.message }

  revalidatePath('/admin/tenants')
  return { success: true, tenantId: (data as Row).id as string }
}

export async function updateTenant(input: { tenantId: string; name?: string; plan?: string; status?: string }) {
  const denied = await requireAdmin()
  if (denied) return { success: false, error: denied }

  const update: Row = {}
  if (input.name !== undefined) {
    const name = input.name.trim()
    if (name.length < 2) return { success: false, error: 'Tenant adı en az 2 karakter olmalıdır' }
    update.name = name
  }
  if (input.plan !== undefined) update.plan = input.plan.trim() || 'standard'
  if (input.status !== undefined) {
    if (!['active', 'suspended'].includes(input.status)) return { success: false, error: 'Geçersiz durum' }
    update.status = input.status
  }

  const supabase = await createClient()
  const { error } = await supabase.from('tenants').update(update as never).eq('id', input.tenantId)
  if (error) return { success: false, error: error.message }

  revalidatePath('/admin/tenants')
  revalidatePath(`/admin/tenants/${input.tenantId}`)
  return { success: true }
}

export async function addTenantMember(input: { tenantId: string; email: string; role: string; password?: string }) {
  const denied = await requireAdmin()
  if (denied) return { success: false, error: denied }
  if (!isTenantRole(input.role)) return { success: false, error: 'Geçersiz rol' }

  const user = await findOrCreateUser(input.email, input.password)
  if ('error' in user) return { success: false, error: user.error }

  const supabase = await createClient()
  const { error } = await supabase
    .from('tenant_users')
    .upsert({ tenant_id: input.tenantId, user_id: user.id, role: input.role } as never, {
      onConflict: 'tenant_id,user_id',
    })
  if (error) return { success: false, error: error.message }

  revalidatePath(`/admin/tenants/${input.tenantId}`)
  return { success: true, created: user.created, email: user.email }
}

export async function removeTenantMember(input: { tenantId: string; userId: string }) {
  const denied = await requireAdmin()
  if (denied) return { success: false, error: denied }

  const supabase = await createClient()
  const { data: owners } = await supabase
    .from('tenant_users')
    .select('user_id')
    .eq('tenant_id', input.tenantId)
    .eq('role', 'owner')
  const ownerIds = ((owners || []) as Row[]).map((o) => o.user_id)
  if (ownerIds.length === 1 && ownerIds[0] === input.userId) {
    return { success: false, error: 'Tenant\'ın son sahibi kaldırılamaz' }
  }

  const { error } = await supabase
    .from('tenant_users')
    .delete()
    .eq('tenant_id', input.tenantId)
    .eq('user_id', input.userId)
  if (error) return { success: false, error: error.message }

  revalidatePath(`/admin/tenants/${input.tenantId}`)
  return { success: true }
}

export async function addRestaurantUser(input: { restaurantId: string; email: string; role: string; password?: string }) {
  const denied = await requireAdmin()
  if (denied) return { success: false, error: denied }
  if (!isBranchRole(input.role)) return { success: false, error: 'Geçersiz rol' }

  const user = await findOrCreateUser(input.email, input.password)
  if ('error' in user) return { success: false, error: user.error }

  const supabase = await createClient()
  const { error } = await supabase
    .from('restaurant_users')
    .upsert({ restaurant_id: input.restaurantId, user_id: user.id, role: input.role } as never, {
      onConflict: 'restaurant_id,user_id',
    })
  if (error) return { success: false, error: error.message }

  const { data: restaurant } = await supabase.from('restaurants').select('tenant_id').eq('id', input.restaurantId).maybeSingle()
  const tenantId = (restaurant as Row | null)?.tenant_id
  if (tenantId) revalidatePath(`/admin/tenants/${tenantId}`)
  return { success: true, created: user.created, email: user.email }
}

export async function removeRestaurantUser(input: { restaurantId: string; userId: string }) {
  const denied = await requireAdmin()
  if (denied) return { success: false, error: denied }

  const supabase = await createClient()
  const { error } = await supabase
    .from('restaurant_users')
    .delete()
    .eq('restaurant_id', input.restaurantId)
    .eq('user_id', input.userId)
  if (error) return { success: false, error: error.message }

  const { data: restaurant } = await supabase.from('restaurants').select('tenant_id').eq('id', input.restaurantId).maybeSingle()
  const tenantId = (restaurant as Row | null)?.tenant_id
  if (tenantId) revalidatePath(`/admin/tenants/${tenantId}`)
  return { success: true }
}

export async function moveRestaurantToTenant(input: { restaurantId: string; tenantId: string }) {
  const denied = await requireAdmin()
  if (denied) return { success: false, error: denied }

  const supabase = await createClient()
  const { data: tenant } = await supabase.from('tenants').select('id').eq('id', input.tenantId).maybeSingle()
  if (!tenant) return { success: false, error: 'Tenant bulunamadı' }

  const { error } = await supabase
    .from('restaurants')
    .update({ tenant_id: input.tenantId } as never)
    .eq('id', input.restaurantId)
  if (error) return { success: false, error: error.message }

  revalidatePath('/admin/tenants')
  revalidatePath(`/admin/tenants/${input.tenantId}`)
  revalidatePath(`/admin/restaurants/${input.restaurantId}`)
  return { success: true }
}

// ---------------------------------------------------------------------------
// Restoran özellikleri (admin)
// ---------------------------------------------------------------------------

export async function getRestaurantFeaturesAdmin(restaurantId: string): Promise<{
  features: Record<string, boolean>
  schemaReady: boolean
  tenant: { id: string; name: string } | null
  error?: string
}> {
  const denied = await requireAdmin()
  if (denied) return { features: {}, schemaReady: false, tenant: null, error: denied }

  const supabase = await createClient()
  const features: Record<string, boolean> = {}
  for (const key of MANAGED_FEATURE_KEYS) features[key] = false

  const { data, error } = await supabase
    .from('restaurant_features')
    .select('feature_key, enabled')
    .eq('restaurant_id', restaurantId)
  if (error) {
    if (isMissingSchemaError(error)) return { features, schemaReady: false, tenant: null }
    return { features, schemaReady: true, tenant: null, error: error.message }
  }
  for (const row of (data || []) as Row[]) {
    if (isFeatureKey(row.feature_key)) features[row.feature_key] = Boolean(row.enabled)
  }

  let tenant: { id: string; name: string } | null = null
  const { data: restaurant } = await supabase.from('restaurants').select('tenant_id').eq('id', restaurantId).maybeSingle()
  const tenantId = (restaurant as Row | null)?.tenant_id
  if (tenantId) {
    const { data: t } = await supabase.from('tenants').select('id, name').eq('id', tenantId).maybeSingle()
    if (t) tenant = { id: (t as Row).id, name: (t as Row).name }
  }

  return { features, schemaReady: true, tenant }
}

export async function updateRestaurantFeatures(input: { restaurantId: string; features: Record<string, boolean> }) {
  const denied = await requireAdmin()
  if (denied) return { success: false, error: denied }

  const rows = Object.entries(input.features)
    .filter(([key]) => isFeatureKey(key) && (MANAGED_FEATURE_KEYS as string[]).includes(key))
    .map(([key, enabled]) => ({ restaurant_id: input.restaurantId, feature_key: key, enabled: Boolean(enabled) }))
  if (rows.length === 0) return { success: true }

  const supabase = await createClient()
  const { error } = await supabase
    .from('restaurant_features')
    .upsert(rows as never, { onConflict: 'restaurant_id,feature_key' })
  if (error) {
    return { success: false, error: isMissingSchemaError(error) ? 'Migration 023 henüz uygulanmamış' : error.message }
  }

  revalidatePath(`/admin/restaurants/${input.restaurantId}`)
  revalidatePath(`/admin/restaurants/${input.restaurantId}/edit`)
  revalidatePath('/admin/tenants')
  revalidatePath('/panel', 'layout')
  return { success: true }
}
