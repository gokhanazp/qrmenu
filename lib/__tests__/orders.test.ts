import { describe, expect, it } from 'vitest'
import {
  canRoleTransition,
  canTransition,
  cartPaymentToOrderPayment,
  formatOrderAge,
  timestampColumnFor,
} from '@/lib/orders/types'
import { buildOrderMessage } from '@/lib/cart/whatsapp-order'

describe('sipariş durum geçişleri', () => {
  it('izin verilen akış', () => {
    expect(canTransition('new', 'accepted')).toBe(true)
    expect(canTransition('new', 'ready')).toBe(false)
    expect(canTransition('accepted', 'preparing')).toBe(true)
    expect(canTransition('preparing', 'ready')).toBe(true)
    expect(canTransition('ready', 'completed')).toBe(true)
    expect(canTransition('completed', 'cancelled')).toBe(false)
    expect(canTransition('cancelled', 'new')).toBe(false)
  })

  it('mutfak yalnızca hazırlama akışını ilerletir', () => {
    expect(canRoleTransition('kitchen', 'accepted', 'preparing')).toBe(true)
    expect(canRoleTransition('kitchen', 'preparing', 'ready')).toBe(true)
    expect(canRoleTransition('kitchen', 'new', 'accepted')).toBe(false)
    expect(canRoleTransition('kitchen', 'preparing', 'cancelled')).toBe(false)
    expect(canRoleTransition('staff', 'new', 'accepted')).toBe(true)
    expect(canRoleTransition('accountant', 'new', 'accepted')).toBe(false)
    expect(canRoleTransition(null, 'new', 'accepted')).toBe(false)
  })

  it('zaman damgası kolonları', () => {
    expect(timestampColumnFor('accepted')).toBe('accepted_at')
    expect(timestampColumnFor('cancelled')).toBe('cancelled_at')
    expect(timestampColumnFor('new')).toBeNull()
  })

  it('sepet ödeme → sipariş ödeme', () => {
    expect(cartPaymentToOrderPayment('cash')).toBe('cash_on_delivery')
    expect(cartPaymentToOrderPayment('card')).toBe('card_on_delivery')
  })

  it('sipariş yaşı', () => {
    const now = new Date('2026-09-25T12:00:00Z')
    expect(formatOrderAge('2026-09-25T11:48:00Z', now)).toBe('12 dk')
    expect(formatOrderAge('2026-09-25T09:55:00Z', now)).toBe('2 sa 5 dk')
    expect(formatOrderAge('2026-09-23T09:55:00Z', now)).toBe('2 gün')
    expect(formatOrderAge('2026-09-25T11:48:00Z', now, 'en')).toBe('12 min')
  })
})

describe('WhatsApp mesajı + sipariş numarası', () => {
  const base = { restaurantName: 'Atakent', items: [{ name: 'Haydari', price: 180, qty: 1 }], paymentMethod: 'cash' as const, address: 'Adres' }

  it('numara verilirse başlığın altına eklenir', () => {
    const msg = buildOrderMessage({ ...base, orderNumber: '250925-007' })
    const lines = msg.split('\n')
    expect(lines[0]).toBe('🛒 *Yeni Sipariş* - Atakent')
    expect(lines[1]).toBe('🧾 Sipariş No: *250925-007*')
    expect(lines[2]).toBe('')
  })

  it('numara yoksa mesaj eskisiyle birebir aynı (Type B regresyonu)', () => {
    const msg = buildOrderMessage(base)
    const lines = msg.split('\n')
    expect(lines[0]).toBe('🛒 *Yeni Sipariş* - Atakent')
    expect(lines[1]).toBe('')
    expect(msg).not.toContain('Sipariş No')
  })

  it('İngilizce etiket', () => {
    expect(buildOrderMessage({ ...base, isEnglish: true, orderNumber: 'X' })).toContain('🧾 Order No: *X*')
  })
})
