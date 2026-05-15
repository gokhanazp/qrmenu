import { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

function getSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '')
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }
  return 'http://localhost:3000'
}

function buildLanguageAlternates(url: string, supportedLanguages: string[]) {
  if (supportedLanguages.length < 2) return undefined
  const languages: Record<string, string> = {}
  for (const lang of supportedLanguages) {
    languages[lang === 'tr' ? 'tr-TR' : lang === 'en' ? 'en-US' : lang] =
      lang === 'tr' ? url : `${url}?lang=${lang}`
  }
  languages['x-default'] = url
  return { languages }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getSiteUrl()
  const supabase = await createClient()

  const { data: restaurants } = await supabase
    .from('restaurants')
    .select('slug, updated_at, created_at, supported_languages')
    .eq('is_active', true)

  const restaurantList = (restaurants || []) as any[]
  const restaurantIds = restaurantList.length > 0
    ? await supabase
        .from('restaurants')
        .select('id, slug, supported_languages, updated_at')
        .eq('is_active', true)
    : { data: [] as any[] }

  const idMap = new Map<string, { slug: string; supported_languages: string[]; updated_at: string }>()
  for (const r of (restaurantIds.data || []) as any[]) {
    idMap.set(r.id, {
      slug: r.slug,
      supported_languages: r.supported_languages || ['tr'],
      updated_at: r.updated_at,
    })
  }

  const { data: categories } = idMap.size > 0
    ? await supabase
        .from('categories')
        .select('id, restaurant_id, updated_at')
        .eq('is_active', true)
    : { data: [] as any[] }

  const restaurantUrls: MetadataRoute.Sitemap = restaurantList.map((restaurant: any) => {
    const url = `${baseUrl}/restorant/${restaurant.slug}`
    const supportedLanguages = restaurant.supported_languages || ['tr']
    return {
      url,
      lastModified: new Date(restaurant.updated_at || restaurant.created_at),
      changeFrequency: 'daily' as const,
      priority: 0.9,
      alternates: buildLanguageAlternates(url, supportedLanguages),
    }
  })

  const categoryUrls: MetadataRoute.Sitemap = ((categories || []) as any[])
    .map((category: any) => {
      const restaurant = idMap.get(category.restaurant_id)
      if (!restaurant) return null
      const url = `${baseUrl}/restorant/${restaurant.slug}/category/${category.id}`
      return {
        url,
        lastModified: new Date(category.updated_at || restaurant.updated_at),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
        alternates: buildLanguageAlternates(url, restaurant.supported_languages),
      }
    })
    .filter(Boolean) as MetadataRoute.Sitemap

  const seoLandingSlugs = [
    'ucretsiz-qr-menu',
    'qr-menu-olusturma',
    'dijital-menu',
    'restoran-menu-programi',
  ]

  const seoLandingUrls: MetadataRoute.Sitemap = seoLandingSlugs.map((slug) => ({
    url: `${baseUrl}/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.85,
  }))

  const staticUrls: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    ...seoLandingUrls,
    {
      url: `${baseUrl}/auth/register`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/auth/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.4,
    },
  ]

  return [...staticUrls, ...restaurantUrls, ...categoryUrls]
}
