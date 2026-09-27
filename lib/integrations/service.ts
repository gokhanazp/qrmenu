/**
 * Entegrasyon servisi (sunucu). credentials_encrypted kolonuna yalnızca burası
 * (service role) dokunur. Çağıran taraf rol kontrolünü YAPMIŞ olmalıdır.
 */
import { createClient as createAdminClient, type SupabaseClient } from '@supabase/supabase-js'
import { randomBytes } from 'node:crypto'
import type { Database } from '@/lib/supabase/types'
import { decryptJson, encryptJson } from './crypto'
import { IntegrationError, toSafeErrorMessage } from './errors'
import { extractExternalIds, maskCredentials } from './credentials'
import { createAdapter } from './registry'
import type { HealthCheckResult, HealthStatus, IntegrationEnvironment, MarketplacePlatform, ResolvedIntegration } from './types'

type Row = Record<string, any>

export function integrationServiceClient(): SupabaseClient<Database> {
  return createAdminClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

function toResolved(row: Row): ResolvedIntegration {
  let credentials: Record<string, string> = {}
  if (row.credentials_encrypted) {
    credentials = decryptJson<Record<string, string>>(row.credentials_encrypted)
  }
  return {
    id: row.id,
    tenantId: row.tenant_id,
    restaurantId: row.restaurant_id,
    platform: row.platform,
    status: row.status,
    environment: row.environment,
    credentials,
    config: (row.config as Record<string, unknown>) || {},
  }
}

export async function getResolvedIntegration(integrationId: string): Promise<ResolvedIntegration | null> {
  const sb = integrationServiceClient()
  const { data, error } = await sb.from('integrations').select('*').eq('id', integrationId).maybeSingle()
  if (error) throw new IntegrationError('platform', error.message)
  return data ? toResolved(data as Row) : null
}

export async function getResolvedIntegrationByRestaurant(
  restaurantId: string,
  platform: MarketplacePlatform
): Promise<ResolvedIntegration | null> {
  const sb = integrationServiceClient()
  const { data, error } = await sb
    .from('integrations')
    .select('*')
    .eq('restaurant_id', restaurantId)
    .eq('platform', platform)
    .maybeSingle()
  if (error) throw new IntegrationError('platform', error.message)
  return data ? toResolved(data as Row) : null
}

export interface UpsertIntegrationInput {
  restaurantId: string
  platform: MarketplacePlatform
  environment: IntegrationEnvironment
  credentials: Record<string, string>
  updatedBy: string
}

export async function upsertIntegration(input: UpsertIntegrationInput): Promise<{ id: string }> {
  const sb = integrationServiceClient()
  const encrypted = encryptJson(input.credentials)
  const ids = extractExternalIds(input.platform, input.credentials)
  const meta = {
    fields: maskCredentials(input.platform, input.credentials),
    updated_at: new Date().toISOString(),
    updated_by: input.updatedBy,
  }
  // Mevcut config korunur (last_poll_at, webhook_token vb.)
  const { data: existingRow } = await sb.from('integrations').select('config').eq('restaurant_id', input.restaurantId).eq('platform', input.platform).maybeSingle()
  const config: Record<string, unknown> = { ...(((existingRow as Row | null)?.config as Record<string, unknown>) || {}) }
  if (input.platform === 'yemeksepeti' && !config.webhook_token) {
    config.webhook_token = randomBytes(24).toString('hex')
  }
  const { data, error } = await sb
    .from('integrations')
    .upsert(
      {
        restaurant_id: input.restaurantId,
        platform: input.platform,
        environment: input.environment,
        credentials_encrypted: encrypted,
        credentials_meta: meta,
        external_chain_id: ids.chainId,
        external_store_id: ids.storeId,
        config,
        status: 'active',
        health_status: 'warning',
        last_error: null,
      } as never,
      { onConflict: 'restaurant_id,platform' }
    )
    .select('id')
    .single()
  if (error) throw new IntegrationError('platform', error.message)
  return { id: (data as Row).id }
}

export async function setIntegrationStatus(integrationId: string, status: 'active' | 'disabled'): Promise<void> {
  const sb = integrationServiceClient()
  const patch: Row = { status }
  if (status === 'disabled') patch.health_status = 'disabled'
  else patch.health_status = 'warning'
  const { error } = await sb.from('integrations').update(patch as never).eq('id', integrationId)
  if (error) throw new IntegrationError('platform', error.message)
}

export async function deleteIntegration(integrationId: string): Promise<void> {
  const sb = integrationServiceClient()
  const { error } = await sb.from('integrations').delete().eq('id', integrationId)
  if (error) throw new IntegrationError('platform', error.message)
}

/**
 * Bağlantı testi: adapter.healthCheck() çalıştırır, sonucu satıra yazar.
 * Hata fırlatmaz; her durumda bir HealthCheckResult döner.
 */
export async function runHealthCheck(integrationId: string, options: { actorEmail?: string } = {}): Promise<HealthCheckResult> {
  const sb = integrationServiceClient()
  const checkedAt = new Date().toISOString()
  let result: HealthCheckResult

  try {
    const resolved = await getResolvedIntegration(integrationId)
    if (!resolved) throw new IntegrationError('config', 'Entegrasyon bulunamadı')
    if (resolved.status === 'disabled') {
      return { status: 'warning', message: 'Entegrasyon devre dışı', checkedAt }
    }
    if (Object.keys(resolved.credentials).length === 0) {
      throw new IntegrationError('config', 'Kimlik bilgileri girilmemiş')
    }
    const adapter = createAdapter(resolved.platform, resolved.credentials, resolved.environment, { actorEmail: options.actorEmail })
    result = await adapter.healthCheck()
  } catch (error) {
    result = { status: 'error', message: toSafeErrorMessage(error), checkedAt }
  }

  const patch: Row = {
    health_status: result.status as HealthStatus,
    last_health_check_at: result.checkedAt,
    last_error: result.status === 'active' ? null : result.message,
  }
  if (result.status === 'active') patch.last_successful_sync_at = result.checkedAt
  await sb.from('integrations').update(patch as never).eq('id', integrationId)

  return result
}
