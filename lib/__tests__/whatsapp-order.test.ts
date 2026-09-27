import { describe, expect, it } from 'vitest'
import {
  buildOrderMessage,
  buildWhatsappOrderUrl,
  cartTotal,
  normalizeWhatsappNumber,
} from '@/lib/cart/whatsapp-order'

// Mevcut WhatsApp akışının regresyon testi: bu çıktı değişirse Type B müşteriler etkilenir.
describe('whatsapp-order (mevcut akış)', () => {
  it('numara normalizasyonu', () => {
    expect(normalizeWhatsappNumber('+90 534 284 44 44')).toBe('905342844444')
    expect(normalizeWhatsappNumber('0534 284 44 44')).toBe('905342844444')
    expect(normalizeWhatsappNumber('534 284 44 44')).toBe('905342844444')
    expect(normalizeWhatsappNumber('')).toBe('')
  })

  it('sepet toplamı', () => {
    expect(cartTotal([{ name: 'Haydari', price: 180, qty: 2 }, { name: 'Atom', price: 200, qty: 1 }])).toBe(560)
  })

  it('mesaj biçimi (TR)', () => {
    const msg = buildOrderMessage({
      restaurantName: 'Atakent',
      items: [{ name: 'Haydari', price: 180, qty: 2 }],
      paymentMethod: 'cash',
      address: 'Mahalle, sokak 1',
      note: 'Az acılı',
    })
    expect(msg).toContain('🛒 *Yeni Sipariş* - Atakent')
    expect(msg).toContain('• 2 x Haydari')
    expect(msg).toContain('💰 *Toplam:')
    expect(msg).toContain('Kapıda Nakit Ödeme')
    expect(msg).toContain('📍 Adres: Mahalle, sokak 1')
    expect(msg).toContain('📝 Not: Az acılı')
  })

  it('wa.me URL', () => {
    const url = buildWhatsappOrderUrl('+90 534 284 44 44', 'merhaba dünya')
    expect(url).toBe('https://wa.me/905342844444?text=merhaba%20d%C3%BCnya')
  })
})
