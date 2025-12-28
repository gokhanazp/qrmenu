'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function isAdmin() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { isAdmin: false }
  }

  const { data: adminUser } = await supabase
    .from('admin_users')
    .select('user_id')
    .eq('user_id', user.id)
    .maybeSingle()

  return { isAdmin: !!adminUser }
}

export async function getAllRestaurants() {
  const supabase = await createClient()
  
  // Check if user is admin
  const { isAdmin: userIsAdmin } = await isAdmin()
  if (!userIsAdmin) {
    return { error: 'Unauthorized' }
  }

  const { data: restaurants, error } = await supabase
    .from('restaurants')
    .select(`
      *,
      subscriptions (
        plan,
        status,
        current_period_start,
        current_period_end
      )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    return { error: error.message }
  }

  return { restaurants }
}

export async function getRestaurantStats(restaurantId: string) {
  const supabase = await createClient()
  
  // Check if user is admin
  const { isAdmin: userIsAdmin } = await isAdmin()
  if (!userIsAdmin) {
    return { error: 'Unauthorized' }
  }

  // Get restaurant details
  const { data: restaurant, error: restaurantError } = await supabase
    .from('restaurants')
    .select(`
      *,
      subscriptions (
        plan,
        status,
        current_period_start,
        current_period_end
      )
    `)
    .eq('id', restaurantId)
    .maybeSingle()

  if (restaurantError) {
    return { error: restaurantError.message }
  }

  if (!restaurant) {
    return { error: 'Restaurant not found' }
  }

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

  // Get recent scan events (last 30 days)
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const { data: scanEvents } = await supabase
    .from('scan_events')
    .select('scanned_at')
    .eq('restaurant_id', restaurantId)
    .gte('scanned_at', thirtyDaysAgo.toISOString())
    .order('scanned_at', { ascending: true })

  return {
    restaurant,
    stats: stats || { scans_today: 0, scans_7d: 0, scans_30d: 0, scans_total: 0 },
    counts: {
      categories: categoryCount || 0,
      products: productCount || 0,
    },
    scanEvents: scanEvents || []
  }
}

interface UpdateSubscriptionInput {
  restaurantId: string
  plan?: string
  status?: string
  current_period_start?: string
  current_period_end?: string
}

export async function updateSubscription(input: UpdateSubscriptionInput) {
  const supabase = await createClient()
  
  // Check if user is admin
  const { isAdmin: userIsAdmin } = await isAdmin()
  if (!userIsAdmin) {
    return { success: false, error: 'Unauthorized' }
  }

  const { restaurantId, ...updateData } = input

  // Check if subscription exists
  const { data: existingSubscription } = await supabase
    .from('subscriptions')
    .select('id')
    .eq('restaurant_id', restaurantId)
    .maybeSingle()

  let error

  if (existingSubscription) {
    // Update existing subscription
    const result = await supabase
      .from('subscriptions')
      .update({
        ...(updateData.plan && { plan: updateData.plan }),
        ...(updateData.status && { status: updateData.status }),
        ...(updateData.current_period_start && { current_period_start: updateData.current_period_start }),
        ...(updateData.current_period_end && { current_period_end: updateData.current_period_end }),
        updated_at: new Date().toISOString()
      } as never)
      .eq('restaurant_id', restaurantId)
    error = result.error
  } else {
    // Create new subscription
    const result = await supabase
      .from('subscriptions')
      .insert({
        restaurant_id: restaurantId,
        plan: updateData.plan || 'free',
        status: updateData.status || 'active',
        ...(updateData.current_period_start && { current_period_start: updateData.current_period_start }),
        ...(updateData.current_period_end && { current_period_end: updateData.current_period_end }),
        updated_at: new Date().toISOString()
      } as never)
    error = result.error
  }

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/admin')
  revalidatePath(`/admin/restaurants/${restaurantId}`)
  return { success: true }
}

export async function updateRestaurantStatus(restaurantId: string, isActive: boolean) {
  const supabase = await createClient()
  
  // Check if user is admin
  const { isAdmin: userIsAdmin } = await isAdmin()
  if (!userIsAdmin) {
    return { success: false, error: 'Unauthorized' }
  }

  const { error } = await supabase
    .from('restaurants')
    .update({ is_active: isActive } as never)
    .eq('id', restaurantId)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/admin')
  revalidatePath(`/admin/restaurants/${restaurantId}`)
  return { success: true }
}