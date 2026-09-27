'use client'

import { useEffect, useMemo, useRef, useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DeleteButton } from '@/components/delete-button'
import { useLocale } from '@/lib/i18n/use-locale'
import { formatCurrency } from '@/lib/utils/currency'
import { INVENTORY_TX_LABELS } from '@/lib/inventory/types'
import type { ChannelSyncResult } from '@/lib/inventory/sync'
import type { MarketplacePlatform } from '@/lib/integrations/types'
import { ChannelCell, MasterPrice, PlatformCard, Thumb, UnmappedRow, shortLabel } from '@/components/products/platform-parts'
import { adjustStock, bulkSetAvailability, bulkSetTrackStock, retryChannelSync, setAvailability, setProductSku, setTrackStock } from '@/app/actions/stock'
import type { HubProduct, ProductsHubData } from '@/app/actions/products-hub'

type Tab = 'list' | 'platform'
type Quick = 'all' | 'soldout' | 'tracked' | 'unlinked' | 'errors'

const PLATFORM_SHORT: Record<MarketplacePlatform, string> = { trendyol_food: 'TY', yemeksepeti: 'YS', getir_food: 'GT', migros_food: 'MG' }
const PLATFORM_COLOR: Record<MarketplacePlatform, string> = { trendyol_food: 'bg-orange-500', yemeksepeti: 'bg-pink-500', getir_food: 'bg-purple-500', migros_food: 'bg-emerald-500' }

/** Satışta | Tükendi anahtarı (tek tık) */
function AvailabilitySwitch({ available, disabled, onChange }: { available: boolean; disabled?: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="inline-flex rounded-full border border-gray-200 bg-gray-50 p-0.5 text-xs font-semibold" role="group" aria-label="Satış durumu">
      <button type="button" disabled={disabled || available} onClick={() => onChange(true)} className={`px-3 py-1 rounded-full transition ${available ? 'bg-green-500 text-white shadow' : 'text-gray-500 hover:text-gray-800'}`}>Satışta</button>
      <button type="button" disabled={disabled || !available} onClick={() => onChange(false)} className={`px-3 py-1 rounded-full transition ${!available ? 'bg-red-500 text-white shadow' : 'text-gray-500 hover:text-gray-800'}`}>Tükendi</button>
    </div>
  )
}

/** Stok rozeti: tıklayınca küçük −/+ pencere */
function StockBadge({ product, canOperate, pending, onDelta, onAbsolute }: { product: HubProduct; canOperate: boolean; pending: boolean; onDelta: (d: number) => void; onAbsolute: (v: number) => void }) {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState('')
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])
  const qty = product.stockQuantity ?? 0
  return (
    <div className="relative" ref={ref}>
      <button type="button" onClick={() => canOperate && setOpen((v) => !v)} className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${qty === 0 ? 'bg-red-50 text-red-700 border-red-200' : qty <= 3 ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-gray-50 text-gray-700 border-gray-200'}`} title="Stok adedi">
        <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>inventory_2</span>
        {qty}
      </button>
      {open && (
        <div className="absolute right-0 z-20 mt-1 w-56 bg-white border border-gray-200 rounded-xl shadow-xl p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">Stok adedi</span>
            <div className="inline-flex items-center rounded-lg border border-gray-200 overflow-hidden">
              <button type="button" disabled={pending} onClick={() => onDelta(-1)} className="w-8 h-8 hover:bg-gray-50">−</button>
              <span className="min-w-[2.5rem] text-center font-bold tabular-nums">{qty}</span>
              <button type="button" disabled={pending} onClick={() => onDelta(1)} className="w-8 h-8 hover:bg-gray-50">+</button>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Input type="number" min="0" value={value} onChange={(e) => setValue(e.target.value)} placeholder="Sayım gir" className="h-8 flex-1" />
            <Button size="sm" className="h-8" disabled={pending || value === ''} onClick={() => { onAbsolute(Number(value)); setValue(''); setOpen(false) }}>Ayarla</Button>
          </div>
        </div>
      )}
    </div>
  )
}

function ProductRow({ product, data, bulkMode, selected, onSelect }: { product: HubProduct; data: ProductsHubData; bulkMode: boolean; selected: boolean; onSelect: (v: boolean) => void }) {
  const router = useRouter()
  const { t, locale } = useLocale()
  const [pending, start] = useTransition()
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sync, setSync] = useState<ChannelSyncResult[]>([])
  const [sku, setSku] = useState(product.sku || '')
  const [showTx, setShowTx] = useState(false)
  const [initialQty, setInitialQty] = useState('')
  const platforms = data.platforms.filter((p) => p.featureEnabled)

  const run = (fn: () => Promise<{ success: boolean; error?: string; sync?: ChannelSyncResult[] }>) => {
    setError(null)
    start(async () => {
      const r = await fn()
      if (!r.success) setError(r.error || 'Hata')
      if (r.sync) setSync(r.sync)
      router.refresh()
    })
  }
  const failedSync = sync.filter((s) => !s.ok)
  const name = locale === 'en' && product.nameEn ? product.nameEn : product.name
  const categoryName = locale === 'en' && product.categoryNameEn ? product.categoryNameEn : product.categoryName
  const channelErrors = product.stockChannels.filter((c) => c.lastSyncOk === false)

  return (
    <div className={`bg-white rounded-xl border transition ${selected ? 'border-orange-300 ring-2 ring-orange-100' : 'border-gray-200'} ${!product.isActive ? 'opacity-60' : ''}`}>
      <div className="px-3 py-2.5 flex items-center gap-3">
        {bulkMode && <input type="checkbox" checked={selected} onChange={(e) => onSelect(e.target.checked)} className="w-4 h-4 rounded border-gray-300 shrink-0" />}
        <Thumb url={product.imageUrl} name={name} />

        {/* Ad */}
        <button type="button" onClick={() => setOpen((v) => !v)} className="min-w-0 flex-1 text-left">
          <p className="font-semibold text-gray-900 leading-tight truncate">{name}</p>
          <p className="text-xs text-gray-500 truncate">
            {categoryName || '—'}
            {product.isFeatured ? ' · ★' : ''}
            {!product.isActive ? ` · ${t.panel.products.inactive}` : ''}
          </p>
        </button>

        {/* Fiyat */}
        <div className="shrink-0 text-right hidden sm:block">
          <p className="font-bold text-gray-900 text-base"><MasterPrice product={product.local} canManage={data.canManage} /></p>
        </div>

        {/* Platform mini rozetleri */}
        {data.marketplaceEnabled && platforms.length > 0 && (
          <div className="hidden md:flex items-center gap-1 shrink-0">
            {platforms.map((p) => {
              const ch = product.local.channels[p.platform]
              const err = product.stockChannels.find((c) => c.platform === p.platform)?.lastSyncOk === false
              return (
                <button key={p.platform} type="button" onClick={() => setOpen(true)} title={ch ? `${p.label}: ${ch.externalName}` : `${p.label}: eşleştirilmemiş`} className={`inline-flex items-center gap-1 pl-1 pr-2 py-0.5 rounded-full text-[11px] border ${ch ? (err ? 'bg-red-50 border-red-200 text-red-700' : 'bg-white border-gray-200 text-gray-700') : 'bg-gray-50 border-dashed border-gray-300 text-gray-400'}`}>
                  <span className={`w-4 h-4 rounded-full text-[9px] font-bold text-white flex items-center justify-center ${PLATFORM_COLOR[p.platform]} ${ch ? '' : 'opacity-40'}`}>{PLATFORM_SHORT[p.platform]}</span>
                  {ch ? (ch.useMasterPrice ? formatCurrency(product.price) : ch.priceOverride !== null ? formatCurrency(ch.priceOverride) : ch.externalPrice !== null ? formatCurrency(ch.externalPrice) : '✓') : 'eşleştir'}
                </button>
              )
            })}
          </div>
        )}

        {/* Satış durumu + stok */}
        {data.stockEnabled && (
          <div className="flex items-center gap-2 shrink-0">
            {product.trackStock && (
              <StockBadge product={product} canOperate={data.canOperate} pending={pending} onDelta={(d) => run(() => adjustStock({ productId: product.id, delta: d }))} onAbsolute={(v) => run(() => adjustStock({ productId: product.id, absolute: v, note: 'Sayım' }))} />
            )}
            <AvailabilitySwitch available={product.isAvailable} disabled={!data.canOperate || pending} onChange={(v) => run(() => setAvailability({ productId: product.id, available: v }))} />
          </div>
        )}

        {/* Sağ ikonlar */}
        <div className="flex items-center shrink-0">
          {data.canManage && (
            <Link href={`/panel/products/${product.id}/edit`} className="w-8 h-8 inline-flex items-center justify-center rounded-md text-gray-400 hover:text-blue-600 hover:bg-blue-50" title={t.common.edit}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>edit</span>
            </Link>
          )}
          <button type="button" onClick={() => setOpen((v) => !v)} className="w-8 h-8 inline-flex items-center justify-center rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100" title="Detay">
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>{open ? 'expand_less' : 'expand_more'}</span>
          </button>
        </div>
      </div>

      {/* Mobil fiyat satırı */}
      <div className="sm:hidden px-3 pb-2 -mt-1 text-sm font-bold text-gray-900"><MasterPrice product={product.local} canManage={data.canManage} /></div>

      {(error || failedSync.length > 0 || channelErrors.length > 0) && !open && (
        <p className="px-3 pb-2 text-xs text-red-600 flex items-center gap-2 flex-wrap">
          <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>error</span>
          {error || failedSync.map((s) => `${s.label}: ${s.error}`).join(' · ') || `${channelErrors.map((c) => c.label).join(', ')} senkron hatası`}
          {channelErrors.length > 0 && data.canOperate && <button type="button" onClick={() => setOpen(true)} className="underline">detay</button>}
        </p>
      )}

      {open && (
        <div className="border-t border-gray-100 bg-gray-50/60 p-3 grid gap-3 md:grid-cols-3">
          {/* Kanallar */}
          {data.marketplaceEnabled && (
            <div className="bg-white rounded-lg border border-gray-200 p-3 space-y-3">
              <p className="text-[11px] uppercase tracking-wider text-gray-500 font-semibold flex items-center gap-1"><span className="material-symbols-outlined" style={{ fontSize: '14px' }}>hub</span> Platformlar</p>
              {platforms.length === 0 && <p className="text-xs text-gray-400">Açık platform yok</p>}
              {platforms.map((p) => {
                const st = product.stockChannels.find((c) => c.platform === p.platform)
                return (
                  <div key={p.platform} className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <span className={`w-4 h-4 rounded-full text-[9px] font-bold text-white flex items-center justify-center ${PLATFORM_COLOR[p.platform]}`}>{PLATFORM_SHORT[p.platform]}</span>
                      <span className="font-medium text-gray-800">{shortLabel(p.platform)}</span>
                      {st && <span className={st.externalAvailable ? 'text-green-600' : 'text-gray-400'}>· platformda {st.externalAvailable ? 'satışta' : 'kapalı'}</span>}
                      {st?.lastSyncOk === false && data.canOperate && <button type="button" disabled={pending} onClick={() => run(() => retryChannelSync({ linkId: st.linkId }))} className="text-red-600 underline">senkronu tekrar dene</button>}
                    </div>
                    <ChannelCell local={product.local} platform={p.platform} external={data.external} canManage={data.canManage} />
                    {st?.lastSyncError && <p className="text-[11px] text-red-600">{st.lastSyncError}</p>}
                  </div>
                )
              })}
            </div>
          )}

          {/* Stok */}
          {data.stockEnabled && (
            <div className="bg-white rounded-lg border border-gray-200 p-3 space-y-2">
              <p className="text-[11px] uppercase tracking-wider text-gray-500 font-semibold flex items-center gap-1"><span className="material-symbols-outlined" style={{ fontSize: '14px' }}>inventory_2</span> Stok</p>
              <label className="flex items-center justify-between gap-2 text-sm">
                <span className="text-gray-800">Adet takibi</span>
                <span className="inline-flex items-center gap-2">
                  {!product.trackStock && data.canOperate && <Input type="number" min="0" value={initialQty} onChange={(e) => setInitialQty(e.target.value)} placeholder="Başlangıç" className="h-7 w-24 text-xs" />}
                  <button type="button" role="switch" aria-checked={product.trackStock} disabled={!data.canOperate || pending} onClick={() => run(() => setTrackStock({ productId: product.id, track: !product.trackStock, quantity: initialQty === '' ? null : Number(initialQty) }))} className={`relative w-10 h-6 rounded-full transition ${product.trackStock ? 'bg-green-500' : 'bg-gray-300'} disabled:opacity-50`}>
                    <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition ${product.trackStock ? 'left-[18px]' : 'left-0.5'}`} />
                  </button>
                </span>
              </label>
              <p className="text-xs text-gray-500">
                {product.trackStock
                  ? 'Açık: sipariş kabul edilince düşer, iptalde geri gelir, 0 olunca otomatik "Tükendi" olur.'
                  : 'Kapalı: yalnızca Satışta / Tükendi anahtarı kullanılır. Çoğu ürün için bu yeterlidir.'}
              </p>
              {product.trackStock && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Mevcut adet</span>
                  <StockBadge product={product} canOperate={data.canOperate} pending={pending} onDelta={(d) => run(() => adjustStock({ productId: product.id, delta: d }))} onAbsolute={(v) => run(() => adjustStock({ productId: product.id, absolute: v, note: 'Sayım' }))} />
                </div>
              )}
              {product.manualOverride && !product.isAvailable && <p className="text-xs text-amber-700">Elle &quot;Tükendi&quot; yapıldı; stok girilse de otomatik açılmaz, &quot;Satışta&quot;ya sen alırsın.</p>}
              {product.trackStock && (
                <>
                  <button type="button" onClick={() => setShowTx((v) => !v)} className="text-xs text-blue-600 hover:underline">{showTx ? 'Hareketleri gizle' : `Son hareketler (${product.transactions.length})`}</button>
                  {showTx && (
                    <ul className="text-xs text-gray-600 space-y-0.5">
                      {product.transactions.length === 0 && <li className="text-gray-400">Hareket yok</li>}
                      {product.transactions.slice(0, 6).map((tx) => (
                        <li key={tx.id} className="flex justify-between gap-2"><span className="truncate">{new Date(tx.createdAt).toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })} · {INVENTORY_TX_LABELS[tx.type]}</span><span className="tabular-nums font-mono shrink-0">{tx.quantity > 0 ? '+' : ''}{tx.quantity} → {tx.newQuantity ?? '-'}</span></li>
                      ))}
                    </ul>
                  )}
                </>
              )}
            </div>
          )}

          {/* Ürün */}
          <div className="bg-white rounded-lg border border-gray-200 p-3 space-y-2">
            <p className="text-[11px] uppercase tracking-wider text-gray-500 font-semibold flex items-center gap-1"><span className="material-symbols-outlined" style={{ fontSize: '14px' }}>restaurant_menu</span> Ürün</p>
            {(product.description || product.descriptionEn) && <p className="text-xs text-gray-600 line-clamp-3">{locale === 'en' && product.descriptionEn ? product.descriptionEn : product.description}</p>}
            {data.stockEnabled && (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-gray-500 w-10">SKU</span>
                <Input value={sku} onChange={(e) => setSku(e.target.value)} onBlur={() => { if ((sku || '') !== (product.sku || '')) run(() => setProductSku({ productId: product.id, sku })) }} placeholder="opsiyonel" className="h-7 flex-1 text-xs" disabled={!data.canOperate} />
              </div>
            )}
            <div className="flex items-center gap-3 pt-1">
              {data.canManage && <Link href={`/panel/products/${product.id}/edit`} className="text-sm text-blue-600 hover:underline">{t.common.edit}</Link>}
              {data.canManage && <DeleteButton productId={product.id} />}
            </div>
            {error && <p className="text-xs text-red-600">{error}</p>}
          </div>
        </div>
      )}
    </div>
  )
}

export function ProductsHubClient({ data, initialTab }: { data: ProductsHubData; initialTab: Tab }) {
  const router = useRouter()
  const { t, locale } = useLocale()
  const [tab, setTab] = useState<Tab>(data.marketplaceEnabled ? initialTab : 'list')
  const [category, setCategory] = useState<string>('all')
  const [query, setQuery] = useState('')
  const [quick, setQuick] = useState<Quick>('all')
  const [bulkMode, setBulkMode] = useState(false)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [bulkQty, setBulkQty] = useState('')
  const [pending, start] = useTransition()
  const [bulkMsg, setBulkMsg] = useState<string | null>(null)
  const platforms = data.platforms.filter((p) => p.featureEnabled)
  const unmapped = data.external.filter((e) => !e.linkId)

  const filtered = useMemo(() => {
    const q = query.trim().toLocaleLowerCase('tr-TR')
    return data.products.filter((p) =>
      (category === 'all' || p.categoryId === category) &&
      (!q || p.name.toLocaleLowerCase('tr-TR').includes(q) || (p.nameEn || '').toLocaleLowerCase('tr-TR').includes(q)) &&
      (quick === 'all' ||
        (quick === 'soldout' && !p.isAvailable) ||
        (quick === 'tracked' && p.trackStock) ||
        (quick === 'unlinked' && platforms.some((pl) => !p.local.channels[pl.platform])) ||
        (quick === 'errors' && p.stockChannels.some((c) => c.lastSyncOk === false)))
    )
  }, [data.products, category, query, quick, platforms])

  const soldOut = data.products.filter((p) => !p.isAvailable).length
  const unlinked = data.products.filter((p) => platforms.some((pl) => !p.local.channels[pl.platform])).length
  const syncErrors = data.products.reduce((n, p) => n + p.stockChannels.filter((c) => c.lastSyncOk === false).length, 0)
  const ids = Array.from(selected)
  const allSelected = filtered.length > 0 && filtered.every((p) => selected.has(p.id))

  const bulk = (fn: () => Promise<{ success: boolean; error?: string; done?: number; failed?: number; syncErrors?: number }>) => {
    setBulkMsg(null)
    start(async () => {
      const r = await fn()
      setBulkMsg(r.success ? `${r.done} ürün güncellendi${r.failed ? `, ${r.failed} başarısız` : ''}${r.syncErrors ? `, ${r.syncErrors} platform senkron hatası` : ''}` : r.error || 'Hata')
      setSelected(new Set())
      router.refresh()
    })
  }

  const quickFilters: [Quick, string, number][] = [
    ['all', t.panel.products.all, data.products.length],
    ...(data.stockEnabled ? ([['soldout', 'Tükendi', soldOut]] as [Quick, string, number][]) : []),
    ...(data.marketplaceEnabled ? ([['unlinked', 'Eşleşmemiş', unlinked]] as [Quick, string, number][]) : []),
    ...(data.stockEnabled && syncErrors > 0 ? ([['errors', 'Senkron hatası', syncErrors]] as [Quick, string, number][]) : []),
  ]

  return (
    <div className="space-y-4">
      {/* Başlık */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-3xl text-orange-500">restaurant_menu</span>
              {t.panel.products.title}
            </h1>
            <p className="text-sm text-gray-600 mt-1">{t.panel.products.manageProducts}{data.restaurantName ? ` · ${data.restaurantName}` : ''}</p>
          </div>
          <div className="flex items-center gap-2">
            {data.canOperate && data.stockEnabled && tab === 'list' && (
              <Button variant="outline" onClick={() => { setBulkMode((v) => !v); setSelected(new Set()); setBulkMsg(null) }} className={bulkMode ? 'border-orange-300 bg-orange-50 text-orange-700' : ''}>
                <span className="material-symbols-outlined mr-1" style={{ fontSize: '18px' }}>{bulkMode ? 'close' : 'checklist'}</span>
                {bulkMode ? 'Toplu düzenlemeyi kapat' : 'Toplu düzenle'}
              </Button>
            )}
            {data.canManage && (
              <Link href="/panel/products/new">
                <Button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700">
                  <span className="material-symbols-outlined mr-2">add</span>
                  {t.panel.products.add}
                </Button>
              </Link>
            )}
          </div>
        </div>
        {data.marketplaceEnabled && (
          <div className="flex gap-2 mt-4">
            <button type="button" onClick={() => setTab('list')} className={`px-4 py-2 rounded-full text-sm font-medium border ${tab === 'list' ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 border-gray-200'}`}>Ürünler <span className="ml-1 opacity-70">{data.products.length}</span></button>
            <button type="button" onClick={() => setTab('platform')} className={`px-4 py-2 rounded-full text-sm font-medium border ${tab === 'platform' ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 border-gray-200'}`}>
              Platform ürünleri {unmapped.length > 0 && <span className="ml-1 px-1.5 rounded-full bg-amber-400 text-gray-900 text-xs font-bold">{unmapped.length}</span>}
            </button>
          </div>
        )}
      </div>

      {data.error && <div className="bg-red-50 border border-red-200 rounded-2xl p-5 text-red-700">{data.error}</div>}
      {data.stockEnabled && !data.stockSchemaReady && <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-900">Stok kolonları için <code>supabase/apply/phase5_027.sql</code> çalıştırılmalı.</div>}
      {data.marketplaceEnabled && !data.marketplaceSchemaReady && <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-900">Platform ürün tabloları için <code>supabase/apply/phase4_026.sql</code> çalıştırılmalı.</div>}

      {tab === 'platform' && data.marketplaceEnabled && (
        <>
          <div className="grid md:grid-cols-2 gap-4">
            {platforms.map((p) => <PlatformCard key={p.platform} p={p} canManage={data.canManage} />)}
          </div>
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 divide-y divide-gray-100">
            <div className="px-4 py-3 text-sm font-semibold text-gray-800">Eşleşmeyen platform ürünleri <span className="text-gray-400 font-normal">({unmapped.length})</span></div>
            {unmapped.length === 0 ? (
              <p className="px-5 py-8 text-center text-gray-400 text-sm">Eşleşmeyen platform ürünü yok. Yeni ürünler için &quot;Ürünleri İçe Aktar&quot;a basın.</p>
            ) : (
              unmapped.map((item) => <UnmappedRow key={item.id} item={item} locals={data.products.map((p) => p.local)} categories={data.categories.map((c) => ({ id: c.id, name: c.name }))} canManage={data.canManage} />)
            )}
          </div>
        </>
      )}

      {tab === 'list' && (
        <>
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 px-4 py-3 space-y-2">
            <div className="flex gap-2 overflow-x-auto pb-1">
              <button type="button" onClick={() => setCategory('all')} className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap ${category === 'all' ? 'bg-orange-500 text-white shadow' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>{t.panel.products.all} ({data.products.length})</button>
              {data.categories.map((c) => {
                const count = data.products.filter((p) => p.categoryId === c.id).length
                return (
                  <button key={c.id} type="button" onClick={() => setCategory(c.id)} className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap ${category === c.id ? 'bg-orange-500 text-white shadow' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                    {locale === 'en' && c.nameEn ? c.nameEn : c.name} ({count})
                  </button>
                )
              })}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t.panel.products.searchProducts} className="h-9 w-56" />
              {quickFilters.length > 1 && (
                <div className="flex gap-1 flex-wrap text-xs">
                  {quickFilters.map(([key, label, count]) => (
                    <button key={key} type="button" onClick={() => setQuick(key)} className={`px-2.5 py-1 rounded-full border ${quick === key ? 'bg-gray-900 text-white border-gray-900' : key === 'soldout' && count ? 'bg-red-50 text-red-700 border-red-200' : key === 'errors' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-white text-gray-600 border-gray-200'}`}>
                      {label} {count}
                    </button>
                  ))}
                </div>
              )}
              {bulkMode && filtered.length > 0 && (
                <label className="ml-auto flex items-center gap-1 text-xs text-gray-600"><input type="checkbox" checked={allSelected} onChange={(e) => setSelected(e.target.checked ? new Set(filtered.map((p) => p.id)) : new Set())} className="w-4 h-4 rounded border-gray-300" /> Görünenlerin tümünü seç</label>
              )}
            </div>
            {bulkMode && (
              <div className={`flex items-center gap-2 flex-wrap rounded-xl px-3 py-2 border ${ids.length ? 'bg-orange-50 border-orange-200' : 'bg-gray-50 border-gray-200'}`}>
                <span className="text-sm font-semibold text-gray-800">{ids.length ? `${ids.length} ürün seçili` : 'Ürünleri işaretleyin'}</span>
                <Button size="sm" variant="outline" className="h-8" disabled={pending || !ids.length} onClick={() => bulk(() => bulkSetAvailability({ productIds: ids, available: false }))}>Tükendi yap</Button>
                <Button size="sm" variant="outline" className="h-8" disabled={pending || !ids.length} onClick={() => bulk(() => bulkSetAvailability({ productIds: ids, available: true }))}>Satışa aç</Button>
                <span className="inline-flex items-center gap-1">
                  <Input type="number" min="0" value={bulkQty} onChange={(e) => setBulkQty(e.target.value)} placeholder="Adet" className="h-8 w-20" />
                  <Button size="sm" variant="outline" className="h-8" disabled={pending || !ids.length} onClick={() => bulk(() => bulkSetTrackStock({ productIds: ids, track: true, quantity: bulkQty === '' ? null : Number(bulkQty) }))}>Adet takibini aç</Button>
                </span>
                <Button size="sm" variant="outline" className="h-8" disabled={pending || !ids.length} onClick={() => bulk(() => bulkSetTrackStock({ productIds: ids, track: false }))}>Takibi kapat</Button>
                {bulkMsg && <span className="text-sm text-gray-600">{bulkMsg}</span>}
                {pending && <span className="text-xs text-gray-400">İşleniyor…</span>}
              </div>
            )}
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-gray-300">
              <span className="material-symbols-outlined text-7xl text-gray-300 mb-3 block">restaurant_menu</span>
              <h3 className="text-xl font-bold text-gray-900">{category === 'all' && !query && quick === 'all' ? t.panel.products.noProductsYet : t.panel.products.noProductsInCategory}</h3>
              {data.canManage && category === 'all' && !query && quick === 'all' && (
                <Link href="/panel/products/new" className="inline-block mt-4"><Button className="bg-gradient-to-r from-orange-500 to-orange-600"><span className="material-symbols-outlined mr-2">add</span>{t.panel.products.addProduct}</Button></Link>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((p) => (
                <ProductRow key={p.id} product={p} data={data} bulkMode={bulkMode} selected={selected.has(p.id)} onSelect={(v) => setSelected((prev) => { const n = new Set(prev); if (v) n.add(p.id); else n.delete(p.id); return n })} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
