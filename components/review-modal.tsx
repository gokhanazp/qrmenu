'use client'

import { useState } from 'react'
import { submitReview } from '@/app/actions/reviews'

interface ReviewModalProps {
  restaurantId: string
  primaryColor?: string
  isEnglish?: boolean
  open: boolean
  onClose: () => void
}

type Topic = 'oneri' | 'sikayet' | 'diger'

export function ReviewModal({
  restaurantId,
  primaryColor = '#FF6B35',
  isEnglish = false,
  open,
  onClose,
}: ReviewModalProps) {
  const [topic, setTopic] = useState<Topic>('oneri')
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [message, setMessage] = useState('')
  const [authorName, setAuthorName] = useState('')
  const [contact, setContact] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  const t = isEnglish
    ? {
        title: 'Reviews & Feedback',
        topic: 'Topic',
        suggestion: 'Suggestion',
        complaint: 'Complaint',
        other: 'Other',
        rating: 'Rating (optional)',
        message: 'Your Message',
        messagePlaceholder: 'Write your thoughts here...',
        name: 'Name (optional)',
        namePlaceholder: 'Your name',
        contact: 'Contact (optional)',
        contactPlaceholder: 'Phone or E-mail',
        send: 'SEND',
        sending: 'Sending...',
        thanksTitle: 'Thank you!',
        thanksDesc: 'Your feedback has been received. It will be published after approval.',
        close: 'Close',
        required: 'Please write a message',
      }
    : {
        title: 'Öneri & Şikayet',
        topic: 'Konu',
        suggestion: 'Öneri',
        complaint: 'Şikayet',
        other: 'Diğer',
        rating: 'Puan (isteğe bağlı)',
        message: 'Mesajınız',
        messagePlaceholder: 'Görüşlerinizi buraya yazın...',
        name: 'İsim (isteğe bağlı)',
        namePlaceholder: 'Adınız',
        contact: 'İletişim (isteğe bağlı)',
        contactPlaceholder: 'Tel No veya E-posta',
        send: 'GÖNDER',
        sending: 'Gönderiliyor...',
        thanksTitle: 'Teşekkürler!',
        thanksDesc: 'Yorumunuz alındı. Onaylandıktan sonra yayınlanacaktır.',
        close: 'Kapat',
        required: 'Lütfen bir mesaj yazın',
      }

  if (!open) return null

  const topics: { key: Topic; label: string }[] = [
    { key: 'oneri', label: t.suggestion },
    { key: 'sikayet', label: t.complaint },
    { key: 'diger', label: t.other },
  ]

  function reset() {
    setTopic('oneri')
    setRating(0)
    setHoverRating(0)
    setMessage('')
    setAuthorName('')
    setContact('')
    setError('')
    setDone(false)
  }

  function handleClose() {
    reset()
    onClose()
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!message.trim()) {
      setError(t.required)
      return
    }
    setSubmitting(true)
    try {
      const res = await submitReview({
        restaurantId,
        topic,
        rating: rating || null,
        message,
        authorName,
        contact,
      })
      if (res.success) {
        setDone(true)
      } else {
        setError(res.error || 'Hata')
      }
    } catch {
      setError('Hata')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5" style={{ backgroundColor: primaryColor }}>
          <h2 className="text-xl font-bold text-white">{t.title}</h2>
          <button
            onClick={handleClose}
            className="text-white/90 hover:text-white transition-colors"
            aria-label={t.close}
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {done ? (
          <div className="p-8 text-center">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: `${primaryColor}20` }}
            >
              <span className="material-symbols-outlined text-3xl" style={{ color: primaryColor }}>
                check_circle
              </span>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">{t.thanksTitle}</h3>
            <p className="text-gray-500 mb-6">{t.thanksDesc}</p>
            <button
              onClick={handleClose}
              className="px-6 py-3 rounded-xl font-semibold text-white w-full"
              style={{ backgroundColor: primaryColor }}
            >
              {t.close}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Topic */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">{t.topic}</label>
              <div className="grid grid-cols-3 gap-2">
                {topics.map((tp) => {
                  const active = topic === tp.key
                  return (
                    <button
                      type="button"
                      key={tp.key}
                      onClick={() => setTopic(tp.key)}
                      className="py-3 rounded-xl text-sm font-semibold transition-all"
                      style={
                        active
                          ? { backgroundColor: primaryColor, color: '#fff' }
                          : { backgroundColor: '#f3f4f6', color: '#374151' }
                      }
                    >
                      {tp.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Rating */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">{t.rating}</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => {
                  const filled = (hoverRating || rating) >= star
                  return (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRating(star === rating ? 0 : star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="transition-transform hover:scale-110"
                      aria-label={`${star}`}
                    >
                      <span
                        className="material-symbols-outlined text-3xl"
                        style={{
                          color: filled ? '#f59e0b' : '#d1d5db',
                          fontVariationSettings: filled ? "'FILL' 1" : "'FILL' 0",
                        }}
                      >
                        star
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">{t.message}</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={t.messagePlaceholder}
                rows={4}
                maxLength={1000}
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 resize-none text-gray-900"
                style={{ ['--tw-ring-color' as string]: primaryColor }}
              />
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">{t.name}</label>
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder={t.namePlaceholder}
                maxLength={80}
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 text-gray-900"
                style={{ ['--tw-ring-color' as string]: primaryColor }}
              />
            </div>

            {/* Contact */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">{t.contact}</label>
              <input
                type="text"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder={t.contactPlaceholder}
                maxLength={120}
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 text-gray-900"
                style={{ ['--tw-ring-color' as string]: primaryColor }}
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 rounded-xl font-bold text-white text-lg disabled:opacity-60 transition-opacity"
              style={{ backgroundColor: primaryColor }}
            >
              {submitting ? t.sending : t.send}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
