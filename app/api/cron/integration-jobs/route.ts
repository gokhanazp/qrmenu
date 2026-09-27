import { NextResponse } from 'next/server'
import { enqueueHealthChecks, processPendingJobs } from '@/lib/integrations/jobs'
import { pollAllActiveIntegrations } from '@/lib/orders/sync'

export const dynamic = 'force-dynamic'

/**
 * Periyodik iş çalıştırıcı. Vercel Cron veya harici bir zamanlayıcı
 * `Authorization: Bearer $CRON_SECRET` ile çağırır.
 *
 * vercel.json örneği (plan limitine göre sıklığı ayarlayın):
 *   "crons": [{ "path": "/api/cron/integration-jobs", "schedule": "*\/15 * * * *" }]
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET
  if (!secret) {
    return NextResponse.json({ error: 'CRON_SECRET tanımlı değil' }, { status: 503 })
  }
  if (request.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const enqueued = await enqueueHealthChecks({ olderThanMinutes: 15 })
    const summary = await processPendingJobs({ limit: 20 })
    const polls = await pollAllActiveIntegrations()
    return NextResponse.json({ ok: true, enqueuedHealthChecks: enqueued, ...summary, polls })
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : String(error) }, { status: 500 })
  }
}
