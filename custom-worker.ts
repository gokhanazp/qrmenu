/**
 * Cloudflare Worker giriş noktası.
 *
 * OpenNext'in ürettiği worker'ı (.open-next/worker.js) sarar ve üzerine bir
 * `scheduled` handler ekler. Vercel Cron'un yaptığı işi Cloudflare Cron
 * Trigger'ı yapar (zamanlama wrangler.jsonc > triggers.crons).
 *
 * Cron tetiklenince mevcut /api/cron/integration-jobs route'u, dışarıya hiç
 * çıkmadan doğrudan worker içinde CRON_SECRET ile çağrılır.
 */
// @ts-ignore `.open-next/worker.js` build sırasında üretilir
import { default as handler } from './.open-next/worker.js'

interface Env {
  CRON_SECRET?: string
  NEXT_PUBLIC_SITE_URL?: string
  [key: string]: unknown
}

export default {
  fetch: handler.fetch,

  async scheduled(_event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
    if (!env.CRON_SECRET) {
      console.error('[cron] CRON_SECRET tanımlı değil, iş atlandı')
      return
    }
    const base = env.NEXT_PUBLIC_SITE_URL || 'https://www.qrmenulist.com'
    const request = new Request(new URL('/api/cron/integration-jobs', base), {
      headers: { authorization: `Bearer ${env.CRON_SECRET}` },
    })
    const response: Response = await handler.fetch(request, env, ctx)
    const body = await response.text()
    if (!response.ok) {
      console.error(`[cron] integration-jobs ${response.status}: ${body.slice(0, 500)}`)
    } else {
      console.log(`[cron] integration-jobs ok: ${body.slice(0, 500)}`)
    }
  },
}
