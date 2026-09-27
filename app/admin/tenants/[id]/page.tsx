import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getTenantDetail } from '@/app/actions/tenants'
import { Button } from '@/components/ui/button'
import { FEATURE_LABELS } from '@/lib/features'
import { TenantSettingsForm } from './tenant-settings-form'
import { TenantMembersClient } from './tenant-members-client'
import { RestaurantUsersClient } from './restaurant-users-client'

export default async function AdminTenantDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: isAdminUser } = await supabase.rpc('is_admin')
  if (!isAdminUser) redirect('/panel')

  const { detail, error } = await getTenantDetail(params.id)
  if (error || !detail) notFound()

  const { tenant, restaurants, members } = detail

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <Link href="/admin/tenants">
              <Button variant="outline" size="sm">← Geri</Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{tenant.name}</h1>
              <p className="text-sm text-slate-500 font-mono">{tenant.slug}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${tenant.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {tenant.status === 'active' ? 'Aktif' : 'Askıda'}
            </span>
            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-700">{tenant.plan}</span>
            <Link href={`/admin/restaurants/new?tenant=${tenant.id}`}>
              <Button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700">
                <span className="material-symbols-outlined mr-2" style={{ fontSize: '20px' }}>add_business</span>
                Yeni Şube Ekle
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Tenant Ayarları</h2>
        <TenantSettingsForm tenant={tenant} />
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Şubeler ({restaurants.length})</h2>
        </div>
        <div className="divide-y divide-slate-100">
          {restaurants.length === 0 && (
            <p className="px-6 py-8 text-sm text-slate-500 text-center">Bu tenant&apos;a bağlı şube yok</p>
          )}
          {restaurants.map((r) => (
            <div key={r.id} className="px-6 py-4">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-slate-900">{r.name}</p>
                    {!r.is_active && <span className="text-xs text-red-600">Pasif</span>}
                    {r.whatsappOrdering && (
                      <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-medium">WhatsApp Sipariş</span>
                    )}
                    {r.features.map((f) => (
                      <span key={f} className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-medium">
                        {FEATURE_LABELS[f].label}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    <span className="font-mono">/restorant/{r.slug}</span> · Sahip: {r.ownerEmail}
                  </p>
                  <RestaurantUsersClient restaurantId={r.id} users={r.users} />
                </div>
                <div className="flex items-center gap-3 text-sm font-semibold">
                  <Link href={`/admin/restaurants/${r.id}`} className="text-blue-600 hover:text-blue-800">Detay</Link>
                  <Link href={`/admin/restaurants/${r.id}/edit`} className="text-orange-600 hover:text-orange-800">Düzenle</Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-1">Tenant Üyeleri</h2>
        <p className="text-sm text-slate-500 mb-4">
          Sahip ve Yönetici tüm şubeleri yönetir; Muhasebe yalnızca raporları görür. Şubeye özel kullanıcılar (şube müdürü, personel, mutfak) yukarıda şube satırından eklenir.
        </p>
        <TenantMembersClient tenantId={tenant.id} members={members} />
      </div>
    </div>
  )
}
