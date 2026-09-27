import { NotImplementedError, NotSupportedError } from '../errors'
import { PLATFORM_LABELS } from '../types'
import type {
  AdapterCapabilities,
  ExternalProductRecord,
  FoodPlatformAdapter,
  GetOrdersParams,
  HealthCheckResult,
  MarketplacePlatform,
  NormalizedOrder,
  NormalizedOrderStatus,
  StoreStatus,
} from '../types'

export type FetchLike = typeof fetch

export interface AdapterOptions {
  fetchImpl?: FetchLike
  /** x-executor-user gibi "işlemi yapan kişi" başlıkları için */
  actorEmail?: string
  timeoutMs?: number
}

/**
 * Tüm adapter'ların temeli. Desteklenmeyen işlemler capability'ye göre
 * NotSupportedError, desteklenen ama henüz yazılmamış olanlar
 * NotImplementedError fırlatır. Böylece UI "varmış gibi" davranamaz.
 */
export abstract class BaseAdapter implements FoodPlatformAdapter {
  abstract readonly platform: MarketplacePlatform
  abstract readonly capabilities: AdapterCapabilities
  protected readonly fetchImpl: FetchLike
  protected readonly actorEmail: string | undefined
  protected readonly timeoutMs: number

  constructor(options: AdapterOptions = {}) {
    this.fetchImpl = options.fetchImpl ?? fetch
    this.actorEmail = options.actorEmail
    this.timeoutMs = options.timeoutMs ?? 15000
  }

  protected get label(): string {
    return PLATFORM_LABELS[this.platform]
  }

  protected guard(flag: keyof AdapterCapabilities, operation: string): never {
    if (!this.capabilities[flag]) throw new NotSupportedError(operation, this.label)
    throw new NotImplementedError(`${this.label} ${operation} (Faz 6)`)
  }

  protected async fetchWithTimeout(url: string, init: RequestInit): Promise<Response> {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), this.timeoutMs)
    try {
      return await this.fetchImpl(url, { ...init, signal: controller.signal })
    } finally {
      clearTimeout(timer)
    }
  }

  abstract healthCheck(): Promise<HealthCheckResult>

  async getOrders(_params: GetOrdersParams): Promise<NormalizedOrder[]> {
    return this.guard('supportsOrderRead', 'sipariş okuma')
  }
  async getOrder(_externalOrderId: string): Promise<NormalizedOrder | null> {
    return this.guard('supportsOrderRead', 'sipariş okuma')
  }
  async acceptOrder(_externalOrderId: string): Promise<void> {
    return this.guard('supportsOrderAccept', 'sipariş kabul')
  }
  async rejectOrder(_externalOrderId: string): Promise<void> {
    return this.guard('supportsOrderReject', 'sipariş red')
  }
  async updateOrderStatus(_externalOrderId: string, _status: NormalizedOrderStatus, _context?: Record<string, unknown>): Promise<void> {
    return this.guard('supportsOrderStatusUpdate', 'sipariş durumu güncelleme')
  }
  async getProducts(): Promise<ExternalProductRecord[]> {
    return this.guard('supportsProductRead', 'ürün okuma')
  }
  async getProduct(_externalProductId: string): Promise<ExternalProductRecord | null> {
    return this.guard('supportsProductRead', 'ürün okuma')
  }
  async createProduct(_product: Partial<ExternalProductRecord>): Promise<ExternalProductRecord> {
    return this.guard('supportsProductCreate', 'ürün oluşturma')
  }
  async updateProduct(_externalProductId: string, _product: Partial<ExternalProductRecord>): Promise<void> {
    return this.guard('supportsProductUpdate', 'ürün güncelleme')
  }
  async setProductAvailability(_externalProductId: string, _available: boolean): Promise<void> {
    return this.guard('supportsAvailabilityUpdate', 'satışa açma/kapama')
  }
  async updatePrice(_externalProductId: string, _price: number): Promise<void> {
    return this.guard('supportsPriceUpdate', 'fiyat güncelleme')
  }
  async updateStock(_externalProductId: string, _quantity: number): Promise<void> {
    return this.guard('supportsStockQuantity', 'stok adedi güncelleme')
  }
  async getStoreStatus(): Promise<StoreStatus> {
    return this.guard('supportsStoreStatus', 'mağaza durumu')
  }
  async setStoreStatus(_status: Exclude<StoreStatus, 'unknown'>): Promise<void> {
    return this.guard('supportsStoreStatus', 'mağaza aç/kapa')
  }
}
