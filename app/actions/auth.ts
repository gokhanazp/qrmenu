'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { loginSchema, registerSchema, type LoginInput, type RegisterInput } from '@/lib/validations/auth'

interface AuthResult {
  success: boolean
  error?: string
  isAdmin?: boolean
}

export async function login(input: LoginInput): Promise<AuthResult> {
  try {
    // Validate input
    const validatedData = loginSchema.parse(input)
    
    const supabase = await createClient()
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: validatedData.email,
      password: validatedData.password,
    })

    if (error) {
      return {
        success: false,
        error: error.message === 'Invalid login credentials'
          ? 'Email veya şifre hatalı'
          : error.message,
      }
    }

    // Check if user is admin
    const { data: isAdmin } = await supabase.rpc('is_admin')
    
    revalidatePath('/', 'layout')
    
    return {
      success: true,
      isAdmin: isAdmin || false,
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Giriş yapılırken bir hata oluştu',
    }
  }
}

export async function register(input: RegisterInput): Promise<AuthResult> {
  try {
    // Validate input
    const validatedData = registerSchema.parse(input)
    
    const supabase = await createClient()
    
    // Create user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: validatedData.email,
      password: validatedData.password,
    })

    if (authError) {
      return {
        success: false,
        error: authError.message === 'User already registered'
          ? 'Bu email adresi zaten kayıtlı'
          : authError.message,
      }
    }

    if (!authData.user) {
      return {
        success: false,
        error: 'Kullanıcı oluşturulamadı',
      }
    }

    // Generate slug from restaurant name
    const { generateSlug } = await import('@/lib/utils/slug')
    let slug = generateSlug(validatedData.restaurantName)
    
    // Check if slug exists and make it unique
    let counter = 0
    let uniqueSlug = slug
    while (true) {
      const { data: existing } = await supabase
        .from('restaurants')
        .select('id')
        .eq('slug', uniqueSlug)
        .single()
      
      if (!existing) break
      
      counter++
      uniqueSlug = `${slug}-${counter}`
    }

    // Create restaurant
    const { error: restaurantError } = await supabase
      .from('restaurants')
      .insert({
        owner_user_id: authData.user.id,
        name: validatedData.restaurantName,
        slug: uniqueSlug,
        is_active: true,
      } as any)

    if (restaurantError) {
      // Rollback: Delete the created user
      await supabase.auth.admin.deleteUser(authData.user.id)
      return {
        success: false,
        error: 'Restoran oluşturulamadı: ' + restaurantError.message,
      }
    }

    // Subscription will be created automatically by trigger

    revalidatePath('/', 'layout')
    
    return {
      success: true,
      isAdmin: false,
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Kayıt olurken bir hata oluştu',
    }
  }
}

export async function logout(): Promise<AuthResult> {
  try {
    const supabase = await createClient()
    
    const { error } = await supabase.auth.signOut()

    if (error) {
      return {
        success: false,
        error: error.message,
      }
    }

    revalidatePath('/', 'layout')
    redirect('/auth/login')
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Çıkış yapılırken bir hata oluştu',
    }
  }
}

export async function getUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function isAdmin() {
  const supabase = await createClient()
  const { data } = await supabase.rpc('is_admin')
  return data || false
}