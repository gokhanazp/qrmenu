import { notFound } from 'next/navigation'
import { getPublicRestaurant, getCategoryWithProducts, getAllProducts, trackScanEvent } from '@/app/actions/public'
import { headers } from 'next/headers'
import Image from 'next/image'
import Link from 'next/link'
import { HamburgerMenu } from '@/components/hamburger-menu'
import { ProductCard } from '@/components/product-card'
import { PublicMenuClient } from '@/components/public-menu-client'
import { PublicMenuBottomNav } from '@/components/public-menu-bottom-nav'

// Revalidate every 5 minutes for category pages
export const revalidate = 300

export default async function CategoryDetailPage({
  params
}: {
  params: { slug: string; categoryId: string }
}) {
  const { slug, categoryId } = params

  // Fetch restaurant
  const { restaurant, error: restaurantError } = await getPublicRestaurant(slug)

  if (restaurantError || !restaurant) {
    notFound()
  }

  // Fetch category and products, and all products for search
  const { category, products = [] } = await getCategoryWithProducts((restaurant as any).id, categoryId)
  const { products: allProducts } = await getAllProducts((restaurant as any).id)

  if (!category) {
    notFound()
  }

  // Track scan event
  const headersList = await headers()
  const userAgent = headersList.get('user-agent') || undefined
  const referrer = headersList.get('referer') || undefined
  await trackScanEvent((restaurant as any).id, userAgent, referrer)

  const rest = restaurant as any
  const cat = category as any
  const backgroundColor = rest.background_color || '#ffffff'
  const surfaceColor = rest.surface_color || '#f9fafb'
  const textColor = rest.text_color || '#111827'
  const primaryColor = rest.primary_color || '#FF6B35'
  const priceColor = rest.price_color || '#ef4444'
  const iconColor = rest.icon_color || '#111827'
  const hamburgerBgColor = rest.hamburger_bg_color || '#ffffff'
  const layoutStyle = rest.layout_style || 'grid'
  const borderColor = textColor + '20' // 20% opacity

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
            <div className="flex items-center justify-between p-4 h-16">
              <HamburgerMenu
                restaurant={rest}
                iconColor={iconColor}
                hamburgerBgColor={hamburgerBgColor}
              />
              <Link href={`/restorant/${slug}`} className="flex items-center">
                {rest.logo_url ? (
                  <Image
                    src={rest.logo_url}
                    alt={rest.name}
                    width={140}
                    height={48}
                    className="h-12 w-auto object-contain"
                    priority
                  />
                ) : (
                  <h1
                    className="text-xl font-bold tracking-tight uppercase"
                    style={{ color: primaryColor }}
                  >
                    {rest.name}
                  </h1>
                )}
              </Link>
              <button
                id="search-button"
                className="flex items-center justify-center p-2 rounded-full transition-colors hover:opacity-80"
                style={{ color: iconColor }}
                aria-label="Ara"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>search</span>
              </button>
            </div>
          </header>

          {/* Category Header */}
          {cat.image_url && (
            <div className="px-4 pt-6 pb-2">
              <div className="relative w-full h-48 rounded-xl overflow-hidden shadow-lg">
                <Image
                  src={cat.image_url}
                  alt={cat.name}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 768px) 100vw, 448px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-5 w-full">
                  <h2 className="text-white text-2xl font-bold leading-tight uppercase">
                    {cat.name}
                  </h2>
                </div>
              </div>
            </div>
          )}

          {/* Products */}
          <div className="mt-4 pb-24">
            <div className="flex items-center px-4 mb-3">
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
                {cat.name}
              </h2>
              <div 
                className="h-px flex-1 ml-4"
                style={{ backgroundColor: borderColor }}
              ></div>
            </div>

            {products.length === 0 ? (
              <div 
                className="px-4 py-8 text-center"
                style={{ color: textColor, opacity: 0.7 }}
              >
                Bu kategoride henüz ürün bulunmuyor
              </div>
            ) : layoutStyle === 'list' ? (
              // List Layout - Full width with large images
              <div className="px-4 grid grid-cols-1 gap-4">
                {products.map((product: any) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    primaryColor={primaryColor}
                    priceColor={priceColor}
                    backgroundColor={backgroundColor}
                    surfaceColor={surfaceColor}
                    textColor={textColor}
                    borderColor={borderColor}
                    variant="category-list"
                  />
                ))}
              </div>
            ) : (
              // Grid Layout - Standard list with small images
              <div className="px-4 flex flex-col gap-3">
                {products.map((product: any) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    primaryColor={primaryColor}
                    priceColor={priceColor}
                    backgroundColor={backgroundColor}
                    surfaceColor={surfaceColor}
                    textColor={textColor}
                    borderColor={borderColor}
                    variant="category-grid"
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <PublicMenuClient
          allProducts={allProducts || []}
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
        />
    </div>
  )
}

export async function generateMetadata({ params }: { params: { slug: string; categoryId: string } }) {
  const { restaurant } = await getPublicRestaurant(params.slug)
  const { category, products = [] } = await getCategoryWithProducts((restaurant as any)?.id, params.categoryId)

  if (!restaurant || !category) {
    return {
      title: 'Kategori Bulunamadı',
      description: 'Aradığınız kategori bulunamadı',
    }
  }

  const rest = restaurant as any
  const cat = category as any
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const pageUrl = `${siteUrl}/restorant/${params.slug}/category/${params.categoryId}`
  
  const title = `${cat.name} - ${rest.name} | Dijital Menü`
  const description = `${rest.name} restoranının ${cat.name} kategorisinde ${products.length} çeşit ürün bulunmaktadır. Dijital menümüzü görüntüleyin.`

  return {
    title,
    description,
    keywords: [
      rest.name,
      cat.name,
      'dijital menü',
      'qr menü',
      'online menü',
      'restoran menüsü',
    ],
    authors: [{ name: rest.name }],
    robots: {
      index: rest.is_active && cat.is_active,
      follow: rest.is_active && cat.is_active,
    },
    openGraph: {
      type: 'website',
      locale: 'tr_TR',
      url: pageUrl,
      title,
      description,
      siteName: rest.name,
      images: cat.image_url ? [
        {
          url: cat.image_url,
          width: 1200,
          height: 630,
          alt: `${rest.name} - ${cat.name}`,
        },
      ] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: cat.image_url ? [cat.image_url] : [],
    },
    alternates: {
      canonical: pageUrl,
    },
  }
}