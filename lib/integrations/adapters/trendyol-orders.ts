/**
 * Trendyol Go paket → NormalizedOrder dönüşümü (saf, test edilebilir).
 * Kaynak: developers.tgoapps.com "Sipariş Paketlerini Çekme" örnek yanıtı.
 */
import type { CancelReason, NormalizedOrder, NormalizedOrderItem, NormalizedOrderStatus } from '../types'

// eslint-disable-next-line
type Row = Record<string, any>

/** Restoran kaynaklı iptal (unsupplied) sebepleri — dokümanda doğrulanan kodlar. */
export const TRENDYOL_CANCEL_REASONS: CancelReason[] = [
  { code: '621', label: 'Tedarik problemi' },
  { code: '622', label: 'Mağaza kapalı' },
  { code: '623', label: 'Mağaza siparişi hazırlayamıyor' },
  { code: '627', label: 'Sipariş karışıklığı' },
]

export const TRENDYOL_PACKAGE_STATUSES = ['Created', 'Picking', 'Invoiced', 'Shipped', 'Delivered', 'Cancelled', 'UnSupplied'] as const

export function mapTrendyolStatus(packageStatus: string, isCancelled?: boolean): NormalizedOrderStatus {
  if (isCancelled) return 'cancelled'
  switch (String(packageStatus)) {
    case 'Created': return 'new'
    case 'Picking': return 'accepted'
    case 'Invoiced': return 'ready'
    case 'Shipped': return 'ready'
    case 'Delivered': return 'completed'
    case 'Cancelled':
    case 'UnSupplied': return 'cancelled'
    default: return 'new'
  }
}

function joinAddress(a: Row | null | undefined): string | null {
  if (!a) return null
  const parts = [
    a.address1, a.address2,
    a.apartmentNumber ? `Bina: ${a.apartmentNumber}` : null,
    a.floor ? `Kat: ${a.floor}` : null,
    a.doorNumber ? `Daire: ${a.doorNumber}` : null,
    a.neighborhood, a.district, a.city,
    a.addressDescription ? `(${a.addressDescription})` : null,
  ].filter((x) => typeof x === 'string' && x.trim())
  return parts.length ? parts.join(', ') : null
}

function toIso(ms: unknown): string | null {
  const n = Number(ms)
  return Number.isFinite(n) && n > 0 ? new Date(n).toISOString() : null
}

export function normalizeTrendyolPackage(pkg: Row): NormalizedOrder {
  const lines = Array.isArray(pkg.lines) ? (pkg.lines as Row[]) : []
  const items: NormalizedOrderItem[] = lines.map((line) => {
    const units = Array.isArray(line.items) ? (line.items as Row[]) : []
    const activeUnits = units.filter((u) => !u.isCancelled)
    const quantity = units.length ? (activeUnits.length || units.length) : Math.max(1, Number(line.quantity ?? 1))
    const unitPrice = Number(line.unitSellingPrice ?? line.price ?? 0)
    const modifiers = Array.isArray(line.modifierProducts) ? (line.modifierProducts as Row[]) : []
    const modifierText = modifiers.map((m) => m.name).filter(Boolean).join(', ')
    return {
      externalProductId: line.productId !== undefined && line.productId !== null ? String(line.productId) : null,
      externalItemId: units.map((u) => u.packageItemId).filter(Boolean).join(',') || null,
      name: String(line.name ?? 'Ürün'),
      quantity,
      unitPrice,
      totalPrice: Math.round(unitPrice * quantity * 100) / 100,
      options: modifiers.map((m) => ({ name: m.name, price: m.price, productId: m.productId, modifierGroupId: m.modifierGroupId })),
      note: modifierText || null,
    }
  })

  const customer = (pkg.customer || {}) as Row
  const address = (pkg.address || {}) as Row
  const payment = (pkg.payment || {}) as Row
  const total = Number(pkg.totalPrice ?? 0)
  const deliveryFee = Number(pkg.totalDeliveryPrice ?? 0) || 0
  const phone = address.phone ? `${address.countryPhoneCode || ''}${address.phone}` : null
  const deliveryType = pkg.storePickupSelected ? 'pickup' : 'delivery'
  const note = pkg.customerNote ?? pkg.note ?? pkg.orderNote ?? null

  return {
    externalOrderId: String(pkg.id),
    externalOrderNumber: pkg.orderNumber ? String(pkg.orderNumber) : pkg.orderCode ? String(pkg.orderCode) : null,
    platformStatus: String(pkg.packageStatus ?? ''),
    status: mapTrendyolStatus(String(pkg.packageStatus ?? ''), Boolean(pkg.isCancelled)),
    modifiedAt: toIso(pkg.packageModificationDate),
    deliveryAddress: joinAddress(address),
    customerName: [customer.firstName, customer.lastName].filter(Boolean).join(' ') || null,
    customerPhone: phone,
    deliveryType,
    paymentType: payment.paymentType ? String(payment.paymentType) : null,
    subtotal: Math.max(0, Math.round((total - deliveryFee) * 100) / 100),
    discount: 0,
    deliveryFee,
    total,
    currency: 'TRY',
    customerNote: typeof note === 'string' && note.trim() ? note.trim() : null,
    createdAt: toIso(pkg.packageCreationDate) || new Date().toISOString(),
    items,
    rawPayload: pkg,
  }
}

/** Ham paketten unsupplied (iptal) için tüm packageItemId'ler */
export function trendyolPackageItemIds(raw: unknown): string[] {
  const pkg = (raw || {}) as Row
  const lines = Array.isArray(pkg.lines) ? (pkg.lines as Row[]) : []
  const ids: string[] = []
  for (const line of lines) {
    for (const u of Array.isArray(line.items) ? (line.items as Row[]) : []) {
      if (u.packageItemId) ids.push(String(u.packageItemId))
    }
  }
  return ids
}
