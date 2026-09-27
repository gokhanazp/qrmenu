import { describe, expect, it } from 'vitest'
import { mapTrendyolStatus, normalizeTrendyolPackage, trendyolPackageItemIds, TRENDYOL_CANCEL_REASONS } from '@/lib/integrations/adapters/trendyol-orders'
import { mapYemeksepetiStatus, normalizeYemeksepetiOrder, yemeksepetiCancelBody, yemeksepetiCatalogBody, yemeksepetiStatusBody } from '@/lib/integrations/adapters/yemeksepeti-orders'

// Dokümandaki "Sipariş Paketlerini Çekme" örneğinden (kısaltılmış)
const TY_PACKAGE = {
  id: '4dc2e9573983ce9fb97aa905df33f06f',
  supplierId: 107385,
  storeId: 153,
  orderCode: '1E1',
  storePickupSelected: false,
  deliveryType: 'STORE',
  packageCreationDate: 1783520347138,
  packageModificationDate: 1783520347146,
  preparationTime: 0,
  orderId: '1001199521762',
  orderNumber: '1199521762',
  totalPrice: 602.7,
  customer: { id: 35018440, firstName: 'Oms', lastName: 'M', email: 'x@trendyolmail.com' },
  payment: { paymentType: 'PAY_WITH_CARD', mealCard: null, onDelivery: null },
  address: { address1: 'Gündoğdu Koleji Yanı', address2: 'İş Adresi', city: 'İstanbul', district: 'Kadıköy', neighborhood: 'Caferağa', apartmentNumber: '5', floor: '2', doorNumber: '7', addressDescription: 'Kadıköy - ISA2', phone: '5554443322', countryPhoneCode: '+90' },
  packageStatus: 'Created',
  lines: [
    { price: 145, unitSellingPrice: 145, items: [{ packageItemId: '1000008723596', lineItemId: 1, isCancelled: false }, { packageItemId: '1000008723597', lineItemId: 2, isCancelled: false }], productId: 203695, name: 'Big King Menü', description: 'Big King + Patates', modifierProducts: [{ name: 'Big King', price: 0, productId: 319239, modifierGroupId: 226881 }] },
    { price: 312.7, unitSellingPrice: 312.7, items: [{ packageItemId: '1000008723598', lineItemId: 3, isCancelled: false }], productId: 1, name: 'Whopper', modifierProducts: [] },
  ],
}

describe('Trendyol paket normalizasyonu', () => {
  it('satırlar: birim adedi items[] uzunluğu, fiyat unitSellingPrice', () => {
    const o = normalizeTrendyolPackage(TY_PACKAGE)
    expect(o.externalOrderId).toBe(TY_PACKAGE.id)
    expect(o.externalOrderNumber).toBe('1199521762')
    expect(o.status).toBe('new')
    expect(o.platformStatus).toBe('Created')
    expect(o.items).toHaveLength(2)
    expect(o.items[0]).toMatchObject({ externalProductId: '203695', name: 'Big King Menü', quantity: 2, unitPrice: 145, totalPrice: 290, externalItemId: '1000008723596,1000008723597', note: 'Big King' })
    expect(o.items[1]).toMatchObject({ quantity: 1, unitPrice: 312.7, totalPrice: 312.7 })
    expect(o.total).toBe(602.7)
    expect(o.customerName).toBe('Oms M')
    expect(o.customerPhone).toBe('+905554443322')
    expect(o.paymentType).toBe('PAY_WITH_CARD')
    expect(o.deliveryType).toBe('delivery')
    expect(o.deliveryAddress).toContain('Gündoğdu Koleji Yanı')
    expect(o.deliveryAddress).toContain('Daire: 7')
    expect(o.createdAt).toBe(new Date(1783520347138).toISOString())
    expect(o.modifiedAt).toBe(new Date(1783520347146).toISOString())
  })

  it('durum eşlemesi ve iptal bayrağı', () => {
    expect(mapTrendyolStatus('Created')).toBe('new')
    expect(mapTrendyolStatus('Picking')).toBe('accepted')
    expect(mapTrendyolStatus('Invoiced')).toBe('ready')
    expect(mapTrendyolStatus('Shipped')).toBe('ready')
    expect(mapTrendyolStatus('Delivered')).toBe('completed')
    expect(mapTrendyolStatus('UnSupplied')).toBe('cancelled')
    expect(mapTrendyolStatus('Created', true)).toBe('cancelled')
    expect(normalizeTrendyolPackage({ ...TY_PACKAGE, storePickupSelected: true }).deliveryType).toBe('pickup')
  })

  it('iptal için tüm packageItemId\'ler ve doğrulanmış sebep kodları', () => {
    expect(trendyolPackageItemIds(TY_PACKAGE)).toEqual(['1000008723596', '1000008723597', '1000008723598'])
    expect(TRENDYOL_CANCEL_REASONS.map((r) => r.code)).toEqual(['621', '622', '623', '627'])
  })

  it('iptal edilen birimler adetten düşer', () => {
    const pkg = { ...TY_PACKAGE, lines: [{ ...TY_PACKAGE.lines[0], items: [{ packageItemId: 'a', isCancelled: true }, { packageItemId: 'b', isCancelled: false }] }] }
    expect(normalizeTrendyolPackage(pkg).items[0].quantity).toBe(1)
  })
})

describe('Yemeksepeti normalizasyonu ve gövdeler', () => {
  it('webhook yükü savunmacı ayrıştırılır', () => {
    const o = normalizeYemeksepetiOrder({
      order_id: 'ys-1', code: 'AB12', status: 'RECEIVED', store_id: 'v-9', created_at: '2026-09-25T10:00:00Z',
      customer: { first_name: 'Ayşe', last_name: 'K', mobile_phone: '+905551112233' },
      items: [{ sku: 'YS-8374', title: 'Ev Yapımı Haydari', quantity: 2, price: 215 }],
      total: 430, comment: 'kapıya bırakın',
    })
    expect(o).toMatchObject({ externalOrderId: 'ys-1', externalOrderNumber: 'AB12', status: 'new', platformStatus: 'RECEIVED', customerName: 'Ayşe K', customerPhone: '+905551112233', total: 430, customerNote: 'kapıya bırakın' })
    expect(o.items[0]).toMatchObject({ externalProductId: 'YS-8374', name: 'Ev Yapımı Haydari', quantity: 2, unitPrice: 215, totalPrice: 430 })
    expect(mapYemeksepetiStatus('READY_FOR_PICKUP')).toBe('ready')
    expect(mapYemeksepetiStatus('DELIVERED')).toBe('completed')
    expect(mapYemeksepetiStatus('CANCELLED')).toBe('cancelled')
  })

  it('istek gövdeleri dokümandaki alan adlarıyla', () => {
    expect(yemeksepetiStatusBody('READY_FOR_PICKUP')).toEqual({ status: 'READY_FOR_PICKUP' })
    expect(yemeksepetiCancelBody('TOO_BUSY')).toEqual({ status: 'CANCELLED', cancellation: { reason: 'TOO_BUSY' } })
    expect(yemeksepetiCatalogBody([{ sku: 'LS-33', active: false, price: 10 }, { sku: 'LS-22', quantity: 4 }])).toEqual({ products: [{ sku: 'LS-33', active: false, price: 10 }, { sku: 'LS-22', quantity: 4 }] })
  })
})
