/**
 * Entegrasyon katmanı — ortak tipler (saf, sunucu/istemci).
 *
 * Pazaryeri kodu uygulamanın geri kalanına dağıtılmaz: her platform bir
 * FoodPlatformAdapter uygular ve kendi capability bilgisini döndürür. UI bu
 * capability'lere göre davranır; desteklenmeyen işlem asla "varmış gibi"
 * gösterilmez.
 */

export const MARKETPLACE_PLATFORMS = ['trendyol_food', 'yemeksepeti', 'getir_food', 'migros_food'] as const
export type MarketplacePlatform = (typeof MARKETPLACE_PLATFORMS)[number]

export const PLATFORM_LABELS: Record<MarketplacePlatform, string> = {
  trendyol_food: 'Trendyol Yemek',
  yemeksepeti: 'Yemeksepeti',
  getir_food: 'Getir Yemek',
  migros_food: 'Migros Yemek',
}

/** V1'de bağlanabilen platformlar; diğerleri adapter eklenince açılır. */
export const AVAILABLE_PLATFORMS: MarketplacePlatform[] = ['trendyol_food', 'yemeksepeti']

export type IntegrationEnvironment = 'production' | 'stage'
export type IntegrationStatus = 'active' | 'disabled'
export type HealthStatus = 'active' | 'warning' | 'error' | 'disabled'

export interface AdapterCapabilities {
  supportsProductRead: boolean
  supportsProductCreate: boolean
  supportsProductUpdate: boolean
  supportsPriceUpdate: boolean
  supportsAvailabilityUpdate: boolean
  supportsStockQuantity: boolean
  supportsOrderRead: boolean
  supportsOrderAccept: boolean
  supportsOrderReject: boolean
  supportsOrderStatusUpdate: boolean
  supportsWebhook: boolean
  supportsStoreStatus: boolean
  supportsManualShip: boolean
  /** Kısa, kullanıcıya gösterilebilir notlar (örn. "Ürün oluşturma DH ekibi onayı ister") */
  notes: string[]
}

export interface HealthCheckResult {
  status: Exclude<HealthStatus, 'disabled'>
  message: string
  details?: Record<string, unknown>
  checkedAt: string
}

export type NormalizedOrderStatus = 'new' | 'accepted' | 'preparing' | 'ready' | 'completed' | 'cancelled'

export interface NormalizedOrderItem {
  externalProductId: string | null
  externalItemId: string | null
  name: string
  quantity: number
  unitPrice: number
  totalPrice: number
  options: Record<string, unknown>[]
  note: string | null
}

export interface NormalizedOrder {
  externalOrderId: string
  externalOrderNumber: string | null
  platformStatus: string
  status: NormalizedOrderStatus
  /** Platform tarafındaki değişiklik zamanı (idempotency anahtarı için) */
  modifiedAt: string | null
  deliveryAddress: string | null
  customerName: string | null
  customerPhone: string | null
  deliveryType: string | null
  paymentType: string | null
  subtotal: number
  discount: number
  deliveryFee: number
  total: number
  currency: string
  customerNote: string | null
  createdAt: string
  items: NormalizedOrderItem[]
  rawPayload: unknown
}

export interface ExternalProductRecord {
  externalProductId: string
  externalSku: string | null
  name: string
  description: string | null
  price: number | null
  quantity: number | null
  available: boolean
  category: string | null
  rawPayload: unknown
}

export type StoreStatus = 'open' | 'closed' | 'unknown'

export interface GetOrdersParams {
  /** Epoch ms; bu andan sonra değişen paketler */
  modifiedSince?: number
  statuses?: string[]
  page?: number
  pageSize?: number
}

/**
 * Tüm platform adapter'larının uyduğu arayüz. Desteklenmeyen metotlar
 * NotSupportedError, henüz yazılmamış olanlar NotImplementedError fırlatır.
 */
export interface FoodPlatformAdapter {
  readonly platform: MarketplacePlatform
  readonly capabilities: AdapterCapabilities

  healthCheck(): Promise<HealthCheckResult>

  getOrders(params: GetOrdersParams): Promise<NormalizedOrder[]>
  getOrder(externalOrderId: string): Promise<NormalizedOrder | null>
  acceptOrder(externalOrderId: string, options?: { preparationTimeMinutes?: number }): Promise<void>
  rejectOrder(externalOrderId: string, options?: { reasonCode?: string; itemIds?: string[] }): Promise<void>
  /** context: siparişin ham yükünden türetilen bilgiler (deliveryType vb.) */
  updateOrderStatus(externalOrderId: string, status: NormalizedOrderStatus, context?: Record<string, unknown>): Promise<void>

  getProducts(): Promise<ExternalProductRecord[]>
  getProduct(externalProductId: string): Promise<ExternalProductRecord | null>
  createProduct(product: Partial<ExternalProductRecord>): Promise<ExternalProductRecord>
  updateProduct(externalProductId: string, product: Partial<ExternalProductRecord>): Promise<void>

  setProductAvailability(externalProductId: string, available: boolean): Promise<void>
  updatePrice(externalProductId: string, price: number): Promise<void>
  updateStock(externalProductId: string, quantity: number): Promise<void>

  getStoreStatus(): Promise<StoreStatus>
  setStoreStatus(status: Exclude<StoreStatus, 'unknown'>): Promise<void>
}

/** DB satırının sunucuda çözülmüş hâli (credentials düz metin, ASLA istemciye gitmez). */
export interface ResolvedIntegration {
  id: string
  tenantId: string
  restaurantId: string
  platform: MarketplacePlatform
  status: IntegrationStatus
  environment: IntegrationEnvironment
  credentials: Record<string, string>
  config: Record<string, unknown>
}

/** Platform iptal sebepleri (UI seçenekleri). */
export interface CancelReason {
  code: string
  label: string
}
