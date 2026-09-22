'use client'

import { useEffect, useState } from 'react'
import { Icon } from '@/components/icon'
import { WhatsAppIcon } from '@/components/whatsapp-icon'
import { formatCurrency } from '@/lib/utils/currency'
import {
  buildOrderMessage,
  buildWhatsappOrderUrl,
  PAYMENT_LABELS,
  PAYMENT_METHODS,
  type PaymentMethod,
} from '@/lib/cart/whatsapp-order'
import { useCart } from './cart-context'

const PAYMENT_ICONS: Record<PaymentMethod, string> = {
  cash: 'payments',
  card: 'credit_card',
}

const customerKey = (slug: string) => `qrmenu-cart-customer:${slug.toLowerCase()}`

/**
 * Alttan açılan sepet paneli (kapıya sipariş). Müşteri ödeme yöntemini seçer,
 * adresini yazar; "Sepeti Onayla" wa.me linkini açar ve sipariş metni
 * müşterinin WhatsApp'ında hazır gelir, gönder tuşuna müşteri basar.
 * Sepet gönderimden sonra bilerek silinmez (WhatsApp açılmazsa kaybolmasın);
 * müşteri "Sepeti Temizle" ile boşaltır. Adres ve ödeme tercihi bir sonraki
 * sipariş için tarayıcıda saklanır.
 */
export function CartDrawer() {
  const cart = useCart()
  const [payment, setPayment] = useState<PaymentMethod | null>(null)
  const [address, setAddress] = useState('')
  const [note, setNote] = useState('')
  const [sent, setSent] = useState(false)
  const [showErrors, setShowErrors] = useState(false)
  const [hydrated, setHydrated] = useState(false)

  const { enabled, isOpen, close, restaurant } = cart

  // Önceki siparişten adres / ödeme tercihini geri yükle
  useEffect(() => {
    if (!enabled) return
    try {
      const raw = window.localStorage.getItem(customerKey(restaurant.slug))
      if (raw) {
        const saved = JSON.parse(raw) as { payment?: unknown; address?: unknown }
        if (saved.payment === 'cash' || saved.payment === 'card') setPayment(saved.payment)
        if (typeof saved.address === 'string') setAddress(saved.address)
      }
    } catch {
      // storage yoksa boş başla
    }
    setHydrated(true)
  }, [enabled, restaurant.slug])

  useEffect(() => {
    if (!enabled || !hydrated) return
    try {
      window.localStorage.setItem(customerKey(restaurant.slug), JSON.stringify({ payment, address }))
    } catch {
      // yoksay
    }
  }, [payment, address, enabled, hydrated, restaurant.slug])

  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    window.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [isOpen, close])

  if (!enabled || !isOpen) return null

  const { primaryColor, priceColor, backgroundColor, surfaceColor, textColor, borderColor } = cart.theme
  const lang = cart.isEnglish ? 'en' : 'tr'
  const t = cart.isEnglish
    ? {
        title: 'My Cart',
        close: 'Close',
        empty: 'Your cart is empty',
        payment: 'Payment Method',
        address: 'Delivery Address',
        addressPlaceholder: 'Neighborhood, street, building no, apartment, floor',
        note: 'Order Note',
        notePlaceholder: 'e.g. Not too spicy',
        total: 'Total',
        confirm: 'Confirm Cart · Send via WhatsApp',
        missing: 'Choose a payment method and enter your address to continue.',
        sentHint: 'WhatsApp opened with your order. Tap send there, then you can clear the cart.',
        clear: 'Clear Cart',
        decrease: 'Decrease',
        increase: 'Increase',
      }
    : {
        title: 'Sepetim',
        close: 'Kapat',
        empty: 'Sepetiniz boş',
        payment: 'Ödeme Yöntemi',
        address: 'Teslimat Adresi',
        addressPlaceholder: 'Mahalle, sokak, bina no, daire, kat',
        note: 'Sipariş Notu',
        notePlaceholder: 'Örn: Az acılı olsun',
        total: 'Toplam',
        confirm: "Sepeti Onayla · WhatsApp'tan Gönder",
        missing: 'Devam etmek için ödeme yöntemi seçin ve adresinizi yazın.',
        sentHint: 'WhatsApp siparişinizle açıldı. Orada gönder tuşuna basın, ardından sepeti temizleyebilirsiniz.',
        clear: 'Sepeti Temizle',
        decrease: 'Azalt',
        increase: 'Artır',
      }

  const empty = cart.items.length === 0
  const addressOk = address.trim().length > 0
  const canSend = payment !== null && addressOk
  const message = buildOrderMessage({
    restaurantName: restaurant.name,
    items: cart.items,
    paymentMethod: payment,
    address,
    note,
    isEnglish: cart.isEnglish,
  })
  const whatsappUrl = buildWhatsappOrderUrl(restaurant.whatsapp, message)
  const fieldStyle = (invalid: boolean) =>
    ({
      backgroundColor,
      border: `1px solid ${invalid ? '#ef4444' : borderColor}`,
      color: textColor,
      ['--tw-ring-color' as string]: primaryColor,
    }) as React.CSSProperties
  const labelClass = 'text-xs font-semibold uppercase tracking-wider opacity-70'

  return (
    <div className="fixed inset-0 z-[200] flex items-end justify-center" onClick={close}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      <div
        className="relative w-full max-w-md rounded-t-3xl shadow-2xl flex flex-col max-h-[90vh] animate-cart-slide-up"
        style={{ backgroundColor: surfaceColor, color: textColor }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={t.title}
      >
        {/* Başlık */}
        <div
          className="flex items-center justify-between px-5 pt-5 pb-3"
          style={{ borderBottom: `1px solid ${borderColor}` }}
        >
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Icon name="shopping_cart" style={{ color: primaryColor }} />
            <span>{t.title}</span>
            <span className="text-sm font-medium opacity-60 tabular-nums">({cart.count})</span>
          </h2>
          <button
            type="button"
            onClick={close}
            aria-label={t.close}
            className="w-9 h-9 rounded-full flex items-center justify-center active:scale-90 transition-transform"
            style={{ backgroundColor, color: textColor }}
          >
            <Icon name="close" />
          </button>
        </div>

        {/* İçerik */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {empty ? (
            <p className="text-center py-10 opacity-60">{t.empty}</p>
          ) : (
            <ul className="space-y-3">
              {cart.items.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center gap-3 p-3 rounded-xl"
                  style={{ backgroundColor, border: `1px solid ${borderColor}` }}
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{item.name}</p>
                    <p className="text-sm font-bold" style={{ color: priceColor || primaryColor }}>
                      {formatCurrency(item.price * item.qty)}
                    </p>
                  </div>
                  <div
                    className="flex items-center rounded-full shrink-0"
                    style={{ border: `1px solid ${borderColor}` }}
                  >
                    <button
                      type="button"
                      onClick={() => cart.setQty(item.id, item.qty - 1)}
                      aria-label={t.decrease}
                      className="w-9 h-9 flex items-center justify-center active:scale-90 transition-transform"
                    >
                      {item.qty === 1 ? (
                        <Icon name="delete" className="text-base" style={{ color: '#ef4444' }} />
                      ) : (
                        <Icon name="remove" strokeWidth={2.5} />
                      )}
                    </button>
                    <span className="w-6 text-center font-bold tabular-nums">{item.qty}</span>
                    <button
                      type="button"
                      onClick={() => cart.setQty(item.id, item.qty + 1)}
                      aria-label={t.increase}
                      className="w-9 h-9 flex items-center justify-center active:scale-90 transition-transform"
                    >
                      <Icon name="add" strokeWidth={2.5} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {!empty && (
            <>
              {/* Ödeme yöntemi */}
              <div>
                <p className={labelClass}>{t.payment}</p>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {PAYMENT_METHODS.map((method) => {
                    const selected = payment === method
                    return (
                      <button
                        key={method}
                        type="button"
                        onClick={() => setPayment(method)}
                        aria-pressed={selected}
                        className="min-h-[3.5rem] px-3 py-2 rounded-xl flex items-center gap-2 text-left text-sm font-semibold leading-tight transition-all active:scale-[0.98]"
                        style={{
                          backgroundColor: selected ? `${primaryColor}1a` : backgroundColor,
                          border: `2px solid ${
                            selected ? primaryColor : showErrors && payment === null ? '#ef4444' : borderColor
                          }`,
                          color: selected ? primaryColor : textColor,
                        }}
                      >
                        <Icon name={PAYMENT_ICONS[method]} className="text-xl shrink-0" />
                        <span>{PAYMENT_LABELS[lang][method]}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Adres */}
              <div>
                <label htmlFor="cart-address" className={labelClass}>
                  {t.address}
                </label>
                <textarea
                  id="cart-address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows={3}
                  autoComplete="street-address"
                  placeholder={t.addressPlaceholder}
                  className="mt-1 w-full px-3 py-2 rounded-xl outline-none focus:ring-2 resize-none"
                  style={fieldStyle(showErrors && !addressOk)}
                />
              </div>

              {/* Not */}
              <div>
                <label htmlFor="cart-note" className={labelClass}>
                  {t.note}
                </label>
                <textarea
                  id="cart-note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={2}
                  placeholder={t.notePlaceholder}
                  className="mt-1 w-full px-3 py-2 rounded-xl outline-none focus:ring-2 resize-none"
                  style={fieldStyle(false)}
                />
              </div>
            </>
          )}
        </div>

        {/* Alt kısım */}
        {!empty && (
          <div className="px-5 pt-3 pb-5 space-y-3" style={{ borderTop: `1px solid ${borderColor}` }}>
            <div className="flex items-center justify-between">
              <span className="font-semibold opacity-80">{t.total}</span>
              <span className="text-2xl font-bold tabular-nums" style={{ color: priceColor || primaryColor }}>
                {formatCurrency(cart.total)}
              </span>
            </div>

            {canSend ? (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setSent(true)}
                className="w-full h-12 rounded-2xl font-bold text-white flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] transition-transform"
                style={{ backgroundColor: '#25D366' }}
              >
                <WhatsAppIcon className="w-5 h-5" />
                <span>{t.confirm}</span>
              </a>
            ) : (
              <button
                type="button"
                onClick={() => setShowErrors(true)}
                className="w-full h-12 rounded-2xl font-bold text-white flex items-center justify-center gap-2 shadow-lg opacity-60"
                style={{ backgroundColor: '#25D366' }}
              >
                <WhatsAppIcon className="w-5 h-5" />
                <span>{t.confirm}</span>
              </button>
            )}
            {showErrors && !canSend && (
              <p className="text-xs text-center" style={{ color: '#ef4444' }}>
                {t.missing}
              </p>
            )}
            {sent && <p className="text-xs text-center opacity-70">{t.sentHint}</p>}
            <button
              type="button"
              onClick={() => {
                cart.clear()
                setSent(false)
                setShowErrors(false)
              }}
              className="w-full text-sm font-medium opacity-60 hover:opacity-100 py-1"
            >
              {t.clear}
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes cart-slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        .animate-cart-slide-up {
          animation: cart-slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}
