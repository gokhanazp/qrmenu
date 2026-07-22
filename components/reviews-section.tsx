'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ReviewModal } from './review-modal'
import type { PublicReview } from '@/app/actions/reviews'

interface ReviewsSectionProps {
  restaurantId: string
  slug: string
  reviews: PublicReview[]
  average: number
  count: number
  ratingCount: number
  primaryColor?: string
  surfaceColor?: string
  textColor?: string
  isEnglish?: boolean
  currentLang?: string
  limit?: number
  compact?: boolean
  showSeeAll?: boolean
}

function Stars({ value, size = 18 }: { value: number; size?: number }) {
  return (
    <div className="flex" style={{ gap: 1 }}>
      {[1, 2, 3, 4, 5].map((s) => {
        const filled = value >= s
        const half = !filled && value >= s - 0.5
        return (
          <span
            key={s}
            className="material-symbols-outlined"
            style={{
              fontSize: size,
              color: filled || half ? '#f59e0b' : '#d1d5db',
              fontVariationSettings: filled ? "'FILL' 1" : "'FILL' 0",
            }}
          >
            {half ? 'star_half' : 'star'}
          </span>
        )
      })}
    </div>
  )
}

export function ReviewsSection({
  restaurantId,
  slug,
  reviews,
  average,
  count,
  ratingCount,
  primaryColor = '#FF6B35',
  surfaceColor = '#f9fafb',
  textColor = '#111827',
  isEnglish = false,
  currentLang = 'tr',
  limit = 5,
  compact = true,
  showSeeAll = true,
}: ReviewsSectionProps) {
  const [open, setOpen] = useState(false)

  const t = isEnglish
    ? {
        title: 'Customer Reviews',
        write: 'Write a Review',
        empty: 'No reviews yet. Be the first to leave one!',
        basedOn: (n: number) => `${n} rating${n === 1 ? '' : 's'}`,
        reviewsCount: (n: number) => `${n} review${n === 1 ? '' : 's'}`,
        seeAll: (n: number) => `See all reviews (${n})`,
      }
    : {
        title: 'Müşteri Yorumları',
        write: 'Yorum Yap',
        empty: 'Henüz yorum yok. İlk yorumu sen bırak!',
        basedOn: (n: number) => `${n} puanlama`,
        reviewsCount: (n: number) => `${n} yorum`,
        seeAll: (n: number) => `Tüm yorumları gör (${n})`,
      }

  const mutedColor = textColor + '99'
  const borderColor = textColor + '18'
  const locale = isEnglish ? 'en-US' : 'tr-TR'

  const shown = reviews.slice(0, limit)
  const allReviewsUrl =
    currentLang && currentLang !== 'tr' ? `/restorant/${slug}/yorumlar?lang=${currentLang}` : `/restorant/${slug}/yorumlar`

  return (
    <section className="max-w-3xl mx-auto px-4 py-8">
      {/* Başlık satırı — kompakt */}
      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold" style={{ color: textColor }}>
            {t.title}
          </h2>
          {ratingCount > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="font-bold" style={{ color: textColor }}>
                {average.toFixed(1)}
              </span>
              <Stars value={average} size={16} />
              <span className="text-xs" style={{ color: mutedColor }}>
                ({t.basedOn(ratingCount)})
              </span>
            </div>
          )}
        </div>

        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold text-white transition-transform hover:scale-[1.02]"
          style={{ backgroundColor: primaryColor }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
            rate_review
          </span>
          {t.write}
        </button>
      </div>

      {shown.length === 0 ? (
        <div
          className="rounded-xl p-6 text-center text-sm"
          style={{ backgroundColor: surfaceColor, color: mutedColor }}
        >
          {t.empty}
        </div>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 gap-3">
            {shown.map((r) => (
              <div
                key={r.id}
                className="rounded-xl p-4 border"
                style={{ backgroundColor: surfaceColor, borderColor }}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-sm font-semibold truncate" style={{ color: textColor }}>
                    {r.author_name || (isEnglish ? 'Guest' : 'Misafir')}
                  </span>
                  {typeof r.rating === 'number' && <Stars value={r.rating} size={14} />}
                </div>
                <p
                  className={`text-sm leading-relaxed ${compact ? 'line-clamp-3' : ''}`}
                  style={{ color: textColor + 'cc' }}
                >
                  {r.message}
                </p>
                <span className="text-xs mt-2 block" style={{ color: mutedColor }}>
                  {new Date(r.created_at).toLocaleDateString(locale, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
            ))}
          </div>

          {showSeeAll && count > shown.length && (
            <div className="text-center mt-5">
              <Link
                href={allReviewsUrl}
                className="inline-flex items-center gap-1 text-sm font-semibold hover:underline"
                style={{ color: primaryColor }}
              >
                {t.seeAll(count)}
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                  arrow_forward
                </span>
              </Link>
            </div>
          )}
        </>
      )}

      <ReviewModal
        restaurantId={restaurantId}
        primaryColor={primaryColor}
        isEnglish={isEnglish}
        open={open}
        onClose={() => setOpen(false)}
      />
    </section>
  )
}
