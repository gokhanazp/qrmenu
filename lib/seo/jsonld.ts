import { FREE_OFFER } from '@/lib/offer'
import { TESTIMONIALS, aggregateRating } from '@/lib/testimonials'
import { COMPANY, socialLinks } from '@/lib/company'
import { CONTACT_WHATSAPP_NUMBER } from '@/lib/contact'

export function getSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '')
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }
  return 'http://localhost:3000'
}

type Restaurant = {
  id: string
  name: string
  slug: string
  slogan?: string | null
  about_us?: string | null
  logo_url?: string | null
  hero_url?: string | null
  phone?: string | null
  email?: string | null
  address?: string | null
  instagram?: string | null
  facebook?: string | null
  twitter?: string | null
  whatsapp?: string | null
  supported_languages?: string[]
}

type Category = {
  id: string
  name: string
  name_en?: string | null
  image_url?: string | null
}

type Product = {
  id: string
  name: string
  name_en?: string | null
  description?: string | null
  description_en?: string | null
  price: number | string
  image_url?: string | null
}

function sameAsList(r: Restaurant): string[] {
  return [r.instagram, r.facebook, r.twitter]
    .filter((u): u is string => Boolean(u))
    .map((u) => (u.startsWith('http') ? u : `https://${u}`))
}

export function restaurantJsonLd(r: Restaurant, products: Product[] = []) {
  const siteUrl = getSiteUrl()
  const url = `${siteUrl}/restorant/${r.slug}`
  const image = r.hero_url || r.logo_url || `${siteUrl}/qrmenu-logo.png`

  const priceRange = products.length > 0
    ? (() => {
        const prices = products
          .map((p) => Number(p.price))
          .filter((p) => !Number.isNaN(p) && p > 0)
        if (prices.length === 0) return undefined
        const max = Math.max(...prices)
        if (max < 100) return '₺'
        if (max < 300) return '₺₺'
        if (max < 600) return '₺₺₺'
        return '₺₺₺₺'
      })()
    : undefined

  return {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    '@id': url,
    name: r.name,
    description: r.about_us || r.slogan || `${r.name} dijital menüsü`,
    url,
    image,
    logo: r.logo_url || undefined,
    telephone: r.phone || undefined,
    email: r.email || undefined,
    address: r.address
      ? {
          '@type': 'PostalAddress',
          streetAddress: r.address,
          addressCountry: 'TR',
        }
      : undefined,
    servesCuisine: 'Turkish',
    priceRange,
    sameAs: sameAsList(r),
    hasMenu: `${url}#menu`,
    acceptsReservations: 'False',
    inLanguage: r.supported_languages || ['tr'],
  }
}

export function menuJsonLd(
  r: Restaurant,
  categories: Array<Category & { products: Product[] }>,
) {
  const siteUrl = getSiteUrl()
  const url = `${siteUrl}/restorant/${r.slug}`

  return {
    '@context': 'https://schema.org',
    '@type': 'Menu',
    '@id': `${url}#menu`,
    name: `${r.name} Menü`,
    inLanguage: r.supported_languages?.[0] || 'tr',
    hasMenuSection: categories.map((cat) => ({
      '@type': 'MenuSection',
      '@id': `${url}/category/${cat.id}`,
      name: cat.name,
      image: cat.image_url || undefined,
      hasMenuItem: (cat.products || []).map((p) => ({
        '@type': 'MenuItem',
        name: p.name,
        description: p.description || undefined,
        image: p.image_url || undefined,
        offers: {
          '@type': 'Offer',
          price: Number(p.price).toFixed(2),
          priceCurrency: 'TRY',
          availability: 'https://schema.org/InStock',
        },
      })),
    })),
  }
}

export function menuSectionJsonLd(
  r: Restaurant,
  category: Category,
  products: Product[],
  isEnglish = false,
) {
  const siteUrl = getSiteUrl()
  const sectionUrl = `${siteUrl}/restorant/${r.slug}/category/${category.id}`
  const name = isEnglish && category.name_en ? category.name_en : category.name

  return {
    '@context': 'https://schema.org',
    '@type': 'MenuSection',
    '@id': sectionUrl,
    name,
    url: sectionUrl,
    image: category.image_url || undefined,
    inLanguage: isEnglish ? 'en' : 'tr',
    hasMenuItem: products.map((p) => ({
      '@type': 'MenuItem',
      name: isEnglish && p.name_en ? p.name_en : p.name,
      description: (isEnglish && p.description_en ? p.description_en : p.description) || undefined,
      image: p.image_url || undefined,
      offers: {
        '@type': 'Offer',
        price: Number(p.price).toFixed(2),
        priceCurrency: 'TRY',
        availability: 'https://schema.org/InStock',
      },
    })),
  }
}

export function breadcrumbJsonLd(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

/**
 * Adres bilgisi TODO placeholder içeriyorsa schema'ya HİÇ konmaz —
 * "TODO: İl" gibi bir değer yayınlanmış PostalAddress'ten daha kötüdür.
 */
function postalAddressOrUndefined() {
  const a = COMPANY.address
  const filled = [a.street, a.district, a.city].every(
    (v) => v && !v.startsWith('TODO'),
  )
  if (!filled) return undefined
  return {
    '@type': 'PostalAddress',
    streetAddress: a.street,
    addressLocality: a.district,
    addressRegion: a.city,
    postalCode: a.postalCode.startsWith('TODO') ? undefined : a.postalCode,
    addressCountry: a.countryCode,
  }
}

export function organizationJsonLd() {
  const siteUrl = getSiteUrl()
  const email = COMPANY.email.startsWith('TODO') ? undefined : COMPANY.email

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${siteUrl}#organization`,
    name: 'QR Menülist',
    legalName: COMPANY.legalName.startsWith('TODO') ? undefined : COMPANY.legalName,
    alternateName: ['QR Menü', 'QR Menülist — QR Menü Oluşturma'],
    url: siteUrl,
    foundingDate: COMPANY.foundedYear,
    logo: {
      '@type': 'ImageObject',
      url: `${siteUrl}/qrmenu-logo.png`,
      width: 512,
      height: 512,
    },
    description:
      'QR menü oluşturma platformu. Restoranlar, kafeler ve oteller için dijital menü, QR kod menü ve online menü yönetim sistemi.',
    address: postalAddressOrUndefined(),
    email,
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: `+${CONTACT_WHATSAPP_NUMBER}`,
      email,
      contactType: 'customer support',
      areaServed: 'TR',
      availableLanguage: ['Turkish', 'English'],
    },
    // sameAs yalnızca gerçekten doldurulmuş sosyal profilleri içerir
    sameAs: socialLinks().map((l) => l.url),
  }
}

/**
 * /iletisim sayfası için LocalBusiness. Adres/e-posta doldurulmadıysa
 * (COMPANY içindeki TODO alanları) schema üretilmez — eksik veriyle
 * yayınlanmış LocalBusiness marka varlığına katkı sağlamaz.
 */
export function localBusinessJsonLd() {
  const siteUrl = getSiteUrl()
  const address = postalAddressOrUndefined()
  if (!address) return null

  return {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    '@id': `${siteUrl}/iletisim#localbusiness`,
    name: COMPANY.brand,
    legalName: COMPANY.legalName,
    url: `${siteUrl}/iletisim`,
    image: `${siteUrl}/qrmenu-logo.png`,
    telephone: `+${CONTACT_WHATSAPP_NUMBER}`,
    email: COMPANY.email.startsWith('TODO') ? undefined : COMPANY.email,
    address,
    openingHours: COMPANY.openingHours.schema,
    areaServed: 'TR',
    parentOrganization: { '@id': `${siteUrl}#organization` },
  }
}

/**
 * Adım adım rehberler için HowTo. /qr-menu-olusturma'da kullanılıyor —
 * o sorgunun SERP'i bilgilendirici (video paketi + adım adım rehberler).
 */
export function howToJsonLd(input: {
  name: string
  description: string
  url: string
  totalMinutes: number
  steps: Array<{ name: string; text: string; anchor: string }>
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: input.name,
    description: input.description,
    totalTime: `PT${input.totalMinutes}M`,
    estimatedCost: {
      '@type': 'MonetaryAmount',
      currency: 'TRY',
      value: '0',
    },
    step: input.steps.map((step, idx) => ({
      '@type': 'HowToStep',
      position: idx + 1,
      name: step.name,
      text: step.text,
      url: `${input.url}#${step.anchor}`,
    })),
  }
}

export function websiteJsonLd() {
  const siteUrl = getSiteUrl()
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${siteUrl}#website`,
    url: siteUrl,
    name: 'QR Menülist',
    alternateName: 'QR Menü Oluşturma',
    description:
      'Restoranın için QR menü oluştur, dijital menü hazırla. QR kod menü oluşturma platformu.',
    publisher: { '@id': `${siteUrl}#organization` },
    inLanguage: ['tr-TR', 'en-US'],
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteUrl}/?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }
}

export function softwareApplicationJsonLd() {
  const siteUrl = getSiteUrl()
  const rating = aggregateRating()

  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'QR Menülist - QR Menü Oluşturma',
    applicationCategory: 'BusinessApplication',
    applicationSubCategory: 'Restaurant Menu Software',
    operatingSystem: 'Web Browser',
    url: siteUrl,
    description:
      'QR menü oluşturma platformu. Restoranlar ve kafeler için dijital menü, QR kod menü, yapay zeka destekli çeviri, çoklu dil desteği, müşteri istatistikleri ve özelleştirilebilir tasarım.',
    offers: [
      {
        '@type': 'Offer',
        name: 'Ücretsiz Deneme',
        category: 'Free',
        price: '0',
        priceCurrency: 'TRY',
        availability: 'https://schema.org/InStock',
        description: FREE_OFFER.sentence,
      },
      {
        '@type': 'Offer',
        name: 'Pro Plan',
        category: 'Subscription',
        priceCurrency: 'TRY',
        availability: 'https://schema.org/InStock',
        description: 'Gelişmiş özellikler ve yüksek kapasite için Pro plan',
      },
    ],
    // aggregateRating YALNIZCA sayfada gerçekten listelenen yorumlardan
    // hesaplanır. Eskiden sabit `4.9 / ratingCount 500` yazıyordu ama sayfadaki
    // üç yorum uydurmaydı — Google'ın yapılandırılmış veri politikası, sayfada
    // doğrulanabilir karşılığı olmayan puan işaretlemesini manuel işlem sebebi
    // sayıyor. lib/testimonials.ts boşken bu alan hiç üretilmez.
    ...(rating
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: rating.ratingValue,
            bestRating: '5',
            worstRating: '1',
            reviewCount: String(rating.reviewCount),
          },
          review: TESTIMONIALS.map((t) => ({
            '@type': 'Review',
            author: { '@type': 'Person', name: t.name },
            reviewRating: {
              '@type': 'Rating',
              ratingValue: String(t.rating),
              bestRating: '5',
            },
            reviewBody: t.text,
          })),
        }
      : {}),
    featureList: [
      'QR menü oluşturma',
      'QR kod ile menü erişimi',
      'Dijital menü yönetimi',
      'Yapay zeka destekli menü çevirisi',
      'Çoklu dil desteği (Türkçe + İngilizce)',
      'Müşteri istatistikleri',
      'Özelleştirilebilir tasarım',
      'Mobil uyumlu menü',
      'Kategori bazlı menü yönetimi',
    ],
  }
}

type ArticleInput = {
  slug: string
  title: string
  description: string
  publishedAt: string
  updatedAt: string
  keywords: string[]
  section: string
  /** Yaklaşık kelime sayısı — Google için içerik derinliği sinyali */
  wordCount?: number
}

export function articleJsonLd(article: ArticleInput) {
  const siteUrl = getSiteUrl()
  const url = `${siteUrl}/blog/${article.slug}`

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    '@id': url,
    headline: article.title,
    description: article.description,
    url,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
    datePublished: article.publishedAt,
    dateModified: article.updatedAt,
    inLanguage: 'tr-TR',
    articleSection: article.section,
    keywords: article.keywords.join(', '),
    wordCount: article.wordCount,
    image: {
      '@type': 'ImageObject',
      url: `${siteUrl}/qrmenu-logo.png`,
      width: 512,
      height: 512,
    },
    author: { '@id': `${siteUrl}#organization` },
    publisher: { '@id': `${siteUrl}#organization` },
    isPartOf: { '@id': `${siteUrl}/blog#blog` },
  }
}

export function blogJsonLd(posts: Array<{ slug: string; title: string; description: string; publishedAt: string }>) {
  const siteUrl = getSiteUrl()
  const blogUrl = `${siteUrl}/blog`

  return {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    '@id': `${blogUrl}#blog`,
    url: blogUrl,
    name: 'QR Menülist Blog',
    description:
      'QR menü, dijital menü ve restoran menü yönetimi üzerine rehberler, karşılaştırmalar ve maliyet analizleri.',
    inLanguage: 'tr-TR',
    publisher: { '@id': `${siteUrl}#organization` },
    blogPost: posts.map((post) => ({
      '@type': 'BlogPosting',
      '@id': `${blogUrl}/${post.slug}`,
      headline: post.title,
      description: post.description,
      datePublished: post.publishedAt,
      url: `${blogUrl}/${post.slug}`,
    })),
  }
}

export function faqPageJsonLd(items: Array<{ q: string; a: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
  }
}
