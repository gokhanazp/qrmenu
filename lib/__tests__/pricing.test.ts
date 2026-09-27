import { describe, expect, it } from 'vitest'
import { effectiveChannelPrice } from '@/lib/pricing/effective'

describe('kanal fiyatı', () => {
  it('QR fiyatıyla aynı', () => {
    expect(effectiveChannelPrice({ useMasterPrice: true, priceOverride: 250, masterPrice: 180.456 })).toBe(180.46)
  })
  it('özel fiyat', () => {
    expect(effectiveChannelPrice({ useMasterPrice: false, priceOverride: 220, masterPrice: 180 })).toBe(220)
  })
  it('ikisi de yoksa gönderilmez', () => {
    expect(effectiveChannelPrice({ useMasterPrice: false, priceOverride: null, masterPrice: 180 })).toBeNull()
  })
})
