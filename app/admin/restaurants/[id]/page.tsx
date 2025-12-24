import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getRestaurantStats } from '@/app/actions/admin'
import { Button } from '@/components/ui/button'
import { UpdateSubscriptionForm } from './update-subscription-form'
import { ToggleRestaurantStatus } from './toggle-restaurant-status'

export default async function AdminRestaurantDetailPage({
  params
}: {
  params: { id: string }
}) {
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

  const { restaurant, stats, counts, scanEvents, error } = await getRestaurantStats(params.id)

  if (error || !restaurant) {
    notFound()
  }

  const rest = restaurant as any
  const subscription = rest.subscriptions?.[0]
  const publicUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001'}/restorant/${rest.slug}`

  // Process scan events for chart (last 30 days)
  const scansByDate: { [key: string]: number } = {}
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (29 - i))
    return date.toISOString().split('T')[0]
  })

  last30Days.forEach(date => {
    scansByDate[date] = 0
  })

  scanEvents?.forEach((event: any) => {
    const date = new Date(event.scanned_at).toISOString().split('T')[0]
    if (scansByDate[date] !== undefined) {
      scansByDate[date]++
    }
  })

  const maxScans = Math.max(...Object.values(scansByDate), 1)

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin">
                <Button variant="outline" size="sm">
                  ← Geri
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  {rest.name}
                </h1>
                <p className="text-sm text-slate-600">
                  Restoran Detayları
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6">
          {/* Restaurant Info */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              Restoran Bilgileri
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-600">Restoran Adı</p>
                <p className="text-base font-medium text-slate-900">{rest.name}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Slug</p>
                <p className="text-base font-medium text-slate-900">{rest.slug}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Slogan</p>
                <p className="text-base font-medium text-slate-900">{rest.slogan || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Kayıt Tarihi</p>
                <p className="text-base font-medium text-slate-900">
                  {new Date(rest.created_at).toLocaleDateString('tr-TR')}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Public URL</p>
                <a
                  href={publicUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-base font-medium text-blue-600 hover:text-blue-700"
                >
                  {publicUrl}
                </a>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-2">Durum</p>
                <ToggleRestaurantStatus
                  restaurantId={rest.id}
                  currentStatus={rest.is_active}
                />
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <p className="text-sm text-slate-600 mb-1">Bugün</p>
              <p className="text-3xl font-bold text-slate-900">
                {stats.scans_today}
              </p>
              <p className="text-xs text-slate-500 mt-1">görüntüleme</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <p className="text-sm text-slate-600 mb-1">Son 7 Gün</p>
              <p className="text-3xl font-bold text-slate-900">
                {stats.scans_7d}
              </p>
              <p className="text-xs text-slate-500 mt-1">görüntüleme</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <p className="text-sm text-slate-600 mb-1">Son 30 Gün</p>
              <p className="text-3xl font-bold text-slate-900">
                {stats.scans_30d}
              </p>
              <p className="text-xs text-slate-500 mt-1">görüntüleme</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <p className="text-sm text-slate-600 mb-1">Toplam</p>
              <p className="text-3xl font-bold text-slate-900">
                {stats.scans_total}
              </p>
              <p className="text-xs text-slate-500 mt-1">görüntüleme</p>
            </div>
          </div>

          {/* Scan Trend Chart */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              Son 30 Gün Görüntüleme Trendi
            </h2>
            <div className="h-64 flex items-end gap-1">
              {last30Days.map((date) => {
                const count = scansByDate[date]
                const height = maxScans > 0 ? (count / maxScans) * 100 : 0
                const day = new Date(date).getDate()
                
                return (
                  <div key={date} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full flex items-end justify-center" style={{ height: '200px' }}>
                      <div
                        className="w-full bg-blue-500 hover:bg-blue-600 transition-colors rounded-t"
                        style={{ height: `${height}%` }}
                        title={`${date}: ${count} görüntüleme`}
                      />
                    </div>
                    <span className="text-xs text-slate-500">{day}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Menu Stats */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                Kategoriler
              </h2>
              <div className="text-center py-8">
                <p className="text-4xl font-bold text-slate-900 mb-2">
                  {counts.categories}
                </p>
                <p className="text-sm text-slate-600">Toplam Kategori</p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                Ürünler
              </h2>
              <div className="text-center py-8">
                <p className="text-4xl font-bold text-slate-900 mb-2">
                  {counts.products}
                </p>
                <p className="text-sm text-slate-600">Toplam Ürün</p>
              </div>
            </div>
          </div>

          {/* Subscription Management */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              Abonelik Yönetimi
            </h2>
            <UpdateSubscriptionForm
              restaurantId={rest.id}
              currentSubscription={subscription}
            />
          </div>
        </div>
      </main>
    </div>
  )
}