'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { formatCurrency } from '@/lib/utils/currency'
import { ProductDetailModal } from './product-detail-modal'

interface SearchModalProps {
  isOpen: boolean
  onClose: () => void
  products: any[]
  primaryColor: string
  priceColor?: string
  iconColor?: string
  backgroundColor: string
  surfaceColor: string
  textColor: string
  borderColor: string
}

export function SearchModal({
  isOpen,
  onClose,
  products,
  primaryColor,
  priceColor,
  iconColor,
  backgroundColor,
  surfaceColor,
  textColor,
  borderColor
}: SearchModalProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredProducts, setFilteredProducts] = useState<any[]>([])
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [isProductModalOpen, setIsProductModalOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Filter products based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredProducts([])
      return
    }

    const query = searchQuery.toLowerCase().trim()
    const filtered = products.filter((product: any) => {
      const nameMatch = product.name?.toLowerCase().includes(query)
      const descMatch = product.description?.toLowerCase().includes(query)
      const categoryMatch = product.categories?.name?.toLowerCase().includes(query)
      return nameMatch || descMatch || categoryMatch
    })

    setFilteredProducts(filtered)
  }, [searchQuery, products])

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  // Close on ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      window.addEventListener('keydown', handleEsc)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      window.removeEventListener('keydown', handleEsc)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  // Reset search when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('')
      setFilteredProducts([])
    }
  }, [isOpen])

  const handleProductClick = (product: any) => {
    setSelectedProduct(product)
    setIsProductModalOpen(true)
  }

  if (!isOpen) return null

  return (
    <>
      <div
        className="fixed inset-0 z-[150] flex items-start justify-center pt-20"
        onClick={onClose}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
        />

        {/* Search Modal Content */}
        <div
          className="relative w-full max-w-lg mx-4 rounded-2xl shadow-2xl overflow-hidden animate-slide-down"
          style={{ backgroundColor: surfaceColor }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Search Input */}
          <div className="p-4 border-b" style={{ borderColor }}>
            <div className="flex items-center gap-3">
              <span
                className="material-symbols-outlined"
                style={{ color: iconColor || primaryColor }}
              >
                search
              </span>
              <input
                ref={inputRef}
                type="text"
                placeholder="Ürün, kategori ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent outline-none text-base"
                style={{ color: textColor }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="p-1 rounded-full hover:opacity-70 transition-opacity"
                  style={{ color: textColor, opacity: 0.5 }}
                >
                  <span className="material-symbols-outlined text-xl">close</span>
                </button>
              )}
            </div>
          </div>

          {/* Search Results */}
          <div className="max-h-[60vh] overflow-y-auto">
            {searchQuery.trim() === '' ? (
              <div className="p-8 text-center" style={{ color: textColor, opacity: 0.5 }}>
                <span className="material-symbols-outlined text-5xl mb-2 block">
                  search
                </span>
                <p>Ürün veya kategori aramak için yazın</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="p-8 text-center" style={{ color: textColor, opacity: 0.5 }}>
                <span className="material-symbols-outlined text-5xl mb-2 block">
                  search_off
                </span>
                <p>Sonuç bulunamadı</p>
                <p className="text-sm mt-1">"{searchQuery}" için ürün bulunamadı</p>
              </div>
            ) : (
              <div className="p-2">
                <div className="px-2 py-1 text-xs font-semibold uppercase tracking-wider" style={{ color: textColor, opacity: 0.5 }}>
                  {filteredProducts.length} sonuç bulundu
                </div>
                {filteredProducts.map((product: any) => (
                  <div
                    key={product.id}
                    onClick={() => handleProductClick(product)}
                    className="flex items-center p-3 rounded-xl hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer my-1"
                    style={{
                      backgroundColor,
                      border: `1px solid ${borderColor}`
                    }}
                  >
                    {product.image_url && (
                      <div
                        className="w-16 h-16 shrink-0 rounded-lg bg-cover bg-center mr-3"
                        style={{
                          backgroundImage: `url(${product.image_url})`,
                          backgroundColor: surfaceColor
                        }}
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h3
                        className="font-bold text-base truncate"
                        style={{ color: textColor }}
                      >
                        {product.name}
                      </h3>
                      {product.categories?.name && (
                        <p
                          className="text-xs truncate"
                          style={{ color: textColor, opacity: 0.6 }}
                        >
                          {product.categories.name}
                        </p>
                      )}
                      <p
                        className="text-sm font-bold mt-0.5"
                        style={{ color: priceColor || primaryColor }}
                      >
                        {formatCurrency(product.price)}
                      </p>
                    </div>
                    <span
                      className="material-symbols-outlined text-lg ml-2"
                      style={{ color: textColor, opacity: 0.3 }}
                    >
                      chevron_right
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          isOpen={isProductModalOpen}
          onClose={() => {
            setIsProductModalOpen(false)
            setSelectedProduct(null)
          }}
          primaryColor={primaryColor}
          priceColor={priceColor}
          backgroundColor={backgroundColor}
          surfaceColor={surfaceColor}
          textColor={textColor}
        />
      )}

      <style jsx>{`
        @keyframes slide-down {
          from {
            transform: translateY(-20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slide-down {
          animation: slide-down 0.2s ease-out;
        }
      `}</style>
    </>
  )
}