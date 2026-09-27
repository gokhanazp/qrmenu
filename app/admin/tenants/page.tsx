import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getTenants } from '@/app/actions/tenants'
import { CreateTenantForm } from './create-tenant-form'

export default async function AdminTenantsPage({
  searchParams,
}: {
  searchParams?: { all?: string }
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: isAdminUser } = await supabase.rpc('is_admin')
  if (!isAdminUser) redirect('/panel')

  const { tenants: allTenants, schemaReady, error } = await getTenants()

  // Varsayılan: yalnızca "Tenant / Çoklu Şube" özelliği açık olanlar (WhatsApp mantığı).
  const showAll = searchParams?.all === '1'
  const tenants = showAll ? allTenants : allTenants.filter((t) => t.active)
  const hiddenCount = allTenants.length - allTenants.filter((t) => t.active).length

  const totalRestaurants = tenants.reduce((sum, t) => sum + t.restaurantCount, 0)
  const totalUsers = tenants.reduce((sum, t) => sum + t.userCount, 0)
  const totalPlatforms = tenants.reduce((sum, t) => sum + t.platformCount, 0)

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-slate-700 to-slate-900 rounded-2xl shadow-xl p-8 text-white">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold mb-2">Müşteriler (Tenant)</h1>
            <p className="text-slate-300">
              Bir tenant birden fazla şubeye (restorana) sahip olabilir. Restoranın düzenleme sayfasında
              &quot;Tenant / Çoklu Şube&quot; özelliğini açtığınızda burada görünür.
            </p>
          </div>
          <div className="hidden md:block">
            <span className="material-symbols-outlined text-white/80" style={{ fontSize: '48px' }}>domain</span>
          </div>
        </div>
      </div>

      {!schemaReady && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-3">
          <span className="material-symbols-outlined text-amber-600">warning</span>
          <div>
            <p className="font-semibold text-amber-900">Tenant tabloları henüz oluşturulmamış</p>
            <p className="text-sm text-amber-800 mt-1">
              Supabase Dashboard → SQL Editor üzerinden sırasıyla <code>supabase/migrations/022_add_tenants.sql</code> ve{' '}
              <code>023_add_restaurant_features.sql</code> dosyalarını çalıştırın. Mevcut sistem bu arada aynen çalışmaya devam eder.
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5 text-red-700">{error}</div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Tenant', value: tenants.length, icon: 'domain', color: 'from-blue-500 to-blue-600' },
          { label: 'Şube', value: totalRestaurants, icon: 'store', color: 'from-orange-500 to-orange-600' },
          { label: 'Kullanıcı', value: totalUsers, icon: 'group', color: 'from-green-500 to-green-600' },
          { label: 'Bağlı Platform', value: totalPlatforms, icon: 'hub', color: 'from-purple-500 to-purple-600' },
        ].map((card) => (
          <div key={card.label} className="bg-white rounded-2xl shadow-lg p-6 border border-slate-100">
            <div className={`w-12 h-12 bg-gradient-to-br ${card.color} rounded-xl flex items-center justify-center shadow-lg mb-4`}>
              <span className="material-symbols-outlined text-white" style={{ fontSize: '24px' }}>{card.icon}</span>
            </div>
            <p className="text-3xl font-bold text-slate-900 mb-1">{card.value}</p>
            <p className="text-sm text-slate-500">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-slate-100">
        <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-xl font-bold text-slate-900">{showAll ? 'Tüm Tenant\'lar' : 'Aktif Tenant\'lar'}</h2>
            {schemaReady && hiddenCount > 0 && (
              <Link
                href={showAll ? '/admin/tenants' : '/admin/tenants?all=1'}
                className="text-sm font-medium text-blue-600 hover:text-blue-800"
              >
                {showAll ? 'Yalnızca aktifleri göster' : `Özelliği kapalı ${hiddenCount} tenant\'ı da göster`}
              </Link>
            )}
          </div>
          {schemaReady && <CreateTenantForm />}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {['Tenant', 'Plan', 'Durum', 'Şubeler', 'Kullanıcı', 'Platformlar', 'Bugün', 'Son senkron', 'Kayıt', ''].map((h) => (
                  <th key={h} className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {tenants.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-6 py-12 text-center text-slate-500">
                    {showAll
                      ? 'Henüz tenant yok'
                      : 'Aktif tenant yok. Bir restoranın düzenleme sayfasında "Tenant / Çoklu Şube" özelliğini açın.'}
                  </td>
                </tr>
              ) : (
                tenants.map((tenant) => (
                  <tr key={tenant.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-slate-900">{tenant.name}</div>
                      <div className="text-xs text-slate-500 font-mono">{tenant.slug}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700">{tenant.plan}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1 items-start">
                        <span className={`px-3 py-1 inline-flex text-xs font-semibold rounded-full ${tenant.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {tenant.status === 'active' ? 'Aktif' : 'Askıda'}
                        </span>
                        {!tenant.multiBranch && (
                          <span className="text-[11px] text-slate-400">Çoklu şube özelliği kapalı</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700">
                      <div className="font-semibold">{tenant.restaurantCount}</div>
                      <div className="text-xs text-slate-500 truncate max-w-[220px]">
                        {tenant.restaurants.map((r) => r.name).join(', ')}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700">{tenant.userCount}</td>
                    <td className="px-6 py-4 text-sm text-slate-700">
                      {tenant.connectedPlatforms.length === 0 ? <span className="text-slate-400">-</span> : tenant.connectedPlatforms.map((p) => (
                        <span key={p} className="inline-block mr-1 mb-1 px-2 py-0.5 rounded-full bg-orange-50 text-orange-700 text-xs">{p === 'trendyol_food' ? 'Trendyol' : p === 'yemeksepeti' ? 'Yemeksepeti' : p}</span>
                      ))}
                      {tenant.integrationErrors > 0 && <div className="text-xs text-red-600 font-semibold">{tenant.integrationErrors} hatalı</div>}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700 tabular-nums">{tenant.ordersToday}</td>
                    <td className="px-6 py-4 text-xs text-slate-500 whitespace-nowrap">{tenant.lastSyncAt ? new Date(tenant.lastSyncAt).toLocaleString('tr-TR') : '-'}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">
                      {new Date(tenant.created_at).toLocaleDateString('tr-TR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link href={`/admin/tenants/${tenant.id}`} className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-semibold text-sm">
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>visibility</span>
                        Detay
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
