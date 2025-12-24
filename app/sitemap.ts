import { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001'
  const supabase = await createClient()

  // Get all active restaurants
  const { data: restaurants } = await supabase
    .from('restaurants')
    .select('slug, created_at')
    .eq('is_active', true)

  const restaurantUrls: MetadataRoute.Sitemap = (restaurants || []).map((restaurant: any) => ({
    url: `${baseUrl}/restorant/${restaurant.slug}`,
    lastModified: new Date(restaurant.created_at),
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }))

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
    ...restaurantUrls,
  ]
}