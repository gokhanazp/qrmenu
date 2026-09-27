import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getAllIntegrations } from '@/app/actions/admin-monitoring'

export const dynamic = 'force-dynamic'

const HEALTH: Record<string, { dot: string; label: string; cls: string }> = {
  active: { dot: '🟢', label: 'Bağlı', cls: 'bg-green-100 text-green-700' },
  warning: { dot: '🟡', label: 'Uyarı', cls: 'bg-amber-100 text-amber-700' },
  error: { dot: '🔴', label: 'Hata', cls: 'bg-red-100 text-red-700' },
  disabled: { dot: '⚪', label: 'Devre dışı', cls: 'bg-slate-100 text-slate-600' },
}

function ago(iso: string | null): string {
  if (!iso) return 'hiç'
  const min = Math.round((Date.now() - new Date(iso).getTime()) / 60000)
  if (min < 1) return 'az önce'
  if (min < 60) return `${min} dk önce`
  const h = Math.round(min / 60)
  if (h < 48) return `${h} saat önce`
  return new Date(iso).toLocaleString('tr-TR')
}

export default async function AdminIntegrationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')
  const { data: isAdminUser } = await supabase.rpc('is_admin')
  if (!isAdminUser) redirect('/panel')

  const { integrations, schemaReady, error } = await getAllIntegrations()
  const errors = integrations.filter((i) => i.status === 'active' && i.healthStatus === 'error').length

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-slate-700 to-slate-900 rounded-2xl shadow-xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Entegrasyon İzleme</h1>
        <p className="text-slate-300">Tüm restoranların pazaryeri bağlantıları, sağlık durumu ve son senkronlar</p>
        <div className="flex gap-6 mt-4 text-sm">
          <span>{integrations.length} bağlantı</span>
          <span className={errors ? 'text-red-300 font-semibold' : ''}>{errors} hatalı</span>
        </div>
      </div>
      {!schemaReady && <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-amber-900 text-sm">Entegrasyon tabloları henüz oluşturulmamış (migration 024).</div>}
      {error && <div className="bg-red-50 border border-red-200 rounded-2xl p-5 text-red-700">{error}</div>}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-slate-100">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {['Restoran', 'Platform', 'Durum', 'Son kontrol', 'Son başarılı senkron', 'Son sipariş çekimi', 'Sipariş', 'Başarısız iş', 'Son hata'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {integrations.length === 0 && <tr><td colSpan={9} className="px-4 py-10 text-center text-slate-500">Henüz bağlantı yok</td></tr>}
              {integrations.map((i) => {
                const h = HEALTH[i.status === 'disabled' ? 'disabled' : i.healthStatus] || HEALTH.warning
                return (
                  <tr key={i.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <Link href={`/admin/restaurants/${i.restaurantId}`} className="text-sm font-semibold text-blue-600 hover:text-blue-800">{i.restaurantName}</Link>
                      <div className="text-xs text-slate-500">{i.tenantName || '-'} · {i.environment}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-800">{i.label}</td>
                    <td className="px-4 py-3"><span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${h.cls}`}>{h.dot} {h.label}</span></td>
                    <td className="px-4 py-3 text-sm text-slate-600 whitespace-nowrap">{ago(i.lastHealthCheckAt)}</td>
                    <td className="px-4 py-3 text-sm text-slate-600 whitespace-nowrap">{ago(i.lastSuccessfulSyncAt)}</td>
                    <td className="px-4 py-3 text-sm text-slate-600 whitespace-nowrap">{ago(i.lastPollAt)}</td>
                    <td className="px-4 py-3 text-sm text-slate-800 tabular-nums">{i.ordersTotal}</td>
                    <td className={`px-4 py-3 text-sm tabular-nums ${i.failedJobs ? 'text-red-600 font-semibold' : 'text-slate-500'}`}>{i.failedJobs}</td>
                    <td className="px-4 py-3 text-xs text-red-600 max-w-[280px] truncate" title={i.lastError || ''}>{i.lastError || '-'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
