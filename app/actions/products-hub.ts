'use server'

/**
 * Ürünler sayfası (tek merkez): liste + QR fiyatı + satışta/tükendi + stok + kanal eşleşmeleri.
 * Özellik kapalıysa ilgili alanlar boş gelir ve arayüz o sütunları çizmez.
 */
import { createClient } from '@/lib/supabase/server'
import { resolveRestaurantContext } from '@/lib/auth/restaurant-context'
import { CONTENT_MANAGER_ROLES, OPERATIONS_ROLES, roleIn } from '@/lib/auth/roles'
import { hasFeature } from '@/lib/features'
import { getStockData, type StockChannel, type StockTransaction } from './stock'
import { getPlatformProductsData, type ExternalProductView, type LocalProductView, type PlatformSummary } from './platform-products'

// eslint-disable-next-line
type Row = Record<string, any>

export interface HubProduct {
  id: string
  name: string
  nameEn: string | null
  description: string | null
  descriptionEn: string | null
  price: number
  imageUrl: string | null
  isActive: boolean
  isFeatured: boolean
  isDailySpecial: boolean
  categoryId: string | null
  categoryName: string | null
  categoryNameEn: string | null
  // stok (özellik açıksa)
  isAvailable: boolean
  trackStock: boolean
  stockQuantity: number | null
  sku: string | null
  manualOverride: boolean
  stockChannels: StockChannel[]
  transactions: StockTransaction[]
  // kanallar (pazaryeri açıksa)
  local: LocalProductView
}

export interface HubCategory {
  id: string
  name: string
  nameEn: string | null
}

export interface ProductsHubData {
  restaurantId: string | null
  restaurantName: string
  canManage: boolean
  canOperate: boolean
  stockEnabled: boolean
  marketplaceEnabled: boolean
  stockSchemaReady: boolean
  marketplaceSchemaReady: boolean
  products: HubProduct[]
  categories: HubCategory[]
  platforms: PlatformSummary[]
  external: ExternalProductView[]
  error?: string
}

export async function getProductsHubData(): Promise<ProductsHubData> {
  const base: ProductsHubData = {
    restaurantId: null, restaurantName: '', canManage: false, canOperate: false,
    stockEnabled: false, marketplaceEnabled: false, stockSchemaReady: true, marketplaceSchemaReady: true,
    products: [], categories: [], platforms: [], external: [],
  }
  const result = await resolveRestaurantContext()
  if (!result.ok) return { ...base, error: result.error }
  const { ctx } = result
  base.restaurantId = ctx.restaurantId
  base.restaurantName = ctx.restaurant.name
  base.canManage = roleIn(ctx.role, CONTENT_MANAGER_ROLES)
  base.canOperate = roleIn(ctx.role, OPERATIONS_ROLES)
  base.stockEnabled = hasFeature(ctx.features, 'stock')
  base.marketplaceEnabled = hasFeature(ctx.features, 'marketplace')

  const supabase = await createClient()
  const [productsRes, categoriesRes, stock, platform] = await Promise.all([
    supabase.from('products').select('*, categories(id, name, name_en)').eq('restaurant_id', ctx.restaurantId).order('sort_order', { ascending: true }),
    supabase.from('categories').select('id, name, name_en').eq('restaurant_id', ctx.restaurantId).order('sort_order', { ascending: true }),
    base.stockEnabled ? getStockData() : Promise.resolve(null),
    base.marketplaceEnabled ? getPlatformProductsData() : Promise.resolve(null),
  ])
  if (productsRes.error) return { ...base, error: productsRes.error.message }

  if (stock) base.stockSchemaReady = stock.schemaReady
  if (platform) base.marketplaceSchemaReady = platform.schemaReady
  const stockById = new Map((stock?.products || []).map((p) => [p.id, p]))
  const localById = new Map((platform?.locals || []).map((l) => [l.id, l]))

  const products: HubProduct[] = ((productsRes.data || []) as Row[]).map((p) => {
    const st = stockById.get(p.id)
    const local = localById.get(p.id)
    const cat = (p.categories as Row | null) || null
    return {
      id: p.id,
      name: p.name,
      nameEn: p.name_en ?? null,
      description: p.description ?? null,
      descriptionEn: p.description_en ?? null,
      price: Number(p.price),
      imageUrl: p.image_url ?? null,
      isActive: Boolean(p.is_active),
      isFeatured: Boolean(p.is_featured),
      isDailySpecial: Boolean(p.is_daily_special),
      categoryId: p.category_id ?? null,
      categoryName: cat?.name ?? null,
      categoryNameEn: cat?.name_en ?? null,
      isAvailable: st ? st.isAvailable : p.is_available !== false,
      trackStock: st?.trackStock ?? Boolean(p.track_stock),
      stockQuantity: st?.stockQuantity ?? (p.stock_quantity ?? null),
      sku: st?.sku ?? (p.sku ?? null),
      manualOverride: st?.manualOverride ?? Boolean(p.availability_manual_override),
      stockChannels: st?.channels ?? [],
      transactions: st?.transactions ?? [],
      local: local ?? { id: p.id, name: p.name, price: Number(p.price), imageUrl: p.image_url ?? null, isActive: Boolean(p.is_active), categoryName: cat?.name ?? null, channels: {} },
    }
  })

  return {
    ...base,
    products,
    categories: ((categoriesRes.data || []) as Row[]).map((c) => ({ id: c.id, name: c.name, nameEn: c.name_en ?? null })),
    platforms: platform?.platforms ?? [],
    external: platform?.external ?? [],
  }
}
