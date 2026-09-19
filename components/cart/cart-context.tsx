'use client'

/**
 * Sepet durumu (WhatsApp sipariş özelliği).
 *
 * Restoran bazında admin panelden açılır (`restaurants.ordering_enabled`).
 * Kapalıyken provider DISABLED değerini verir; ProductCard/Modal gibi
 * tüketiciler `enabled === false` görüp hiçbir şey çizmez — menü bugünkü
 * gibi kalır. Sepet müşterinin tarayıcısında (localStorage, slug başına)
 * saklanır; sayfa geçişlerinde kaybolmaz.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { cartTotal } from '@/lib/cart/whatsapp-order'

export interface CartItem {
  id: string
  name: string
  price: number
  qty: number
}

export interface CartTheme {
  primaryColor: string
  priceColor?: string
  backgroundColor: string
  surfaceColor: string
  textColor: string
  borderColor: string
}

export interface CartRestaurant {
  slug: string
  name: string
  whatsapp: string
}

interface CartContextValue {
  enabled: boolean
  items: CartItem[]
  count: number
  total: number
  qtyOf: (id: string) => number
  add: (product: { id: string; name: string; price: number | string }, qty?: number) => void
  setQty: (id: string, qty: number) => void
  remove: (id: string) => void
  clear: () => void
  isOpen: boolean
  open: () => void
  close: () => void
  restaurant: CartRestaurant
  theme: CartTheme
  isEnglish: boolean
}

const noop = () => {}

const DISABLED: CartContextValue = {
  enabled: false,
  items: [],
  count: 0,
  total: 0,
  qtyOf: () => 0,
  add: noop,
  setQty: noop,
  remove: noop,
  clear: noop,
  isOpen: false,
  open: noop,
  close: noop,
  restaurant: { slug: '', name: '', whatsapp: '' },
  theme: {
    primaryColor: '#FF6B35',
    backgroundColor: '#ffffff',
    surfaceColor: '#f9fafb',
    textColor: '#111827',
    borderColor: '#11182720',
  },
  isEnglish: false,
}

const CartContext = createContext<CartContextValue>(DISABLED)

export function useCart() {
  return useContext(CartContext)
}

const MAX_QTY = 99
const storageKey = (slug: string) => `qrmenu-cart:${slug.toLowerCase()}`

function isCartItem(value: unknown): value is CartItem {
  if (!value || typeof value !== 'object') return false
  const v = value as Record<string, unknown>
  return (
    typeof v.id === 'string' &&
    typeof v.name === 'string' &&
    typeof v.price === 'number' &&
    typeof v.qty === 'number' &&
    v.qty > 0
  )
}

export function CartProvider({
  enabled,
  restaurant,
  theme,
  isEnglish = false,
  children,
}: {
  enabled: boolean
  restaurant: CartRestaurant
  theme: CartTheme
  isEnglish?: boolean
  children: ReactNode
}) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [hydrated, setHydrated] = useState(false)

  // localStorage'dan yükle (yalnızca tarayıcıda, özellik açıksa)
  useEffect(() => {
    if (!enabled) return
    try {
      const raw = window.localStorage.getItem(storageKey(restaurant.slug))
      if (raw) {
        const parsed: unknown = JSON.parse(raw)
        if (Array.isArray(parsed)) setItems(parsed.filter(isCartItem))
      }
    } catch {
      // private mode / engellenmiş storage: boş sepetle devam
    }
    setHydrated(true)
  }, [enabled, restaurant.slug])

  // Değişiklikleri kaydet. `hydrated` bayrağı, ilk render'daki boş state'in
  // kayıtlı sepetin üzerine yazılmasını engeller.
  useEffect(() => {
    if (!enabled || !hydrated) return
    try {
      window.localStorage.setItem(storageKey(restaurant.slug), JSON.stringify(items))
    } catch {
      // storage yoksa sepet yalnızca bu sayfa ömründe yaşar
    }
  }, [items, enabled, hydrated, restaurant.slug])

  const add = useCallback<CartContextValue['add']>((product, qty = 1) => {
    const price = Number(product.price) || 0
    setItems((prev) => {
      const existing = prev.find((i) => i.id === product.id)
      if (existing) {
        return prev.map((i) =>
          i.id === product.id ? { ...i, qty: Math.min(MAX_QTY, i.qty + qty) } : i
        )
      }
      return [...prev, { id: product.id, name: product.name, price, qty: Math.min(MAX_QTY, qty) }]
    })
  }, [])

  const setQty = useCallback<CartContextValue['setQty']>((id, qty) => {
    setItems((prev) =>
      qty <= 0
        ? prev.filter((i) => i.id !== id)
        : prev.map((i) => (i.id === id ? { ...i, qty: Math.min(MAX_QTY, qty) } : i))
    )
  }, [])

  const remove = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id))
  }, [])

  const clear = useCallback(() => setItems([]), [])
  const open = useCallback(() => setIsOpen(true), [])
  const close = useCallback(() => setIsOpen(false), [])

  const value = useMemo<CartContextValue>(
    () => ({
      enabled: true,
      items,
      count: items.reduce((sum, i) => sum + i.qty, 0),
      total: cartTotal(items),
      qtyOf: (id) => items.find((i) => i.id === id)?.qty ?? 0,
      add,
      setQty,
      remove,
      clear,
      isOpen,
      open,
      close,
      restaurant,
      theme,
      isEnglish,
    }),
    [items, add, setQty, remove, clear, isOpen, open, close, restaurant, theme, isEnglish]
  )

  return (
    <CartContext.Provider value={enabled ? value : DISABLED}>
      {children}
    </CartContext.Provider>
  )
}
