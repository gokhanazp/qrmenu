'use client'

import { useEffect } from 'react'
import Image from 'next/image'
import { formatCurrency } from '@/lib/utils/currency'

interface ProductDetailModalProps {
  product: any
  isOpen: boolean
  onClose: () => void
  primaryColor: string
  backgroundColor: string
  surfaceColor: string
  textColor: string
}

export function ProductDetailModal({
  product,
  isOpen,
  onClose,
  primaryColor,
  backgroundColor,
  surfaceColor,
  textColor
}: ProductDetailModalProps) {
  // Close on ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      window.addEventListener('keydown', handleEsc)
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden'
    }
    return () => {
      window.removeEventListener('keydown', handleEsc)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen || !product) return null

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
      />

      {/* Modal Content */}
      <div
        className="relative w-full max-w-lg mx-auto sm:mx-4 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden animate-slide-up max-h-[90vh] overflow-y-auto"
        style={{ backgroundColor: surfaceColor }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95"
          style={{
            backgroundColor: `${backgroundColor}e6`,
            color: textColor
          }}
        >
          <span className="material-symbols-outlined">close</span>
        </button>

        {/* Product Image */}
        {product.image_url && (
          <div className="relative w-full h-64 sm:h-80 bg-gray-100">
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 512px"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          {/* Badges */}
          <div className="flex gap-2 mb-3">
            {product.is_featured && (
              <span
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold"
                style={{
                  backgroundColor: `${primaryColor}20`,
                  color: primaryColor
                }}
              >
                <span className="material-symbols-outlined text-sm mr-1">star</span>
                Öne Çıkan
              </span>
            )}
            {product.is_daily_special && (
              <span
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold"
                style={{
                  backgroundColor: primaryColor,
                  color: '#ffffff'
                }}
              >
                <span className="text-sm mr-1">🌟</span>
                Günün Menüsü
              </span>
            )}
          </div>

          {/* Product Name */}
          <h2
            className="text-2xl sm:text-3xl font-bold mb-2"
            style={{ color: textColor }}
          >
            {product.name}
          </h2>

          {/* Price */}
          <p
            className="text-3xl font-bold mb-4"
            style={{ color: primaryColor }}
          >
            {formatCurrency(product.price)}
          </p>

          {/* Description */}
          {product.description && (
            <div className="mb-6">
              <h3
                className="text-sm font-semibold uppercase tracking-wider mb-2"
                style={{ color: textColor, opacity: 0.7 }}
              >
                Açıklama
              </h3>
              <p
                className="text-base leading-relaxed"
                style={{ color: textColor, opacity: 0.9 }}
              >
                {product.description}
              </p>
            </div>
          )}

          {/* Category */}
          {product.categories?.name && (
            <div className="mb-6">
              <h3
                className="text-sm font-semibold uppercase tracking-wider mb-2"
                style={{ color: textColor, opacity: 0.7 }}
              >
                Kategori
              </h3>
              <span
                className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium"
                style={{
                  backgroundColor: backgroundColor,
                  color: textColor
                }}
              >
                <span className="material-symbols-outlined text-sm mr-2" style={{ color: primaryColor }}>
                  restaurant
                </span>
                {product.categories.name}
              </span>
            </div>
          )}

        </div>
      </div>

      <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}