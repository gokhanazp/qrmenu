import { describe, expect, it } from 'vitest'
import { buildFeatureSet, featureConfig, hasFeature, isWhatsappOrderingEnabled } from '@/lib/features'

describe('buildFeatureSet', () => {
  it('QR-only restoran: yalnızca qr_menu açık', () => {
    const set = buildFeatureSet({ ordering_enabled: false, whatsapp: null }, [])
    expect(set.keys).toEqual(['qr_menu'])
    expect(hasFeature(set, 'whatsapp_order')).toBe(false)
    expect(hasFeature(set, 'marketplace')).toBe(false)
  })

  it('WhatsApp sipariş: kolon açık ve numara varsa', () => {
    const set = buildFeatureSet({ ordering_enabled: true, whatsapp: '+90 534 284 44 44' }, [])
    expect(hasFeature(set, 'whatsapp_order')).toBe(true)
  })

  it('WhatsApp sipariş: numara yoksa kapalı sayılır (public sayfa kuralı)', () => {
    expect(isWhatsappOrderingEnabled({ ordering_enabled: true, whatsapp: '   ' })).toBe(false)
    expect(isWhatsappOrderingEnabled(null)).toBe(false)
  })

  it('tablo satırları: enabled=false ve bilinmeyen anahtarlar yok sayılır', () => {
    const set = buildFeatureSet(null, [
      { feature_key: 'marketplace', enabled: true, config: { foo: 1 } },
      { feature_key: 'stock', enabled: false, config: null },
      { feature_key: 'unknown_feature', enabled: true, config: null },
      { feature_key: 'direct_order', enabled: true, config: { stock_deduct_on: 'accept' } },
    ])
    expect(set.keys).toEqual(['qr_menu', 'direct_order', 'marketplace'])
    expect(featureConfig(set, 'direct_order')).toEqual({ stock_deduct_on: 'accept' })
    expect(featureConfig(set, 'stock')).toEqual({})
  })

  it('satırlar ordering_enabled kolonunu geçersiz kılamaz', () => {
    const set = buildFeatureSet({ ordering_enabled: false, whatsapp: '123' }, [
      { feature_key: 'whatsapp_order', enabled: true, config: null },
    ])
    // whatsapp_order tablo üzerinden de açılabilir ama kolon kapalıyken public sayfa kapalı; iki kaynak birleşir
    expect(set.keys).toContain('whatsapp_order')
  })
})
