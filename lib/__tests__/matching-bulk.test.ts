import { describe, expect, it } from 'vitest'
import { exactNameMatches, primaryCategoryName } from '@/lib/integrations/matching'

describe('toplu birebir eşleştirme', () => {
  const locals = [
    { id: 'l1', name: 'Haydari' },
    { id: 'l2', name: 'Acılı Ezme 200gr' },
    { id: 'l3', name: 'Acılı Ezme 500gr' },
    { id: 'l4', name: 'Atom' },
    { id: 'l5', name: 'atom' },
  ]
  it('yalnızca birebir aynı ad ve tek aday', () => {
    const pairs = exactNameMatches([
      { id: 'e1', name: 'HAYDARİ' },
      { id: 'e2', name: 'Acılı Ezme' }, // 200gr / 500gr birebir değil → eşleşmez
      { id: 'e3', name: 'Acılı Ezme 500gr' },
      { id: 'e4', name: 'Atom' }, // yerelde iki aday (Atom, atom) → eşleşmez
    ], locals)
    expect(pairs.map((p) => [p.externalRowId, p.localProductId])).toEqual([['e1', 'l1'], ['e3', 'l3']])
  })
  it('platformda aynı adla iki ürün varsa eşleşmez', () => {
    const pairs = exactNameMatches([{ id: 'e1', name: 'Haydari' }, { id: 'e2', name: 'Haydari' }], locals)
    expect(pairs).toEqual([])
  })
  it('kategori: ilk bölüm', () => {
    expect(primaryCategoryName('Mezeler, En Sevilenler')).toBe('Mezeler')
    expect(primaryCategoryName(null)).toBeNull()
    expect(primaryCategoryName(' ')).toBeNull()
  })
})
