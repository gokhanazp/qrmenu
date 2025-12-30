'use server'

import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'

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

interface CreateRestaurantInput {
  name: string
  slug: string
  email: string
  password: string
  slogan?: string
  phone?: string
  address?: string
  whatsapp?: string
  instagram?: string
  facebook?: string
  twitter?: string
  about_us?: string
  logo_url?: string
  hero_url?: string
  layout_style?: string
  background_color?: string
  surface_color?: string
  text_color?: string
  primary_color?: string
  price_color?: string
  icon_color?: string
  hamburger_bg_color?: string
  qr_logo_bg_color?: string
  plan?: 'free' | 'pro'
}

export async function createRestaurantWithUser(input: CreateRestaurantInput) {
  const supabase = await createClient()
  
  // Check if user is admin
  const { isAdmin: userIsAdmin } = await isAdmin()
  if (!userIsAdmin) {
    return { success: false, error: 'Unauthorized' }
  }

  // Check if slug is unique
  const { data: existingRestaurant } = await supabase
    .from('restaurants')
    .select('id')
    .eq('slug', input.slug)
    .maybeSingle()

  if (existingRestaurant) {
    return { success: false, error: 'Bu slug zaten kullanılıyor' }
  }

  // Create user with Supabase Admin API
  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )

  // Create user
  const { data: newUser, error: userError } = await supabaseAdmin.auth.admin.createUser({
    email: input.email,
    password: input.password,
    email_confirm: true
  })

  if (userError) {
    return { success: false, error: `Kullanıcı oluşturulamadı: ${userError.message}` }
  }

  // Create restaurant with all fields
  const { data: restaurant, error: restaurantError } = await supabase
    .from('restaurants')
    .insert({
      name: input.name,
      slug: input.slug,
      slogan: input.slogan || null,
      phone: input.phone || null,
      address: input.address || null,
      whatsapp: input.whatsapp || null,
      instagram: input.instagram || null,
      facebook: input.facebook || null,
      twitter: input.twitter || null,
      about_us: input.about_us || null,
      logo_url: input.logo_url || null,
      hero_url: input.hero_url || null,
      layout_style: input.layout_style || 'grid',
      background_color: input.background_color || '#ffffff',
      surface_color: input.surface_color || '#f9fafb',
      text_color: input.text_color || '#111827',
      primary_color: input.primary_color || '#FF6B35',
      price_color: input.price_color || '#ef4444',
      icon_color: input.icon_color || '#111827',
      hamburger_bg_color: input.hamburger_bg_color || '#ffffff',
      qr_logo_bg_color: input.qr_logo_bg_color || '#FFFFFF',
      owner_user_id: newUser.user.id,
      is_active: true
    } as never)
    .select()
    .single()

  if (restaurantError) {
    // Rollback: delete user if restaurant creation fails
    await supabaseAdmin.auth.admin.deleteUser(newUser.user.id)
    return { success: false, error: `Restoran oluşturulamadı: ${restaurantError.message}` }
  }

  // Create subscription
  const { error: subscriptionError } = await supabase
    .from('subscriptions')
    .insert({
      restaurant_id: (restaurant as any).id,
      plan: input.plan || 'free',
      status: 'active'
    } as never)

  if (subscriptionError) {
    console.error('Subscription creation error:', subscriptionError)
  }

  revalidatePath('/admin')
  revalidatePath('/admin/restaurants')
  return { success: true, restaurant }
}

interface UpdateRestaurantByAdminInput {
  restaurantId: string
  name?: string
  slug?: string
  slogan?: string
  phone?: string
  email?: string
  address?: string
  whatsapp?: string
  instagram?: string
  facebook?: string
  twitter?: string
  about_us?: string
  logo_url?: string
  hero_url?: string
  layout_style?: string
  background_color?: string
  surface_color?: string
  text_color?: string
  primary_color?: string
  price_color?: string
  icon_color?: string
  hamburger_bg_color?: string
  qr_logo_bg_color?: string
  is_active?: boolean
}

export async function updateRestaurantByAdmin(input: UpdateRestaurantByAdminInput) {
  const supabase = await createClient()
  
  // Check if user is admin
  const { isAdmin: userIsAdmin } = await isAdmin()
  if (!userIsAdmin) {
    return { success: false, error: 'Unauthorized' }
  }

  const { restaurantId, ...updateData } = input

  // If slug is being updated, check if it's unique
  if (updateData.slug) {
    const { data: existingRestaurant } = await supabase
      .from('restaurants')
      .select('id')
      .eq('slug', updateData.slug)
      .neq('id', restaurantId)
      .maybeSingle()

    if (existingRestaurant) {
      return { success: false, error: 'Bu slug zaten kullanılıyor' }
    }
  }

  const { error } = await supabase
    .from('restaurants')
    .update(updateData as never)
    .eq('id', restaurantId)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/admin')
  revalidatePath(`/admin/restaurants/${restaurantId}`)
  revalidatePath(`/admin/restaurants/${restaurantId}/edit`)
  return { success: true }
}

export async function deleteRestaurant(restaurantId: string) {
  const supabase = await createClient()
  
  // Check if user is admin
  const { isAdmin: userIsAdmin } = await isAdmin()
  if (!userIsAdmin) {
    return { success: false, error: 'Unauthorized' }
  }

  // Get restaurant owner
  const { data: restaurant } = await supabase
    .from('restaurants')
    .select('owner_user_id')
    .eq('id', restaurantId)
    .single()

  if (!restaurant) {
    return { success: false, error: 'Restoran bulunamadı' }
  }

  // Delete restaurant (cascade will handle related records)
  const { error } = await supabase
    .from('restaurants')
    .delete()
    .eq('id', restaurantId)

  if (error) {
    return { success: false, error: error.message }
  }

  // Optionally delete user
  // Note: This requires service role key
  // const supabaseAdmin = createAdminClient(...)
  // await supabaseAdmin.auth.admin.deleteUser(restaurant.owner_user_id)

  revalidatePath('/admin')
  revalidatePath('/admin/restaurants')
  return { success: true }
}

export async function getRestaurantById(restaurantId: string) {
  const supabase = await createClient()
  
  // Check if user is admin
  const { isAdmin: userIsAdmin } = await isAdmin()
  if (!userIsAdmin) {
    return { error: 'Unauthorized' }
  }

  const { data: restaurant, error } = await supabase
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
    .single()

  if (error) {
    return { error: error.message }
  }

  return { restaurant }
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

// Category management for admin
interface CreateCategoryByAdminInput {
  restaurantId: string
  name: string
  image_url?: string
  sort_order?: number
  is_active?: boolean
}

export async function createCategoryByAdmin(input: CreateCategoryByAdminInput) {
  const supabase = await createClient()
  
  const { isAdmin: userIsAdmin } = await isAdmin()
  if (!userIsAdmin) {
    return { success: false, error: 'Unauthorized' }
  }

  const { data, error } = await supabase
    .from('categories')
    .insert({
      restaurant_id: input.restaurantId,
      name: input.name,
      image_url: input.image_url || null,
      sort_order: input.sort_order || 0,
      is_active: input.is_active ?? true
    } as never)
    .select()
    .single()

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath(`/admin/restaurants/${input.restaurantId}/categories`)
  return { success: true, category: data }
}

interface UpdateCategoryByAdminInput {
  name?: string
  image_url?: string
  sort_order?: number
  is_active?: boolean
}

export async function updateCategoryByAdmin(categoryId: string, input: UpdateCategoryByAdminInput) {
  const supabase = await createClient()
  
  const { isAdmin: userIsAdmin } = await isAdmin()
  if (!userIsAdmin) {
    return { success: false, error: 'Unauthorized' }
  }

  // Get category to find restaurant_id
  const { data: category } = await supabase
    .from('categories')
    .select('restaurant_id')
    .eq('id', categoryId)
    .single()

  const { error } = await supabase
    .from('categories')
    .update(input as never)
    .eq('id', categoryId)

  if (error) {
    return { success: false, error: error.message }
  }

  if (category) {
    revalidatePath(`/admin/restaurants/${(category as { restaurant_id: string }).restaurant_id}/categories`)
  }
  return { success: true }
}

export async function deleteCategoryByAdmin(categoryId: string) {
  const supabase = await createClient()
  
  const { isAdmin: userIsAdmin } = await isAdmin()
  if (!userIsAdmin) {
    return { success: false, error: 'Unauthorized' }
  }

  // Get category to find restaurant_id before deleting
  const { data: category } = await supabase
    .from('categories')
    .select('restaurant_id')
    .eq('id', categoryId)
    .single()

  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', categoryId)

  if (error) {
    return { success: false, error: error.message }
  }

  if (category) {
    revalidatePath(`/admin/restaurants/${(category as { restaurant_id: string }).restaurant_id}/categories`)
  }
  return { success: true }
}

// Product management for admin
interface CreateProductByAdminInput {
  restaurantId: string
  category_id: string
  name: string
  description?: string
  price: number
  image_url?: string
  sort_order?: number
  is_available?: boolean
  is_featured?: boolean
  is_daily_special?: boolean
}

export async function createProductByAdmin(input: CreateProductByAdminInput) {
  const supabase = await createClient()
  
  const { isAdmin: userIsAdmin } = await isAdmin()
  if (!userIsAdmin) {
    return { success: false, error: 'Unauthorized' }
  }

  const { data, error } = await supabase
    .from('products')
    .insert({
      restaurant_id: input.restaurantId,
      category_id: input.category_id,
      name: input.name,
      description: input.description || null,
      price: input.price,
      image_url: input.image_url || null,
      sort_order: input.sort_order || 0,
      is_available: input.is_available ?? true,
      is_featured: input.is_featured ?? false,
      is_daily_special: input.is_daily_special ?? false
    } as never)
    .select()
    .single()

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath(`/admin/restaurants/${input.restaurantId}/products`)
  return { success: true, product: data }
}

interface UpdateProductByAdminInput {
  category_id?: string
  name?: string
  description?: string
  price?: number
  image_url?: string
  sort_order?: number
  is_available?: boolean
  is_featured?: boolean
  is_daily_special?: boolean
}

export async function updateProductByAdmin(productId: string, input: UpdateProductByAdminInput) {
  const supabase = await createClient()
  
  const { isAdmin: userIsAdmin } = await isAdmin()
  if (!userIsAdmin) {
    return { success: false, error: 'Unauthorized' }
  }

  // Get product to find restaurant_id
  const { data: product } = await supabase
    .from('products')
    .select('restaurant_id')
    .eq('id', productId)
    .single()

  const { error } = await supabase
    .from('products')
    .update(input as never)
    .eq('id', productId)

  if (error) {
    return { success: false, error: error.message }
  }

  if (product) {
    revalidatePath(`/admin/restaurants/${(product as { restaurant_id: string }).restaurant_id}/products`)
  }
  return { success: true }
}

export async function deleteProductByAdmin(productId: string) {
  const supabase = await createClient()
  
  const { isAdmin: userIsAdmin } = await isAdmin()
  if (!userIsAdmin) {
    return { success: false, error: 'Unauthorized' }
  }

  // Get product to find restaurant_id
  const { data: product } = await supabase
    .from('products')
    .select('restaurant_id')
    .eq('id', productId)
    .single()

  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', productId)

  if (error) {
    return { success: false, error: error.message }
  }

  if (product) {
    revalidatePath(`/admin/restaurants/${(product as { restaurant_id: string }).restaurant_id}/products`)
  }
  return { success: true }
}

interface CategoryData {
  id: string
  restaurant_id: string
  name: string
  image_url?: string
  sort_order: number
  is_active: boolean
}

interface ProductData {
  id: string
  restaurant_id: string
  category_id?: string
  name: string
  description?: string
  price: number
  image_url?: string
  sort_order: number
  is_available: boolean
  is_featured: boolean
  is_daily_special: boolean
  categories?: { id: string; name: string }
}

export async function getCategoryById(categoryId: string): Promise<{ success: boolean; error?: string; data?: CategoryData }> {
  const supabase = await createClient()
  
  const { isAdmin: userIsAdmin } = await isAdmin()
  if (!userIsAdmin) {
    return { success: false, error: 'Unauthorized' }
  }

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('id', categoryId)
    .single()

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true, data: data as CategoryData }
}

export async function getProductById(productId: string): Promise<{ success: boolean; error?: string; data?: ProductData }> {
  const supabase = await createClient()
  
  const { isAdmin: userIsAdmin } = await isAdmin()
  if (!userIsAdmin) {
    return { success: false, error: 'Unauthorized' }
  }

  const { data, error } = await supabase
    .from('products')
    .select('*, categories(id, name)')
    .eq('id', productId)
    .single()

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true, data: data as ProductData }
}

export async function getCategoriesByRestaurant(restaurantId: string): Promise<{ success: boolean; error?: string; data?: { id: string; name: string }[] }> {
  const supabase = await createClient()
  
  const { isAdmin: userIsAdmin } = await isAdmin()
  if (!userIsAdmin) {
    return { success: false, error: 'Unauthorized' }
  }

  const { data, error } = await supabase
    .from('categories')
    .select('id, name')
    .eq('restaurant_id', restaurantId)
    .order('sort_order', { ascending: true })

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true, data: (data || []) as { id: string; name: string }[] }
}

// Admin impersonation - login as restaurant owner
export async function impersonateRestaurant(restaurantId: string) {
  const supabase = await createClient()
  
  const { isAdmin: userIsAdmin } = await isAdmin()
  if (!userIsAdmin) {
    return { success: false, error: 'Unauthorized' }
  }

  // Get restaurant owner user id
  const { data: restaurant, error: restaurantError } = await supabase
    .from('restaurants')
    .select('owner_user_id, name, slug')
    .eq('id', restaurantId)
    .single()

  if (restaurantError || !restaurant) {
    return { success: false, error: 'Restoran bulunamadı' }
  }

  // Store admin session info in cookie for later restoration
  const cookieStore = await cookies()
  const { data: { user: currentUser } } = await supabase.auth.getUser()
  
  if (currentUser) {
    cookieStore.set('admin_original_user', currentUser.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 // 1 hour
    })
  }

  // Create admin client to generate magic link or session
  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )

  // Generate a magic link for the restaurant owner
  const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
    type: 'magiclink',
    email: '', // We'll get this from user
  })

  // Alternative: Get user email and create session
  const { data: userData } = await supabaseAdmin.auth.admin.getUserById(restaurant.owner_user_id)
  
  if (!userData?.user?.email) {
    return { success: false, error: 'Restoran sahibi bulunamadı' }
  }

  // Store impersonation info
  cookieStore.set('impersonating_restaurant', JSON.stringify({
    restaurantId,
    restaurantName: restaurant.name,
    restaurantSlug: restaurant.slug,
    ownerUserId: restaurant.owner_user_id
  }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 // 1 hour
  })

  return {
    success: true,
    redirectUrl: '/panel',
    restaurant: {
      name: restaurant.name,
      slug: restaurant.slug
    }
  }
}

export async function stopImpersonation() {
  const cookieStore = await cookies()
  
  // Clear impersonation cookies
  cookieStore.delete('impersonating_restaurant')
  cookieStore.delete('admin_original_user')
  
  return { success: true, redirectUrl: '/admin' }
}

export async function getImpersonationStatus() {
  const cookieStore = await cookies()
  const impersonationCookie = cookieStore.get('impersonating_restaurant')
  
  if (!impersonationCookie?.value) {
    return { isImpersonating: false }
  }

  try {
    const data = JSON.parse(impersonationCookie.value)
    return {
      isImpersonating: true,
      restaurant: data
    }
  } catch {
    return { isImpersonating: false }
  }
}