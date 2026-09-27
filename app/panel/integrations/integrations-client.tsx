'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useLocale } from '@/lib/i18n/use-locale'
import { MASK } from '@/lib/integrations/credentials'
import type { HealthCheckResult, HealthStatus, IntegrationEnvironment } from '@/lib/integrations/types'
import {
  removeIntegration,
  saveIntegration,
  testIntegration,
  toggleIntegration,
  type PanelIntegration,
  type PanelIntegrationsData,
} from '@/app/actions/integrations'

const HEALTH_STYLES: Record<HealthStatus | 'none', { dot: string; label: string; badge: string }> = {
  active: { dot: '🟢', label: 'Bağlı', badge: 'bg-green-100 text-green-700' },
  warning: { dot: '🟡', label: 'Uyarı', badge: 'bg-amber-100 text-amber-700' },
  error: { dot: '🔴', label: 'Hata', badge: 'bg-red-100 text-red-700' },
  disabled: { dot: '⚪', label: 'Devre dışı', badge: 'bg-slate-100 text-slate-600' },
  none: { dot: '⚪', label: 'Bağlı değil', badge: 'bg-slate-100 text-slate-600' },
}

const CAPABILITY_LABELS: { key: keyof PanelIntegration['capabilities']; label: string }[] = [
  { key: 'supportsOrderRead', label: 'Sipariş okuma' },
  { key: 'supportsOrderAccept', label: 'Sipariş kabul' },
  { key: 'supportsOrderStatusUpdate', label: 'Sipariş durumu' },
  { key: 'supportsProductRead', label: 'Ürün okuma' },
  { key: 'supportsProductCreate', label: 'Ürün oluşturma' },
  { key: 'supportsAvailabilityUpdate', label: 'Satışta / Tükendi' },
  { key: 'supportsPriceUpdate', label: 'Fiyat güncelleme' },
  { key: 'supportsStockQuantity', label: 'Stok adedi' },
  { key: 'supportsWebhook', label: 'Webhook' },
  { key: 'supportsStoreStatus', label: 'Mağaza aç/kapa' },
]

function relativeTime(iso: string | null, locale: string): string {
  if (!iso) return locale === 'en' ? 'never' : 'hiç'
  const diff = Date.now() - new Date(iso).getTime()
  const min = Math.round(diff / 60000)
  if (min < 1) return locale === 'en' ? 'just now' : 'az önce'
  if (min < 60) return locale === 'en' ? `${min} min ago` : `${min} dk önce`
  const hours = Math.round(min / 60)
  if (hours < 48) return locale === 'en' ? `${hours} h ago` : `${hours} saat önce`
  return new Date(iso).toLocaleString(locale === 'en' ? 'en-GB' : 'tr-TR')
}

function PlatformCard({ item, canManage, secretKeyConfigured }: { item: PanelIntegration; canManage: boolean; secretKeyConfigured: boolean }) {
  const router = useRouter()
  const { locale } = useLocale()
  const [values, setValues] = useState<Record<string, string>>({})
  const [environment, setEnvironment] = useState<IntegrationEnvironment>(item.integration?.environment || 'production')
  const [busy, setBusy] = useState<'save' | 'test' | 'toggle' | 'remove' | null>(null)
  const [message, setMessage] = useState<{ type: 'ok' | 'warn' | 'err'; text: string } | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [editing, setEditing] = useState(!item.integration)

  const health = item.integration ? HEALTH_STYLES[item.integration.healthStatus] : HEALTH_STYLES.none

  const showHealth = (h: HealthCheckResult | undefined, fallback: string) => {
    if (!h) return setMessage({ type: 'err', text: fallback })
    setMessage({ type: h.status === 'active' ? 'ok' : h.status === 'warning' ? 'warn' : 'err', text: h.message })
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy('save')
    setMessage(null)
    setFieldErrors({})
    const result = await saveIntegration({ platform: item.platform, environment, credentials: values })
    setBusy(null)
    if (result.success) {
      showHealth(result.health, 'Kaydedildi')
      setValues({})
      setEditing(false)
      router.refresh()
    } else {
      setFieldErrors(result.fieldErrors || {})
      setMessage({ type: 'err', text: result.error || 'Kaydedilemedi' })
    }
  }

  const handleTest = async () => {
    setBusy('test')
    setMessage(null)
    const result = await testIntegration({ platform: item.platform })
    setBusy(null)
    if (result.success) showHealth(result.health, 'Test tamamlandı')
    else setMessage({ type: 'err', text: result.error || 'Test başarısız' })
    router.refresh()
  }

  const handleToggle = async () => {
    if (!item.integration) return
    setBusy('toggle')
    const next = item.integration.status === 'active' ? 'disabled' : 'active'
    const result = await toggleIntegration({ platform: item.platform, status: next })
    setBusy(null)
    if (!result.success) setMessage({ type: 'err', text: result.error || 'Güncellenemedi' })
    router.refresh()
  }

  const handleRemove = async () => {
    if (!confirm(`${item.label} bağlantısı ve kimlik bilgileri silinsin mi?`)) return
    setBusy('remove')
    const result = await removeIntegration({ platform: item.platform })
    setBusy(null)
    if (!result.success) setMessage({ type: 'err', text: result.error || 'Silinemedi' })
    setEditing(true)
    router.refresh()
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-orange-500" style={{ fontSize: '28px' }}>hub</span>
          <div>
            <h2 className="text-lg font-bold text-gray-900">{item.label}</h2>
            {item.integration && (
              <p className="text-xs text-gray-500">
                Son kontrol: {relativeTime(item.integration.lastHealthCheckAt, locale)} · Son başarılı: {relativeTime(item.integration.lastSuccessfulSyncAt, locale)}
                {item.integration.environment === 'stage' && ' · STAGE ortamı'}
              </p>
            )}
          </div>
        </div>
        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${health.badge}`}>
          {health.dot} {health.label}
        </span>
      </div>

      <div className="p-6 space-y-5">
        {!item.featureEnabled && (
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-600">
            Bu platform özelliği restoranınız için henüz açılmamış. QRMenuList yönetimiyle iletişime geçin.
          </div>
        )}

        {item.integration?.lastError && item.integration.healthStatus !== 'active' && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex items-start gap-2">
            <span className="material-symbols-outlined text-red-600" style={{ fontSize: '20px' }}>error</span>
            <span>{item.integration.lastError}</span>
          </div>
        )}

        {message && (
          <div className={`p-4 rounded-xl text-sm border ${message.type === 'ok' ? 'bg-green-50 border-green-200 text-green-700' : message.type === 'warn' ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-red-50 border-red-200 text-red-700'}`}>
            {message.text}
          </div>
        )}

        {item.integration?.webhookUrl && (
          <div className="p-4 bg-pink-50 border border-pink-200 rounded-xl text-sm">
            <p className="font-semibold text-pink-900">Sipariş webhook adresi</p>
            <p className="text-pink-800 mt-1">Bu adresi Yemeksepeti / Delivery Hero tarafında sipariş webhook&apos;u olarak tanımlatın. Siparişler bu adrese POST edilir.</p>
            <div className="mt-2 flex gap-2 items-center">
              <code className="flex-1 min-w-0 truncate text-xs bg-white border border-pink-200 rounded px-2 py-1">{item.integration.webhookUrl}</code>
              <Button type="button" size="sm" variant="outline" onClick={() => navigator.clipboard?.writeText(item.integration?.webhookUrl || '')}>Kopyala</Button>
            </div>
          </div>
        )}

        {item.integration?.lastPollAt && (
          <p className="text-xs text-gray-500">Son sipariş çekimi: {relativeTime(item.integration.lastPollAt, locale)}</p>
        )}

        {item.integration && !editing && (
          <div className="grid sm:grid-cols-2 gap-3">
            {item.fields.filter((f) => item.integration?.masked[f.key]).map((f) => (
              <div key={f.key} className="bg-gray-50 rounded-xl px-4 py-3">
                <p className="text-[11px] uppercase tracking-wider text-gray-500 font-semibold">{f.label}</p>
                <p className="text-sm font-mono text-gray-900 truncate">{item.integration?.masked[f.key]}</p>
              </div>
            ))}
          </div>
        )}

        {item.featureEnabled && canManage && editing && (
          <form onSubmit={handleSave} className="space-y-4">
            {!secretKeyConfigured && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
                Sunucuda INTEGRATION_SECRET_KEY tanımlı değil; kimlik bilgileri şifrelenemeyeceği için kaydedilemez.
              </div>
            )}
            <div className="grid sm:grid-cols-2 gap-4">
              {item.fields.map((f) => (
                <div key={f.key} className={f.key === 'baseUrl' ? 'sm:col-span-2' : ''}>
                  <Label htmlFor={`${item.platform}-${f.key}`}>
                    {f.label}{f.required ? ' *' : ''}
                  </Label>
                  <Input
                    id={`${item.platform}-${f.key}`}
                    type={f.secret ? 'password' : 'text'}
                    autoComplete="off"
                    value={values[f.key] ?? ''}
                    onChange={(e) => setValues((prev) => ({ ...prev, [f.key]: e.target.value }))}
                    placeholder={f.secret && item.integration?.masked[f.key] ? `${MASK} (değiştirmek için yazın)` : f.placeholder || ''}
                    defaultValue={undefined}
                    className="mt-1"
                  />
                  {fieldErrors[f.key] && <p className="text-xs text-red-600 mt-1">{fieldErrors[f.key]}</p>}
                  {f.help && !fieldErrors[f.key] && <p className="text-xs text-gray-500 mt-1">{f.help}</p>}
                </div>
              ))}
              {item.environments.length > 1 && (
                <div>
                  <Label htmlFor={`${item.platform}-env`}>Ortam</Label>
                  <select
                    id={`${item.platform}-env`}
                    value={environment}
                    onChange={(e) => setEnvironment(e.target.value as IntegrationEnvironment)}
                    className="mt-1 block w-full h-10 rounded-md border border-gray-300 px-3 text-sm bg-white"
                  >
                    <option value="production">Canlı (production)</option>
                    <option value="stage">Test (stage)</option>
                  </select>
                </div>
              )}
            </div>
            {item.integration && !item.integration.masked && null}
            <p className="text-xs text-gray-500">
              Gizli alanlar sunucuda şifrelenerek saklanır, tekrar görüntülenemez. Mevcut bir değeri korumak için alanı boş bırakın.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button type="submit" disabled={busy !== null || !secretKeyConfigured}>
                {busy === 'save' ? 'Kaydediliyor ve test ediliyor...' : 'Kaydet ve Bağlantıyı Test Et'}
              </Button>
              {item.integration && (
                <Button type="button" variant="outline" onClick={() => { setEditing(false); setValues({}); setFieldErrors({}) }}>
                  Vazgeç
                </Button>
              )}
            </div>
          </form>
        )}

        {item.featureEnabled && canManage && item.integration && !editing && (
          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={handleTest} disabled={busy !== null}>
              {busy === 'test' ? 'Test ediliyor...' : 'Bağlantıyı Test Et'}
            </Button>
            <Button type="button" variant="outline" onClick={() => setEditing(true)} disabled={busy !== null}>
              Bilgileri Güncelle
            </Button>
            <Button type="button" variant="outline" onClick={handleToggle} disabled={busy !== null}>
              {item.integration.status === 'active' ? 'Devre Dışı Bırak' : 'Etkinleştir'}
            </Button>
            <Button type="button" variant="outline" onClick={handleRemove} disabled={busy !== null} className="text-red-600 hover:bg-red-50 hover:text-red-700">
              Bağlantıyı Kaldır
            </Button>
          </div>
        )}

        {item.featureEnabled && !canManage && (
          <p className="text-sm text-gray-500">Kimlik bilgilerini yalnızca sahip veya yönetici düzenleyebilir.</p>
        )}

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Bu platformda desteklenenler</p>
          <div className="flex flex-wrap gap-2">
            {CAPABILITY_LABELS.map((c) => {
              const ok = item.capabilities[c.key]
              return (
                <span key={c.key} className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${ok ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-gray-50 text-gray-400 border border-gray-200 line-through'}`}>
                  {ok ? '✓' : '✕'} {c.label}
                </span>
              )
            })}
          </div>
          {item.capabilities.notes.length > 0 && (
            <ul className="mt-3 space-y-1 text-xs text-gray-500 list-disc pl-5">
              {item.capabilities.notes.map((n) => <li key={n}>{n}</li>)}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

export function IntegrationsClient({ data }: { data: PanelIntegrationsData }) {
  const { t } = useLocale()

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <span className="material-symbols-outlined text-3xl text-orange-500">hub</span>
          {t.panel.integrations.title}
        </h1>
        <p className="text-sm text-gray-600 mt-1">{t.panel.integrations.subtitle}{data.restaurantName ? ` · ${data.restaurantName}` : ''}</p>
      </div>

      {data.error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5 text-red-700">{data.error}</div>
      )}

      {!data.schemaReady && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-3">
          <span className="material-symbols-outlined text-amber-600">warning</span>
          <div className="text-sm text-amber-900">
            <p className="font-semibold">Entegrasyon tabloları henüz oluşturulmamış</p>
            <p className="mt-1">Supabase SQL Editor üzerinden <code>supabase/apply/phase3_024.sql</code> dosyasını çalıştırın.</p>
          </div>
        </div>
      )}

      {!data.marketplaceEnabled && !data.error && (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-sm text-slate-700">
          Pazaryeri entegrasyonu bu restoran için açık değil. QRMenuList yönetimi &quot;Pazaryeri Entegrasyonu&quot; özelliğini açtığında Trendyol Yemek ve Yemeksepeti bağlantıları burada tanımlanır.
        </div>
      )}

      {data.marketplaceEnabled && data.schemaReady && data.platforms.map((item) => (
        <PlatformCard key={item.platform} item={item} canManage={data.canManage} secretKeyConfigured={data.secretKeyConfigured} />
      ))}
    </div>
  )
}
