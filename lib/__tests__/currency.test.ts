import { describe, expect, it } from 'vitest'
import { currencySymbol, formatCurrency, localeForCurrency, normalizeCurrency } from '@/lib/utils/currency'

describe('currency', () => {
  it('normalizes codes and falls back to TRY', () => {
    expect(normalizeCurrency('cad')).toBe('CAD')
    expect(normalizeCurrency(' usd ')).toBe('USD')
    expect(normalizeCurrency(null)).toBe('TRY')
    expect(normalizeCurrency('')).toBe('TRY')
    expect(normalizeCurrency('TL')).toBe('TRY')
  })

  it('formats TRY the old way by default', () => {
    expect(formatCurrency(35)).toBe('₺35,00')
    expect(formatCurrency(35, 'TRY')).toBe('₺35,00')
  })

  it('formats CAD like a Canadian menu', () => {
    expect(formatCurrency(35, 'CAD')).toBe('$35.00')
    expect(formatCurrency(1234.5, 'CAD')).toBe('$1,234.50')
  })

  it('formats other currencies with their own locale', () => {
    expect(formatCurrency(10, 'USD')).toBe('$10.00')
    expect(formatCurrency(10, 'GBP')).toBe('£10.00')
    expect(formatCurrency(10, 'EUR')).toContain('€')
    expect(localeForCurrency('CAD')).toBe('en-CA')
    expect(localeForCurrency('XXX')).toBe('en-US')
  })

  it('never throws on an unknown code', () => {
    expect(formatCurrency(5, 'ZZZ')).toBeTypeOf('string')
    expect(formatCurrency(5, 'not-a-code')).toBe('₺5,00')
  })

  it('gives bare symbols for form labels', () => {
    expect(currencySymbol('TRY')).toBe('₺')
    expect(currencySymbol('CAD')).toBe('$')
    expect(currencySymbol('EUR')).toBe('€')
  })
})
