import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getAllRestaurants } from '@/app/actions/admin'
import { Button } from '@/components/ui/button'

export default async function AdminDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Check if user is admin
  const { data: isAdminUser } = await supabase.rpc('is_admin')
  if (!isAdminUser) {
    redirect('/panel')
  }

  const { restaurants, error } = await getAllRestaurants()

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center border border-red-100">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-red-600" style={{ fontSize: '32px' }}>
              error
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Hata</h1>
          <p className="text-slate-600">{error}</p>
        </div>
      </div>
    )
  }

  // Calculate stats
  const totalRestaurants = restaurants?.length || 0
  const activeRestaurants = restaurants?.filter((r: any) => r.is_active).length || 0
  const freeRestaurants = restaurants?.filter((r: any) => r.subscriptions?.[0]?.plan === 'free').length || 0
  const proRestaurants = restaurants?.filter((r: any) => r.subscriptions?.[0]?.plan === 'pro').length || 0

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-slate-700 to-slate-900 rounded-2xl shadow-xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Admin Dashboard 🎯
            </h1>
            <p className="text-slate-300 text-lg">
              Sistem Yönetimi
            </p>
            <p className="text-slate-400 text-sm mt-1">
              {user.email}
            </p>
          </div>
          <div className="hidden md:block">
            <div className="w-24 h-24 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <span className="material-symbols-outlined text-white" style={{ fontSize: '48px' }}>
                admin_panel_settings
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Restaurants */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-100 hover:shadow-xl transition-shadow group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-white" style={{ fontSize: '24px' }}>
                store
              </span>
            </div>
            <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
              Toplam
            </span>
          </div>
          <p className="text-3xl font-bold text-slate-900 mb-1">
            {totalRestaurants}
          </p>
          <p className="text-sm text-slate-500">Restoran</p>
        </div>

        {/* Active Restaurants */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-100 hover:shadow-xl transition-shadow group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-white" style={{ fontSize: '24px' }}>
                check_circle
              </span>
            </div>
            <span className="text-xs font-semibold text-green-600 bg-green-50 px-3 py-1 rounded-full">
              Aktif
            </span>
          </div>
          <p className="text-3xl font-bold text-green-600 mb-1">
            {activeRestaurants}
          </p>
          <p className="text-sm text-slate-500">Aktif Restoran</p>
        </div>

        {/* Free Plan */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-100 hover:shadow-xl transition-shadow group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-white" style={{ fontSize: '24px' }}>
                card_giftcard
              </span>
            </div>
            <span className="text-xs font-semibold text-cyan-600 bg-cyan-50 px-3 py-1 rounded-full">
              Free
            </span>
          </div>
          <p className="text-3xl font-bold text-cyan-600 mb-1">
            {freeRestaurants}
          </p>
          <p className="text-sm text-slate-500">Free Plan</p>
        </div>

        {/* Pro Plan */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-100 hover:shadow-xl transition-shadow group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-white" style={{ fontSize: '24px' }}>
                workspace_premium
              </span>
            </div>
            <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-3 py-1 rounded-full">
              Pro
            </span>
          </div>
          <p className="text-3xl font-bold text-purple-600 mb-1">
            {proRestaurants}
          </p>
          <p className="text-sm text-slate-500">Pro Plan</p>
        </div>
      </div>

      {/* Restaurants Table */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-slate-100">
        <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-slate-700 to-slate-900 rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined text-white" style={{ fontSize: '22px' }}>
                  list_alt
                </span>
              </div>
              <h2 className="text-xl font-bold text-slate-900">
                Tüm Restoranlar
              </h2>
            </div>
            <Link href="/admin/restaurants/new">
              <Button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700">
                <span className="material-symbols-outlined mr-2" style={{ fontSize: '20px' }}>add</span>
                Yeni Restoran
              </Button>
            </Link>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Restoran
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Slug
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Plan
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Durum
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Kayıt Tarihi
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {restaurants && restaurants.length > 0 ? (
                restaurants.map((restaurant: any) => (
                  <tr key={restaurant.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="material-symbols-outlined text-white" style={{ fontSize: '20px' }}>
                            restaurant
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-slate-900">
                            {restaurant.name}
                          </div>
                          {!restaurant.is_active && (
                            <div className="flex items-center gap-1 text-xs text-red-600">
                              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
                                cancel
                              </span>
                              Pasif
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-600 font-mono">
                        {restaurant.slug}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex items-center gap-1 text-xs font-semibold rounded-full ${
                        restaurant.subscriptions?.[0]?.plan === 'pro'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-cyan-100 text-cyan-700'
                      }`}>
                        <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
                          {restaurant.subscriptions?.[0]?.plan === 'pro' ? 'workspace_premium' : 'card_giftcard'}
                        </span>
                        {restaurant.subscriptions?.[0]?.plan || 'free'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex items-center gap-1 text-xs font-semibold rounded-full ${
                        restaurant.subscriptions?.[0]?.status === 'active'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
                          {restaurant.subscriptions?.[0]?.status === 'active' ? 'check_circle' : 'schedule'}
                        </span>
                        {restaurant.subscriptions?.[0]?.status || 'active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {new Date(restaurant.created_at).toLocaleDateString('tr-TR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/restaurants/${restaurant.id}`}
                          className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-semibold transition-colors"
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                            visibility
                          </span>
                          Detay
                        </Link>
                        <Link
                          href={`/admin/restaurants/${restaurant.id}/edit`}
                          className="inline-flex items-center gap-1 text-orange-600 hover:text-orange-800 font-semibold transition-colors"
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                            edit
                          </span>
                          Düzenle
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                        <span className="material-symbols-outlined text-slate-400" style={{ fontSize: '32px' }}>
                          store
                        </span>
                      </div>
                      <p className="text-slate-500 font-medium">Henüz restoran bulunmuyor</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}