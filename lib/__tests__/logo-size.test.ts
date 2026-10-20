import { describe, expect, it } from 'vitest'
import { clampLogoBox, isCustomLogoSize, logoBox, normalizeLogoSize } from '@/lib/utils/logo-size'

describe('logo size', () => {
  it('keeps presets and falls back to md', () => {
    expect(normalizeLogoSize('lg')).toBe('lg')
    expect(normalizeLogoSize(null)).toBe('md')
    expect(normalizeLogoSize('huge')).toBe('md')
    expect(logoBox('xl')).toEqual({ width: 320, height: 124 })
    expect(logoBox(undefined)).toEqual({ width: 200, height: 80 })
  })

  it('accepts custom WxH and clamps to safe limits', () => {
    expect(normalizeLogoSize('240x90')).toBe('240x90')
    expect(normalizeLogoSize(' 240x90 ')).toBe('240x90')
    expect(normalizeLogoSize('999x999')).toBe('320x160')
    expect(normalizeLogoSize('10x10')).toBe('60x30')
    expect(isCustomLogoSize('240x90')).toBe(true)
    expect(isCustomLogoSize('md')).toBe(false)
    expect(clampLogoBox(500, 5)).toEqual({ width: 320, height: 30 })
  })

  it('scales boxes for the category header', () => {
    expect(logoBox('240x90', 0.7)).toEqual({ width: 168, height: 63 })
    expect(logoBox('md', 0.7)).toEqual({ width: 140, height: 56 })
  })
})
