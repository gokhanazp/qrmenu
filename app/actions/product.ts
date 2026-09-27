'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { assertRestaurantAccess, assertRestaurantRole } from '@/lib/auth/restaurant-context'
import { CONTENT_MANAGER_ROLES, OPERATIONS_ROLES } from '@/lib/auth/roles'
import { syncProductPrice } from '@/lib/inventory/sync'

export async function getProducts(restaurantId: string) {
  const supabase = await createClient()

  // İstemciden gelen restaurant_id'ye güvenme: erişim sunucuda doğrulanır
  const access = await assertRestaurantAccess(restaurantId)
  if (!access.ok) {
    return { products: [], error: access.error }
  }

  const { data: products, error } = await supabase
    .from('products')
    .select(`
      *,
      categories (
        id,
        name,
        name_en
      )
    `)
    .eq('restaurant_id', restaurantId)
    .order('sort_order', { ascending: true })

  if (error) {
    console.error('Error fetching products:', error)
    return { products: [], error: error.message }
  }

  return { products, error: null }
}

export async function getProduct(id: string) {
  const supabase = await createClient()

  const { data: product, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (error) {
    console.error('Error fetching product:', error)
    return { product: null, error: error.message }
  }

  return { product, error: null }
}

async function getProductRestaurantId(id: string): Promise<string | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('products')
    .select('restaurant_id')
    .eq('id', id)
    .maybeSingle()
  return (data as { restaurant_id: string } | null)?.restaurant_id || null
}

export async function createProduct(data: {
  restaurant_id: string
  category_id: string | null
  name: string
  name_en?: string | null
  description: string | null
  description_en?: string | null
  price: number
  image_url: string | null
  sort_order: number
  is_active: boolean
  is_featured: boolean
  is_daily_special?: boolean
}) {
  const supabase = await createClient()

  const access = await assertRestaurantRole(data.restaurant_id, CONTENT_MANAGER_ROLES)
  if (!access.ok) {
    return { product: null, error: access.error }
  }

  const { data: product, error } = await supabase
    .from('products')
    .insert({
      restaurant_id: data.restaurant_id,
      category_id: data.category_id,
      name: data.name,
      name_en: data.name_en || null,
      description: data.description,
      description_en: data.description_en || null,
      price: data.price,
      image_url: data.image_url,
      sort_order: data.sort_order,
      is_active: data.is_active,
      is_featured: data.is_featured,
      is_daily_special: data.is_daily_special || false
    } as never)
    .select()
    .single()

  if (error) {
    console.error('Error creating product:', error)
    return { product: null, error: error.message }
  }

  revalidatePath('/panel/products')
  return { product, error: null }
}

export async function updateProduct(id: string, data: {
  name?: string
  name_en?: string | null
  description?: string | null
  description_en?: string | null
  price?: number
  category_id?: string | null
  image_url?: string | null
  sort_order?: number
  is_active?: boolean
  is_featured?: boolean
  is_daily_special?: boolean
}) {
  const supabase = await createClient()

  const restaurantId = await getProductRestaurantId(id)
  if (!restaurantId) {
    return { product: null, error: 'Ürün bulunamadı' }
  }
  const access = await assertRestaurantRole(restaurantId, OPERATIONS_ROLES)
  if (!access.ok) {
    return { product: null, error: access.error }
  }

  const { data: product, error } = await supabase
    .from('products')
    .update(data as never)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating product:', error)
    return { product: null, error: error.message }
  }

  revalidatePath('/panel/products')
  revalidatePath('/panel/products/platform')
  // Fiyat/durum değişikliği public menüde ISR beklemeden görünsün
  revalidatePath('/restorant/[slug]', 'page')
  revalidatePath('/restorant/[slug]/category/[categoryId]', 'page')

  // QR fiyatı değiştiyse "QR fiyatıyla aynı" kanallara gönder (hata akışı kesmez)
  if (data.price !== undefined) {
    try {
      await syncProductPrice(id, { onlyMasterLinked: true })
    } catch (e) {
      console.error('price sync error:', e)
    }
  }
  return { product, error: null }
}

export async function deleteProduct(id: string) {
  const supabase = await createClient()

  const restaurantId = await getProductRestaurantId(id)
  if (!restaurantId) {
    return { success: false, error: 'Ürün bulunamadı' }
  }
  const access = await assertRestaurantRole(restaurantId, CONTENT_MANAGER_ROLES)
  if (!access.ok) {
    return { success: false, error: access.error }
  }

  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting product:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/panel/products')
  return { success: true, error: null }
}
