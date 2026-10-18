'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { normalizeCurrency } from '@/lib/utils/currency'
import { cookies } from 'next/headers'
import {
  ACTIVE_RESTAURANT_COOKIE,
  resolveRestaurantContext,
} from '@/lib/auth/restaurant-context'
import { canManageContent, ROLE_LABELS, type RestaurantRole } from '@/lib/auth/roles'
import type { FeatureKey } from '@/lib/features'

/**
 * Aktif restoran. Eski davranış korunur: restoran yoksa `{ restaurant: null }`,
 * oturum yoksa `{ error: 'Unauthorized' }`.
 */
export async function getRestaurant() {
  const result = await resolveRestaurantContext()
  if (!result.ok) {
    if (result.code === 'unauthorized') return { error: 'Unauthorized' }
    if (result.code === 'not_found') return { restaurant: null }
    return { error: result.error }
  }
  return { restaurant: result.ctx.restaurant }
}

export async function getRestaurantWithStats() {
  const supabase = await createClient()
  const result = await resolveRestaurantContext()

  if (!result.ok) {
    if (result.code === 'unauthorized') return { error: 'Unauthorized' }
    return { error: result.error }
  }

  const { restaurant, restaurantId } = result.ctx

  // Get subscription
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('restaurant_id', restaurantId)
    .maybeSingle()

  // Get scan stats
  const { data: stats } = await supabase
    .rpc('get_restaurant_scan_stats', { rest_id: restaurantId } as never)
    .maybeSingle()

  // Get category count
  const { count: categoryCount } = await supabase
    .from('categories')
    .select('*', { count: 'exact', head: true })
    .eq('restaurant_id', restaurantId)

  // Get product count
  const { count: productCount } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('restaurant_id', restaurantId)

  return {
    restaurant,
    subscription,
    stats: stats || { scans_today: 0, scans_7d: 0, scans_30d: 0, scans_total: 0 },
    counts: {
      categories: categoryCount || 0,
      products: productCount || 0,
    }
  }
}

interface UpdateRestaurantInput {
  name?: string
  slug?: string
  slogan?: string
  logo_url?: string
  hero_url?: string
  header_bg_url?: string
  currency?: string
  is_active?: boolean
  layout_style?: string
  background_color?: string
  surface_color?: string
  header_bg_color?: string
  footer_bg_color?: string
  text_color?: string
  primary_color?: string
  price_color?: string
  icon_color?: string
  hamburger_bg_color?: string
  qr_logo_bg_color?: string
  about_us?: string
  phone?: string
  email?: string
  address?: string
  instagram?: string
  facebook?: string
  twitter?: string
  supported_languages?: string[]
}

export async function updateRestaurant(input: UpdateRestaurantInput) {
  const supabase = await createClient()
  const result = await resolveRestaurantContext()

  if (!result.ok) {
    if (result.code === 'unauthorized') return { success: false, error: 'Unauthorized' }
    return { success: false, error: 'Restaurant not found' }
  }

  const { restaurant, restaurantId, role } = result.ctx

  if (!canManageContent(role)) {
    return { success: false, error: 'Bu işlem için yetkiniz yok' }
  }

  // If slug is being updated, check if it's unique
  if (input.slug && input.slug !== restaurant.slug) {
    const { data: existingRestaurant } = await supabase
      .from('restaurants')
      .select('id')
      .eq('slug', input.slug)
      .maybeSingle()

    if (existingRestaurant) {
      return { success: false, error: 'Bu slug zaten kullanılıyor' }
    }
  }

  const payload = { ...input, ...(input.currency !== undefined ? { currency: normalizeCurrency(input.currency) } : {}) }
  const { error } = await supabase
    .from('restaurants')
    .update(payload as never)
    .eq('id', restaurantId)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/panel')
  revalidatePath('/panel/settings')
  return { success: true }
}

/**
 * Çoklu şube: aktif şubeyi değiştirir. Üyelik sunucuda doğrulanır.
 */
export async function setActiveRestaurant(restaurantId: string) {
  const result = await resolveRestaurantContext()
  if (!result.ok) {
    return { success: false, error: result.code === 'unauthorized' ? 'Unauthorized' : result.error }
  }
  if (!result.ctx.restaurants.some((r) => r.id === restaurantId)) {
    return { success: false, error: 'Bu şubeye erişim yetkiniz yok' }
  }

  const cookieStore = await cookies()
  cookieStore.set(ACTIVE_RESTAURANT_COOKIE, restaurantId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  })

  revalidatePath('/panel', 'layout')
  return { success: true }
}

export interface PanelRestaurantOption {
  id: string
  name: string
  slug: string
  role: RestaurantRole
  roleLabel: string
}

export interface PanelContext {
  restaurant: { id: string; name: string; slug: string } | null
  restaurants: PanelRestaurantOption[]
  role: RestaurantRole | null
  roleLabel: string | null
  features: FeatureKey[]
  isImpersonating: boolean
  impersonatedName: string | null
  /** Sipariş paneli açıksa bekleyen "Yeni" sipariş sayısı (menü rozeti) */
  newOrdersCount: number
  error?: string
}

/**
 * Panel layout'u için serileştirilebilir bağlam (şube seçici, feature'a göre menü).
 */
export async function getPanelContext(): Promise<PanelContext> {
  const empty: PanelContext = {
    restaurant: null,
    restaurants: [],
    role: null,
    roleLabel: null,
    features: [],
    isImpersonating: false,
    impersonatedName: null,
    newOrdersCount: 0,
  }

  const result = await resolveRestaurantContext()
  if (!result.ok) return { ...empty, error: result.error }

  const { ctx } = result
  let newOrdersCount = 0
  if (ctx.features.keys.includes('direct_order')) {
    const supabase = await createClient()
    const { count } = await supabase.from('orders').select('*', { count: 'exact', head: true }).eq('restaurant_id', ctx.restaurantId).eq('status', 'new')
    newOrdersCount = count || 0
  }
  return {
    newOrdersCount,
    restaurant: { id: ctx.restaurantId, name: ctx.restaurant.name, slug: ctx.restaurant.slug },
    restaurants: ctx.restaurants.map((r) => ({
      id: r.id,
      name: r.name,
      slug: r.slug,
      role: r.role,
      roleLabel: ROLE_LABELS[r.role],
    })),
    role: ctx.role,
    roleLabel: ROLE_LABELS[ctx.role],
    features: ctx.features.keys,
    isImpersonating: ctx.isImpersonating,
    impersonatedName: ctx.isImpersonating ? ctx.restaurant.name : null,
  }
}
