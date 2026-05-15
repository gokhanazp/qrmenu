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

export function organizationJsonLd() {
  const siteUrl = getSiteUrl()
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${siteUrl}#organization`,
    name: 'QR Menülist',
    alternateName: ['QR Menü', 'QR Menülist - Ücretsiz QR Menü Oluşturma'],
    url: siteUrl,
    logo: {
      '@type': 'ImageObject',
      url: `${siteUrl}/qrmenu-logo.png`,
      width: 512,
      height: 512,
    },
    description:
      'Ücretsiz QR menü oluşturma platformu. Restoranlar ve kafeler için dijital menü, QR kod menü ve online menü yönetim sistemi.',
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+90-537-510-20-84',
      contactType: 'customer support',
      contactOption: 'TollFree',
      areaServed: 'TR',
      availableLanguage: ['Turkish', 'English'],
    },
    sameAs: [],
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
    alternateName: 'Ücretsiz QR Menü Oluşturma',
    description:
      'Ücretsiz QR menü oluştur, restoranın için dijital menü hazırla. QR kod menü oluşturma platformu.',
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
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'QR Menülist - Ücretsiz QR Menü Oluşturma',
    applicationCategory: 'BusinessApplication',
    applicationSubCategory: 'Restaurant Menu Software',
    operatingSystem: 'Web Browser',
    url: siteUrl,
    description:
      'Ücretsiz QR menü oluşturma platformu. Restoranlar ve kafeler için dijital menü, QR kod menü, yapay zeka destekli çeviri, çoklu dil desteği, müşteri istatistikleri ve özelleştirilebilir tasarım.',
    offers: [
      {
        '@type': 'Offer',
        name: 'Başlangıç Planı',
        category: 'Free',
        price: '0',
        priceCurrency: 'TRY',
        availability: 'https://schema.org/InStock',
        description: 'Ücretsiz başlangıç planı — denemek için ideal',
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
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      bestRating: '5',
      ratingCount: '500',
    },
    featureList: [
      'Ücretsiz QR menü oluşturma',
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
