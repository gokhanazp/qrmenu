/**
 * Trendyol Yemek = "Uber Eats Trendyol Go" Partner API adapter'ı.
 *
 * Kaynak: developers.tgoapps.com (docs/authorization, trendyol-go-yemek-entegrasyonu/*).
 * Yalnızca dokümanda doğrulanan endpoint'ler kullanılır. Faz 3 kapsamı:
 * sağlık kontrolü ve mağaza durumu. Sipariş/menü metotları Faz 6'da.
 */
import { IntegrationError, toSafeErrorMessage } from '../errors'
import { TRENDYOL_GO_CAPABILITIES } from '../capabilities'
import type { ExternalProductRecord, GetOrdersParams, HealthCheckResult, IntegrationEnvironment, NormalizedOrder, NormalizedOrderStatus, StoreStatus } from '../types'
import { normalizeTrendyolPackage, trendyolPackageItemIds } from './trendyol-orders'
import { BaseAdapter, type AdapterOptions } from './base'

export interface TrendyolGoCredentials {
  supplierId: string
  apiKey: string
  apiSecret: string
  storeId: string
  integratorName?: string
  executorEmail?: string
}

export const TRENDYOL_GO_BASE_URLS: Record<IntegrationEnvironment, string> = {
  production: 'https://api.tgoapis.com',
  stage: 'https://stageapi.tgoapis.com',
}

const DEFAULT_INTEGRATOR = 'SelfIntegration'

/** Dokümandaki zorunlu başlıklar: Basic auth, User-Agent "{supplierId} - {Entegratör}", x-agentname, x-executor-user */
export function buildTrendyolHeaders(creds: TrendyolGoCredentials, actorEmail?: string): Record<string, string> {
  const integrator = (creds.integratorName || DEFAULT_INTEGRATOR).replace(/[^A-Za-z0-9]/g, '').slice(0, 30) || DEFAULT_INTEGRATOR
  const executor = creds.executorEmail || actorEmail || ''
  return {
    Authorization: 'Basic ' + Buffer.from(`${creds.apiKey}:${creds.apiSecret}`, 'utf8').toString('base64'),
    'User-Agent': `${creds.supplierId} - ${integrator}`,
    'x-agentname': integrator,
    'x-executor-user': executor,
    'Content-Type': 'application/json',
    Accept: 'application/json',
  }
}

interface TrendyolStore {
  id?: string | number
  storeId?: string | number
  name?: string
  storeName?: string
  workingStatus?: string
  status?: string
}

export class TrendyolGoAdapter extends BaseAdapter {
  readonly platform = 'trendyol_food' as const
  readonly capabilities = TRENDYOL_GO_CAPABILITIES

  constructor(
    private readonly creds: TrendyolGoCredentials,
    private readonly environment: IntegrationEnvironment,
    options: AdapterOptions = {}
  ) {
    super(options)
  }

  private get baseUrl(): string {
    return TRENDYOL_GO_BASE_URLS[this.environment]
  }

  private async request<T>(method: 'GET' | 'PUT' | 'POST', path: string, body?: unknown): Promise<T> {
    let response: Response
    try {
      response = await this.fetchWithTimeout(this.baseUrl + path, {
        method,
        headers: buildTrendyolHeaders(this.creds, this.actorEmail),
        body: body === undefined ? undefined : JSON.stringify(body),
      })
    } catch (error) {
      throw new IntegrationError('network', `Trendyol'a ulaşılamadı: ${toSafeErrorMessage(error)}`)
    }

    const text = await response.text()
    if (response.status === 401 || response.status === 403) {
      throw new IntegrationError('auth', `Kimlik doğrulama başarısız (HTTP ${response.status}). API Key, API Secret, Satıcı ID ve User-Agent bilgisini kontrol edin; stage ortamında IP izni gerekir.`, { httpStatus: response.status })
    }
    if (response.status === 429) {
      throw new IntegrationError('rate_limited', 'Trendyol istek limiti aşıldı (10 saniyede 50 istek). Biraz sonra tekrar deneyin.', { httpStatus: 429 })
    }
    if (!response.ok) {
      throw new IntegrationError('platform', `Trendyol hata döndü (HTTP ${response.status}): ${text.slice(0, 200)}`, { httpStatus: response.status })
    }
    if (!text) return undefined as T
    try {
      return JSON.parse(text) as T
    } catch {
      throw new IntegrationError('platform', 'Trendyol yanıtı JSON değil')
    }
  }

  /** GET /integrator/store/meal/suppliers/{supplierId}/stores */
  private async fetchStores(): Promise<TrendyolStore[]> {
    const data = await this.request<unknown>('GET', `/integrator/store/meal/suppliers/${encodeURIComponent(this.creds.supplierId)}/stores`)
    if (Array.isArray(data)) return data as TrendyolStore[]
    if (data && typeof data === 'object') {
      const obj = data as Record<string, unknown>
      for (const key of ['content', 'stores', 'restaurants', 'data']) {
        if (Array.isArray(obj[key])) return obj[key] as TrendyolStore[]
      }
    }
    return []
  }

  private findStore(stores: TrendyolStore[]): TrendyolStore | undefined {
    const wanted = String(this.creds.storeId)
    return stores.find((s) => String(s.id ?? s.storeId ?? '') === wanted)
  }

  async healthCheck(): Promise<HealthCheckResult> {
    const checkedAt = new Date().toISOString()
    const stores = await this.fetchStores()
    const store = this.findStore(stores)
    if (!store) {
      return {
        status: 'warning',
        message: `Bağlantı kuruldu ama ${this.creds.storeId} numaralı şube bu satıcıda bulunamadı (${stores.length} şube listelendi). Restoran ID'sini kontrol edin.`,
        details: { storeCount: stores.length, environment: this.environment },
        checkedAt,
      }
    }
    return {
      status: 'active',
      message: `Bağlı: ${store.name || store.storeName || this.creds.storeId} (${store.workingStatus || store.status || 'durum bilinmiyor'})`,
      details: {
        storeName: store.name || store.storeName || null,
        workingStatus: store.workingStatus || store.status || null,
        storeCount: stores.length,
        environment: this.environment,
      },
      checkedAt,
    }
  }

  private get orderPath(): string {
    return `/integrator/order/meal/suppliers/${encodeURIComponent(this.creds.supplierId)}`
  }

  /**
   * GET .../packages?storeId&packageStatuses&packageModificationStartDate&packageModificationEndDate&page&size
   * Sayfalı; size en fazla 50. modifiedSince (epoch ms) verilmezse son 24 saat.
   */
  async getOrders(params: GetOrdersParams = {}): Promise<NormalizedOrder[]> {
    const size = Math.min(50, params.pageSize ?? 50)
    const start = params.modifiedSince ?? Date.now() - 24 * 60 * 60 * 1000
    const end = Date.now()
    const out: NormalizedOrder[] = []
    for (let page = params.page ?? 0; page < 40; page++) {
      const qs = new URLSearchParams({
        storeId: this.creds.storeId,
        packageModificationStartDate: String(Math.floor(start)),
        packageModificationEndDate: String(Math.floor(end)),
        page: String(page),
        size: String(size),
      })
      if (params.statuses && params.statuses.length) qs.set('packageStatuses', params.statuses.join(','))
      const data = await this.request<Record<string, unknown>>('GET', `${this.orderPath}/packages?${qs.toString()}`)
      const content = Array.isArray(data?.content) ? (data.content as Record<string, unknown>[]) : Array.isArray(data) ? (data as Record<string, unknown>[]) : []
      for (const pkg of content) out.push(normalizeTrendyolPackage(pkg))
      const totalPages = Number(data?.totalPages ?? 1)
      if (content.length < size || page + 1 >= totalPages) break
    }
    return out
  }

  /** GET .../packages/{packageId} */
  async getOrder(externalOrderId: string): Promise<NormalizedOrder | null> {
    const data = await this.request<Record<string, unknown>>('GET', `${this.orderPath}/packages/${encodeURIComponent(externalOrderId)}`)
    if (!data || typeof data !== 'object') return null
    const pkg = Array.isArray((data as Record<string, unknown>).content) ? ((data as Record<string, unknown>).content as Record<string, unknown>[])[0] : data
    return pkg ? normalizeTrendyolPackage(pkg) : null
  }

  /** PUT .../packages/picked { packageId, preparationTime } */
  async acceptOrder(externalOrderId: string, options: { preparationTimeMinutes?: number } = {}): Promise<void> {
    await this.request<void>('PUT', `${this.orderPath}/packages/picked`, {
      packageId: externalOrderId,
      preparationTime: Math.max(1, Math.round(options.preparationTimeMinutes ?? 30)),
    })
  }

  /**
   * PUT .../packages/unsupplied { packageId, itemIdList, reasonId }
   * itemIds verilmezse ham paketteki tüm packageItemId'ler (tam iptal) kullanılır.
   */
  async rejectOrder(externalOrderId: string, options: { reasonCode?: string; itemIds?: string[]; raw?: unknown } = {}): Promise<void> {
    const itemIdList = options.itemIds && options.itemIds.length ? options.itemIds : trendyolPackageItemIds(options.raw)
    if (itemIdList.length === 0) throw new IntegrationError('validation', 'İptal için paket kalem ID\'leri bulunamadı; siparişi yeniden çekin')
    await this.request<void>('PUT', `${this.orderPath}/packages/unsupplied`, {
      packageId: externalOrderId,
      itemIdList,
      reasonId: Number(options.reasonCode || '621'),
    })
  }

  /**
   * ready → PUT .../packages/invoiced { packageId }
   * completed → yalnızca kendi kuryesiyle teslim eden restoran (deliveryType STORE):
   *             PUT .../packages/{id}/manual-shipped, sonra .../manual-delivered
   * preparing → platformda karşılığı yok (yerel).
   */
  async updateOrderStatus(externalOrderId: string, status: NormalizedOrderStatus, context: Record<string, unknown> = {}): Promise<void> {
    if (status === 'ready') {
      await this.request<void>('PUT', `${this.orderPath}/packages/invoiced`, { packageId: externalOrderId })
      return
    }
    if (status === 'completed') {
      const raw = (context.raw || {}) as Record<string, unknown>
      const deliveryType = String(context.deliveryType ?? raw.deliveryType ?? '').toUpperCase()
      if (deliveryType !== 'STORE') return // GO kuryesi: teslimatı platform bildirir
      const actualDate = Date.now()
      await this.request<void>('PUT', `${this.orderPath}/packages/${encodeURIComponent(externalOrderId)}/manual-shipped`, { actualDate })
      await this.request<void>('PUT', `${this.orderPath}/packages/${encodeURIComponent(externalOrderId)}/manual-delivered`, { actualDate })
      return
    }
    // accepted → acceptOrder, cancelled → rejectOrder, preparing/new → yerel
  }

  /** POST .../suppliers/{supplierId}/products/price { items: [{ restaurantId, productId, sellingPrice }] } → batchRequestId */
  async updatePrice(externalProductId: string, price: number): Promise<void> {
    await this.request<Record<string, unknown>>('POST', `/integrator/product/meal/suppliers/${encodeURIComponent(this.creds.supplierId)}/products/price`, {
      items: [{ restaurantId: Number(this.creds.storeId), productId: Number(externalProductId), sellingPrice: Math.round(price * 100) / 100 }],
    })
  }

  private get storePath(): string {
    return `/integrator/product/meal/suppliers/${encodeURIComponent(this.creds.supplierId)}/stores/${encodeURIComponent(this.creds.storeId)}`
  }

  /**
   * GET /integrator/product/meal/suppliers/{supplierId}/stores/{storeId}/products
   *
   * Gerçek yanıt (canlıda doğrulandı):
   *   products[]      : { id, name, description, sellingPrice, originalPrice, status, modifierGroups:[{id,position}] }
   *   sections[]      : { id, name, position, status, products:[{id, position}] }   ← yalnızca referans
   *   modifierGroups[]: { id, name, min, max, modifierProducts:[{id, price, position}] }
   * Bölümler kategori bilgisini verir; bir ürün birden fazla bölümde olabilir.
   */
  async getProducts(): Promise<ExternalProductRecord[]> {
    const data = await this.request<unknown>('GET', `${this.storePath}/products`)
    const root = (data && typeof data === 'object' && !Array.isArray(data) ? data : {}) as Record<string, unknown>
    const sections = Array.isArray(root.sections) ? (root.sections as Record<string, unknown>[]) : []
    const topProducts = Array.isArray(root.products) ? (root.products as Record<string, unknown>[]) : []

    // Bölüm adları: ürün id → ["Mezeler", "Kahvaltı"]
    const sectionNames = new Map<string, string[]>()
    for (const section of sections) {
      const name = typeof section.name === 'string' ? section.name : null
      const refs = Array.isArray(section.products) ? (section.products as Record<string, unknown>[]) : []
      for (const ref of refs) {
        const id = ref.id ?? ref.productId
        if (id === undefined || id === null || !name) continue
        const list = sectionNames.get(String(id)) || []
        if (!list.includes(name)) list.push(name)
        sectionNames.set(String(id), list)
      }
    }

    const toRecord = (p: Record<string, unknown>, categoryOverride?: string | null): ExternalProductRecord | null => {
      const id = p.id ?? p.productId
      if (id === undefined || id === null) return null
      const key = String(id)
      const status = String(p.status ?? '').toUpperCase()
      const priceRaw = p.sellingPrice ?? p.price
      const categories = sectionNames.get(key) || []
      return {
        externalProductId: key,
        externalSku: typeof p.sku === 'string' ? p.sku : null,
        name: String(p.name ?? ''),
        description: typeof p.description === 'string' ? p.description : null,
        price: typeof priceRaw === 'number' ? priceRaw : priceRaw ? Number(priceRaw) : null,
        quantity: null,
        available: status ? status === 'ACTIVE' : true,
        category: categoryOverride !== undefined ? categoryOverride : categories.length ? categories.join(', ') : null,
        rawPayload: { ...p, sections: categories },
      }
    }

    const byId = new Map<string, ExternalProductRecord>()

    // 1) Üst seviye ürün listesi (asıl kaynak)
    const fullProducts = topProducts.filter((p) => p.name !== undefined || p.sellingPrice !== undefined || p.price !== undefined)
    for (const p of fullProducts) {
      const rec = toRecord(p)
      if (rec && !byId.has(rec.externalProductId)) byId.set(rec.externalProductId, rec)
    }

    // 2) Üst seviye liste yoksa bölümlerin içinde tam ürün nesneleri olabilir (geriye dönük)
    if (byId.size === 0) {
      for (const section of sections) {
        const sectionName = typeof section.name === 'string' ? section.name : null
        const products = Array.isArray(section.products) ? (section.products as Record<string, unknown>[]) : []
        for (const p of products) {
          if (p.name === undefined && p.sellingPrice === undefined && p.price === undefined) continue
          const rec = toRecord(p, sectionName)
          if (!rec) continue
          const existing = byId.get(rec.externalProductId)
          if (existing) {
            if (sectionName && existing.category && !existing.category.split(', ').includes(sectionName)) existing.category = `${existing.category}, ${sectionName}`
            else if (sectionName && !existing.category) existing.category = sectionName
          } else {
            byId.set(rec.externalProductId, rec)
          }
        }
      }
    }

    return Array.from(byId.values())
  }

  /** PUT .../stores/{storeId}/products/{productId}/status { status: ACTIVE | PASSIVE } */
  async setProductAvailability(externalProductId: string, available: boolean): Promise<void> {
    await this.request<void>('PUT', `${this.storePath}/products/${encodeURIComponent(externalProductId)}/status`, {
      status: available ? 'ACTIVE' : 'PASSIVE',
    })
  }

  async getStoreStatus(): Promise<StoreStatus> {
    const store = this.findStore(await this.fetchStores())
    const status = String(store?.workingStatus || store?.status || '').toUpperCase()
    if (status === 'OPEN') return 'open'
    if (status === 'CLOSED') return 'closed'
    return 'unknown'
  }

  /** PUT /integrator/store/meal/suppliers/{supplierId}/stores/{storeId}/status { status: OPEN | CLOSED } */
  async setStoreStatus(status: Exclude<StoreStatus, 'unknown'>): Promise<void> {
    await this.request<void>(
      'PUT',
      `/integrator/store/meal/suppliers/${encodeURIComponent(this.creds.supplierId)}/stores/${encodeURIComponent(this.creds.storeId)}/status`,
      { status: status === 'open' ? 'OPEN' : 'CLOSED' }
    )
  }
}
