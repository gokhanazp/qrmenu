'use client'

import { useState, type MouseEvent } from 'react'
import { Icon } from '@/components/icon'
import { formatCurrency } from '@/lib/utils/currency'
import { useCart } from './cart-context'

interface CartProduct {
  id: string
  name: string
  price: number | string
}

/**
 * Ürün kartındaki kompakt buton. Sepette yoksa "+" dairesi, varsa
 * "- adet +" hapı. Kartın kendisi tıklanabilir (detay açar) olduğu için
 * tıklamaları yutar.
 */
export function AddToCartButton({ product }: { product: CartProduct }) {
  const cart = useCart()
  if (!cart.enabled) return null

  const qty = cart.qtyOf(product.id)
  const { primaryColor } = cart.theme
  const stop = (e: MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
  }

  if (qty === 0) {
    return (
      <button
        type="button"
        onClick={(e) => {
          stop(e)
          cart.add(product)
        }}
        aria-label={cart.isEnglish ? 'Add to cart' : 'Sepete ekle'}
        className="w-9 h-9 shrink-0 rounded-full flex items-center justify-center shadow-md active:scale-90 transition-transform"
        style={{ backgroundColor: primaryColor, color: '#ffffff' }}
      >
        <Icon name="add" className="text-xl" strokeWidth={2.5} />
      </button>
    )
  }

  return (
    <div
      onClick={stop}
      className="flex items-center shrink-0 rounded-full shadow-md"
      style={{ backgroundColor: primaryColor, color: '#ffffff' }}
    >
      <button
        type="button"
        onClick={(e) => {
          stop(e)
          cart.setQty(product.id, qty - 1)
        }}
        aria-label={cart.isEnglish ? 'Decrease' : 'Azalt'}
        className="w-8 h-9 flex items-center justify-center active:scale-90 transition-transform"
      >
        <Icon name="remove" className="text-lg" strokeWidth={2.5} />
      </button>
      <span className="min-w-[1.25rem] text-center text-sm font-bold tabular-nums">{qty}</span>
      <button
        type="button"
        onClick={(e) => {
          stop(e)
          cart.setQty(product.id, qty + 1)
        }}
        aria-label={cart.isEnglish ? 'Increase' : 'Artır'}
        className="w-8 h-9 flex items-center justify-center active:scale-90 transition-transform"
      >
        <Icon name="add" className="text-lg" strokeWidth={2.5} />
      </button>
    </div>
  )
}

/**
 * Ürün detay penceresinin altına yapışan panel: adet seçici + "Sepete Ekle".
 */
export function AddToCartPanel({
  product,
  onAdded,
}: {
  product: CartProduct
  onAdded?: () => void
}) {
  const cart = useCart()
  const [qty, setQty] = useState(1)
  if (!cart.enabled) return null

  const { primaryColor, surfaceColor, textColor, borderColor } = cart.theme
  const price = Number(product.price) || 0
  const label = cart.isEnglish ? 'Add to Cart' : 'Sepete Ekle'

  return (
    <div
      className="sticky bottom-0 left-0 right-0 p-4 flex items-center gap-3"
      style={{ backgroundColor: surfaceColor, borderTop: `1px solid ${borderColor}` }}
    >
      <div
        className="flex items-center rounded-full shrink-0"
        style={{ border: `1px solid ${borderColor}`, color: textColor }}
      >
        <button
          type="button"
          onClick={() => setQty((q) => Math.max(1, q - 1))}
          aria-label={cart.isEnglish ? 'Decrease' : 'Azalt'}
          className="w-10 h-11 flex items-center justify-center active:scale-90 transition-transform"
        >
          <Icon name="remove" strokeWidth={2.5} />
        </button>
        <span className="w-6 text-center font-bold tabular-nums">{qty}</span>
        <button
          type="button"
          onClick={() => setQty((q) => Math.min(99, q + 1))}
          aria-label={cart.isEnglish ? 'Increase' : 'Artır'}
          className="w-10 h-11 flex items-center justify-center active:scale-90 transition-transform"
        >
          <Icon name="add" strokeWidth={2.5} />
        </button>
      </div>
      <button
        type="button"
        onClick={() => {
          cart.add(product, qty)
          onAdded?.()
        }}
        className="flex-1 h-11 rounded-full font-bold flex items-center justify-center gap-2 shadow-md active:scale-[0.98] transition-transform"
        style={{ backgroundColor: primaryColor, color: '#ffffff' }}
      >
        <Icon name="shopping_cart" className="text-lg" />
        <span>
          {label} · {formatCurrency(price * qty)}
        </span>
      </button>
    </div>
  )
}
