import { notFound } from 'next/navigation'
import { getPublicRestaurant, getPublicMenu, getFeaturedProducts, getDailySpecials, getAllProducts, trackScanEvent } from '@/app/actions/public'
import { headers } from 'next/headers'
import Image from 'next/image'
import Link from 'next/link'
import { HamburgerMenu } from '@/components/hamburger-menu'
import { ProductCard } from '@/components/product-card'
import { PublicMenuClient } from '@/components/public-menu-client'
import { PublicMenuBottomNav } from '@/components/public-menu-bottom-nav'

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic'

export default async function PublicMenuPage({ params, searchParams }: { params: { slug: string }, searchParams: { lang?: string } }) {
  const { slug } = params

  // Fetch restaurant
  const { restaurant, error: restaurantError } = await getPublicRestaurant(slug)

  if (restaurantError || !restaurant) {
    notFound()
  }

  // Fetch menu, featured products, daily specials, and all products for search
  const { categories } = await getPublicMenu((restaurant as any).id)
  const { products: featuredProducts } = await getFeaturedProducts((restaurant as any).id)
  const { products: dailySpecials } = await getDailySpecials((restaurant as any).id)
  const { products: allProducts } = await getAllProducts((restaurant as any).id)

  // Track scan event
  const headersList = await headers()
  const userAgent = headersList.get('user-agent') || undefined
  const referrer = headersList.get('referer') || undefined
  await trackScanEvent((restaurant as any).id, userAgent, referrer)

  const rest = restaurant as any
  const backgroundColor = rest.background_color || '#ffffff'
  const surfaceColor = rest.surface_color || '#f9fafb'
  const textColor = rest.text_color || '#111827'
  const primaryColor = rest.primary_color || '#FF6B35'
  const priceColor = rest.price_color || '#ef4444'
  const iconColor = rest.icon_color || '#111827'
  const hamburgerBgColor = rest.hamburger_bg_color || '#ffffff'
  const layoutStyle = rest.layout_style || 'grid'
  const borderColor = textColor + '20' // 20% opacity
  const supportedLanguages = rest.supported_languages || ['tr']
  
  // Dil seçimi - URL parametresinden veya varsayılan
  const currentLang = searchParams.lang && supportedLanguages.includes(searchParams.lang) 
    ? searchParams.lang 
    : supportedLanguages[0]
  const isEnglish = currentLang === 'en'
  
  // Çeviri metinleri
  const translations = {
    tr: {
      welcome: 'Hoşgeldiniz',
      menuPreparing: 'Menü Hazırlanıyor',
      menuPreparingDesc: 'Yakında lezzetli menümüzle karşınızda olacağız',
      categories: 'Kategoriler',
      dailyMenu: 'Günün Menüsü',
      featured: 'Öne Çıkanlar',
      items: 'Çeşit',
      search: 'Ara'
    },
    en: {
      welcome: 'Welcome',
      menuPreparing: 'Menu is Being Prepared',
      menuPreparingDesc: 'We will be with you soon with our delicious menu',
      categories: 'Categories',
      dailyMenu: 'Daily Specials',
      featured: 'Featured',
      items: 'Items',
      search: 'Search'
    }
  }
  
  const t = translations[isEnglish ? 'en' : 'tr']

  return (
    <div
      className="font-['Work_Sans'] antialiased transition-colors duration-200"
      style={{
        backgroundColor,
        color: textColor
      }}
    >
        <div
          className="relative flex h-full min-h-screen w-full flex-col overflow-x-hidden max-w-md mx-auto shadow-2xl"
          style={{ backgroundColor }}
        >
          {/* Sticky Header */}
          <header
            className="sticky top-0 z-[60] backdrop-blur-md transition-colors duration-200"
            style={{
              backgroundColor: `${backgroundColor}e6`,
              borderBottom: `1px solid ${borderColor}`
            }}
          >
            <div className="flex items-center px-3" style={{ minHeight: '120px', paddingTop: '16px', paddingBottom: '16px' }}>
              {/* Sol: Hamburger Menü */}
              <div className="flex-shrink-0 w-12">
                <HamburgerMenu
                  restaurant={rest}
                  iconColor={iconColor}
                  hamburgerBgColor={hamburgerBgColor}
                  supportedLanguages={supportedLanguages}
                  currentLang={currentLang}
                  slug={slug}
                />
              </div>
              
              {/* Orta: Logo */}
              <Link href={`/restorant/${slug}${isEnglish ? '?lang=en' : ''}`} className="flex items-center justify-center flex-1">
                {rest.logo_url ? (
                  <div className="relative" style={{ width: '200px', height: '80px' }}>
                    <Image
                      src={rest.logo_url}
                      alt={rest.name}
                      fill
                      className="object-contain"
                      priority
                      sizes="200px"
                    />
                  </div>
                ) : (
                  <h1
                    className="text-xl font-bold tracking-tight uppercase text-center"
                    style={{ color: primaryColor }}
                  >
                    {rest.name}
                  </h1>
                )}
              </Link>
              
              {/* Sağ: Arama İkonu */}
              <div className="flex-shrink-0 w-12 flex justify-end">
                <button
                  id="search-button"
                  className="flex items-center justify-center p-2 rounded-full transition-colors hover:opacity-80"
                  style={{ color: iconColor }}
                  aria-label={t.search}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>search</span>
                </button>
              </div>
            </div>
          </header>

      {/* Hero Section */}
      {rest.hero_url && (
        <div className="px-4 pt-6 pb-2">
          <div className="relative w-full h-48 rounded-xl overflow-hidden shadow-lg group cursor-pointer">
            <Image
              src={rest.hero_url}
              alt={rest.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              priority
              sizes="(max-width: 768px) 100vw, 448px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
            {rest.slogan && (
              <div className="absolute bottom-0 left-0 p-5 w-full">
                <p 
                  className="text-sm font-semibold tracking-wider uppercase mb-1"
                  style={{ color: primaryColor }}
                >
                  {t.welcome}
                </p>
                <h2 className="text-white text-2xl font-bold leading-tight">
                  {isEnglish && rest.slogan_en ? rest.slogan_en : rest.slogan}
                </h2>
              </div>
            )}
          </div>
        </div>
      )}

          {/* Menu Categories */}
          {categories.length === 0 ? (
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="text-center">
                <div className="text-6xl mb-4">🍽️</div>
                <h3 
                  className="text-xl font-bold mb-2"
                  style={{ color: textColor }}
                >
                  {t.menuPreparing}
                </h3>
                <p style={{ color: textColor, opacity: 0.7 }}>
                  {t.menuPreparingDesc}
                </p>
              </div>
            </div>
          ) : (
            <div className="mt-4 pb-24">
              {/* Food Categories Section */}
              <div className="flex items-center px-4 mb-3" data-section="categories">
                <span
                  className="material-symbols-outlined mr-2"
                  style={{ color: iconColor }}
                >
                  restaurant
                </span>
                <h2
                  className="text-lg font-bold"
                  style={{ color: textColor }}
                >
                  {t.categories}
                </h2>
                <div
                  className="h-px flex-1 ml-4"
                  style={{ backgroundColor: borderColor }}
                ></div>
              </div>
              
              <div className={`px-4 ${layoutStyle === 'grid' ? 'grid grid-cols-2 gap-3' : 'flex flex-col gap-3'}`}>
                {categories.map((category: any) => (
                  <Link
                    key={category.id}
                    href={`/restorant/${slug}/category/${category.id}${isEnglish ? '?lang=en' : ''}`}
                    className={`relative ${layoutStyle === 'grid' ? 'aspect-[4/3]' : 'aspect-[16/9]'} rounded-lg overflow-hidden cursor-pointer group shadow-sm`}
                    style={{ backgroundColor: surfaceColor }}
                  >
                    {(category.image_url || category.products[0]?.image_url) && (
                      <div
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                        style={{ backgroundImage: `url(${category.image_url || category.products[0]?.image_url})` }}
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity"></div>
                    <div className="absolute bottom-0 left-0 p-3 w-full">
                      <h3 className="text-white font-bold text-lg leading-tight transition-colors uppercase group-hover:opacity-90">
                        {isEnglish && category.name_en ? category.name_en : category.name}
                      </h3>
                      <p className="text-gray-300 text-xs mt-1 font-medium">
                        {category.products.length} {t.items}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Daily Specials Section */}
              {dailySpecials && dailySpecials.length > 0 && (
                <div className="mt-6">
                  <div className="flex items-center px-4 mb-3">
                    <span
                      className="material-symbols-outlined mr-2"
                      style={{ color: iconColor }}
                    >
                      local_fire_department
                    </span>
                    <h2
                      className="text-lg font-bold"
                      style={{ color: textColor }}
                    >
                      {t.dailyMenu}
                    </h2>
                    <div
                      className="h-px flex-1 ml-4"
                      style={{ backgroundColor: borderColor }}
                    ></div>
                  </div>
                  
                  <div className="px-4 flex flex-col gap-3">
                    {dailySpecials.map((product: any) => (
                      <ProductCard
                        key={product.id}
                        product={{
                          ...product,
                          name: isEnglish && product.name_en ? product.name_en : product.name,
                          description: isEnglish && product.description_en ? product.description_en : product.description
                        }}
                        primaryColor={primaryColor}
                        priceColor={priceColor}
                        backgroundColor={backgroundColor}
                        surfaceColor={surfaceColor}
                        textColor={textColor}
                        borderColor={borderColor}
                        variant="daily-special"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Featured Products Section */}
              {featuredProducts && featuredProducts.length > 0 && (
                <div className="mt-6">
                  <div className="flex items-center px-4 mb-3">
                    <span
                      className="material-symbols-outlined mr-2"
                      style={{ color: iconColor }}
                    >
                      star
                    </span>
                    <h2
                      className="text-lg font-bold"
                      style={{ color: textColor }}
                    >
                      {t.featured}
                    </h2>
                    <div
                      className="h-px flex-1 ml-4"
                      style={{ backgroundColor: borderColor }}
                    ></div>
                  </div>
                  
                  <div className="px-4 flex flex-col gap-3">
                    {featuredProducts.map((product: any) => (
                      <ProductCard
                        key={product.id}
                        product={{
                          ...product,
                          name: isEnglish && product.name_en ? product.name_en : product.name,
                          description: isEnglish && product.description_en ? product.description_en : product.description
                        }}
                        primaryColor={primaryColor}
                        priceColor={priceColor}
                        backgroundColor={backgroundColor}
                        surfaceColor={surfaceColor}
                        textColor={textColor}
                        borderColor={borderColor}
                        variant="featured"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <PublicMenuClient
          allProducts={(allProducts || []).map((product: any) => ({
            ...product,
            name: isEnglish && product.name_en ? product.name_en : product.name,
            description: isEnglish && product.description_en ? product.description_en : product.description
          }))}
          primaryColor={primaryColor}
          priceColor={priceColor}
          iconColor={iconColor}
          backgroundColor={backgroundColor}
          surfaceColor={surfaceColor}
          textColor={textColor}
          borderColor={borderColor}
        />

        <PublicMenuBottomNav
          restaurant={rest}
          primaryColor={primaryColor}
          backgroundColor={backgroundColor}
          surfaceColor={surfaceColor}
          textColor={textColor}
          iconColor={iconColor}
          currentLang={currentLang}
        />
    </div>
  )
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const { restaurant } = await getPublicRestaurant(params.slug)

  if (!restaurant) {
    return {
      title: 'Restoran Bulunamadı',
      description: 'Aradığınız restoran bulunamadı',
    }
  }

  const rest = restaurant as any
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const pageUrl = `${siteUrl}/restorant/${params.slug}`
  
  const title = `${rest.name} - Dijital Menü | QR Menü`
  const description = rest.slogan
    ? `${rest.name} - ${rest.slogan}. Dijital menümüzü görüntüleyin ve sipariş verin.`
    : `${rest.name} dijital menüsü. QR kod ile kolayca menümüze ulaşın ve sipariş verin.`

  return {
    title,
    description,
    keywords: [
      rest.name,
      'dijital menü',
      'qr menü',
      'online menü',
      'restoran menüsü',
      'yemek menüsü',
      rest.slogan,
    ].filter(Boolean),
    authors: [{ name: rest.name }],
    creator: rest.name,
    publisher: rest.name,
    robots: {
      index: rest.is_active,
      follow: rest.is_active,
      googleBot: {
        index: rest.is_active,
        follow: rest.is_active,
      },
    },
    openGraph: {
      type: 'website',
      locale: 'tr_TR',
      url: pageUrl,
      title,
      description,
      siteName: rest.name,
      images: rest.hero_url || rest.logo_url ? [
        {
          url: rest.hero_url || rest.logo_url,
          width: 1200,
          height: 630,
          alt: rest.name,
        },
      ] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: rest.hero_url || rest.logo_url ? [rest.hero_url || rest.logo_url] : [],
    },
    alternates: {
      canonical: pageUrl,
    },
    other: {
      'mobile-web-app-capable': 'yes',
      'apple-mobile-web-app-capable': 'yes',
      'apple-mobile-web-app-status-bar-style': 'black-translucent',
    },
  }
}