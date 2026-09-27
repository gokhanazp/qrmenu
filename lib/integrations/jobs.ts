/**
 * Basit iş kuyruğu (sunucu). Bugün: aynı süreçte çalışan runner + cron.
 * Yarın: aynı tablo üzerinden ayrı bir worker/queue.
 */
import { getResolvedIntegration, integrationServiceClient, runHealthCheck } from './service'
import { IntegrationError, toSafeErrorMessage } from './errors'
import { createAdapter } from './registry'

type Row = Record<string, any>

export type IntegrationJobType =
  | 'health_check'
  | 'import_products'
  | 'sync_stock'
  | 'sync_availability'
  | 'sync_price'
  | 'order_status_update'
  | 'poll_orders'

export interface EnqueueJobInput {
  tenantId: string
  restaurantId: string
  integrationId: string | null
  type: IntegrationJobType
  payload?: Record<string, unknown>
  runAfter?: Date
  /** Aynı entegrasyon + tip için bekleyen iş varsa yenisini ekleme */
  dedupe?: boolean
}

export async function enqueueJob(input: EnqueueJobInput): Promise<{ id: string | null; skipped: boolean }> {
  const sb = integrationServiceClient()
  if (input.dedupe && input.integrationId) {
    const { data: existing } = await sb
      .from('integration_jobs')
      .select('id')
      .eq('integration_id', input.integrationId)
      .eq('type', input.type)
      .eq('status', 'pending')
      .limit(1)
    if (existing && existing.length > 0) return { id: (existing[0] as Row).id, skipped: true }
  }
  const { data, error } = await sb
    .from('integration_jobs')
    .insert({
      tenant_id: input.tenantId,
      restaurant_id: input.restaurantId,
      integration_id: input.integrationId,
      type: input.type,
      payload: input.payload || {},
      run_after: (input.runAfter || new Date()).toISOString(),
    } as never)
    .select('id')
    .single()
  if (error) throw new Error(error.message)
  return { id: (data as Row).id, skipped: false }
}

type JobHandler = (job: Row) => Promise<Record<string, unknown>>

const handlers: Partial<Record<IntegrationJobType, JobHandler>> = {
  health_check: async (job) => {
    if (!job.integration_id) throw new Error('integration_id yok')
    const result = await runHealthCheck(job.integration_id)
    return { status: result.status, message: result.message }
  },
  // payload: { productId, linkId, externalProductId, available }
  sync_availability: async (job) => {
    if (!job.integration_id) throw new Error('integration_id yok')
    const payload = (job.payload || {}) as Row
    const externalProductId = String(payload.externalProductId || '')
    if (!externalProductId) throw new Error('externalProductId yok')
    const resolved = await getResolvedIntegration(job.integration_id)
    if (!resolved) throw new IntegrationError('config', 'Entegrasyon bulunamadı')
    if (resolved.status !== 'active') throw new IntegrationError('config', 'Entegrasyon devre dışı')
    const adapter = createAdapter(resolved.platform, resolved.credentials, resolved.environment)
    const available = Boolean(payload.available)
    await adapter.setProductAvailability(externalProductId, available)
    const sb = integrationServiceClient()
    await sb.from('external_products').update({ available } as never).eq('integration_id', resolved.id).eq('external_product_id', externalProductId)
    await sb.from('integrations').update({ last_successful_sync_at: new Date().toISOString() } as never).eq('id', resolved.id)
    return { externalProductId, available }
  },
  // payload: { productId, linkId, externalProductId, price }
  sync_price: async (job) => {
    if (!job.integration_id) throw new Error('integration_id yok')
    const payload = (job.payload || {}) as Row
    const externalProductId = String(payload.externalProductId || '')
    const price = Number(payload.price)
    if (!externalProductId || !Number.isFinite(price) || price < 0) throw new Error('Geçersiz fiyat/ürün')
    const resolved = await getResolvedIntegration(job.integration_id)
    if (!resolved) throw new IntegrationError('config', 'Entegrasyon bulunamadı')
    if (resolved.status !== 'active') throw new IntegrationError('config', 'Entegrasyon devre dışı')
    const adapter = createAdapter(resolved.platform, resolved.credentials, resolved.environment)
    await adapter.updatePrice(externalProductId, price)
    const sb = integrationServiceClient()
    await sb.from('external_products').update({ price } as never).eq('integration_id', resolved.id).eq('external_product_id', externalProductId)
    await sb.from('integrations').update({ last_successful_sync_at: new Date().toISOString() } as never).eq('id', resolved.id)
    return { externalProductId, price }
  },
}

/**
 * Tek bir işi hemen çalıştırır (kuyruğu beklemeden). Sonucu ve hatayı döner;
 * fırlatmaz. Retry/backoff processPendingJobs ile aynı kurallara tabidir.
 */
export async function runJob(jobId: string): Promise<{ status: 'completed' | 'failed' | 'pending' | 'skipped'; error?: string; result?: Record<string, unknown> }> {
  const sb = integrationServiceClient()
  const { data: rows } = await sb.from('integration_jobs').select('*').eq('id', jobId).limit(1)
  const job = (rows || [])[0] as Row | undefined
  if (!job) return { status: 'skipped', error: 'İş bulunamadı' }
  return executeJob(sb, job)
}

async function executeJob(
  sb: ReturnType<typeof integrationServiceClient>,
  job: Row
): Promise<{ status: 'completed' | 'failed' | 'pending' | 'skipped'; error?: string; result?: Record<string, unknown> }> {
  const { data: claimed } = await sb
    .from('integration_jobs')
    .update({ status: 'running', started_at: new Date().toISOString() } as never)
    .eq('id', job.id)
    .eq('status', 'pending')
    .select('id')
  if (!claimed || claimed.length === 0) return { status: 'skipped', error: 'İş başka bir çalıştırıcı tarafından alındı' }

  const handler = handlers[job.type as IntegrationJobType]
  const attempt = (job.attempt_count || 0) + 1
  try {
    if (!handler) throw new Error(`İş tipi için handler yok: ${job.type}`)
    const result = await handler(job)
    await sb
      .from('integration_jobs')
      .update({ status: 'completed', result, attempt_count: attempt, processed_at: new Date().toISOString(), last_error: null } as never)
      .eq('id', job.id)
    return { status: 'completed', result }
  } catch (err) {
    const message = toSafeErrorMessage(err)
    // Desteklenmeyen/uygulanmamış işlemde tekrar denemenin anlamı yok
    const permanent = err instanceof IntegrationError && (err.code === 'not_supported' || err.code === 'not_implemented' || err.code === 'config')
    const exhausted = permanent || attempt >= (job.max_attempts || 5) || !handler
    const backoffMinutes = Math.min(60, 2 ** attempt)
    await sb
      .from('integration_jobs')
      .update({
        status: exhausted ? 'failed' : 'pending',
        attempt_count: attempt,
        last_error: message,
        processed_at: exhausted ? new Date().toISOString() : null,
        run_after: exhausted ? job.run_after : new Date(Date.now() + backoffMinutes * 60_000).toISOString(),
      } as never)
      .eq('id', job.id)
    return { status: exhausted ? 'failed' : 'pending', error: message }
  }
}

/**
 * Bekleyen işleri çalıştırır. Aynı işi iki runner'ın almaması için
 * pending → running geçişi koşullu UPDATE ile yapılır.
 */
export async function processPendingJobs(options: { limit?: number } = {}): Promise<{ processed: number; completed: number; failed: number }> {
  const sb = integrationServiceClient()
  const limit = options.limit ?? 10
  const nowIso = new Date().toISOString()
  const { data: jobs, error } = await sb
    .from('integration_jobs')
    .select('*')
    .eq('status', 'pending')
    .lte('run_after', nowIso)
    .order('created_at', { ascending: true })
    .limit(limit)
  if (error) throw new Error(error.message)

  let processed = 0
  let completed = 0
  let failed = 0

  for (const job of (jobs || []) as Row[]) {
    const outcome = await executeJob(sb, job)
    if (outcome.status === 'skipped') continue
    processed++
    if (outcome.status === 'completed') completed++
    if (outcome.status === 'failed') failed++
  }

  return { processed, completed, failed }
}

/** Aktif entegrasyonlar için periyodik sağlık kontrolü işi ekler. */
export async function enqueueHealthChecks(options: { olderThanMinutes?: number } = {}): Promise<number> {
  const sb = integrationServiceClient()
  const threshold = new Date(Date.now() - (options.olderThanMinutes ?? 15) * 60_000).toISOString()
  const { data, error } = await sb
    .from('integrations')
    .select('id, tenant_id, restaurant_id, last_health_check_at')
    .eq('status', 'active')
  if (error) throw new Error(error.message)
  let count = 0
  for (const row of (data || []) as Row[]) {
    if (row.last_health_check_at && row.last_health_check_at > threshold) continue
    const { skipped } = await enqueueJob({
      tenantId: row.tenant_id,
      restaurantId: row.restaurant_id,
      integrationId: row.id,
      type: 'health_check',
      dedupe: true,
    })
    if (!skipped) count++
  }
  return count
}
