import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

type Restaurant = {
  id: string
  name: string
  slug: string
  logo_url: string | null
  is_active: boolean
  created_at: string
  subscriptions?: Array<{
    plan: string
    status: string
    current_period_start: string | null
    current_period_end: string | null
  }>
}

type ScanEvent = {
  restaurant_id: string
  scanned_at: string
}

export default async function AdminRestaurantsPage() {
  const supabase = await createClient()

  // Check if user is admin
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth/login')
  }

  const { data: isAdmin } = await supabase
    .from('admin_users')
    .select('user_id')
    .eq('user_id', user.id)
    .single()

  if (!isAdmin) {
    redirect('/panel')
  }

  // Fetch all restaurants with stats
  const { data: restaurants } = await supabase
    .from('restaurants')
    .select(`
      *,
      subscriptions (
        plan,
        status,
        current_period_start,
        current_period_end
      )
    `)
    .order('created_at', { ascending: false })

  // Fetch scan stats for each restaurant
  const restaurantIds = (restaurants as Restaurant[])?.map(r => r.id) || []
  
  const { data: scanStats } = await supabase
    .from('scan_events')
    .select('restaurant_id, scanned_at')
    .in('restaurant_id', restaurantIds)

  // Calculate stats
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)

  const statsMap = new Map<string, { total: number; today: number; week: number }>()
  ;(scanStats as ScanEvent[])?.forEach(scan => {
    const rid = scan.restaurant_id
    if (!statsMap.has(rid)) {
      statsMap.set(rid, { total: 0, today: 0, week: 0 })
    }
    const stats = statsMap.get(rid)!
    stats.total++
    
    const scanDate = new Date(scan.scanned_at)
    if (scanDate >= today) stats.today++
    if (scanDate >= sevenDaysAgo) stats.week++
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Link href="/admin">
                  <Button variant="ghost" size="sm">
                    <span className="material-symbols-outlined mr-2">arrow_back</span>
                    Geri
                  </Button>
                </Link>
              </div>
              <Link href="/admin/restaurants/new">
                <Button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700">
                  <span className="material-symbols-outlined mr-2">add</span>
                  Yeni Restoran Ekle
                </Button>
              </Link>
            </div>
            <h1 className="text-4xl font-black text-gray-900 mb-2">Restoranlar</h1>
            <p className="text-gray-600 font-medium">Tüm restoranları yönetin</p>
          </div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-blue-100">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <span className="material-symbols-outlined text-white text-2xl">restaurant</span>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">Toplam</p>
                  <p className="text-3xl font-black text-gray-900">{restaurants?.length || 0}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-green-100">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                  <span className="material-symbols-outlined text-white text-2xl">check_circle</span>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">Aktif</p>
                  <p className="text-3xl font-black text-gray-900">{(restaurants as Restaurant[])?.filter(r => r.is_active).length || 0}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-orange-100">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                  <span className="material-symbols-outlined text-white text-2xl">workspace_premium</span>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">Pro</p>
                  <p className="text-3xl font-black text-gray-900">{(restaurants as Restaurant[])?.filter(r => r.subscriptions?.[0]?.plan === 'pro').length || 0}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-purple-100">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <span className="material-symbols-outlined text-white text-2xl">trending_up</span>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">Free</p>
                  <p className="text-3xl font-black text-gray-900">{(restaurants as Restaurant[])?.filter(r => !r.subscriptions?.[0] || r.subscriptions[0].plan === 'free').length || 0}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Restaurants Table */}
          <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-900 to-gray-800 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left font-bold">Restoran</th>
                    <th className="px-6 py-4 text-left font-bold">Slug</th>
                    <th className="px-6 py-4 text-left font-bold">Plan</th>
                    <th className="px-6 py-4 text-left font-bold">Durum</th>
                    <th className="px-6 py-4 text-center font-bold">Toplam Tarama</th>
                    <th className="px-6 py-4 text-center font-bold">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {(restaurants as Restaurant[])?.map((restaurant) => {
                    const stats = statsMap.get(restaurant.id) || { total: 0, today: 0, week: 0 }
                    const subscription = restaurant.subscriptions?.[0]
                    
                    return (
                      <tr key={restaurant.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {restaurant.logo_url ? (
                              <img src={restaurant.logo_url} alt={restaurant.name} className="w-10 h-10 rounded-lg object-cover" />
                            ) : (
                              <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-pink-400 rounded-lg flex items-center justify-center">
                                <span className="material-symbols-outlined text-white">restaurant</span>
                              </div>
                            )}
                            <div>
                              <p className="font-bold text-gray-900">{restaurant.name}</p>
                              <p className="text-sm text-gray-500">{new Date(restaurant.created_at).toLocaleDateString('tr-TR')}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <code className="px-2 py-1 bg-gray-100 rounded text-sm font-mono">{restaurant.slug}</code>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            subscription?.plan === 'pro' 
                              ? 'bg-orange-100 text-orange-700' 
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {subscription?.plan?.toUpperCase() || 'FREE'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold inline-block ${
                              restaurant.is_active 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {restaurant.is_active ? 'Aktif' : 'Pasif'}
                            </span>
                            {subscription && (
                              <span className={`px-3 py-1 rounded-full text-xs font-bold inline-block ${
                                subscription.status === 'active' 
                                  ? 'bg-blue-100 text-blue-700' 
                                  : 'bg-yellow-100 text-yellow-700'
                              }`}>
                                {subscription.status}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-xl font-black text-gray-900">{stats.total}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <Link href={`/admin/restaurants/${restaurant.id}`}>
                              <Button size="sm" className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700">
                                <span className="material-symbols-outlined text-sm">visibility</span>
                              </Button>
                            </Link>
                            <Link href={`/restorant/${restaurant.slug}`} target="_blank">
                              <Button size="sm" variant="outline">
                                <span className="material-symbols-outlined text-sm">open_in_new</span>
                              </Button>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {restaurants?.length === 0 && (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-gray-400 text-5xl">restaurant</span>
              </div>
              <p className="text-gray-600 font-medium">Henüz restoran yok</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}