'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'

// Admin impersonation desteği (restaurant.ts ile aynı davranış)
async function getImpersonatedRestaurantId(): Promise<string | null> {
  const cookieStore = await cookies()
  const impersonationCookie = cookieStore.get('impersonating_restaurant')
  if (!impersonationCookie?.value) return null
  try {
    const data = JSON.parse(impersonationCookie.value)
    return data.restaurantId || null
  } catch {
    return null
  }
}

const TOPICS = ['oneri', 'sikayet', 'diger'] as const
type Topic = (typeof TOPICS)[number]

interface SubmitReviewInput {
  restaurantId: string
  topic: string
  rating?: number | null
  message: string
  authorName?: string
  contact?: string
}

// PUBLIC: yorum gönder (anonim müşteri)
export async function submitReview(input: SubmitReviewInput) {
  const supabase = await createClient()

  const message = (input.message || '').trim()
  if (!message) return { success: false, error: 'Mesaj boş olamaz' }
  if (message.length > 1000) return { success: false, error: 'Mesaj çok uzun' }

  const topic: Topic = TOPICS.includes(input.topic as Topic) ? (input.topic as Topic) : 'oneri'

  let rating: number | null = null
  if (input.rating != null) {
    const r = Math.round(Number(input.rating))
    if (r >= 1 && r <= 5) rating = r
  }

  // Restoran aktif mi?
  const { data: restaurant } = await supabase
    .from('restaurants')
    .select('id')
    .eq('id', input.restaurantId)
    .eq('is_active', true)
    .maybeSingle()

  if (!restaurant) return { success: false, error: 'Restoran bulunamadı' }

  // is_published trigger tarafından zaten false'a kilitleniyor
  const { error } = await supabase
    .from('reviews')
    .insert({
      restaurant_id: input.restaurantId,
      topic,
      rating,
      message,
      author_name: input.authorName?.trim() || null,
      contact: input.contact?.trim() || null,
    } as never)

  if (error) return { success: false, error: error.message }

  return { success: true }
}

export interface PublicReview {
  id: string
  topic: Topic
  rating: number | null
  message: string
  author_name: string | null
  created_at: string
}

// PUBLIC: yayınlanmış yorumlar + özet (contact ALINMAZ)
export async function getPublicReviews(restaurantId: string): Promise<{
  reviews: PublicReview[]
  average: number
  count: number
  ratingCount: number
}> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('reviews')
      .select('id, topic, rating, message, author_name, created_at')
      .eq('restaurant_id', restaurantId)
      .eq('is_published', true)
      .order('created_at', { ascending: false })
      .limit(100)

    if (error || !data) return { reviews: [], average: 0, count: 0, ratingCount: 0 }

    const reviews = data as PublicReview[]
    const rated = reviews.filter((r) => typeof r.rating === 'number')
    const average = rated.length
      ? Math.round((rated.reduce((s, r) => s + (r.rating || 0), 0) / rated.length) * 10) / 10
      : 0

    return { reviews, average, count: reviews.length, ratingCount: rated.length }
  } catch {
    return { reviews: [], average: 0, count: 0, ratingCount: 0 }
  }
}

// OWNER: kendi restoranımın tüm yorumları (contact dahil)
export async function getMyReviews() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const impersonatedRestaurantId = await getImpersonatedRestaurantId()

  let restaurantId: string | null = null
  if (impersonatedRestaurantId) {
    restaurantId = impersonatedRestaurantId
  } else {
    const { data: restaurant } = await supabase
      .from('restaurants')
      .select('id')
      .eq('owner_user_id', user.id)
      .maybeSingle()
    restaurantId = (restaurant as { id: string } | null)?.id || null
  }

  if (!restaurantId) return { error: 'Restoran bulunamadı' }

  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('restaurant_id', restaurantId)
    .order('created_at', { ascending: false })

  if (error) return { error: error.message }
  return { reviews: data || [] }
}

// OWNER/ADMIN: yayınla / yayından kaldır
export async function setReviewPublished(reviewId: string, published: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  const { error } = await supabase
    .from('reviews')
    .update({ is_published: published } as never)
    .eq('id', reviewId)

  if (error) return { success: false, error: error.message }

  revalidatePath('/panel/reviews')
  return { success: true }
}

// OWNER/ADMIN: sil
export async function deleteReview(reviewId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  const { error } = await supabase
    .from('reviews')
    .delete()
    .eq('id', reviewId)

  if (error) return { success: false, error: error.message }

  revalidatePath('/panel/reviews')
  return { success: true }
}
