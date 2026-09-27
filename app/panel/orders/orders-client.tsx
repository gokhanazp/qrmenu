'use client'

import { useCallback, useEffect, useRef, useState, useTransition } from 'react'
import { useOrdersRealtime } from '@/lib/realtime/use-orders-realtime'
import { attachAudioUnlock, CHIME_REPEAT_MS, getAudioState, isSoundEnabled, playOrderChime, setSoundEnabled, unlockAudio } from '@/lib/realtime/chime'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useLocale } from '@/lib/i18n/use-locale'
import { formatCurrency } from '@/lib/utils/currency'
import {
  ACTIVE_ORDER_STATUSES,
  ORDER_SOURCE_LABELS,
  ORDER_STATUS_LABELS,
  PAYMENT_TYPE_LABELS,
  canRoleTransition,
  formatOrderAge,
  type OrderSource,
  type OrderStatus,
} from '@/lib/orders/types'
import type { RestaurantRole } from '@/lib/auth/roles'
import { pollOrdersNow, updateOrderStatus, type PanelOrder, type PanelOrdersData, type PanelOrdersFilter } from '@/app/actions/orders'
import { TRENDYOL_CANCEL_REASONS } from '@/lib/integrations/adapters/trendyol-orders'
import { YEMEKSEPETI_CANCEL_REASONS } from '@/lib/integrations/adapters/yemeksepeti-orders'
import type { CancelReason } from '@/lib/integrations/types'

type Lang = 'tr' | 'en'

const PLATFORM_CANCEL_REASONS: Partial<Record<OrderSource, CancelReason[]>> = {
  trendyol_food: TRENDYOL_CANCEL_REASONS,
  yemeksepeti: YEMEKSEPETI_CANCEL_REASONS,
}

/** Durum rengi: sol şerit, rozet ve grup başlığı aynı paleti kullanır */
const STATUS_THEME: Record<OrderStatus, { bar: string; pill: string; dot: string; icon: string }> = {
  new: { bar: 'border-l-red-500', pill: 'bg-red-500 text-white', dot: 'bg-red-500', icon: 'notifications_active' },
  accepted: { bar: 'border-l-blue-500', pill: 'bg-blue-100 text-blue-800', dot: 'bg-blue-500', icon: 'thumb_up' },
  preparing: { bar: 'border-l-amber-500', pill: 'bg-amber-100 text-amber-800', dot: 'bg-amber-500', icon: 'skillet' },
  ready: { bar: 'border-l-green-500', pill: 'bg-green-100 text-green-800', dot: 'bg-green-500', icon: 'check_circle' },
  completed: { bar: 'border-l-slate-300', pill: 'bg-slate-100 text-slate-600', dot: 'bg-slate-400', icon: 'task_alt' },
  cancelled: { bar: 'border-l-gray-300', pill: 'bg-gray-100 text-gray-500', dot: 'bg-gray-400', icon: 'cancel' },
}

const SOURCE_THEME: Record<OrderSource, { chip: string; icon: string }> = {
  qrmenulist: { chip: 'bg-gray-900 text-white', icon: 'qr_code_2' },
  trendyol_food: { chip: 'bg-orange-500 text-white', icon: 'storefront' },
  yemeksepeti: { chip: 'bg-pink-600 text-white', icon: 'storefront' },
  getir_food: { chip: 'bg-purple-600 text-white', icon: 'storefront' },
  migros_food: { chip: 'bg-emerald-600 text-white', icon: 'storefront' },
}

const NEXT_ACTIONS: { to: OrderStatus; from: OrderStatus[]; tr: string; en: string; icon: string }[] = [
  { to: 'accepted', from: ['new'], tr: 'Kabul Et', en: 'Accept', icon: 'thumb_up' },
  { to: 'preparing', from: ['accepted'], tr: 'Hazırlanıyor', en: 'Preparing', icon: 'skillet' },
  { to: 'ready', from: ['accepted', 'preparing'], tr: 'Hazır', en: 'Ready', icon: 'check_circle' },
  { to: 'completed', from: ['ready'], tr: 'Teslim Edildi', en: 'Delivered', icon: 'task_alt' },
]

const PREP_TIMES = [15, 20, 30, 45, 60]

function buildHref(filter: PanelOrdersFilter, patch: Partial<PanelOrdersFilter>): string {
  const next = { ...filter, ...patch }
  const params = new URLSearchParams()
  if (next.status && next.status !== 'active') params.set('status', next.status)
  if (next.source && next.source !== 'all') params.set('source', next.source)
  if (next.days && next.days !== 7) params.set('days', String(next.days))
  const qs = params.toString()
  return qs ? `/panel/orders?${qs}` : '/panel/orders'
}

function fmtTime(iso: string | null, lang: Lang, now: Date): string {
  if (!iso) return ''
  const d = new Date(iso)
  const sameDay = d.toDateString() === now.toDateString()
  const loc = lang === 'en' ? 'en-GB' : 'tr-TR'
  const time = d.toLocaleTimeString(loc, { hour: '2-digit', minute: '2-digit' })
  return sameDay ? time : `${d.toLocaleDateString(loc, { day: '2-digit', month: '2-digit' })} ${time}`
}

function optionLabel(opt: unknown): string | null {
  if (!opt || typeof opt !== 'object') return typeof opt === 'string' ? opt : null
  const o = opt as Record<string, unknown>
  const name = typeof o.name === 'string' ? o.name : typeof o.title === 'string' ? o.title : null
  if (!name) return null
  const price = typeof o.price === 'number' && o.price > 0 ? ` (+${formatCurrency(o.price)})` : ''
  return name + price
}

/** Sipariş akışı: Alındı → Kabul → Hazır → Teslim (veya İptal) */
function Timeline({ order, lang, now }: { order: PanelOrder; lang: Lang; now: Date }) {
  const steps: { label: string; at: string | null; done: boolean; danger?: boolean }[] = order.status === 'cancelled'
    ? [
        { label: lang === 'en' ? 'Received' : 'Alındı', at: order.createdAt, done: true },
        { label: lang === 'en' ? 'Cancelled' : 'İptal', at: order.cancelledAt, done: true, danger: true },
      ]
    : [
        { label: lang === 'en' ? 'Received' : 'Alındı', at: order.createdAt, done: true },
        { label: lang === 'en' ? 'Accepted' : 'Kabul', at: order.acceptedAt, done: Boolean(order.acceptedAt) || ['preparing', 'ready', 'completed'].includes(order.status) },
        { label: lang === 'en' ? 'Ready' : 'Hazır', at: order.readyAt, done: Boolean(order.readyAt) || order.status === 'completed' },
        { label: lang === 'en' ? 'Delivered' : 'Teslim', at: order.completedAt, done: Boolean(order.completedAt) },
      ]
  return (
    <ol className="flex flex-wrap items-center gap-x-1 gap-y-1.5 text-[11px]">
      {steps.map((s, i) => (
        <li key={s.label} className="flex items-center gap-1">
          {i > 0 && <span className={`w-4 h-px ${s.done ? (s.danger ? 'bg-red-300' : 'bg-green-400') : 'bg-gray-200'}`} />}
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full ${s.done ? (s.danger ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700') : 'bg-gray-50 text-gray-400'}`}>
            <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>{s.done ? (s.danger ? 'cancel' : 'check') : 'radio_button_unchecked'}</span>
            {s.label}{s.at && s.done ? <span className="font-mono opacity-80">{fmtTime(s.at, lang, now)}</span> : null}
          </span>
        </li>
      ))}
    </ol>
  )
}

function OrderCard({ order, role, canOperate, lang, now }: { order: PanelOrder; role: RestaurantRole | null; canOperate: boolean; lang: Lang; now: Date }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [panel, setPanel] = useState<'none' | 'accept' | 'cancel'>('none')
  const [prepMinutes, setPrepMinutes] = useState(30)
  const [reasonCode, setReasonCode] = useState<string>(PLATFORM_CANCEL_REASONS[order.source]?.[0]?.code || '')
  const [reasonText, setReasonText] = useState('')
  const platformReasons = order.isPlatformOrder ? PLATFORM_CANCEL_REASONS[order.source] || [] : []
  const theme = STATUS_THEME[order.status]
  const src = SOURCE_THEME[order.source]
  const isNew = order.status === 'new'
  const isClosed = order.status === 'completed' || order.status === 'cancelled'

  const submit = (to: OrderStatus, extra: { reason?: string; reasonCode?: string; preparationTimeMinutes?: number } = {}) => {
    setError(null)
    startTransition(async () => {
      const result = await updateOrderStatus({ orderId: order.id, status: to, ...extra })
      if (!result.success) setError(result.error || 'Hata')
      else setPanel('none')
      router.refresh()
    })
  }

  const act = (to: OrderStatus) => {
    if (to === 'accepted' && order.isPlatformOrder && order.source === 'trendyol_food') { setPanel(panel === 'accept' ? 'none' : 'accept'); return }
    submit(to)
  }

  const nextActions = NEXT_ACTIONS.filter((a) => a.from.includes(order.status) && canOperate && canRoleTransition(role, order.status, a.to))
  const canCancel = canOperate && canRoleTransition(role, order.status, 'cancelled')
  const [primary, ...secondary] = nextActions
  const hasBreakdown = order.discount > 0 || order.deliveryFee > 0 || Math.abs(order.subtotal - order.total) > 0.005
  const hasCustomer = Boolean(order.customerName || order.customerPhone || order.deliveryAddress || order.customerNote)
  const phoneHref = order.customerPhone ? `tel:${order.customerPhone.replace(/[^\d+]/g, '')}` : null
  const cancelLabel = isNew ? (lang === 'en' ? 'Reject' : 'Reddet') : (lang === 'en' ? 'Cancel' : 'İptal Et')

  return (
    <article className={`bg-white rounded-2xl shadow-sm border border-gray-200 border-l-4 ${theme.bar} ${isNew ? 'ring-2 ring-red-100 shadow-md' : ''} ${isClosed ? 'opacity-80' : ''} flex flex-col`}>
      {/* Başlık */}
      <header className="px-4 pt-3 pb-2 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold ${src.chip}`}>
              <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>{src.icon}</span>
              {ORDER_SOURCE_LABELS[order.source]}
            </span>
            <span className="font-mono text-lg font-bold text-gray-900 leading-none">#{order.orderNumber}</span>
            {order.externalOrderNumber && <span className="text-[11px] text-gray-400 font-mono" title={`${ORDER_SOURCE_LABELS[order.source]} sipariş no`}>· {order.externalOrderNumber}</span>}
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-gray-500 flex-wrap">
            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>schedule</span>
            <span className="font-mono">{fmtTime(order.createdAt, lang, now)}</span>
            <span className={`font-semibold ${isNew ? 'text-red-600' : !isClosed ? 'text-gray-700' : ''}`}>· {formatOrderAge(order.createdAt, now, lang)} {lang === 'en' ? 'ago' : 'önce'}</span>
            {order.isPlatformOrder && order.platformStatus && <span className="text-gray-400">· {ORDER_SOURCE_LABELS[order.source].split(' ')[0]}: {order.platformStatus}</span>}
          </div>
        </div>
        <span className={`shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${theme.pill} ${isNew ? 'animate-pulse' : ''}`}>
          <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>{theme.icon}</span>
          {ORDER_STATUS_LABELS[lang][order.status]}
        </span>
      </header>

      {/* Ürünler */}
      <div className="px-4 py-3 border-t border-gray-100">
        <ul className="space-y-2">
          {order.items.map((item) => {
            const opts = item.options.map(optionLabel).filter((x): x is string => Boolean(x))
            return (
              <li key={item.id} className="flex items-start gap-3">
                <span className="shrink-0 min-w-[2rem] h-7 px-1.5 rounded-lg bg-gray-900 text-white text-sm font-bold tabular-nums flex items-center justify-center">{item.quantity}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-gray-900 leading-snug">{item.name}</p>
                  {opts.length > 0 && <p className="text-xs text-gray-500">+ {opts.join(', ')}</p>}
                  {item.note && <p className="text-xs text-amber-700 italic">&ldquo;{item.note}&rdquo;</p>}
                </div>
                <span className="shrink-0 text-sm text-gray-700 tabular-nums">{formatCurrency(item.totalPrice, order.currency)}</span>
              </li>
            )
          })}
        </ul>
        <div className="mt-3 pt-2 border-t border-dashed border-gray-200 space-y-0.5 text-sm">
          {hasBreakdown && (
            <>
              <div className="flex justify-between text-gray-500"><span>{lang === 'en' ? 'Subtotal' : 'Ara toplam'}</span><span className="tabular-nums">{formatCurrency(order.subtotal, order.currency)}</span></div>
              {order.discount > 0 && <div className="flex justify-between text-green-700"><span>{lang === 'en' ? 'Discount' : 'İndirim'}</span><span className="tabular-nums">−{formatCurrency(order.discount, order.currency)}</span></div>}
              {order.deliveryFee > 0 && <div className="flex justify-between text-gray-500"><span>{lang === 'en' ? 'Delivery fee' : 'Teslimat ücreti'}</span><span className="tabular-nums">{formatCurrency(order.deliveryFee, order.currency)}</span></div>}
            </>
          )}
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 flex items-center gap-2 flex-wrap">
              {order.paymentType && (
                <span className="inline-flex items-center gap-1"><span className="material-symbols-outlined" style={{ fontSize: '14px' }}>{order.paymentType.includes('cash') ? 'payments' : 'credit_card'}</span>{PAYMENT_TYPE_LABELS[lang][order.paymentType] || order.paymentType}</span>
              )}
              <span className="inline-flex items-center gap-1"><span className="material-symbols-outlined" style={{ fontSize: '14px' }}>{order.deliveryType === 'pickup' ? 'shopping_bag' : 'two_wheeler'}</span>{order.deliveryType === 'pickup' ? (lang === 'en' ? 'Pickup' : 'Gel-Al') : (lang === 'en' ? 'Delivery' : 'Kurye')}</span>
            </span>
            <span className="text-xl font-bold text-gray-900 tabular-nums">{formatCurrency(order.total, order.currency)}</span>
          </div>
        </div>
      </div>

      {/* Müşteri */}
      {hasCustomer && (
        <div className="px-4 py-3 border-t border-gray-100 bg-gray-50/70 text-sm space-y-1.5">
          {(order.customerName || order.customerPhone) && (
            <div className="flex items-center gap-2 text-gray-800">
              <span className="material-symbols-outlined text-gray-400" style={{ fontSize: '18px' }}>person</span>
              <span className="font-medium">{order.customerName || (lang === 'en' ? 'Customer' : 'Müşteri')}</span>
              {order.customerPhone && phoneHref && (
                <a href={phoneHref} className="ml-auto inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white border border-gray-200 text-blue-700 font-mono text-xs hover:bg-blue-50">
                  <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>call</span>{order.customerPhone}
                </a>
              )}
            </div>
          )}
          {order.deliveryAddress && (
            <div className="flex items-start gap-2 text-gray-700">
              <span className="material-symbols-outlined text-gray-400 mt-0.5" style={{ fontSize: '18px' }}>location_on</span>
              <span className="leading-snug">{order.deliveryAddress}</span>
            </div>
          )}
          {order.customerNote && (
            <div className="flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 px-2.5 py-1.5 text-amber-900">
              <span className="material-symbols-outlined text-amber-500 mt-0.5" style={{ fontSize: '18px' }}>sticky_note_2</span>
              <span className="leading-snug font-medium">{order.customerNote}</span>
            </div>
          )}
        </div>
      )}

      {order.status === 'cancelled' && order.cancelReason && (
        <div className="px-4 py-2 border-t border-gray-100 text-xs text-red-700 bg-red-50/60 flex items-center gap-2">
          <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>info</span>
          {lang === 'en' ? 'Reason' : 'Sebep'}: {order.cancelReason}
        </div>
      )}

      {/* Akış + aksiyonlar */}
      <footer className="px-4 py-3 border-t border-gray-100 mt-auto space-y-3">
        <Timeline order={order} lang={lang} now={now} />

        {panel === 'accept' && (
          <div className="rounded-xl bg-blue-50 border border-blue-200 p-3 space-y-2">
            <p className="text-sm font-semibold text-blue-900">{lang === 'en' ? 'Preparation time' : 'Hazırlama süresi'} <span className="font-normal text-blue-700">({lang === 'en' ? 'sent to Trendyol' : 'Trendyol’a iletilir'})</span></p>
            <div className="flex gap-1.5 flex-wrap">
              {PREP_TIMES.map((m) => (
                <button key={m} type="button" onClick={() => setPrepMinutes(m)} className={`px-3 py-1.5 rounded-full text-sm font-semibold border ${prepMinutes === m ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-blue-800 border-blue-200'}`}>{m} {lang === 'en' ? 'min' : 'dk'}</button>
              ))}
            </div>
            <div className="flex gap-2 justify-end">
              <Button size="sm" variant="outline" onClick={() => setPanel('none')} disabled={pending}>{lang === 'en' ? 'Back' : 'Vazgeç'}</Button>
              <Button size="sm" disabled={pending} onClick={() => submit('accepted', { preparationTimeMinutes: prepMinutes })} className="bg-green-600 hover:bg-green-700">
                <span className="material-symbols-outlined mr-1" style={{ fontSize: '16px' }}>thumb_up</span>{lang === 'en' ? `Accept · ${prepMinutes} min` : `Kabul Et · ${prepMinutes} dk`}
              </Button>
            </div>
          </div>
        )}

        {panel === 'cancel' && (
          <div className="rounded-xl bg-red-50 border border-red-200 p-3 space-y-2">
            <p className="text-sm font-semibold text-red-900">{cancelLabel} · {lang === 'en' ? 'reason' : 'sebep'}{platformReasons.length > 0 ? ` (${ORDER_SOURCE_LABELS[order.source]})` : ''}</p>
            {platformReasons.length > 0 && (
              <select value={reasonCode} onChange={(e) => setReasonCode(e.target.value)} className="w-full h-9 rounded-md border border-gray-300 px-2 text-sm bg-white">
                {platformReasons.map((r) => <option key={r.code} value={r.code}>{r.label}</option>)}
              </select>
            )}
            <input value={reasonText} onChange={(e) => setReasonText(e.target.value)} placeholder={lang === 'en' ? 'Note (optional)' : 'Not (isteğe bağlı)'} className="w-full h-9 rounded-md border border-gray-300 px-2 text-sm bg-white" />
            <div className="flex gap-2 justify-end">
              <Button size="sm" variant="outline" onClick={() => setPanel('none')} disabled={pending}>{lang === 'en' ? 'Back' : 'Vazgeç'}</Button>
              <Button size="sm" disabled={pending} onClick={() => submit('cancelled', { reasonCode: platformReasons.length ? reasonCode : undefined, reason: reasonText })} className="bg-red-600 hover:bg-red-700">
                {lang === 'en' ? 'Confirm' : 'Onayla'}
              </Button>
            </div>
          </div>
        )}

        {panel === 'none' && (primary || canCancel) && (
          <div className="flex items-center gap-2">
            {primary && (
              <Button disabled={pending} onClick={() => act(primary.to)} className={`flex-1 h-11 text-base font-bold ${primary.to === 'accepted' ? 'bg-green-600 hover:bg-green-700' : primary.to === 'completed' ? 'bg-gray-900 hover:bg-gray-800' : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700'}`}>
                <span className="material-symbols-outlined mr-1.5" style={{ fontSize: '20px' }}>{pending ? 'hourglass_top' : primary.icon}</span>
                {lang === 'en' ? primary.en : primary.tr}
              </Button>
            )}
            {secondary.map((a) => (
              <Button key={a.to} variant="outline" disabled={pending} onClick={() => act(a.to)} className="h-11">
                <span className="material-symbols-outlined mr-1" style={{ fontSize: '18px' }}>{a.icon}</span>{lang === 'en' ? a.en : a.tr}
              </Button>
            ))}
            {canCancel && (
              <button type="button" disabled={pending} onClick={() => setPanel('cancel')} className="h-11 px-3 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50">{cancelLabel}</button>
            )}
          </div>
        )}
        {error && <p className="text-xs text-red-600 flex items-center gap-1"><span className="material-symbols-outlined" style={{ fontSize: '14px' }}>error</span>{error}</p>}
      </footer>
    </article>
  )
}

function PollButton({ lang }: { lang: Lang }) {
  const router = useRouter()
  const [pending, start] = useTransition()
  const [msg, setMsg] = useState<string | null>(null)
  return (
    <span className="inline-flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        disabled={pending}
        onClick={() => {
          setMsg(null)
          start(async () => {
            const r = await pollOrdersNow()
            if (!r.success) setMsg(r.error || 'Hata')
            else {
              const parts = (r.results || []).map((p) => p.error ? `${ORDER_SOURCE_LABELS[p.platform as OrderSource] || p.platform}: ${p.error}` : `${ORDER_SOURCE_LABELS[p.platform as OrderSource] || p.platform}: ${p.fetched} paket, ${p.created} yeni`)
              setMsg(parts.length ? parts.join(' · ') : (lang === 'en' ? 'No polling platform connected' : 'Çekilecek platform bağlantısı yok'))
            }
            router.refresh()
          })
        }}
      >
        <span className={`material-symbols-outlined mr-1 ${pending ? 'animate-spin' : ''}`} style={{ fontSize: '18px' }}>{pending ? 'sync' : 'cloud_download'}</span>
        {pending ? (lang === 'en' ? 'Fetching...' : 'Çekiliyor...') : (lang === 'en' ? 'Fetch from platforms' : 'Platformdan Çek')}
      </Button>
      {msg && <span className="text-xs text-gray-500 max-w-xs truncate" title={msg}>{msg}</span>}
    </span>
  )
}

const GROUP_ORDER: OrderStatus[] = ['new', 'accepted', 'preparing', 'ready', 'completed', 'cancelled']

export function OrdersClient({ data, filter }: { data: PanelOrdersData; filter: PanelOrdersFilter }) {
  const router = useRouter()
  const { t, locale } = useLocale()
  const lang: Lang = locale === 'en' ? 'en' : 'tr'

  // Tek saat: tüm kartlar aynı "şimdi"yi kullanır (30 sn'de bir)
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000)
    return () => clearInterval(id)
  }, [])

  // Yedek: 30 sn'de bir yenile (Realtime koparsa)
  useEffect(() => {
    if (!data.featureEnabled) return
    const id = setInterval(() => router.refresh(), 30_000)
    return () => clearInterval(id)
  }, [router, data.featureEnabled])

  // Realtime: yeni sipariş → ses + anlık yenileme; durum değişimi → yenileme
  const [soundOn, setSoundOn] = useState(false)
  const [live, setLive] = useState<'connecting' | 'live' | 'off'>('connecting')
  const [toast, setToast] = useState<string | null>(null)
  const refreshTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => { setSoundOn(isSoundEnabled()) }, [])
  const scheduleRefresh = useCallback(() => {
    if (refreshTimer.current) clearTimeout(refreshTimer.current)
    refreshTimer.current = setTimeout(() => router.refresh(), 400)
  }, [router])
  useOrdersRealtime(data.featureEnabled ? data.restaurantId : null, {
    onInsert: (row) => {
      if (row.status === 'new') {
        if (isSoundEnabled()) playOrderChime()
        setToast(`${lang === 'en' ? 'New order' : 'Yeni sipariş'} #${row.order_number} · ${ORDER_SOURCE_LABELS[row.source as OrderSource] || row.source}`)
        setTimeout(() => setToast(null), 8000)
      }
      scheduleRefresh()
    },
    onUpdate: () => scheduleRefresh(),
    onStatus: (status) => setLive(status === 'SUBSCRIBED' ? 'live' : status === 'CLOSED' || status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' ? 'off' : 'connecting'),
  })
  const [audioBlocked, setAudioBlocked] = useState(false)
  const toggleSound = async () => {
    if (soundOn) { setSoundEnabled(false); setSoundOn(false); return }
    const ok = await unlockAudio()
    setSoundEnabled(true)
    setSoundOn(true)
    setAudioBlocked(!ok)
    if (ok) playOrderChime()
  }

  useEffect(() => {
    if (!soundOn) return
    if (getAudioState() === 'running') { setAudioBlocked(false); return }
    setAudioBlocked(true)
    const cleanup = attachAudioUnlock(() => setAudioBlocked(false))
    return cleanup
  }, [soundOn])

  useEffect(() => {
    if (!soundOn || !data.featureEnabled || data.counts.new === 0) return
    if (getAudioState() === 'running') playOrderChime()
    const id = setInterval(() => { if (getAudioState() === 'running') playOrderChime() }, CHIME_REPEAT_MS)
    return () => clearInterval(id)
  }, [soundOn, data.featureEnabled, data.counts.new])
  useEffect(() => {
    if (typeof document === 'undefined') return
    const n = data.counts.new
    document.title = n > 0 ? `(${n}) ${t.panel.orders.title}` : t.panel.orders.title
  }, [data.counts.new, t.panel.orders.title])

  const activeCount = ACTIVE_ORDER_STATUSES.reduce((sum, s) => sum + data.counts[s], 0)
  const totalCount = activeCount + data.counts.completed + data.counts.cancelled
  const status = filter.status || 'active'

  const tabs: { key: PanelOrdersFilter['status']; label: string; count: number; dot?: string }[] = [
    { key: 'active', label: lang === 'en' ? 'Active' : 'Aktif', count: activeCount },
    { key: 'new', label: ORDER_STATUS_LABELS[lang].new, count: data.counts.new, dot: STATUS_THEME.new.dot },
    { key: 'accepted', label: ORDER_STATUS_LABELS[lang].accepted, count: data.counts.accepted, dot: STATUS_THEME.accepted.dot },
    { key: 'preparing', label: ORDER_STATUS_LABELS[lang].preparing, count: data.counts.preparing, dot: STATUS_THEME.preparing.dot },
    { key: 'ready', label: ORDER_STATUS_LABELS[lang].ready, count: data.counts.ready, dot: STATUS_THEME.ready.dot },
    { key: 'completed', label: ORDER_STATUS_LABELS[lang].completed, count: data.counts.completed, dot: STATUS_THEME.completed.dot },
    { key: 'cancelled', label: ORDER_STATUS_LABELS[lang].cancelled, count: data.counts.cancelled, dot: STATUS_THEME.cancelled.dot },
    { key: 'all', label: lang === 'en' ? 'All' : 'Tümü', count: totalCount },
  ]

  // Aktif / Tümü görünümünde durum gruplarına böl (Yeni en üstte)
  const grouped: { status: OrderStatus; orders: PanelOrder[] }[] = status === 'active' || status === 'all'
    ? GROUP_ORDER.map((s) => ({ status: s, orders: data.orders.filter((o) => o.status === s) })).filter((g) => g.orders.length > 0)
    : [{ status: status as OrderStatus, orders: data.orders }]

  const periodLabel = filter.days === 1 ? (lang === 'en' ? 'today' : 'bugün') : filter.days === 30 ? (lang === 'en' ? 'last 30 days' : 'son 30 gün') : (lang === 'en' ? 'last 7 days' : 'son 7 gün')

  return (
    <div className="space-y-4">
      {/* Başlık + araçlar */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-3xl text-orange-500">receipt_long</span>
              {t.panel.orders.title}
              {data.counts.new > 0 && (
                <span className="ml-1 px-2.5 py-0.5 rounded-full bg-red-500 text-white text-sm font-bold animate-pulse">{data.counts.new} {lang === 'en' ? 'new' : 'yeni'}</span>
              )}
            </h1>
            <p className="text-sm text-gray-600 mt-1">{data.restaurantName ? `${data.restaurantName} · ` : ''}{periodLabel}</p>
          </div>
          {data.featureEnabled && (
            <div className="flex items-center gap-2 flex-wrap">
              <button type="button" onClick={toggleSound} className={`h-9 px-3 rounded-lg border text-sm font-medium flex items-center gap-1.5 ${soundOn ? 'bg-green-50 border-green-300 text-green-700' : 'bg-white border-gray-300 text-gray-700'}`} title={lang === 'en' ? 'Sound alert for new orders' : 'Yeni siparişte sesli uyarı'}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>{soundOn ? 'volume_up' : 'volume_off'}</span>
                {soundOn ? (lang === 'en' ? 'Sound on' : 'Ses açık') : (lang === 'en' ? 'Sound off' : 'Ses kapalı')}
              </button>
              <span className={`h-9 px-3 rounded-lg border text-xs font-medium inline-flex items-center gap-1.5 ${live === 'live' ? 'border-green-200 bg-green-50 text-green-700' : live === 'off' ? 'border-gray-200 bg-gray-50 text-gray-500' : 'border-amber-200 bg-amber-50 text-amber-700'}`} title="Realtime bağlantısı">
                <span className={`inline-block w-2 h-2 rounded-full ${live === 'live' ? 'bg-green-500 animate-pulse' : live === 'off' ? 'bg-gray-300' : 'bg-amber-400'}`} />
                {live === 'live' ? (lang === 'en' ? 'Live' : 'Canlı') : live === 'off' ? (lang === 'en' ? 'Auto-refresh' : 'Otomatik yenileme') : (lang === 'en' ? 'Connecting' : 'Bağlanıyor')}
              </span>
              <Button variant="outline" size="sm" onClick={() => router.refresh()} title={lang === 'en' ? 'Refresh' : 'Yenile'}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>refresh</span>
              </Button>
              {data.canPoll && <PollButton lang={lang} />}
            </div>
          )}
        </div>
        {soundOn && audioBlocked && data.featureEnabled && (
          <p className="mt-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5 inline-flex items-center gap-1"><span className="material-symbols-outlined" style={{ fontSize: '14px' }}>touch_app</span>{lang === 'en' ? 'Tap the page once to enable sound' : 'Sesin çalması için sayfaya bir kez dokunun'}</p>
        )}
      </div>

      {toast && (
        <div className="fixed top-4 right-4 z-[100] bg-gray-900 text-white rounded-xl shadow-2xl px-5 py-3 flex items-center gap-2 animate-pulse">
          <span className="material-symbols-outlined text-orange-400">notifications_active</span>
          <span className="font-semibold">{toast}</span>
        </div>
      )}
      {data.error && <div className="bg-red-50 border border-red-200 rounded-2xl p-5 text-red-700">{data.error}</div>}
      {(data.pollResults || []).filter((p) => p.error).map((p) => (
        <div key={p.integrationId} className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-900">
          {ORDER_SOURCE_LABELS[p.platform as OrderSource] || p.platform} sipariş çekimi: {p.error}
        </div>
      ))}

      {!data.schemaReady && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-sm text-amber-900">
          <p className="font-semibold">Sipariş tabloları henüz oluşturulmamış</p>
          <p className="mt-1">Supabase SQL Editor üzerinden <code>supabase/apply/phase2_025.sql</code> dosyasını çalıştırın.</p>
        </div>
      )}

      {!data.featureEnabled && !data.error && (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-sm text-slate-700">
          {lang === 'en'
            ? 'The order panel is not enabled for this restaurant. Orders keep going to WhatsApp as before.'
            : 'Sipariş paneli bu restoran için açık değil. Siparişler eskisi gibi WhatsApp’a gitmeye devam eder.'}
        </div>
      )}

      {data.featureEnabled && data.schemaReady && (
        <>
          {/* Filtreler */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 px-4 py-3 flex items-center gap-3 flex-wrap">
            <div className="flex flex-wrap gap-1.5 flex-1 min-w-0">
              {tabs.map((tab) => {
                const active = status === tab.key
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => router.push(buildHref(filter, { status: tab.key }))}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${active ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}
                  >
                    {tab.dot && <span className={`w-2 h-2 rounded-full ${tab.dot}`} />}
                    {tab.label}
                    <span className={`tabular-nums text-xs px-1.5 rounded-full ${active ? 'bg-white/20 text-white' : tab.key === 'new' && tab.count > 0 ? 'bg-red-500 text-white font-bold' : 'bg-gray-100 text-gray-500'}`}>{tab.count}</span>
                  </button>
                )
              })}
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <select value={filter.days || 7} onChange={(e) => router.push(buildHref(filter, { days: Number(e.target.value) }))} className="h-9 rounded-lg border border-gray-300 px-2 text-sm bg-white">
                <option value={1}>{lang === 'en' ? 'Today' : 'Bugün'}</option>
                <option value={7}>{lang === 'en' ? 'Last 7 days' : 'Son 7 gün'}</option>
                <option value={30}>{lang === 'en' ? 'Last 30 days' : 'Son 30 gün'}</option>
              </select>
              <select value={filter.source || 'all'} onChange={(e) => router.push(buildHref(filter, { source: e.target.value as PanelOrdersFilter['source'] }))} className="h-9 rounded-lg border border-gray-300 px-2 text-sm bg-white">
                <option value="all">{lang === 'en' ? 'All channels' : 'Tüm kanallar'}</option>
                {(Object.keys(ORDER_SOURCE_LABELS) as OrderSource[]).map((s) => (
                  <option key={s} value={s}>{ORDER_SOURCE_LABELS[s]}</option>
                ))}
              </select>
            </div>
          </div>

          {data.orders.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center text-gray-500">
              <span className="material-symbols-outlined text-5xl text-gray-300 mb-2 block">inbox</span>
              {lang === 'en' ? 'No orders in this view' : 'Bu görünümde sipariş yok'}
              <p className="text-xs text-gray-400 mt-1">{lang === 'en' ? 'New orders appear here automatically.' : 'Yeni siparişler buraya kendiliğinden düşer.'}</p>
            </div>
          ) : (
            <div className="space-y-6">
              {grouped.map((g) => (
                <section key={g.status}>
                  {grouped.length > 1 && (
                    <h2 className="flex items-center gap-2 text-sm font-bold text-gray-800 mb-2 px-1">
                      <span className={`w-2.5 h-2.5 rounded-full ${STATUS_THEME[g.status].dot}`} />
                      {ORDER_STATUS_LABELS[lang][g.status]}
                      <span className="text-gray-400 font-normal">{g.orders.length}</span>
                    </h2>
                  )}
                  <div className="grid gap-4 xl:grid-cols-2">
                    {g.orders.map((order) => (
                      <OrderCard key={order.id} order={order} role={data.role as RestaurantRole | null} canOperate={data.canOperate} lang={lang} now={now} />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
