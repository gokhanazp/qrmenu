import { describe, expect, it } from 'vitest'
import { nameSimilarity, normalizeProductName, suggestMatches } from '@/lib/integrations/matching'
import { TrendyolGoAdapter } from '@/lib/integrations/adapters/trendyol-go'
import { YemeksepetiAdapter } from '@/lib/integrations/adapters/yemeksepeti'

function fakeFetch(handler: (url: string) => { status: number; body?: unknown }): typeof fetch {
  return (async (input: RequestInfo | URL) => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url
    const r = handler(url)
    return new Response(r.body === undefined ? '' : JSON.stringify(r.body), { status: r.status, headers: { 'Content-Type': 'application/json' } })
  }) as typeof fetch
}

describe('isim normalizasyonu ve benzerlik', () => {
  it('birim ve noktalama temizlenir, Türkçe küçük harf', () => {
    expect(normalizeProductName('Haydari 200 Gr')).toBe('haydari')
    expect(normalizeProductName('HAYDARİ (200gr)')).toBe('haydari')
    expect(normalizeProductName('Ev Yapımı Haydari')).toBe('ev yapımı haydari')
    expect(normalizeProductName('Acılı Ezme 500gr')).toBe('acılı ezme')
  })

  it('benzer isimler yüksek, farklılar düşük skor alır', () => {
    expect(nameSimilarity('Haydari', 'Haydari 200 Gr')).toBe(1)
    expect(nameSimilarity('Ev Yapımı Haydari', 'Haydari')).toBeGreaterThan(0.5)
    expect(nameSimilarity('Haydari', 'Yaprak Sarma')).toBeLessThan(0.3)
  })
})

describe('eşleştirme önerileri', () => {
  const locals = [
    { id: 'l1', name: 'Haydari', sku: null },
    { id: 'l2', name: 'Acılı Ezme', sku: 'EZME-200' },
    { id: 'l3', name: 'Yaprak Sarma', sku: null },
    { id: 'l4', name: 'Atom', sku: null },
  ]

  it('SKU eşleşmesi en üstte ve %100', () => {
    const s = suggestMatches({ name: 'Acili Ezme 500gr', sku: 'ezme-200' }, locals)
    expect(s[0]).toMatchObject({ localProductId: 'l2', score: 1, reason: 'sku' })
  })

  it('birebir isim eşleşmesi exact olarak işaretlenir ama yine öneri kalır', () => {
    const s = suggestMatches({ name: 'Haydari 200 Gr' }, locals)
    expect(s[0]).toMatchObject({ localProductId: 'l1', score: 1, reason: 'exact' })
  })

  it('200gr ve 500gr aynı ürün gibi görünür; ikisi de öneri olur, otomatik seçilmez', () => {
    const many = [
      { id: 'a', name: 'Acılı Ezme 200gr' },
      { id: 'b', name: 'Acılı Ezme 500gr' },
    ]
    const s = suggestMatches({ name: 'Acılı Ezme' }, many)
    expect(s.map((x) => x.localProductId).sort()).toEqual(['a', 'b'])
    expect(s.every((x) => x.reason === 'exact')).toBe(true)
  })

  it('alakasız ürün önerilmez, en fazla 3 öneri', () => {
    const s = suggestMatches({ name: 'Zeytinyağlı Yaprak Sarma 200gr' }, locals)
    expect(s.map((x) => x.localProductId)).toContain('l3')
    expect(s.map((x) => x.localProductId)).not.toContain('l4')
    expect(s.length).toBeLessThanOrEqual(3)
  })
})

describe('adapter ürün okuma', () => {
  it('Trendyol: gerçek yapı (products + section referansları)', async () => {
    const adapter = new TrendyolGoAdapter({ supplierId: '1', apiKey: 'k', apiSecret: 's', storeId: '7' }, 'production', {
      fetchImpl: fakeFetch((url) => {
        expect(url).toBe('https://api.tgoapis.com/integrator/product/meal/suppliers/1/stores/7/products')
        return {
          status: 200,
          body: {
            sections: [
              { id: 1, name: 'Mezeler', position: 1, status: 'ACTIVE', products: [{ id: 928374, position: 1 }] },
              { id: 2, name: 'En Sevilenler', position: 2, status: 'ACTIVE', products: [{ id: 928374, position: 1 }, { id: 5, position: 2 }] },
            ],
            products: [
              { id: 928374, name: 'Haydari 200 Gr', description: 'Süzme yoğurt', sellingPrice: 220, originalPrice: null, status: 'ACTIVE', modifierGroups: [] },
              { id: 5, name: 'Atom', description: '', sellingPrice: 200, originalPrice: 250, status: 'PASSIVE', modifierGroups: [] },
              { id: 9, name: 'Bölümsüz Ürün', sellingPrice: 10, status: 'ACTIVE', modifierGroups: [] },
            ],
            ingredients: [],
            modifierGroups: [],
          },
        }
      }),
    })
    const products = await adapter.getProducts()
    expect(products).toHaveLength(3)
    expect(products[0]).toMatchObject({ externalProductId: '928374', name: 'Haydari 200 Gr', description: 'Süzme yoğurt', price: 220, available: true, category: 'Mezeler, En Sevilenler' })
    expect(products[1]).toMatchObject({ name: 'Atom', available: false, category: 'En Sevilenler' })
    expect(products[2]).toMatchObject({ name: 'Bölümsüz Ürün', category: null })
  })

  it('Trendyol: eski varsayım (bölüm içinde tam ürün) da çalışır', async () => {
    const adapter = new TrendyolGoAdapter({ supplierId: '1', apiKey: 'k', apiSecret: 's', storeId: '7' }, 'production', {
      fetchImpl: fakeFetch(() => ({ status: 200, body: { sections: [{ name: 'Mezeler', products: [{ id: 3, name: 'Haydari', price: 220, status: 'ACTIVE' }] }] } })),
    })
    const products = await adapter.getProducts()
    expect(products).toHaveLength(1)
    expect(products[0]).toMatchObject({ externalProductId: '3', name: 'Haydari', price: 220, category: 'Mezeler' })
  })

  it('Trendyol: aynı ürün iki bölümde → tek kayıt, kategoriler birleşir', async () => {
    const adapter = new TrendyolGoAdapter({ supplierId: '1', apiKey: 'k', apiSecret: 's', storeId: '7' }, 'production', {
      fetchImpl: fakeFetch(() => ({
        status: 200,
        body: { sections: [
          { name: 'Mezeler', products: [{ id: 1, name: 'Haydari', price: 220, status: 'ACTIVE' }] },
          { name: 'Kahvaltı', products: [{ id: 1, name: 'Haydari', price: 220, status: 'ACTIVE' }, { id: 2, name: 'Atom', price: 200, status: 'ACTIVE' }] },
        ] },
      })),
    })
    const products = await adapter.getProducts()
    expect(products).toHaveLength(2)
    expect(products[0]).toMatchObject({ externalProductId: '1', category: 'Mezeler, Kahvaltı' })
  })

  it('Yemeksepeti: sayfalı katalog', async () => {
    const calls: string[] = []
    const adapter = new YemeksepetiAdapter({ clientId: 'c', clientSecret: 's', chainId: 'ch', vendorId: 'v' }, {
      fetchImpl: fakeFetch((url) => {
        calls.push(url)
        if (url.endsWith('/v2/oauth/token')) return { status: 200, body: { access_token: 't', expires_in: 100 } }
        if (url.includes('/v2/chains/ch/vendors/v/catalog?page_size=100&page=1')) return { status: 200, body: { data: [{ sku: 'YS-8374', title: 'Ev Yapımı Haydari', price: 215, active: true, quantity: 12, category: { name: 'Meze' }, images: ['https://x/y.jpg'] }] } }
        return { status: 404 }
      }),
    })
    const products = await adapter.getProducts()
    expect(products).toHaveLength(1)
    expect(products[0]).toMatchObject({ externalProductId: 'YS-8374', externalSku: 'YS-8374', name: 'Ev Yapımı Haydari', price: 215, quantity: 12, available: true, category: 'Meze' })
    expect(calls.filter((c) => c.includes('/catalog')).length).toBe(1)
  })
})
