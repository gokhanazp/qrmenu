'use client'

import { useRouter } from 'next/navigation'
import { useLocale } from '@/lib/i18n/use-locale'
import { formatCurrency } from '@/lib/utils/currency'
import { ORDER_SOURCE_LABELS } from '@/lib/orders/types'
import type { ReportsData } from '@/app/actions/reports'

function Bar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.max(2, Math.round((value / max) * 100)) : 0
  return <div className="h-2 rounded-full bg-gray-100 overflow-hidden"><div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} /></div>
}

export function ReportsClient({ data }: { data: ReportsData }) {
  const router = useRouter()
  const { t, locale } = useLocale()
  const lang: 'tr' | 'en' = locale === 'en' ? 'en' : 'tr'
  const s = data.summary
  const go = (patch: { days?: number; scope?: 'current' | 'all' }) => {
    const p = new URLSearchParams()
    const days = patch.days ?? data.days
    const scope = patch.scope ?? data.scope
    if (days !== 1) p.set('days', String(days))
    if (scope === 'all') p.set('scope', 'all')
    router.push(`/panel/reports${p.toString() ? `?${p}` : ''}`)
  }
  const periodLabel = data.days === 1 ? (lang === 'en' ? 'Today' : 'Bugün') : data.days === 7 ? (lang === 'en' ? 'Last 7 days' : 'Son 7 gün') : (lang === 'en' ? 'Last 30 days' : 'Son 30 gün')
  const maxSource = s ? Math.max(...s.bySource.map((x) => x.revenue), 0) : 0
  const maxDay = s ? Math.max(...s.byDay.map((x) => x.revenue), 0) : 0
  const restaurantName = (id: string) => data.restaurants.find((r) => r.id === id)?.name || id

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-3xl text-orange-500">bar_chart</span>
              {t.panel.reports.title}
            </h1>
            <p className="text-sm text-gray-600 mt-1">{t.panel.reports.subtitle}{data.restaurantName ? ` · ${data.scope === 'all' ? (lang === 'en' ? 'All branches' : 'Tüm şubeler') : data.restaurantName}` : ''}</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {[1, 7, 30].map((d) => (
              <button key={d} type="button" onClick={() => go({ days: d })} className={`px-3 py-1.5 rounded-full text-sm font-medium border ${data.days === d ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 border-gray-200'}`}>
                {d === 1 ? (lang === 'en' ? 'Today' : 'Bugün') : d === 7 ? (lang === 'en' ? '7 days' : '7 gün') : (lang === 'en' ? '30 days' : '30 gün')}
              </button>
            ))}
            {data.canViewAllBranches && (
              <select value={data.scope} onChange={(e) => go({ scope: e.target.value as 'current' | 'all' })} className="h-9 rounded-md border border-gray-300 px-2 text-sm bg-white">
                <option value="current">{data.restaurantName}</option>
                <option value="all">{lang === 'en' ? 'All branches' : 'Tüm şubeler'}</option>
              </select>
            )}
          </div>
        </div>
      </div>

      {data.error && <div className="bg-red-50 border border-red-200 rounded-2xl p-5 text-red-700">{data.error}</div>}
      {!data.featureEnabled && !data.error && (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-sm text-slate-700">{lang === 'en' ? 'Reports are not enabled for this restaurant.' : 'Raporlar bu restoran için açık değil.'}</div>
      )}

      {s && (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: `${periodLabel} · ${lang === 'en' ? 'Orders' : 'Sipariş'}`, value: String(s.orders), icon: 'receipt_long' },
              { label: `${periodLabel} · ${lang === 'en' ? 'Revenue' : 'Ciro'}`, value: formatCurrency(s.revenue), icon: 'payments' },
              { label: lang === 'en' ? 'Average order' : 'Ortalama sipariş', value: formatCurrency(s.averageOrder), icon: 'functions' },
              { label: lang === 'en' ? 'Cancelled' : 'İptal', value: String(s.cancelled), icon: 'cancel' },
            ].map((c) => (
              <div key={c.label} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5">
                <div className="flex items-center gap-2 text-gray-500 text-xs uppercase tracking-wider"><span className="material-symbols-outlined text-orange-500" style={{ fontSize: '18px' }}>{c.icon}</span>{c.label}</div>
                <p className="text-2xl font-bold text-gray-900 mt-2 tabular-nums">{c.value}</p>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5 space-y-3">
              <h2 className="font-bold text-gray-900">{lang === 'en' ? 'By platform' : 'Platform bazında'}</h2>
              {s.bySource.length === 0 && <p className="text-sm text-gray-400">{lang === 'en' ? 'No orders' : 'Sipariş yok'}</p>}
              {s.bySource.map((x) => (
                <div key={x.source} className="space-y-1">
                  <div className="flex justify-between text-sm"><span className="font-medium text-gray-800">{ORDER_SOURCE_LABELS[x.source]}</span><span className="tabular-nums text-gray-600">{x.orders} {lang === 'en' ? 'orders' : 'sipariş'} · {formatCurrency(x.revenue)}{x.cancelled ? ` · ${x.cancelled} ${lang === 'en' ? 'cancelled' : 'iptal'}` : ''}</span></div>
                  <Bar value={x.revenue} max={maxSource} color="bg-gradient-to-r from-orange-400 to-orange-600" />
                </div>
              ))}
            </div>
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5 space-y-3">
              <h2 className="font-bold text-gray-900">{lang === 'en' ? 'By day' : 'Gün bazında'}</h2>
              {s.byDay.length === 0 && <p className="text-sm text-gray-400">{lang === 'en' ? 'No orders' : 'Sipariş yok'}</p>}
              {s.byDay.map((d) => (
                <div key={d.day} className="space-y-1">
                  <div className="flex justify-between text-sm"><span className="text-gray-800">{new Date(d.day + 'T12:00:00Z').toLocaleDateString(lang === 'en' ? 'en-GB' : 'tr-TR', { day: '2-digit', month: 'short' })}</span><span className="tabular-nums text-gray-600">{d.orders} · {formatCurrency(d.revenue)}</span></div>
                  <Bar value={d.revenue} max={maxDay} color="bg-gradient-to-r from-blue-400 to-blue-600" />
                </div>
              ))}
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5">
              <h2 className="font-bold text-gray-900 mb-3">{lang === 'en' ? 'Top products' : 'En çok satanlar'}</h2>
              {s.topProducts.length === 0 && <p className="text-sm text-gray-400">{lang === 'en' ? 'No data' : 'Veri yok'}</p>}
              <ol className="space-y-1.5 text-sm">
                {s.topProducts.map((p, i) => (
                  <li key={p.name} className="flex justify-between gap-3"><span className="text-gray-800 truncate"><span className="text-gray-400 mr-2">{i + 1}.</span>{p.name}</span><span className="tabular-nums text-gray-600 shrink-0">{p.quantity} {lang === 'en' ? 'pcs' : 'adet'} · {formatCurrency(p.revenue)}</span></li>
                ))}
              </ol>
            </div>
            {data.scope === 'all' && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5">
                <h2 className="font-bold text-gray-900 mb-3">{lang === 'en' ? 'By branch' : 'Şube bazında'}</h2>
                <ul className="space-y-1.5 text-sm">
                  {s.byRestaurant.map((r) => (
                    <li key={r.restaurantId} className="flex justify-between gap-3"><span className="text-gray-800">{restaurantName(r.restaurantId)}</span><span className="tabular-nums text-gray-600">{r.orders} · {formatCurrency(r.revenue)}</span></li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <p className="text-xs text-gray-500">{lang === 'en' ? 'Revenue = order totals excluding cancelled orders; platform commissions are not deducted.' : 'Ciro = iptal hariç sipariş toplamları; platform komisyonları düşülmemiştir.'}</p>
        </>
      )}
    </div>
  )
}
