/**
 * Restoran özellik (feature) sistemi — saf, sunucu/istemci ortak.
 *
 * Kaynaklar:
 *  1. Mevcut kolon: restaurants.ordering_enabled + whatsapp -> 'whatsapp_order'
 *     (public sayfadaki mantıkla birebir: numara yoksa kapalı sayılır).
 *  2. restaurant_features tablosu (migration 023): admin tarafından açılan
 *     diğer özellikler ve config'leri.
 *
 * 'qr_menu' her restoranda her zaman açıktır.
 */

export const FEATURE_KEYS = [
  'qr_menu',
  'whatsapp_order',
  'direct_order',
  'marketplace',
  'trendyol_food',
  'yemeksepeti',
  'stock',
  'reports',
  'multi_branch',
] as const

export type FeatureKey = (typeof FEATURE_KEYS)[number]

/** Admin panelinde açılıp kapatılabilen özellikler (kolon tabanlı olanlar hariç). */
export const MANAGED_FEATURE_KEYS: FeatureKey[] = [
  'direct_order',
  'marketplace',
  'trendyol_food',
  'yemeksepeti',
  'stock',
  'reports',
  'multi_branch',
]

export const FEATURE_LABELS: Record<FeatureKey, { label: string; description: string }> = {
  qr_menu: { label: 'QR Menü', description: 'Her restoranda açık' },
  whatsapp_order: {
    label: 'WhatsApp Sipariş',
    description: 'Restoran ayarlarındaki "Sepet ve WhatsApp ile sipariş" anahtarı ile yönetilir',
  },
  direct_order: {
    label: 'Sipariş Paneli',
    description: 'QR menüden gelen siparişler veritabanına kaydedilir ve panelde listelenir',
  },
  marketplace: {
    label: 'Pazaryeri Entegrasyonu',
    description: 'Entegrasyonlar, platform ürünleri ve ürün eşleştirme ekranları',
  },
  trendyol_food: { label: 'Trendyol Yemek', description: 'Trendyol Yemek bağlantısı tanımlanabilir' },
  yemeksepeti: { label: 'Yemeksepeti', description: 'Yemeksepeti bağlantısı tanımlanabilir' },
  stock: { label: 'Stok Yönetimi', description: 'Merkezi stok, stok adedi ve "Tükendi" yönetimi' },
  reports: { label: 'Raporlar', description: 'Günlük sipariş ve ciro raporları' },
  multi_branch: {
    label: 'Tenant / Çoklu Şube',
    description: 'Açıldığında bu restoranın müşterisi (tenant) admin "Müşteriler" listesinde görünür; şube ve kullanıcı eklenebilir',
  },
}

export interface FeatureRow {
  feature_key: string
  enabled: boolean
  config: Record<string, unknown> | null
}

export interface RestaurantFeatureSource {
  ordering_enabled?: boolean | null
  whatsapp?: string | null
}

export interface FeatureSet {
  keys: FeatureKey[]
  configs: Partial<Record<FeatureKey, Record<string, unknown>>>
}

export function isFeatureKey(value: string): value is FeatureKey {
  return (FEATURE_KEYS as readonly string[]).includes(value)
}

/** Public sayfadaki kuralın aynısı: anahtar açık VE numara girilmiş. */
export function isWhatsappOrderingEnabled(restaurant: RestaurantFeatureSource | null | undefined): boolean {
  if (!restaurant) return false
  return Boolean(restaurant.ordering_enabled) && Boolean(String(restaurant.whatsapp || '').trim())
}

export function buildFeatureSet(
  restaurant: RestaurantFeatureSource | null | undefined,
  rows: FeatureRow[] | null | undefined
): FeatureSet {
  const keys = new Set<FeatureKey>(['qr_menu'])
  const configs: FeatureSet['configs'] = {}

  if (isWhatsappOrderingEnabled(restaurant)) keys.add('whatsapp_order')

  for (const row of rows || []) {
    if (!isFeatureKey(row.feature_key)) continue
    if (!row.enabled) continue
    keys.add(row.feature_key)
    if (row.config && typeof row.config === 'object') configs[row.feature_key] = row.config
  }

  return { keys: FEATURE_KEYS.filter((k) => keys.has(k)), configs }
}

export function hasFeature(features: FeatureSet | null | undefined, key: FeatureKey): boolean {
  return Boolean(features?.keys.includes(key))
}

export function featureConfig<T extends Record<string, unknown> = Record<string, unknown>>(
  features: FeatureSet | null | undefined,
  key: FeatureKey
): T {
  return ((features?.configs[key] as T | undefined) ?? ({} as T))
}
