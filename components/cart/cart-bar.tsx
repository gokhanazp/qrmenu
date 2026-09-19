'use client'

import { Icon } from '@/components/icon'
import { formatCurrency } from '@/lib/utils/currency'
import { useCart } from './cart-context'
import { CartDrawer } from './cart-drawer'

/**
 * Alt navigasyonun üstünde duran sabit sepet çubuğu. Sepet boşken veya
 * özellik kapalıyken hiçbir şey çizmez.
 */
export function CartBar() {
  const cart = useCart()
  if (!cart.enabled || cart.count === 0) return null

  const { primaryColor } = cart.theme
  const label = cart.isEnglish ? 'View Cart' : 'Sepeti Gör'

  return (
    <>
      {/* Akış içi boşluk: sayfanın sonu sabit çubuğun altında kalmasın */}
      <div className="h-20" aria-hidden="true" />

      <div
        className="fixed left-0 right-0 z-[55] max-w-md mx-auto px-4"
        style={{ bottom: 'calc(4rem + 8px)' }}
      >
        <button
          type="button"
          onClick={cart.open}
          className="w-full h-14 rounded-2xl shadow-xl flex items-center justify-between px-4 text-white active:scale-[0.98] transition-transform"
          style={{ backgroundColor: primaryColor }}
        >
          <span className="flex items-center gap-3">
            <span className="relative flex">
              <Icon name="shopping_cart" className="text-2xl" />
              <span
                className="absolute -top-2 -right-2 min-w-[1.25rem] h-5 px-1 rounded-full bg-white text-xs font-bold flex items-center justify-center tabular-nums"
                style={{ color: primaryColor }}
              >
                {cart.count}
              </span>
            </span>
            <span className="font-bold">{label}</span>
          </span>
          <span className="font-bold tabular-nums">{formatCurrency(cart.total)}</span>
        </button>
      </div>

      <CartDrawer />
    </>
  )
}
