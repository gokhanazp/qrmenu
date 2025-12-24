'use server'

import { createClient } from '@/lib/supabase/server'

export async function getPublicRestaurant(slug: string) {
  const supabase = await createClient()

  const { data: restaurant, error } = await supabase
    .from('restaurants')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .maybeSingle()

  if (error) {
    console.error('Error fetching restaurant:', error)
    return { restaurant: null, error: error.message }
  }

  return { restaurant, error: null }
}

export async function getPublicMenu(restaurantId: string) {
  const supabase = await createClient()

  // Fetch categories with their products
  const { data: categories, error: categoriesError } = await supabase
    .from('categories')
    .select(`
      id,
      name,
      sort_order,
      image_url,
      products (
        id,
        name,
        description,
        price,
        image_url,
        sort_order
      )
    `)
    .eq('restaurant_id', restaurantId)
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  if (categoriesError) {
    console.error('Error fetching menu:', categoriesError)
    return { categories: [], error: categoriesError.message }
  }

  // Filter active products and sort them
  const categoriesWithProducts = (categories as any[])?.map((category: any) => ({
    ...category,
    products: (category.products || [])
      .filter((p: any) => p.is_active !== false)
      .sort((a: any, b: any) => a.sort_order - b.sort_order)
  })) || []

  return { categories: categoriesWithProducts, error: null }
}

export async function getFeaturedProducts(restaurantId: string) {
  const supabase = await createClient()

  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .eq('restaurant_id', restaurantId)
    .eq('is_active', true)
    .eq('is_featured', true)
    .order('sort_order', { ascending: true })
    .limit(6)

  if (error) {
    console.error('Error fetching featured products:', error)
    return { products: [], error: error.message }
  }

  return { products, error: null }
}

export async function getDailySpecials(restaurantId: string) {
  const supabase = await createClient()

  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .eq('restaurant_id', restaurantId)
    .eq('is_active', true)
    .eq('is_daily_special', true)
    .order('sort_order', { ascending: true })
    .limit(5)

  if (error) {
    console.error('Error fetching daily specials:', error)
    return { products: [], error: error.message }
  }

  return { products, error: null }
}

export async function getAllProducts(restaurantId: string) {
  const supabase = await createClient()

  const { data: products, error } = await supabase
    .from('products')
    .select(`
      *,
      categories (
        id,
        name
      )
    `)
    .eq('restaurant_id', restaurantId)
    .eq('is_active', true)
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching all products:', error)
    return { products: [], error: error.message }
  }

  return { products, error: null }
}

export async function getCategoryWithProducts(restaurantId: string, categoryId: string) {
  const supabase = await createClient()

  // Fetch category
  const { data: category, error: categoryError } = await supabase
    .from('categories')
    .select('*')
    .eq('id', categoryId)
    .eq('restaurant_id', restaurantId)
    .eq('is_active', true)
    .maybeSingle()

  if (categoryError || !category) {
    console.error('Error fetching category:', categoryError)
    return { category: null, products: [], error: categoryError?.message || 'Category not found' }
  }

  // Fetch products in this category
  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('*')
    .eq('restaurant_id', restaurantId)
    .eq('category_id', categoryId)
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  if (productsError) {
    console.error('Error fetching products:', productsError)
    return { category, products: [], error: productsError.message }
  }

  return { category, products, error: null }
}

export async function trackScanEvent(restaurantId: string, userAgent?: string, referrer?: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('scan_events')
    .insert({
      restaurant_id: restaurantId,
      user_agent: userAgent,
      referrer: referrer,
      scanned_at: new Date().toISOString()
    } as any)

  if (error) {
    console.error('Error tracking scan event:', error)
    return { success: false, error: error.message }
  }

  return { success: true, error: null }
}