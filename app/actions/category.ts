'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getCategories(restaurantId: string) {
  const supabase = await createClient()

  const { data: categories, error } = await supabase
    .from('categories')
    .select('*')
    .eq('restaurant_id', restaurantId)
    .order('sort_order', { ascending: true })

  if (error) {
    console.error('Error fetching categories:', error)
    return { categories: [], error: error.message }
  }

  return { categories: categories || [], error: null }
}

export async function createCategory(data: {
  restaurant_id: string
  name: string
  name_en?: string | null
  sort_order: number
  image_url?: string
}) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('categories')
    .insert({
      restaurant_id: data.restaurant_id,
      name: data.name,
      name_en: data.name_en || null,
      sort_order: data.sort_order,
      image_url: data.image_url || null,
      is_active: true
    } as never)

  if (error) {
    console.error('Error creating category:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/panel/categories')
  return { success: true, error: null }
}

export async function updateCategory(id: string, data: {
  name: string
  name_en?: string | null
  sort_order: number
  is_active: boolean
  image_url?: string
}) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('categories')
    .update({
      name: data.name,
      name_en: data.name_en || null,
      sort_order: data.sort_order,
      is_active: data.is_active,
      image_url: data.image_url
    } as never)
    .eq('id', id)

  if (error) {
    console.error('Error updating category:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/panel/categories')
  return { success: true, error: null }
}

export async function deleteCategory(id: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting category:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/panel/categories')
  return { success: true, error: null }
}

export async function getCategory(id: string) {
  const supabase = await createClient()

  const { data: category, error } = await supabase
    .from('categories')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (error) {
    console.error('Error fetching category:', error)
    return { category: null, error: error.message }
  }

  return { category, error: null }
}