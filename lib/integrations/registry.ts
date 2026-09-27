import { NotImplementedError } from './errors'
import type { FoodPlatformAdapter, IntegrationEnvironment, MarketplacePlatform } from './types'
import { PLATFORM_LABELS } from './types'
import type { AdapterOptions } from './adapters/base'
import { TrendyolGoAdapter, type TrendyolGoCredentials } from './adapters/trendyol-go'
import { YemeksepetiAdapter, type YemeksepetiCredentials } from './adapters/yemeksepeti'

export function createAdapter(
  platform: MarketplacePlatform,
  credentials: Record<string, string>,
  environment: IntegrationEnvironment,
  options: AdapterOptions = {}
): FoodPlatformAdapter {
  switch (platform) {
    case 'trendyol_food':
      return new TrendyolGoAdapter(credentials as unknown as TrendyolGoCredentials, environment, options)
    case 'yemeksepeti':
      return new YemeksepetiAdapter(credentials as unknown as YemeksepetiCredentials, options)
    default:
      throw new NotImplementedError(`${PLATFORM_LABELS[platform]} adapter'ı`)
  }
}
