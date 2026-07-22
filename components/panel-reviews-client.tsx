'use client'

import { useState } from 'react'
import { useLocale } from '@/lib/i18n/use-locale'
import { setReviewPublished, deleteReview } from '@/app/actions/reviews'

interface Review {
  id: string
  restaurant_id: string
  topic: 'oneri' | 'sikayet' | 'diger'
  rating: number | null
  message: string
  author_name: string | null
  contact: string | null
  is_published: boolean
  created_at: string
}

type Filter = 'all' | 'published' | 'pending'

export function PanelReviewsClient({ initialReviews }: { initialReviews: Review[] }) {
  const { t, locale } = useLocale()
  const [reviews, setReviews] = useState<Review[]>(initialReviews)
  const [filter, setFilter] = useState<Filter>('all')
  const [busy, setBusy] = useState<string | null>(null)

  const tr = t.panel.reviews

  const topicLabel = (topic: Review['topic']) =>
    topic === 'oneri' ? tr.topicOneri : topic === 'sikayet' ? tr.topicSikayet : tr.topicDiger

  const topicStyle = (topic: Review['topic']) =>
    topic === 'sikayet'
      ? 'bg-red-100 text-red-700'
      : topic === 'oneri'
        ? 'bg-emerald-100 text-emerald-700'
        : 'bg-gray-100 text-gray-700'

  const filtered = reviews.filter((r) =>
    filter === 'all' ? true : filter === 'published' ? r.is_published : !r.is_published
  )

  const pendingCount = reviews.filter((r) => !r.is_published).length

  async function togglePublish(r: Review) {
    setBusy(r.id)
    const res = await setReviewPublished(r.id, !r.is_published)
    if (res.success) {
      setReviews((list) =>
        list.map((x) => (x.id === r.id ? { ...x, is_published: !r.is_published } : x))
      )
    }
    setBusy(null)
  }

  async function remove(r: Review) {
    if (!confirm(tr.deleteConfirm)) return
    setBusy(r.id)
    const res = await deleteReview(r.id)
    if (res.success) {
      setReviews((list) => list.filter((x) => x.id !== r.id))
    }
    setBusy(null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{tr.title}</h1>
        <p className="text-gray-500 mt-1">{tr.subtitle}</p>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {([
          { key: 'all', label: `${tr.all} (${reviews.length})` },
          { key: 'pending', label: `${tr.pending} (${pendingCount})` },
          { key: 'published', label: `${tr.published} (${reviews.length - pendingCount})` },
        ] as { key: Filter; label: string }[]).map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              filter === f.key
                ? 'bg-orange-500 text-white shadow-md shadow-orange-200'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center text-gray-400">
          {tr.empty}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => (
            <div
              key={r.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5"
            >
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1 min-w-[240px]">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${topicStyle(r.topic)}`}>
                      {topicLabel(r.topic)}
                    </span>
                    {typeof r.rating === 'number' && (
                      <span className="flex items-center gap-0.5 text-amber-500">
                        {Array.from({ length: r.rating }).map((_, i) => (
                          <span key={i} className="material-symbols-outlined" style={{ fontSize: 16, fontVariationSettings: "'FILL' 1" }}>
                            star
                          </span>
                        ))}
                      </span>
                    )}
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        r.is_published ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {r.is_published ? tr.publishedBadge : tr.pendingBadge}
                    </span>
                  </div>

                  <p className="text-gray-800 whitespace-pre-wrap">{r.message}</p>

                  <div className="flex items-center gap-4 mt-3 text-xs text-gray-400 flex-wrap">
                    {r.author_name && <span className="font-medium text-gray-600">{r.author_name}</span>}
                    {r.contact && (
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined" style={{ fontSize: 14 }}>contact_phone</span>
                        {r.contact}
                      </span>
                    )}
                    <span>
                      {new Date(r.created_at).toLocaleDateString(locale === 'tr' ? 'tr-TR' : 'en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => togglePublish(r)}
                    disabled={busy === r.id}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold disabled:opacity-50 transition-all ${
                      r.is_published
                        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        : 'bg-green-500 text-white hover:bg-green-600'
                    }`}
                  >
                    {r.is_published ? tr.unpublish : tr.publish}
                  </button>
                  <button
                    onClick={() => remove(r)}
                    disabled={busy === r.id}
                    className="w-10 h-10 flex items-center justify-center rounded-xl text-red-600 hover:bg-red-50 disabled:opacity-50"
                    aria-label={tr.delete}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 20 }}>delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
