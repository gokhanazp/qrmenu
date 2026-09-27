'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { isMissingSchemaError, resolveRestaurantContext } from '@/lib/auth/restaurant-context'
import { INTEGRATION_MANAGER_ROLES, roleIn } from '@/lib/auth/roles'
import { hasFeature, type FeatureKey } from '@/lib/features'
import { PLATFORM_CAPABILITIES } from '@/lib/integrations/capabilities'
import {
  PLATFORM_CREDENTIAL_FIELDS,
  PLATFORM_ENVIRONMENTS,
  isMarketplacePlatform,
  validateCredentials,
  type CredentialField,
} from '@/lib/integrations/credentials'
import { toSafeErrorMessage } from '@/lib/integrations/errors'
import {
  deleteIntegration,
  getResolvedIntegrationByRestaurant,
  runHealthCheck,
  setIntegrationStatus,
  upsertIntegration,
} from '@/lib/integrations/service'
import {
  AVAILABLE_PLATFORMS,
  PLATFORM_LABELS,
  type AdapterCapabilities,
  type HealthCheckResult,
  type HealthStatus,
  type IntegrationEnvironment,
  type IntegrationStatus,
  type MarketplacePlatform,
} from '@/lib/integrations/types'

type Row = Record<string, any>

export interface PanelIntegrationRow {
  id: string
  status: IntegrationStatus
  healthStatus: HealthStatus
  environment: IntegrationEnvironment
  masked: Record<string, string>
  externalChainId: string | null
  externalStoreId: string | null
  lastHealthCheckAt: string | null
  lastSuccessfulSyncAt: string | null
  lastError: string | null
  updatedAt: string
  /** Yemeksepeti: platforma tanımlanacak webhook adresi */
  webhookUrl: string | null
  lastPollAt: string | null
}

export interface PanelIntegration {
  platform: MarketplacePlatform
  label: string
  featureEnabled: boolean
  capabilities: AdapterCapabilities
  environments: IntegrationEnvironment[]
  fields: CredentialField[]
  integration: PanelIntegrationRow | null
}

export interface PanelIntegrationsData {
  restaurantName: string
  canManage: boolean
  marketplaceEnabled: boolean
  schemaReady: boolean
  secretKeyConfigured: boolean
  platforms: PanelIntegration[]
  error?: string
}

function toPanelRow(row: Row): PanelIntegrationRow {
  const meta = (row.credentials_meta || {}) as { fields?: Record<string, string> }
  return {
    id: row.id,
    status: row.status,
    healthStatus: row.health_status,
    environment: row.environment,
    masked: meta.fields || {},
    externalChainId: row.external_chain_id ?? null,
    externalStoreId: row.external_store_id ?? null,
    lastHealthCheckAt: row.last_health_check_at ?? null,
    lastSuccessfulSyncAt: row.last_successful_sync_at ?? null,
    lastError: row.last_error ?? null,
    updatedAt: row.updated_at,
    webhookUrl: row.platform === 'yemeksepeti' && (row.config as Row | null)?.webhook_token
      ? `${(process.env.NEXT_PUBLIC_SITE_URL || '').replace(/\/+$/, '')}/api/webhooks/yemeksepeti/${row.id}?token=${(row.config as Row).webhook_token}`
      : null,
    lastPollAt: ((row.config as Row | null)?.last_poll_at as string | undefined) ?? null,
  }
}

export async function getPanelIntegrations(): Promise<PanelIntegrationsData> {
  const empty: PanelIntegrationsData = {
    restaurantName: '',
    canManage: false,
    marketplaceEnabled: false,
    schemaReady: true,
    secretKeyConfigured: Boolean(process.env.INTEGRATION_SECRET_KEY),
    platforms: [],
  }
  const result = await resolveRestaurantContext()
  if (!result.ok) return { ...empty, error: result.error }
  const { ctx } = result

  const supabase = await createClient()
  // credentials_encrypted bu rolde SELECT yetkisine sahip değil; kolonlar açıkça listelenir.
  const { data, error } = await supabase
    .from('integrations')
    .select('id, restaurant_id, platform, status, health_status, environment, external_chain_id, external_store_id, credentials_meta, config, last_health_check_at, last_successful_sync_at, last_error, created_at, updated_at')
    .eq('restaurant_id', ctx.restaurantId)

  let schemaReady = true
  const byPlatform = new Map<string, Row>()
  if (error) {
    if (isMissingSchemaError(error)) schemaReady = false
    else return { ...empty, restaurantName: ctx.restaurant.name, error: error.message }
  } else {
    for (const row of (data || []) as Row[]) byPlatform.set(row.platform, row)
  }

  return {
    restaurantName: ctx.restaurant.name,
    canManage: roleIn(ctx.role, INTEGRATION_MANAGER_ROLES),
    marketplaceEnabled: hasFeature(ctx.features, 'marketplace'),
    schemaReady,
    secretKeyConfigured: Boolean(process.env.INTEGRATION_SECRET_KEY),
    platforms: AVAILABLE_PLATFORMS.map((platform) => {
      const row = byPlatform.get(platform)
      return {
        platform,
        label: PLATFORM_LABELS[platform],
        featureEnabled: hasFeature(ctx.features, platform as FeatureKey),
        capabilities: PLATFORM_CAPABILITIES[platform],
        environments: PLATFORM_ENVIRONMENTS[platform],
        fields: PLATFORM_CREDENTIAL_FIELDS[platform],
        integration: row ? toPanelRow(row) : null,
      }
    }),
  }
}

interface ManageResult {
  ok: true
  restaurantId: string
  tenantId: string | null
  actorEmail: string | undefined
}

async function requireIntegrationManager(platform: string): Promise<ManageResult | { ok: false; error: string }> {
  if (!isMarketplacePlatform(platform)) return { ok: false, error: 'Geçersiz platform' }
  const result = await resolveRestaurantContext()
  if (!result.ok) return { ok: false, error: result.error }
  const { ctx } = result
  if (!roleIn(ctx.role, INTEGRATION_MANAGER_ROLES)) return { ok: false, error: 'Entegrasyon ayarları için sahip veya yönetici yetkisi gerekir' }
  if (!hasFeature(ctx.features, 'marketplace')) return { ok: false, error: 'Pazaryeri özelliği bu restoranda açık değil' }
  if (!hasFeature(ctx.features, platform as FeatureKey)) return { ok: false, error: `${PLATFORM_LABELS[platform]} özelliği bu restoranda açık değil` }
  return { ok: true, restaurantId: ctx.restaurantId, tenantId: ctx.tenantId, actorEmail: ctx.userEmail ?? undefined }
}

export async function saveIntegration(input: {
  platform: string
  environment?: string
  credentials: Record<string, unknown>
}): Promise<{ success: boolean; error?: string; fieldErrors?: Record<string, string>; health?: HealthCheckResult }> {
  const access = await requireIntegrationManager(input.platform)
  if (!access.ok) return { success: false, error: access.error }
  const platform = input.platform as MarketplacePlatform

  if (!process.env.INTEGRATION_SECRET_KEY) {
    return { success: false, error: 'Sunucuda INTEGRATION_SECRET_KEY tanımlı değil; kimlik bilgileri şifrelenemez.' }
  }

  const environment: IntegrationEnvironment =
    input.environment === 'stage' && PLATFORM_ENVIRONMENTS[platform].includes('stage') ? 'stage' : 'production'

  try {
    const existing = await getResolvedIntegrationByRestaurant(access.restaurantId, platform)
    const validation = validateCredentials(platform, input.credentials || {}, existing?.credentials)
    if (!validation.ok) return { success: false, error: 'Eksik veya hatalı alanlar var', fieldErrors: validation.errors }

    const { id } = await upsertIntegration({
      restaurantId: access.restaurantId,
      platform,
      environment,
      credentials: validation.values,
      updatedBy: access.actorEmail || 'panel',
    })
    const health = await runHealthCheck(id, { actorEmail: access.actorEmail })
    revalidatePath('/panel/integrations')
    return { success: true, health }
  } catch (error) {
    return { success: false, error: toSafeErrorMessage(error) }
  }
}

export async function testIntegration(input: { platform: string }): Promise<{ success: boolean; error?: string; health?: HealthCheckResult }> {
  const access = await requireIntegrationManager(input.platform)
  if (!access.ok) return { success: false, error: access.error }
  try {
    const existing = await getResolvedIntegrationByRestaurant(access.restaurantId, input.platform as MarketplacePlatform)
    if (!existing) return { success: false, error: 'Önce kimlik bilgilerini kaydedin' }
    const health = await runHealthCheck(existing.id, { actorEmail: access.actorEmail })
    revalidatePath('/panel/integrations')
    return { success: true, health }
  } catch (error) {
    return { success: false, error: toSafeErrorMessage(error) }
  }
}

export async function toggleIntegration(input: { platform: string; status: 'active' | 'disabled' }): Promise<{ success: boolean; error?: string }> {
  const access = await requireIntegrationManager(input.platform)
  if (!access.ok) return { success: false, error: access.error }
  try {
    const existing = await getResolvedIntegrationByRestaurant(access.restaurantId, input.platform as MarketplacePlatform)
    if (!existing) return { success: false, error: 'Entegrasyon bulunamadı' }
    await setIntegrationStatus(existing.id, input.status)
    revalidatePath('/panel/integrations')
    return { success: true }
  } catch (error) {
    return { success: false, error: toSafeErrorMessage(error) }
  }
}

export async function removeIntegration(input: { platform: string }): Promise<{ success: boolean; error?: string }> {
  const access = await requireIntegrationManager(input.platform)
  if (!access.ok) return { success: false, error: access.error }
  try {
    const existing = await getResolvedIntegrationByRestaurant(access.restaurantId, input.platform as MarketplacePlatform)
    if (!existing) return { success: true }
    await deleteIntegration(existing.id)
    revalidatePath('/panel/integrations')
    return { success: true }
  } catch (error) {
    return { success: false, error: toSafeErrorMessage(error) }
  }
}
