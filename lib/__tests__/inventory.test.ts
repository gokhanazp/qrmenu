import { describe, expect, it } from 'vitest'
import { deriveAvailability, formatStockLabel, orderDeductKey, orderRestoreKey, stockDeductTiming } from '@/lib/inventory/types'

describe('stok kuralları', () => {
  const base = { is_available: true, track_stock: true, stock_quantity: 5, availability_manual_override: false }

  it('stok 0 → tükendi', () => {
    expect(deriveAvailability(base, 0)).toBe(false)
  })
  it('stok >0 ve tükendiyse, elle engel yoksa → satışta', () => {
    expect(deriveAvailability({ ...base, is_available: false }, 3)).toBe(true)
  })
  it('elle kapatıldıysa stok gelse de açılmaz', () => {
    expect(deriveAvailability({ ...base, is_available: false, availability_manual_override: true }, 3)).toBe(false)
  })
  it('stok takibi kapalıysa stok değişimi durumu etkilemez', () => {
    expect(deriveAvailability({ ...base, track_stock: false, is_available: true }, 0)).toBe(true)
    expect(deriveAvailability({ ...base, track_stock: false, is_available: false }, 9)).toBe(false)
  })
  it('idempotency anahtarları DB ile aynı biçimde', () => {
    expect(orderDeductKey('o1', 'p1')).toBe('order:o1:product:p1:deduct')
    expect(orderRestoreKey('o1', 'p1')).toBe('order:o1:product:p1:restore')
  })
  it('stok düşüm anı varsayılan kabul', () => {
    expect(stockDeductTiming(undefined)).toBe('accept')
    expect(stockDeductTiming({})).toBe('accept')
    expect(stockDeductTiming({ stock_deduct_on: 'create' })).toBe('create')
    expect(stockDeductTiming({ stock_deduct_on: 'weird' })).toBe('accept')
  })
  it('etiket', () => {
    expect(formatStockLabel({ ...base, is_available: false })).toBe('Tükendi')
    expect(formatStockLabel(base)).toBe('5')
    expect(formatStockLabel({ ...base, track_stock: false })).toBe('Satışta')
  })
})
