import { NextResponse } from 'next/server'
import { createHash, timingSafeEqual } from 'node:crypto'
import { getResolvedIntegration } from '@/lib/integrations/service'
import { normalizeYemeksepetiOrder } from '@/lib/integrations/adapters/yemeksepeti-orders'
import { upsertPlatformOrder } from '@/lib/orders/sync'

export const dynamic = 'force-dynamic'

/**
 * Yemeksepeti sipariş webhook'u.
 * URL: /api/webhooks/yemeksepeti/{integrationId}?token={webhook_token}
 * Token entegrasyon kaydedilirken üretilir ve Entegrasyonlar sayfasında gösterilir;
 * Yemeksepeti tarafına bu adres tanımlanır. Başlık alternatifi: x-webhook-token.
 *
 * İşleme sırası: entegrasyon → token → olay idempotency (integration_events)
 * → normalize → orders upsert → (RECEIVED ise) stok düşümü.
 */
function tokenMatches(expected: string | undefined, provided: string | null): boolean {
  if (!expected || !provided) return false
  const a = createHash('sha256').update(expected).digest()
  const b = createHash('sha256').update(provided).digest()
  return timingSafeEqual(a, b)
}

export async function GET() {
  // Bazı platformlar adresi GET ile doğrular
  return NextResponse.json({ ok: true })
}

export async function POST(request: Request, { params }: { params: { integrationId: string } }) {
  const integration = await getResolvedIntegration(params.integrationId).catch(() => null)
  if (!integration || integration.platform !== 'yemeksepeti') {
    return NextResponse.json({ error: 'not_found' }, { status: 404 })
  }
  const url = new URL(request.url)
  const provided = url.searchParams.get('token') || request.headers.get('x-webhook-token')
  if (!tokenMatches(integration.config.webhook_token as string | undefined, provided)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }
  if (integration.status !== 'active') {
    return NextResponse.json({ ok: true, ignored: 'integration_disabled' })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }
  if (!body || typeof body !== 'object') return NextResponse.json({ error: 'invalid_payload' }, { status: 400 })

  const normalized = normalizeYemeksepetiOrder(body as Record<string, unknown>)
  if (!normalized.externalOrderId || normalized.externalOrderId === 'undefined') {
    return NextResponse.json({ error: 'order_id_missing' }, { status: 400 })
  }

  try {
    const result = await upsertPlatformOrder(integration, normalized)
    return NextResponse.json({ ok: true, orderId: result.orderId, created: result.created, skipped: result.skipped })
  } catch (error) {
    console.error('yemeksepeti webhook error:', error)
    return NextResponse.json({ error: 'processing_failed' }, { status: 500 })
  }
}
