import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getPublicRestaurant } from '@/app/actions/public'
import { getPublicReviews } from '@/app/actions/reviews'
import { ReviewsSection } from '@/components/reviews-section'
import { MenuUnavailable } from '@/components/menu-unavailable'
import { isMenuAccessible, extractSubscription } from '@/lib/subscription'

export const revalidate = 60

export default async function AllReviewsPage({
  params,
  searchParams,
}: {
  params: { slug: string }
  searchParams: { lang?: string }
}) {
  const { slug } = params
  const { restaurant, error } = await getPublicRestaurant(slug)

  if (error || !restaurant) {
    notFound()
  }

  const rest = restaurant as any
  const subscription = extractSubscription(rest.subscriptions)
  const langs = rest.supported_languages || ['tr']
  const currentLang = searchParams.lang && langs.includes(searchParams.lang) ? searchParams.lang : langs[0]
  const isEnglish = currentLang === 'en'

  if (!isMenuAccessible(subscription, rest.created_at)) {
    return <MenuUnavailable restaurantName={rest.name} isEnglish={isEnglish} />
  }

  const reviewsData = await getPublicReviews(rest.id)

  const backgroundColor = rest.background_color || '#ffffff'
  const surfaceColor = rest.surface_color || '#f9fafb'
  const textColor = rest.text_color || '#111827'
  const primaryColor = rest.primary_color || '#FF6B35'
  const headerBgColor = rest.header_bg_color || backgroundColor
  const borderColor = textColor + '18'

  const menuUrl = currentLang !== 'tr' ? `/restorant/${slug}?lang=${currentLang}` : `/restorant/${slug}`

  return (
    <div className="min-h-screen pb-16" style={{ backgroundColor }}>
      {/* Header */}
      <header
        className="sticky top-0 z-40 border-b"
        style={{ backgroundColor: headerBgColor, borderColor }}
      >
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center gap-3">
          <Link
            href={menuUrl}
            className="flex items-center justify-center w-9 h-9 rounded-full hover:opacity-70 transition-opacity"
            style={{ color: textColor }}
            aria-label={isEnglish ? 'Back to menu' : 'Menüye dön'}
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
          {rest.logo_url && (
            <img src={rest.logo_url} alt={rest.name} className="h-8 w-8 rounded-full object-cover" />
          )}
          <div className="min-w-0">
            <p className="text-sm font-bold truncate" style={{ color: textColor }}>
              {rest.name}
            </p>
            <p className="text-xs" style={{ color: textColor + '99' }}>
              {isEnglish ? 'Customer Reviews' : 'Müşteri Yorumları'}
            </p>
          </div>
        </div>
      </header>

      <ReviewsSection
        restaurantId={rest.id}
        slug={slug}
        reviews={reviewsData.reviews}
        average={reviewsData.average}
        count={reviewsData.count}
        ratingCount={reviewsData.ratingCount}
        primaryColor={primaryColor}
        surfaceColor={surfaceColor}
        textColor={textColor}
        isEnglish={isEnglish}
        currentLang={currentLang}
        limit={reviewsData.reviews.length || 0}
        compact={false}
        showSeeAll={false}
      />
    </div>
  )
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const { restaurant } = await getPublicRestaurant(params.slug)
  if (!restaurant) {
    return { title: 'Yorumlar' }
  }
  const rest = restaurant as any
  return {
    title: `Yorumlar - ${rest.name}`,
    description: `${rest.name} müşteri yorumları ve değerlendirmeleri.`,
    robots: { index: false, follow: true },
  }
}
