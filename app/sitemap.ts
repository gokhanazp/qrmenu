import { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'
import { BLOG_POSTS } from '@/lib/blog/posts'

function getSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '')
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }
  return 'http://localhost:3000'
}

/**
 * Restoran sayfaları için hreflang alternate'leri.
 *
 * Yalnızca restoranın GERÇEKTEN birden fazla dil desteklediği durumda üretilir.
 * Pazarlama sayfaları (ana sayfa, landing'ler, blog, yasal sayfalar) tek dilli
 * olduğu için onlara alternate verilmiyor — eskiden tr-TR/en-US/x-default üçü
 * de aynı URL'e bakıyordu ve Google bunu çelişki olarak okuyordu.
 */
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

  const restaurantUrls: MetadataRoute.Sitemap = restaurantList.map((restaurant: any) => {
    /*
     * Slug KÜÇÜK HARFE çevrilerek yayınlanıyor.
     *
     * Veritabanında elle girilmiş büyük harfli slug'lar var (ör.
     * "Hilton-Garden-Inn-Pendik"). Sitemap'in kanonik adresi bildirmesi gerekir:
     * middleware /restorant/* isteklerini küçük harfe 308'liyor ve arama
     * `ilike` olduğu için küçük harfli adres kaydı bulur. Büyük harfli URL'i
     * sitemap'e koymak Google'ı yönlendirme zincirine sokar.
     *
     * (supabase/migrations/020 bu slug'ları veritabanında da normalize eder.)
     */
    const url = `${baseUrl}/restorant/${String(restaurant.slug).toLowerCase()}`
    const supportedLanguages = restaurant.supported_languages || ['tr']
    return {
      url,
      lastModified: new Date(restaurant.updated_at || restaurant.created_at),
      changeFrequency: 'daily' as const,
      priority: 0.9,
      alternates: buildLanguageAlternates(url, supportedLanguages),
    }
  })

  /*
   * Kategori URL'leri (/restorant/[slug]/category/[uuid]) BİLEREK sitemap'te yok.
   *
   * Üç sebep:
   *   1. Slug bir UUID — hiçbir aramaya karşılık gelmiyor.
   *   2. İnce içerik — kategori sayfası, ana restoran sayfasının alt kümesi;
   *      neredeyse birebir kopya. İndekslenmesi gereken sayfa, tüm ürünleri
   *      içeren ana restoran sayfası.
   *   3. Tarama bütçesi — 169 URL'in 71'i (%42) bu sayfalara gidiyordu; yeni
   *      blog yazıları daha yavaş taranıyordu.
   *
   * Sayfalar erişilebilir kalmaya devam ediyor, sadece `noindex, follow`
   * veriliyor (bkz. app/restorant/[slug]/category/[categoryId]/page.tsx).
   */

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

  const blogPostUrls: MetadataRoute.Sitemap = BLOG_POSTS.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(`${post.updatedAt}T00:00:00Z`),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  // Kurumsal sayfalar — güven (E-E-A-T) sinyali, para sayfalarından sonra gelir
  const corporateUrls: MetadataRoute.Sitemap = [
    { slug: 'hakkimizda', priority: 0.5 },
    { slug: 'iletisim', priority: 0.5 },
  ].map(({ slug, priority }) => ({
    url: `${baseUrl}/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority,
  }))

  // Yasal sayfalar — index, follow ama düşük öncelikle
  const legalUrls: MetadataRoute.Sitemap = [
    'gizlilik-politikasi',
    'kullanim-sartlari',
    'kvkk',
    'cerez-politikasi',
  ].map((slug) => ({
    url: `${baseUrl}/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'yearly' as const,
    priority: 0.3,
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
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    ...blogPostUrls,
    ...corporateUrls,
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
    ...legalUrls,
  ]

  return [...staticUrls, ...restaurantUrls]
}
