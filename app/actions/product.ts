'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getProducts(restaurantId: string) {
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

export async function createProduct(data: {
  restaurant_id: string
  category_id: string | null
  name: string
  description: string | null
  price: number
  image_url: string | null
  sort_order: number
  is_active: boolean
  is_featured: boolean
  is_daily_special?: boolean
}) {
  const supabase = await createClient()

  const { data: product, error } = await supabase
    .from('products')
    .insert(data as any)
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
  description?: string | null
  price?: number
  category_id?: string | null
  image_url?: string | null
  sort_order?: number
  is_active?: boolean
  is_featured?: boolean
  is_daily_special?: boolean
}) {
  const supabase = await createClient()

  const { data: product, error } = await supabase
    .from('products')
    .update(data as any)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating product:', error)
    return { product: null, error: error.message }
  }

  revalidatePath('/panel/products')
  return { product, error: null }
}

export async function deleteProduct(id: string) {
  const supabase = await createClient()

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