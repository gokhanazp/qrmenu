import { describe, expect, it } from 'vitest'
import { aggregateOrders, istanbulDay } from '@/lib/reports/aggregate'

describe('rapor toplamları', () => {
  const rows = [
    { restaurant_id: 'r1', source: 'qrmenulist' as const, status: 'completed' as const, total: 100, created_at: '2026-09-25T09:00:00Z', items: [{ name: 'Haydari', quantity: 2, total_price: 100 }] },
    { restaurant_id: 'r1', source: 'trendyol_food' as const, status: 'accepted' as const, total: 250.5, created_at: '2026-09-25T10:00:00Z', items: [{ name: 'haydari', quantity: 1, total_price: 50.5 }, { name: 'Atom', quantity: 3, total_price: 200 }] },
    { restaurant_id: 'r2', source: 'trendyol_food' as const, status: 'cancelled' as const, total: 999, created_at: '2026-09-25T22:30:00Z', items: [] },
    { restaurant_id: 'r2', source: 'yemeksepeti' as const, status: 'new' as const, total: 60, created_at: '2026-09-24T23:30:00Z', items: [] },
  ]

  it('iptaller ciroya girmez, sayılır', () => {
    const s = aggregateOrders(rows)
    expect(s.orders).toBe(3)
    expect(s.revenue).toBe(410.5)
    expect(s.cancelled).toBe(1)
    expect(s.averageOrder).toBe(136.83)
  })

  it('platform ve şube kırılımı', () => {
    const s = aggregateOrders(rows)
    expect(s.bySource.find((x) => x.source === 'trendyol_food')).toMatchObject({ orders: 1, revenue: 250.5, cancelled: 1 })
    expect(s.bySource[0].source).toBe('trendyol_food')
    expect(s.byRestaurant.find((r) => r.restaurantId === 'r2')).toMatchObject({ orders: 1, revenue: 60 })
  })

  it('gün İstanbul saatiyle hesaplanır (UTC 23:30 → ertesi gün)', () => {
    expect(istanbulDay('2026-09-24T23:30:00Z')).toBe('2026-09-25')
    expect(istanbulDay('2026-09-25T22:30:00Z')).toBe('2026-09-26')
    const s = aggregateOrders(rows)
    expect(s.byDay.map((d) => d.day)).toEqual(['2026-09-25'])
    expect(s.byDay[0].orders).toBe(3)
  })

  it('en çok satanlar isim büyük/küçük harften bağımsız birleşir', () => {
    const s = aggregateOrders(rows)
    expect(s.topProducts[0]).toMatchObject({ name: 'Atom', quantity: 3 })
    expect(s.topProducts[1]).toMatchObject({ quantity: 3, revenue: 150.5 })
  })
})
