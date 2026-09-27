import type { AdapterCapabilities, MarketplacePlatform } from './types'

/**
 * Yalnızca resmi dokümantasyonda DOĞRULANAN yetenekler true'dur.
 * Kaynaklar: plans/marketplace-architecture-plan.md bölüm G.
 */
export const TRENDYOL_GO_CAPABILITIES: AdapterCapabilities = {
  supportsProductRead: true, // GET .../stores/{storeId}/products
  supportsProductCreate: false, // Yemek menü entegrasyonunda create endpoint'i yok
  supportsProductUpdate: false,
  supportsPriceUpdate: true, // POST .../products/price (async batch)
  supportsAvailabilityUpdate: true, // PUT .../products/{productId}/status ACTIVE|PASSIVE
  supportsStockQuantity: false,
  supportsOrderRead: true, // GET .../packages (polling)
  supportsOrderAccept: true, // PUT .../packages/picked
  supportsOrderReject: true, // PUT .../packages/unsupplied
  supportsOrderStatusUpdate: true, // invoiced / manual-shipped / manual-delivered
  supportsWebhook: false, // yalnızca Hızlı Market için belgeli
  supportsStoreStatus: true, // PUT .../stores/{storeId}/status OPEN|CLOSED
  supportsManualShip: true, // yalnızca kendi kuryesi olan restoranlar
  notes: [
    'Ürünler Trendyol panelinde oluşturulur, burada eşleştirilir.',
    'Stok adedi yok; yalnızca satışta / tükendi.',
    'Siparişler 60 sn aralıkla çekilir (webhook yok).',
  ],
}

export const YEMEKSEPETI_CAPABILITIES: AdapterCapabilities = {
  supportsProductRead: true, // GET /catalog
  supportsProductCreate: false, // POST /catalog var ama Delivery Hero ekibi onayı gerekir; V1'de kapalı
  supportsProductUpdate: true, // PUT /catalog (price, active, quantity)
  supportsPriceUpdate: true,
  supportsAvailabilityUpdate: true,
  supportsStockQuantity: true, // PUT /catalog quantity
  supportsOrderRead: true, // GET /v2/chains/{chain}/orders/{id}, vendors/{vendor}
  supportsOrderAccept: false, // RECEIVED zaten onaylı sipariştir
  supportsOrderReject: true, // PUT orders/{id} CANCELLED
  supportsOrderStatusUpdate: true, // READY_FOR_PICKUP, DISPATCHED
  supportsWebhook: true, // zorunlu
  supportsStoreStatus: true, // PUT /v2/chains/{chain}/status
  supportsManualShip: true, // DISPATCHED (vendor delivery)
  notes: [
    'Ürün oluşturma Yemeksepeti panelinden yapılır; API ile oluşturma Delivery Hero onayı ister.',
    'Siparişler webhook ile gelir; webhook adresi Yemeksepeti tarafında tanımlanmalıdır.',
    'Hesabın "Local Shops" mı restoran programı mı olduğu Account Manager ile teyit edilmelidir.',
  ],
}

export const UNAVAILABLE_CAPABILITIES: AdapterCapabilities = {
  supportsProductRead: false,
  supportsProductCreate: false,
  supportsProductUpdate: false,
  supportsPriceUpdate: false,
  supportsAvailabilityUpdate: false,
  supportsStockQuantity: false,
  supportsOrderRead: false,
  supportsOrderAccept: false,
  supportsOrderReject: false,
  supportsOrderStatusUpdate: false,
  supportsWebhook: false,
  supportsStoreStatus: false,
  supportsManualShip: false,
  notes: ['Bu platform için adapter henüz yok.'],
}

export const PLATFORM_CAPABILITIES: Record<MarketplacePlatform, AdapterCapabilities> = {
  trendyol_food: TRENDYOL_GO_CAPABILITIES,
  yemeksepeti: YEMEKSEPETI_CAPABILITIES,
  getir_food: UNAVAILABLE_CAPABILITIES,
  migros_food: UNAVAILABLE_CAPABILITIES,
}
