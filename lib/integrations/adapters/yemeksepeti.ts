/**
 * Yemeksepeti (Delivery Hero Partner API) adapter'ı.
 *
 * Kaynak: developer.yemeksepeti.com (Partner Picking, Catalog API, Outlet Management).
 * Doğrulanan: POST /v2/oauth/token (client_id + client_secret, 2 saat Bearer),
 * GET/PUT /v2/chains/{chain_id}/status. Faz 3 kapsamı: sağlık kontrolü ve
 * mağaza durumu okuma. Sipariş/katalog metotları Faz 6'da.
 *
 * NOT: Token isteğinin gövdesi standart OAuth2 client_credentials olarak
 * gönderilir; Faz 6'da dokümandaki örnekle birebir teyit edilecek.
 */
import { IntegrationError, toSafeErrorMessage } from '../errors'
import { YEMEKSEPETI_CAPABILITIES } from '../capabilities'
import type { ExternalProductRecord, GetOrdersParams, HealthCheckResult, NormalizedOrder, NormalizedOrderStatus, StoreStatus } from '../types'
import { normalizeYemeksepetiOrder, yemeksepetiCancelBody, yemeksepetiCatalogBody, yemeksepetiStatusBody } from './yemeksepeti-orders'
import { BaseAdapter, type AdapterOptions } from './base'

export interface YemeksepetiCredentials {
  clientId: string
  clientSecret: string
  chainId: string
  vendorId: string
  baseUrl?: string
}

export const YEMEKSEPETI_DEFAULT_BASE_URL = 'https://yemeksepeti.partner.deliveryhero.io'

interface OutletStatusRecord {
  vendor_id?: string
  status?: string
  availability_state?: string
  closed_reason?: string
  [key: string]: unknown
}

export class YemeksepetiAdapter extends BaseAdapter {
  readonly platform = 'yemeksepeti' as const
  readonly capabilities = YEMEKSEPETI_CAPABILITIES
  private token: { value: string; expiresAt: number } | null = null

  constructor(private readonly creds: YemeksepetiCredentials, options: AdapterOptions = {}) {
    super(options)
  }

  get baseUrl(): string {
    return (this.creds.baseUrl || YEMEKSEPETI_DEFAULT_BASE_URL).replace(/\/+$/, '')
  }

  /** POST /v2/oauth/token */
  async getAccessToken(): Promise<string> {
    if (this.token && this.token.expiresAt > Date.now() + 60_000) return this.token.value

    const body = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: this.creds.clientId,
      client_secret: this.creds.clientSecret,
    })
    let response: Response
    try {
      response = await this.fetchWithTimeout(`${this.baseUrl}/v2/oauth/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
        body: body.toString(),
      })
    } catch (error) {
      throw new IntegrationError('network', `Yemeksepeti'ne ulaşılamadı: ${toSafeErrorMessage(error)}`)
    }
    const text = await response.text()
    if (response.status === 401 || response.status === 403 || response.status === 400) {
      throw new IntegrationError('auth', `Token alınamadı (HTTP ${response.status}). Client ID / Client Secret bilgisini kontrol edin: ${text.slice(0, 160)}`, { httpStatus: response.status })
    }
    if (!response.ok) {
      throw new IntegrationError('platform', `Yemeksepeti token hatası (HTTP ${response.status}): ${text.slice(0, 160)}`, { httpStatus: response.status })
    }
    let parsed: { access_token?: string; expires_in?: number }
    try {
      parsed = JSON.parse(text)
    } catch {
      throw new IntegrationError('platform', 'Yemeksepeti token yanıtı JSON değil')
    }
    if (!parsed.access_token) throw new IntegrationError('platform', 'Yemeksepeti yanıtında access_token yok')
    const ttl = (parsed.expires_in && parsed.expires_in > 0 ? parsed.expires_in : 7200) * 1000
    this.token = { value: parsed.access_token, expiresAt: Date.now() + ttl }
    return parsed.access_token
  }

  private async request<T>(method: 'GET' | 'PUT' | 'POST', path: string, body?: unknown): Promise<T> {
    const token = await this.getAccessToken()
    let response: Response
    try {
      response = await this.fetchWithTimeout(this.baseUrl + path, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: body === undefined ? undefined : JSON.stringify(body),
      })
    } catch (error) {
      throw new IntegrationError('network', `Yemeksepeti'ne ulaşılamadı: ${toSafeErrorMessage(error)}`)
    }
    const text = await response.text()
    if (response.status === 401 || response.status === 403) {
      throw new IntegrationError('auth', `Yetki hatası (HTTP ${response.status}): token geçerli ama bu chain_id için yetki yok olabilir.`, { httpStatus: response.status })
    }
    if (response.status === 404) {
      throw new IntegrationError('platform', `Kayıt bulunamadı (HTTP 404): chain_id / vendor_id bilgisini kontrol edin.`, { httpStatus: 404 })
    }
    if (response.status === 429) {
      throw new IntegrationError('rate_limited', 'Yemeksepeti istek limiti aşıldı.', { httpStatus: 429 })
    }
    if (!response.ok) {
      throw new IntegrationError('platform', `Yemeksepeti hata döndü (HTTP ${response.status}): ${text.slice(0, 200)}`, { httpStatus: response.status })
    }
    if (!text) return undefined as T
    try {
      return JSON.parse(text) as T
    } catch {
      throw new IntegrationError('platform', 'Yemeksepeti yanıtı JSON değil')
    }
  }

  /** GET /v2/chains/{chain_id}/status */
  private async fetchOutletStatuses(): Promise<OutletStatusRecord[]> {
    const data = await this.request<unknown>('GET', `/v2/chains/${encodeURIComponent(this.creds.chainId)}/status`)
    if (Array.isArray(data)) return data as OutletStatusRecord[]
    if (data && typeof data === 'object') {
      const obj = data as Record<string, unknown>
      for (const key of ['data', 'vendors', 'outlets', 'items']) {
        if (Array.isArray(obj[key])) return obj[key] as OutletStatusRecord[]
      }
      return [obj as OutletStatusRecord]
    }
    return []
  }

  private findVendor(records: OutletStatusRecord[]): OutletStatusRecord | undefined {
    return records.find((r) => String(r.vendor_id ?? '') === String(this.creds.vendorId)) ?? (records.length === 1 ? records[0] : undefined)
  }

  async healthCheck(): Promise<HealthCheckResult> {
    const checkedAt = new Date().toISOString()
    await this.getAccessToken()
    try {
      const records = await this.fetchOutletStatuses()
      const vendor = this.findVendor(records)
      if (!vendor) {
        return {
          status: 'warning',
          message: `Token alındı; ${records.length} mağaza listelendi ama vendor_id ${this.creds.vendorId} bulunamadı.`,
          details: { outletCount: records.length },
          checkedAt,
        }
      }
      const status = String(vendor.status || vendor.availability_state || 'bilinmiyor')
      return {
        status: 'active',
        message: `Bağlı: mağaza durumu ${status}`,
        details: { status, closedReason: vendor.closed_reason || null, outletCount: records.length },
        checkedAt,
      }
    } catch (error) {
      if (error instanceof IntegrationError && (error.code === 'auth' || error.code === 'platform')) {
        return { status: 'warning', message: `Token alındı ama mağaza durumu okunamadı: ${error.message}`, checkedAt }
      }
      throw error
    }
  }

  private get chainPath(): string {
    return `/v2/chains/${encodeURIComponent(this.creds.chainId)}`
  }

  /** GET /v2/chains/{chain}/orders/{order_id} (son 60 gün) */
  async getOrder(externalOrderId: string): Promise<NormalizedOrder | null> {
    const data = await this.request<Record<string, unknown>>('GET', `${this.chainPath}/orders/${encodeURIComponent(externalOrderId)}`)
    return data && typeof data === 'object' ? normalizeYemeksepetiOrder(data) : null
  }

  /** GET /v2/chains/{chain}/vendors/{vendor}?start_time&end_time&page_size&page */
  async getOrders(params: GetOrdersParams = {}): Promise<NormalizedOrder[]> {
    const pageSize = Math.min(100, params.pageSize ?? 50)
    const start = new Date(params.modifiedSince ?? Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const end = new Date().toISOString()
    const out: NormalizedOrder[] = []
    for (let page = params.page ?? 1; page <= 20; page++) {
      const qs = new URLSearchParams({ start_time: start, end_time: end, page_size: String(pageSize), page: String(page) })
      const data = await this.request<unknown>('GET', `${this.vendorPath}?${qs.toString()}`)
      let list: Record<string, unknown>[] = []
      if (Array.isArray(data)) list = data as Record<string, unknown>[]
      else if (data && typeof data === 'object') {
        const obj = data as Record<string, unknown>
        for (const key of ['orders', 'data', 'items']) if (Array.isArray(obj[key])) { list = obj[key] as Record<string, unknown>[]; break }
      }
      for (const o of list) out.push(normalizeYemeksepetiOrder(o))
      if (list.length < pageSize) break
    }
    return out
  }

  /** RECEIVED zaten onaylı sipariştir; platformda ayrı kabul yoktur (capability false). */

  /** PUT orders/{id} { status: 'CANCELLED', cancellation: { reason } } */
  async rejectOrder(externalOrderId: string, options: { reasonCode?: string } = {}): Promise<void> {
    await this.request<void>('PUT', `${this.chainPath}/orders/${encodeURIComponent(externalOrderId)}`, yemeksepetiCancelBody(options.reasonCode || 'ITEM_UNAVAILABLE'))
  }

  /** ready → READY_FOR_PICKUP; completed → DISPATCHED (kendi kuryesi); DELIVERED platformdan gelir */
  async updateOrderStatus(externalOrderId: string, status: NormalizedOrderStatus): Promise<void> {
    if (status === 'ready') {
      await this.request<void>('PUT', `${this.chainPath}/orders/${encodeURIComponent(externalOrderId)}`, yemeksepetiStatusBody('READY_FOR_PICKUP'))
    } else if (status === 'completed') {
      await this.request<void>('PUT', `${this.chainPath}/orders/${encodeURIComponent(externalOrderId)}`, yemeksepetiStatusBody('DISPATCHED'))
    }
  }

  /** PUT vendors/{vendor}/catalog { products: [{ sku, active }] } (async job) */
  async setProductAvailability(externalProductId: string, available: boolean): Promise<void> {
    await this.request<void>('PUT', `${this.vendorPath}/catalog`, yemeksepetiCatalogBody([{ sku: externalProductId, active: available }]))
  }

  async updatePrice(externalProductId: string, price: number): Promise<void> {
    await this.request<void>('PUT', `${this.vendorPath}/catalog`, yemeksepetiCatalogBody([{ sku: externalProductId, price: Math.round(price * 100) / 100 }]))
  }

  async updateStock(externalProductId: string, quantity: number): Promise<void> {
    await this.request<void>('PUT', `${this.vendorPath}/catalog`, yemeksepetiCatalogBody([{ sku: externalProductId, quantity: Math.max(0, Math.round(quantity)) }]))
  }

  private get vendorPath(): string {
    return `/v2/chains/${encodeURIComponent(this.creds.chainId)}/vendors/${encodeURIComponent(this.creds.vendorId)}`
  }

  /**
   * GET /v2/chains/{chain_id}/vendors/{vendor_id}/catalog?page_size&page&is_active
   * Ürün alanları: sku, barcode, title, price, active, quantity, status, category, images
   */
  async getProducts(): Promise<ExternalProductRecord[]> {
    const pageSize = 100
    const out: ExternalProductRecord[] = []
    for (let page = 1; page <= 50; page++) {
      const data = await this.request<unknown>('GET', `${this.vendorPath}/catalog?page_size=${pageSize}&page=${page}`)
      let items: Record<string, unknown>[] = []
      if (Array.isArray(data)) items = data as Record<string, unknown>[]
      else if (data && typeof data === 'object') {
        const obj = data as Record<string, unknown>
        for (const key of ['data', 'items', 'products', 'catalog']) {
          if (Array.isArray(obj[key])) { items = obj[key] as Record<string, unknown>[]; break }
        }
      }
      for (const p of items) {
        const sku = p.sku ?? p.remote_id ?? p.id
        if (sku === undefined || sku === null) continue
        const category = p.category
        const images = Array.isArray(p.images) ? (p.images as unknown[]) : []
        const firstImage = images.find((i) => typeof i === 'string') as string | undefined
        out.push({
          externalProductId: String(sku),
          externalSku: String(sku),
          name: String(p.title ?? p.name ?? ''),
          description: typeof p.description === 'string' ? p.description : null,
          price: typeof p.price === 'number' ? p.price : p.price ? Number(p.price) : null,
          quantity: typeof p.quantity === 'number' ? p.quantity : null,
          available: p.active === undefined ? String(p.status ?? '').toLowerCase() !== 'inactive' : Boolean(p.active),
          category: typeof category === 'string' ? category : category && typeof category === 'object' ? String((category as Record<string, unknown>).name ?? (category as Record<string, unknown>).title ?? '') || null : null,
          rawPayload: { ...p, image_url: firstImage ?? null },
        })
      }
      if (items.length < pageSize) break
    }
    return out
  }

  async getStoreStatus(): Promise<StoreStatus> {
    const vendor = this.findVendor(await this.fetchOutletStatuses())
    const status = String(vendor?.status || vendor?.availability_state || '').toUpperCase()
    if (status === 'OPEN') return 'open'
    if (status.startsWith('CLOSED')) return 'closed'
    return 'unknown'
  }
}
