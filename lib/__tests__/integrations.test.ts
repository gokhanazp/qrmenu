import { beforeAll, describe, expect, it } from 'vitest'
import { decryptJson, encryptJson, generateIntegrationKey } from '@/lib/integrations/crypto'
import { extractExternalIds, maskCredentials, validateCredentials, MASK } from '@/lib/integrations/credentials'
import { PLATFORM_CAPABILITIES } from '@/lib/integrations/capabilities'
import { IntegrationError, NotImplementedError, NotSupportedError } from '@/lib/integrations/errors'
import { buildTrendyolHeaders, TrendyolGoAdapter } from '@/lib/integrations/adapters/trendyol-go'
import { YemeksepetiAdapter, YEMEKSEPETI_DEFAULT_BASE_URL } from '@/lib/integrations/adapters/yemeksepeti'
import { MockAdapter } from '@/lib/integrations/adapters/mock'

const TY_CREDS = { supplierId: '1234', apiKey: 'key', apiSecret: 'secret', storeId: '777' }

function fakeFetch(handler: (url: string, init?: RequestInit) => { status: number; body?: unknown }): typeof fetch {
  return (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url
    const r = handler(url, init)
    return new Response(r.body === undefined ? '' : JSON.stringify(r.body), { status: r.status, headers: { 'Content-Type': 'application/json' } })
  }) as typeof fetch
}

describe('credential şifreleme', () => {
  beforeAll(() => {
    process.env.INTEGRATION_SECRET_KEY = generateIntegrationKey()
  })

  it('şifrele / çöz gidiş-dönüş', () => {
    const payload = { apiKey: 'abc', apiSecret: 'çok gizli ✓' }
    const enc = encryptJson(payload)
    expect(enc.startsWith('v1.')).toBe(true)
    expect(enc).not.toContain('abc')
    expect(decryptJson(enc)).toEqual(payload)
  })

  it('bozuk veri çözülemez', () => {
    const enc = encryptJson({ a: 1 })
    const parts = enc.split('.')
    parts[2] = Buffer.from('tampered').toString('base64')
    expect(() => decryptJson(parts.join('.'))).toThrow()
  })
})

describe('credential alanları', () => {
  it('zorunlu alanlar denetlenir, bilinmeyenler atılır', () => {
    const v = validateCredentials('trendyol_food', { supplierId: ' 1 ', apiKey: 'k', hacker: 'x' })
    expect(v.ok).toBe(false)
    expect(Object.keys(v.errors)).toEqual(['apiSecret', 'storeId'])
    expect(v.values).toEqual({ supplierId: '1', apiKey: 'k' })
  })

  it('boş bırakılan gizli alan mevcut değeri korur', () => {
    const v = validateCredentials('trendyol_food', { supplierId: '1', apiKey: '', apiSecret: '', storeId: '2' }, { apiKey: 'old-k', apiSecret: 'old-s' })
    expect(v.ok).toBe(true)
    expect(v.values.apiKey).toBe('old-k')
    expect(v.values.apiSecret).toBe('old-s')
  })

  it('maskeleme gizli alanları saklar', () => {
    const m = maskCredentials('yemeksepeti', { clientId: 'cid', clientSecret: 'sec', chainId: 'c', vendorId: 'v' })
    expect(m.clientSecret).toBe(MASK)
    expect(m.clientId).toBe('cid')
    expect(extractExternalIds('yemeksepeti', { chainId: 'c', vendorId: 'v' })).toEqual({ chainId: 'c', storeId: 'v' })
    expect(extractExternalIds('trendyol_food', TY_CREDS)).toEqual({ chainId: '1234', storeId: '777' })
  })

  it('baseUrl https olmalı', () => {
    const v = validateCredentials('yemeksepeti', { clientId: 'a', clientSecret: 'b', chainId: 'c', vendorId: 'd', baseUrl: 'http://x' })
    expect(v.errors.baseUrl).toBeTruthy()
  })
})

describe('capabilities', () => {
  it('doğrulanmamış işlemler kapalı', () => {
    expect(PLATFORM_CAPABILITIES.trendyol_food.supportsProductCreate).toBe(false)
    expect(PLATFORM_CAPABILITIES.trendyol_food.supportsStockQuantity).toBe(false)
    expect(PLATFORM_CAPABILITIES.trendyol_food.supportsWebhook).toBe(false)
    expect(PLATFORM_CAPABILITIES.yemeksepeti.supportsOrderAccept).toBe(false)
    expect(PLATFORM_CAPABILITIES.getir_food.supportsOrderRead).toBe(false)
  })

  it('adapter desteklemediği işlemde NotSupported, yazılmamışta NotImplemented fırlatır', async () => {
    const mock = new MockAdapter('trendyol_food', PLATFORM_CAPABILITIES.trendyol_food)
    await expect(mock.updateStock('1', 5)).rejects.toBeInstanceOf(NotSupportedError)
    await expect(mock.getProducts()).rejects.toBeInstanceOf(NotImplementedError)
  })
})

describe('Trendyol Go adapter', () => {
  it('başlıklar dokümandaki formatta', () => {
    const h = buildTrendyolHeaders({ ...TY_CREDS, integratorName: 'Qr Menü!' }, 'ops@x.com')
    expect(h['User-Agent']).toBe('1234 - QrMen')
    expect(h['x-agentname']).toBe('QrMen')
    expect(h['x-executor-user']).toBe('ops@x.com')
    expect(h.Authorization).toBe('Basic ' + Buffer.from('key:secret').toString('base64'))
    expect(buildTrendyolHeaders(TY_CREDS)['User-Agent']).toBe('1234 - SelfIntegration')
  })

  it('healthCheck: şube bulunursa active', async () => {
    const calls: string[] = []
    const adapter = new TrendyolGoAdapter(TY_CREDS, 'stage', {
      fetchImpl: fakeFetch((url) => {
        calls.push(url)
        return { status: 200, body: [{ id: 777, name: 'Atakent', workingStatus: 'OPEN' }] }
      }),
    })
    const r = await adapter.healthCheck()
    expect(r.status).toBe('active')
    expect(r.details?.storeName).toBe('Atakent')
    expect(calls[0]).toBe('https://stageapi.tgoapis.com/integrator/store/meal/suppliers/1234/stores')
    expect(await adapter.getStoreStatus()).toBe('open')
  })

  it('healthCheck: şube yoksa warning, 401 ise auth hatası', async () => {
    const missing = new TrendyolGoAdapter(TY_CREDS, 'production', { fetchImpl: fakeFetch(() => ({ status: 200, body: { content: [{ id: 1 }] } })) })
    expect((await missing.healthCheck()).status).toBe('warning')

    const denied = new TrendyolGoAdapter(TY_CREDS, 'production', { fetchImpl: fakeFetch(() => ({ status: 401, body: {} })) })
    await expect(denied.healthCheck()).rejects.toMatchObject({ code: 'auth' })

    const limited = new TrendyolGoAdapter(TY_CREDS, 'production', { fetchImpl: fakeFetch(() => ({ status: 429, body: {} })) })
    await expect(limited.healthCheck()).rejects.toBeInstanceOf(IntegrationError)
  })
})

describe('Yemeksepeti adapter', () => {
  const creds = { clientId: 'cid', clientSecret: 'sec', chainId: 'chain-1', vendorId: 'v-9' }

  it('token alır ve mağaza durumunu okur', async () => {
    const calls: { url: string; init?: RequestInit }[] = []
    const adapter = new YemeksepetiAdapter(creds, {
      fetchImpl: fakeFetch((url, init) => {
        calls.push({ url, init })
        if (url.endsWith('/v2/oauth/token')) return { status: 200, body: { access_token: 'tok', expires_in: 7200 } }
        if (url.endsWith('/v2/chains/chain-1/status')) return { status: 200, body: [{ vendor_id: 'v-9', status: 'OPEN' }] }
        return { status: 404 }
      }),
    })
    const r = await adapter.healthCheck()
    expect(r.status).toBe('active')
    expect(calls[0].url).toBe(`${YEMEKSEPETI_DEFAULT_BASE_URL}/v2/oauth/token`)
    expect(String(calls[0].init?.body)).toContain('client_id=cid')
    expect((calls[1].init?.headers as Record<string, string>).Authorization).toBe('Bearer tok')
    expect(await adapter.getStoreStatus()).toBe('open')
  })

  it('token hatası auth koduyla gelir', async () => {
    const adapter = new YemeksepetiAdapter(creds, { fetchImpl: fakeFetch(() => ({ status: 401, body: { error: 'invalid_client' } })) })
    await expect(adapter.healthCheck()).rejects.toMatchObject({ code: 'auth' })
  })
})
