'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'

// Helper function to get impersonated restaurant ID
async function getImpersonatedRestaurantId(): Promise<string | null> {
  const cookieStore = await cookies()
  const impersonationCookie = cookieStore.get('impersonating_restaurant')
  
  if (!impersonationCookie?.value) {
    return null
  }

  try {
    const data = JSON.parse(impersonationCookie.value)
    return data.restaurantId || null
  } catch {
    return null
  }
}

export async function getRestaurant() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: 'Unauthorized' }
  }

  // Check if admin is impersonating a restaurant
  const impersonatedRestaurantId = await getImpersonatedRestaurantId()
  
  let restaurant
  let error

  if (impersonatedRestaurantId) {
    // Admin is impersonating - get the impersonated restaurant
    const result = await supabase
      .from('restaurants')
      .select('*')
      .eq('id', impersonatedRestaurantId)
      .maybeSingle()
    restaurant = result.data
    error = result.error
  } else {
    // Normal user - get their own restaurant
    const result = await supabase
      .from('restaurants')
      .select('*')
      .eq('owner_user_id', user.id)
      .maybeSingle()
    restaurant = result.data
    error = result.error
  }

  if (error) {
    return { error: error.message }
  }

  return { restaurant }
}

export async function getRestaurantWithStats() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: 'Unauthorized' }
  }

  // Check if admin is impersonating a restaurant
  const impersonatedRestaurantId = await getImpersonatedRestaurantId()
  
  let restaurant
  let restaurantError

  if (impersonatedRestaurantId) {
    // Admin is impersonating - get the impersonated restaurant
    const result = await supabase
      .from('restaurants')
      .select('*')
      .eq('id', impersonatedRestaurantId)
      .maybeSingle()
    restaurant = result.data
    restaurantError = result.error
  } else {
    // Normal user - get their own restaurant
    const result = await supabase
      .from('restaurants')
      .select('*')
      .eq('owner_user_id', user.id)
      .maybeSingle()
    restaurant = result.data
    restaurantError = result.error
  }

  if (restaurantError) {
    return { error: restaurantError.message }
  }

  if (!restaurant) {
    return { error: 'Restoran bulunamadı. Lütfen tekrar kayıt olun.' }
  }

  // Get subscription
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('restaurant_id', (restaurant as any).id)
    .maybeSingle()

  // Get scan stats
  const { data: stats } = await supabase
    .rpc('get_restaurant_scan_stats', { rest_id: (restaurant as any).id } as never)
    .maybeSingle()

  // Get category count
  const { count: categoryCount } = await supabase
    .from('categories')
    .select('*', { count: 'exact', head: true })
    .eq('restaurant_id', (restaurant as any).id)

  // Get product count
  const { count: productCount } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('restaurant_id', (restaurant as any).id)

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
  is_active?: boolean
  layout_style?: string
  background_color?: string
  surface_color?: string
  text_color?: string
  primary_color?: string
  about_us?: string
  phone?: string
  email?: string
  address?: string
  instagram?: string
  facebook?: string
  twitter?: string
}

export async function updateRestaurant(input: UpdateRestaurantInput) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { success: false, error: 'Unauthorized' }
  }

  // Check if admin is impersonating a restaurant
  const impersonatedRestaurantId = await getImpersonatedRestaurantId()
  
  let restaurant
  
  if (impersonatedRestaurantId) {
    // Admin is impersonating - get the impersonated restaurant
    const result = await supabase
      .from('restaurants')
      .select('id, slug')
      .eq('id', impersonatedRestaurantId)
      .maybeSingle()
    restaurant = result.data
  } else {
    // Normal user - get their own restaurant
    const result = await supabase
      .from('restaurants')
      .select('id, slug')
      .eq('owner_user_id', user.id)
      .maybeSingle()
    restaurant = result.data
  }

  if (!restaurant) {
    return { success: false, error: 'Restaurant not found' }
  }

  // If slug is being updated, check if it's unique
  if (input.slug && input.slug !== (restaurant as any).slug) {
    const { data: existingRestaurant } = await supabase
      .from('restaurants')
      .select('id')
      .eq('slug', input.slug)
      .maybeSingle()

    if (existingRestaurant) {
      return { success: false, error: 'Bu slug zaten kullanılıyor' }
    }
  }

  const { error } = await supabase
    .from('restaurants')
    .update(input as never)
    .eq('id', (restaurant as any).id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/panel')
  revalidatePath('/panel/settings')
  return { success: true }
}