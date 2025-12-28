'use client'

import { useState } from 'react'
import Image from 'next/image'
import { formatCurrency } from '@/lib/utils/currency'
import { ProductDetailModal } from './product-detail-modal'

interface ProductCardProps {
  product: any
  primaryColor: string
  priceColor?: string
  backgroundColor: string
  surfaceColor: string
  textColor: string
  borderColor: string
  variant?: 'featured' | 'daily-special' | 'category-grid' | 'category-list'
}

export function ProductCard({
  product,
  primaryColor,
  priceColor,
  backgroundColor,
  surfaceColor,
  textColor,
  borderColor,
  variant
}: ProductCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const isDailySpecial = variant === 'daily-special'
  const isFeatured = variant === 'featured'
  const isCategoryList = variant === 'category-list'
  const isCategoryGrid = variant === 'category-grid'

  // Category List Layout - Full width with large images
  if (isCategoryList) {
    return (
      <>
        <div
          onClick={() => setIsModalOpen(true)}
          className="rounded-xl shadow-sm overflow-hidden active:scale-[0.98] transition-transform cursor-pointer"
          style={{
            backgroundColor: surfaceColor,
            border: `1px solid ${borderColor}`
          }}
        >
          {product.image_url && (
            <div className="relative w-full h-56">
              <Image
                src={product.image_url}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 448px"
              />
            </div>
          )}
          <div className="p-4">
            <h3
              className="font-bold text-lg mb-2"
              style={{ color: textColor }}
            >
              {product.name}
            </h3>
            {product.description && (
              <p
                className="text-sm mb-3 line-clamp-2"
                style={{ color: textColor, opacity: 0.7 }}
              >
                {product.description}
              </p>
            )}
            <div className="flex items-center justify-between">
              <p
                className="text-xl font-bold"
                style={{ color: priceColor || primaryColor }}
              >
                {formatCurrency(product.price)}
              </p>
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{
                  backgroundColor,
                  color: textColor,
                  opacity: 0.5
                }}
              >
                <span className="material-symbols-outlined">add</span>
              </div>
            </div>
          </div>
        </div>

        <ProductDetailModal
          product={product}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          primaryColor={primaryColor}
          priceColor={priceColor}
          backgroundColor={backgroundColor}
          surfaceColor={surfaceColor}
          textColor={textColor}
        />
      </>
    )
  }

  // Category Grid Layout - Standard list with small images
  if (isCategoryGrid) {
    return (
      <>
        <div
          onClick={() => setIsModalOpen(true)}
          className="flex items-center p-3 rounded-xl shadow-sm active:scale-[0.98] transition-transform cursor-pointer"
          style={{
            backgroundColor: surfaceColor,
            border: `1px solid ${borderColor}`
          }}
        >
          {product.image_url && (
            <div
              className="w-16 h-16 shrink-0 rounded-lg bg-cover bg-center mr-4"
              style={{
                backgroundImage: `url(${product.image_url})`,
                backgroundColor
              }}
            />
          )}
          <div className="flex-1">
            <h3
              className="font-bold text-base"
              style={{ color: textColor }}
            >
              {product.name}
            </h3>
            {product.description && (
              <p
                className="text-sm line-clamp-2"
                style={{ color: textColor, opacity: 0.7 }}
              >
                {product.description}
              </p>
            )}
            <p
              className="text-sm font-medium mt-1"
              style={{ color: priceColor || primaryColor }}
            >
              {formatCurrency(product.price)}
            </p>
          </div>
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{
              backgroundColor,
              color: textColor,
              opacity: 0.5
            }}
          >
            <span className="material-symbols-outlined text-lg">chevron_right</span>
          </div>
        </div>

        <ProductDetailModal
          product={product}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          primaryColor={primaryColor}
          priceColor={priceColor}
          backgroundColor={backgroundColor}
          surfaceColor={surfaceColor}
          textColor={textColor}
        />
      </>
    )
  }

  // Default Layout (Featured & Daily Special)
  return (
    <>
      <div
        onClick={() => setIsModalOpen(true)}
        className={`flex items-center p-3 rounded-xl shadow-sm active:scale-[0.98] transition-all cursor-pointer ${
          isDailySpecial ? 'shadow-md relative overflow-hidden' : ''
        }`}
        style={{
          backgroundColor: surfaceColor,
          border: isDailySpecial ? `2px solid ${primaryColor}40` : `1px solid ${borderColor}`
        }}
      >
        {/* Daily Special Badge */}
        {isDailySpecial && (
          <div
            className="absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1"
            style={{
              backgroundColor: primaryColor,
              color: '#ffffff'
            }}
          >
            <span className="text-sm">🌟</span>
            <span>ÖZEL</span>
          </div>
        )}

        {/* Product Image */}
        {product.image_url && (
          <div
            className={`${isDailySpecial ? 'w-24 h-24' : 'w-20 h-20'} shrink-0 rounded-lg bg-cover bg-center mr-4 ${
              isDailySpecial ? 'ring-2' : ''
            }`}
            style={{
              backgroundImage: `url(${product.image_url})`,
              backgroundColor,
              ...(isDailySpecial && { ringColor: primaryColor })
            }}
          />
        )}

        {/* Product Info */}
        <div className="flex-1">
          {isFeatured && (
            <div className="flex items-center gap-2 mb-1">
              <span
                className="material-symbols-outlined text-sm"
                style={{ color: primaryColor }}
              >
                star
              </span>
              <h3
                className="font-bold text-base"
                style={{ color: textColor }}
              >
                {product.name}
              </h3>
            </div>
          )}
          {!isFeatured && (
            <h3
              className={`font-bold ${isDailySpecial ? 'text-lg mb-1' : 'text-base'}`}
              style={{ color: textColor }}
            >
              {product.name}
            </h3>
          )}
          {product.description && (
            <p
              className={`text-sm line-clamp-2 ${isDailySpecial ? 'mb-2' : ''}`}
              style={{ color: textColor, opacity: 0.7 }}
            >
              {product.description}
            </p>
          )}
          <p
            className={`${isDailySpecial ? 'text-lg' : 'text-base'} font-bold mt-1`}
            style={{ color: priceColor || primaryColor }}
          >
            {formatCurrency(product.price)}
          </p>
        </div>

        {/* Chevron Icon */}
        {!isDailySpecial && (
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{
              backgroundColor,
              color: textColor,
              opacity: 0.5
            }}
          >
            <span className="material-symbols-outlined text-lg">chevron_right</span>
          </div>
        )}
      </div>

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={product}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        primaryColor={primaryColor}
        priceColor={priceColor}
        backgroundColor={backgroundColor}
        surfaceColor={surfaceColor}
        textColor={textColor}
      />
    </>
  )
}