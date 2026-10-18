'use client'

import { useEffect, useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { currencySymbol, formatCurrency } from '@/lib/utils/currency'
import { useCurrency } from '@/lib/utils/currency-context'
import { PLATFORM_LABELS, type MarketplacePlatform } from '@/lib/integrations/types'
import type { ExactMatchPair } from '@/lib/integrations/matching'
import {
  addManualExternalProduct,
  applyExactMatches,
  createLocalProductFromExternal,
  importAllExternalToLocal,
  importPlatformProducts,
  linkProduct,
  previewExactMatches,
  setChannelPrice,
  setMasterPrice,
  unlinkProduct,
  type ExternalProductView,
  type LocalProductView,
  type PlatformProductsData,
  type PlatformSummary,
} from '@/app/actions/platform-products'

const PLATFORM_BADGE: Record<MarketplacePlatform, string> = {
  trendyol_food: 'bg-orange-100 text-orange-700',
  yemeksepeti: 'bg-pink-100 text-pink-700',
  getir_food: 'bg-purple-100 text-purple-700',
  migros_food: 'bg-emerald-100 text-emerald-700',
}
const HEALTH_DOT: Record<string, string> = { active: '🟢', warning: '🟡', error: '🔴', disabled: '⚪' }
const shortLabel = (p: MarketplacePlatform) => PLATFORM_LABELS[p].replace(' Yemek', '')

export function Thumb({ url, name }: { url: string | null; name: string }) {
  if (!url) return <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-300 shrink-0"><span className="material-symbols-outlined" style={{ fontSize: '18px' }}>image</span></div>
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={url} alt={name} className="w-10 h-10 rounded-lg object-cover shrink-0 bg-gray-100" loading="lazy" />
}

const IMPORT_TIMEOUT_MS = 60_000
export { PLATFORM_BADGE, shortLabel }

export function ImportProgress({ startedAt }: { startedAt: number }) {
  const [elapsed, setElapsed] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setElapsed(Math.floor((Date.now() - startedAt) / 1000)), 250)
    return () => clearInterval(id)
  }, [startedAt])
  const phase = elapsed < 2 ? 'Platforma bağlanılıyor' : elapsed < 20 ? 'Ürün listesi çekiliyor' : elapsed < 40 ? 'Kaydediliyor' : 'Platform geç yanıt veriyor, bekleniyor'
  const percent = Math.min(95, Math.round((1 - Math.exp(-elapsed / 15)) * 100))
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-gray-600"><span>{phase}…</span><span className="tabular-nums">{elapsed} sn</span></div>
      <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden"><div className="h-full rounded-full bg-gradient-to-r from-orange-400 to-orange-600 transition-all duration-300" style={{ width: `${percent}%` }} /></div>
    </div>
  )
}

export function PlatformCard({ p, canManage }: { p: PlatformSummary; canManage: boolean }) {
  const router = useRouter()
  const [pending, start] = useTransition()
  const [importing, setImporting] = useState<number | null>(null)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [manualOpen, setManualOpen] = useState(false)
  const [manual, setManual] = useState({ id: '', name: '', price: '' })
  const [preview, setPreview] = useState<ExactMatchPair[] | null>(null)

  const runImport = async () => {
    if (importing !== null) return
    setMsg(null)
    setImporting(Date.now())
    const timeout = new Promise<{ success: false; error: string }>((resolve) => setTimeout(() => resolve({ success: false, error: 'Sunucudan 60 saniyedir yanıt yok. Sayfayı yenileyip tekrar deneyin.' }), IMPORT_TIMEOUT_MS))
    try {
      const r = await Promise.race([importPlatformProducts({ platform: p.platform }), timeout])
      setMsg(r.success ? { ok: true, text: `${r.fetched} ürün çekildi (${r.created} yeni, ${r.updated} güncellendi)` } : { ok: false, text: r.error || 'Hata' })
    } catch (e) {
      setMsg({ ok: false, text: e instanceof Error ? e.message : 'Beklenmeyen hata' })
    } finally {
      setImporting(null)
      router.refresh()
    }
  }

  const showPreview = () => {
    setMsg(null)
    start(async () => {
      const r = await previewExactMatches({ platform: p.platform })
      if (!r.success) setMsg({ ok: false, text: r.error || 'Hata' })
      else setPreview(r.pairs || [])
    })
  }
  const confirmPreview = () => {
    if (!preview) return
    start(async () => {
      const r = await applyExactMatches({ platform: p.platform, pairs: preview.map((x) => ({ externalRowId: x.externalRowId, localProductId: x.localProductId })) })
      setMsg(r.success ? { ok: true, text: `${r.linked} ürün eşleştirildi${r.failed ? `, ${r.failed} başarısız` : ''}` } : { ok: false, text: r.error || 'Hata' })
      setPreview(null)
      router.refresh()
    })
  }
  const importAll = () => {
    if (!confirm(`${p.label} üzerindeki eşleşmemiş ${p.unmapped} ürün, kategorileriyle birlikte QRMenuList menünüze eklenecek ve eşleştirilecek. Devam edilsin mi?`)) return
    setMsg(null)
    start(async () => {
      const r = await importAllExternalToLocal({ platform: p.platform })
      setMsg(r.success ? { ok: true, text: `${r.created} ürün ve ${r.categoriesCreated} kategori oluşturuldu${r.failed ? `, ${r.failed} başarısız` : ''}${r.skipped ? ` (${r.skipped} zaten eşleşmişti)` : ''}` } : { ok: false, text: r.error || 'Hata' })
      router.refresh()
    })
  }
  const addManual = (e: React.FormEvent) => {
    e.preventDefault()
    start(async () => {
      const r = await addManualExternalProduct({ platform: p.platform, externalProductId: manual.id, name: manual.name, price: manual.price ? Number(manual.price) : null })
      setMsg(r.success ? { ok: true, text: 'Platform ürünü eklendi' } : { ok: false, text: r.error || 'Hata' })
      if (r.success) { setManual({ id: '', name: '', price: '' }); setManualOpen(false) }
      router.refresh()
    })
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5 space-y-3">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${PLATFORM_BADGE[p.platform]}`}>{p.label}</span>
          <span className="text-sm text-gray-600">{p.healthStatus ? HEALTH_DOT[p.healthStatus] : '⚪'} {p.connected ? 'Bağlı' : 'Bağlı değil'}</span>
        </div>
        <div className="text-xs text-gray-500">{p.total} ürün · <span className="text-green-700">{p.mapped} eşleşti</span> · <span className={p.unmapped ? 'text-amber-600 font-semibold' : ''}>{p.unmapped} eşleşmedi</span></div>
      </div>
      {!p.featureEnabled ? (
        <p className="text-sm text-gray-500">Bu platform özelliği açık değil.</p>
      ) : !p.connected ? (
        <p className="text-sm text-gray-500">Önce <a href="/panel/integrations" className="text-blue-600 underline">Entegrasyonlar</a> sayfasından bağlantıyı kurun.</p>
      ) : (
        <div className="flex flex-wrap gap-2 items-center">
          {p.supportsProductRead && canManage && (
            <Button size="sm" onClick={runImport} disabled={pending || importing !== null} className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700">
              <span className={`material-symbols-outlined mr-1 ${importing !== null ? 'animate-spin' : ''}`} style={{ fontSize: '18px' }}>{importing !== null ? 'sync' : 'cloud_download'}</span>
              {importing !== null ? 'Çekiliyor...' : 'Ürünleri İçe Aktar'}
            </Button>
          )}
          {canManage && p.unmapped > 0 && (
            <>
              <Button size="sm" variant="outline" disabled={pending} onClick={showPreview}>Birebir eşleşenleri bul</Button>
              <Button size="sm" variant="outline" disabled={pending} onClick={importAll}>Tümünü QRMenuList&apos;e aktar ({p.unmapped})</Button>
            </>
          )}
          {canManage && <button type="button" onClick={() => setManualOpen((v) => !v)} className="text-xs font-semibold text-blue-600 hover:text-blue-800">{manualOpen ? 'Vazgeç' : '+ Elle ekle'}</button>}
          {p.lastSyncedAt && <span className="text-xs text-gray-400">Son çekim: {new Date(p.lastSyncedAt).toLocaleString('tr-TR')}</span>}
        </div>
      )}
      {importing !== null && <ImportProgress startedAt={importing} />}
      {preview && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-3 space-y-2 text-sm">
          <p className="font-semibold text-green-900">{preview.length === 0 ? 'Birebir aynı adlı eşleşme bulunamadı.' : `${preview.length} ürün birebir aynı adla eşleşecek:`}</p>
          {preview.length > 0 && (
            <ul className="max-h-48 overflow-y-auto text-xs text-green-900 space-y-0.5">
              {preview.map((x) => <li key={x.externalRowId}>{x.externalName} <span className="text-green-600">→</span> {x.localName}</li>)}
            </ul>
          )}
          <div className="flex gap-2">
            {preview.length > 0 && <Button size="sm" disabled={pending} onClick={confirmPreview}>Onayla ve eşleştir</Button>}
            <Button size="sm" variant="outline" onClick={() => setPreview(null)}>Kapat</Button>
          </div>
        </div>
      )}
      {manualOpen && (
        <form onSubmit={addManual} className="flex flex-col sm:flex-row gap-2">
          <Input value={manual.id} onChange={(e) => setManual({ ...manual, id: e.target.value })} placeholder="Platform ürün ID" required className="h-9 sm:w-40" />
          <Input value={manual.name} onChange={(e) => setManual({ ...manual, name: e.target.value })} placeholder="Platformdaki ürün adı" required className="h-9 flex-1" />
          <Input value={manual.price} onChange={(e) => setManual({ ...manual, price: e.target.value })} placeholder="Fiyat" type="number" step="0.01" min="0" className="h-9 sm:w-28" />
          <Button type="submit" size="sm" disabled={pending}>Ekle</Button>
        </form>
      )}
      {msg && <p className={`text-sm ${msg.ok ? 'text-green-600' : 'text-red-600'}`}>{msg.text}</p>}
      {!p.supportsProductCreate && p.featureEnabled && <p className="text-xs text-gray-400">Bu platformda API ile ürün oluşturma yok: ürünü {p.label} panelinde oluşturun, içe aktarıp burada eşleştirin.</p>}
    </div>
  )
}

export function UnmappedRow({ item, locals, categories, canManage }: { item: ExternalProductView; locals: LocalProductView[]; categories: { id: string; name: string }[]; canManage: boolean }) {
  const currency = useCurrency()
  const router = useRouter()
  const [pending, start] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [pick, setPick] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [categoryId, setCategoryId] = useState(categories[0]?.id || '')
  const [price, setPrice] = useState(item.price !== null ? String(item.price) : '')

  const link = (localProductId: string) => {
    if (!localProductId) return
    setError(null)
    start(async () => {
      const r = await linkProduct({ localProductId, externalRowId: item.id })
      if (!r.success) setError(r.error || 'Hata')
      router.refresh()
    })
  }
  const create = () => {
    setError(null)
    start(async () => {
      const r = await createLocalProductFromExternal({ externalRowId: item.id, categoryId: categoryId || null, price: price ? Number(price) : null })
      if (!r.success) setError(r.error || 'Hata')
      router.refresh()
    })
  }

  return (
    <div className="px-4 py-3 space-y-2">
      <div className="flex items-center gap-3 flex-wrap">
        <Thumb url={item.imageUrl} name={item.name} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${PLATFORM_BADGE[item.platform]}`}>{shortLabel(item.platform)}</span>
            <p className="font-medium text-gray-900">{item.name}</p>
            {!item.available && <span className="text-[11px] text-red-600">platformda kapalı</span>}
          </div>
          <p className="text-xs text-gray-500">{item.price !== null ? formatCurrency(item.price, currency) : 'fiyat yok'}{item.category ? ` · ${item.category}` : ''}</p>
        </div>
        {canManage && (
          <div className="flex flex-wrap gap-2 items-center">
            <select value={pick} onChange={(e) => setPick(e.target.value)} className="h-9 rounded-md border border-gray-300 px-2 text-sm bg-white max-w-[220px]">
              <option value="">Mevcut ürünle eşleştir…</option>
              {locals.filter((l) => !l.channels[item.platform]).map((l) => <option key={l.id} value={l.id}>{l.name} · {formatCurrency(l.price, currency)}</option>)}
            </select>
            <Button size="sm" variant="outline" className="h-9" disabled={!pick || pending} onClick={() => link(pick)}>Eşleştir</Button>
            <Button size="sm" variant="outline" className="h-9" disabled={pending} onClick={() => setCreateOpen((v) => !v)}>{createOpen ? 'Vazgeç' : 'QR menüye ekle'}</Button>
          </div>
        )}
      </div>
      {item.suggestions.length > 0 && canManage && (
        <div className="flex flex-wrap gap-2 items-center pl-[52px]">
          <span className="text-xs text-gray-500">Öneri:</span>
          {item.suggestions.map((s) => (
            <button key={s.localProductId} type="button" disabled={pending} onClick={() => link(s.localProductId)} title={s.reason === 'sku' ? 'SKU eşleşmesi' : s.reason === 'exact' ? 'İsim birebir' : 'İsim benzerliği'} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border border-green-200 bg-green-50 text-green-800 text-xs hover:bg-green-100">
              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>link</span>{s.localName} · {formatCurrency(s.localPrice, currency)} · %{Math.round(s.score * 100)}
            </button>
          ))}
        </div>
      )}
      {createOpen && (
        <div className="flex flex-wrap gap-2 items-center bg-gray-50 rounded-xl p-3 ml-[52px]">
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="h-9 rounded-md border border-gray-300 px-2 text-sm bg-white">
            <option value="">Kategori (isteğe bağlı)</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <Input type="number" step="0.01" min="0" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="QR menü fiyatı" className="h-9 w-36" />
          <Button size="sm" disabled={pending} onClick={create}>Oluştur ve eşleştir</Button>
        </div>
      )}
      {error && <p className="text-xs text-red-600 pl-[52px]">{error}</p>}
    </div>
  )
}

export function ChannelCell({ local, platform, external, canManage }: { local: LocalProductView; platform: MarketplacePlatform; external: ExternalProductView[]; canManage: boolean }) {
  const currency = useCurrency()
  const router = useRouter()
  const [pending, start] = useTransition()
  const [open, setOpen] = useState<'link' | 'price' | null>(null)
  const [pick, setPick] = useState('')
  const ch = local.channels[platform]
  const [useMaster, setUseMaster] = useState(ch?.useMasterPrice ?? false)
  const [override, setOverride] = useState(ch?.priceOverride !== null && ch?.priceOverride !== undefined ? String(ch.priceOverride) : '')

  if (!ch) {
    const candidates = external.filter((e) => e.platform === platform && !e.linkId)
    return (
      <div className="text-sm">
        {open === 'link' ? (
          <div className="flex items-center gap-1">
            <select value={pick} onChange={(e) => setPick(e.target.value)} className="h-8 rounded-md border border-gray-300 px-1 text-xs bg-white max-w-[180px]">
              <option value="">Platform ürünü seç…</option>
              {candidates.map((e) => <option key={e.id} value={e.id}>{e.name}{e.price !== null ? ` · ${formatCurrency(e.price, currency)}` : ''}</option>)}
            </select>
            <Button size="sm" className="h-8" disabled={!pick || pending} onClick={() => start(async () => { const r = await linkProduct({ localProductId: local.id, externalRowId: pick }); if (!r.success) alert(r.error || 'Hata'); setOpen(null); router.refresh() })}>Bağla</Button>
            <button type="button" onClick={() => setOpen(null)} className="text-xs text-gray-400">iptal</button>
          </div>
        ) : canManage ? (
          <button type="button" onClick={() => setOpen('link')} className="text-xs text-gray-400 hover:text-blue-600">— eşleştir</button>
        ) : <span className="text-gray-300">—</span>}
      </div>
    )
  }

  const effective = ch.useMasterPrice ? local.price : ch.priceOverride !== null ? ch.priceOverride : ch.externalPrice
  const priceMode = ch.useMasterPrice ? 'QR fiyatı' : ch.priceOverride !== null ? 'özel' : 'platform'
  const syncTitle = ch.lastPriceSyncOk === false ? `Fiyat gönderilemedi: ${ch.lastPriceSyncError || ''}` : ch.lastPriceSyncOk ? `Platforma gönderildi ${ch.lastPriceSyncAt ? new Date(ch.lastPriceSyncAt).toLocaleString('tr-TR') : ''}` : ''
  return (
    <div className="text-sm">
      <div className="flex items-center gap-2">
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${ch.available ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-gray-100 text-gray-500 border border-gray-200'}`} title={`${ch.externalName} · ${priceMode}${syncTitle ? ' · ' + syncTitle : ''}`}>
          ✓ {effective !== null ? formatCurrency(effective, currency) : 'fiyat yok'}
          <span className="opacity-60">· {priceMode}</span>
          {ch.lastPriceSyncOk === false && <span className="text-red-600">✕</span>}
          {!ch.available ? ' · kapalı' : ''}
        </span>
        {canManage && (
          <>
            <button type="button" onClick={() => setOpen(open === 'price' ? null : 'price')} className="text-gray-400 hover:text-blue-600" title="Kanal fiyatı"><span className="material-symbols-outlined" style={{ fontSize: '16px' }}>edit</span></button>
            <button type="button" disabled={pending} onClick={() => { if (confirm('Eşleşme kaldırılsın mı? Ürünler silinmez.')) start(async () => { await unlinkProduct({ linkId: ch.linkId }); router.refresh() }) }} className="text-gray-400 hover:text-red-600" title="Eşleşmeyi kaldır"><span className="material-symbols-outlined" style={{ fontSize: '16px' }}>link_off</span></button>
          </>
        )}
      </div>
      {ch.externalName.toLocaleLowerCase('tr-TR') !== local.name.toLocaleLowerCase('tr-TR') && <p className="text-[11px] text-gray-400 truncate max-w-[200px]" title={ch.externalName}>{ch.externalName}</p>}
      {open === 'price' && (
        <div className="mt-1 bg-gray-50 rounded-lg p-2 text-xs space-y-1.5">
          <p className="font-semibold text-gray-700">{shortLabel(platform)} fiyatı</p>
          <label className="flex items-center gap-1"><input type="radio" name={`pm-${ch.linkId}`} checked={useMaster} onChange={() => setUseMaster(true)} /> QR fiyatıyla aynı ({formatCurrency(local.price, currency)})</label>
          <label className="flex items-center gap-1"><input type="radio" name={`pm-${ch.linkId}`} checked={!useMaster} onChange={() => setUseMaster(false)} /> Özel:
            <Input type="number" step="0.01" min="0" value={override} onChange={(e) => { setOverride(e.target.value); setUseMaster(false) }} placeholder={ch.externalPrice !== null ? String(ch.externalPrice) : 'fiyat'} className="h-7 w-24" />
          </label>
          <div className="flex items-center gap-2">
            <Button size="sm" className="h-7" disabled={pending} onClick={() => start(async () => { const r = await setChannelPrice({ linkId: ch.linkId, useMasterPrice: useMaster, priceOverride: override ? Number(override) : null }); if (!r.success) alert(r.error || 'Hata'); else if (r.sync?.some((x) => !x.ok)) alert(r.sync.filter((x) => !x.ok).map((x) => `${x.label}: ${x.error}`).join('\n')); setOpen(null); router.refresh() })}>
              {pending ? 'Gönderiliyor…' : `Kaydet ve ${shortLabel(platform)}'a gönder`}
            </Button>
            <button type="button" onClick={() => setOpen(null)} className="text-gray-400">iptal</button>
          </div>
          {ch.lastPriceSyncOk === false && <p className="text-red-600">{ch.lastPriceSyncError}</p>}
          {platform === 'trendyol_food' && <p className="text-gray-400">Trendyol fiyatı toplu işle işler; birkaç dakika içinde yansır.</p>}
        </div>
      )}
    </div>
  )
}

export function MasterPrice({ product, canManage }: { product: LocalProductView; canManage: boolean }) {
  const currency = useCurrency()
  const router = useRouter()
  const [pending, start] = useTransition()
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(String(product.price))
  const [msg, setMsg] = useState<string | null>(null)
  if (!canManage) return <span>{formatCurrency(product.price, currency)}</span>
  if (!editing) {
    return (
      <button type="button" onClick={() => { setValue(String(product.price)); setEditing(true) }} className="inline-flex items-center gap-1 text-orange-600 hover:underline" title="QR menü fiyatını düzenle">
        {formatCurrency(product.price, currency)}<span className="material-symbols-outlined" style={{ fontSize: '14px' }}>edit</span>
        {msg && <span className="text-[11px] text-gray-500 ml-1">{msg}</span>}
      </button>
    )
  }
  const save = () => {
    const price = Number(value)
    if (!Number.isFinite(price) || price < 0) { setEditing(false); return }
    if (price === product.price) { setEditing(false); return }
    start(async () => {
      const r = await setMasterPrice({ productId: product.id, price })
      if (!r.success) setMsg(r.error || 'Hata')
      else {
        const failed = (r.sync || []).filter((x) => !x.ok)
        const sent = (r.sync || []).filter((x) => x.ok)
        setMsg(failed.length ? `${failed.map((x) => x.label).join(', ')} gönderilemedi` : sent.length ? `${sent.map((x) => x.label.replace(' Yemek', '')).join(', ')} güncellendi` : 'QR menü güncellendi')
        setTimeout(() => setMsg(null), 6000)
      }
      setEditing(false)
      router.refresh()
    })
  }
  return (
    <span className="inline-flex items-center gap-1">
      <span className="text-orange-600 font-bold">{currencySymbol(currency)}</span>
      <input type="number" step="0.01" min="0" value={value} onChange={(e) => setValue(e.target.value)} onBlur={save} onKeyDown={(e) => { if (e.key === 'Enter') save(); if (e.key === 'Escape') setEditing(false) }} autoFocus disabled={pending} className="w-20 h-6 px-1 text-xs border border-orange-300 rounded" />
    </span>
  )
}
