/**
 * Test ve geliştirme için sahte adapter. Gerçek platforma istek atmaz.
 */
import type { AdapterCapabilities, HealthCheckResult, MarketplacePlatform, StoreStatus } from '../types'
import { BaseAdapter } from './base'

export class MockAdapter extends BaseAdapter {
  constructor(
    readonly platform: MarketplacePlatform,
    readonly capabilities: AdapterCapabilities,
    private readonly outcome: HealthCheckResult['status'] = 'active'
  ) {
    super()
  }

  async healthCheck(): Promise<HealthCheckResult> {
    return { status: this.outcome, message: `mock ${this.outcome}`, checkedAt: new Date().toISOString() }
  }

  async getStoreStatus(): Promise<StoreStatus> {
    return 'open'
  }
}
