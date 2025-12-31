import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getRestaurantStats } from '@/app/actions/admin'
import { Button } from '@/components/ui/button'
import { UpdateSubscriptionForm } from './update-subscription-form'
import { ToggleRestaurantStatus } from './toggle-restaurant-status'
import { ImpersonateButton } from './impersonate-button'

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
  const publicUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/restorant/${rest.slug}`

  // Process scan events for chart (last 30 days)
  const scansByDate: { [key: string]: number} = {}
  const last30Days: string[] = []
  
  for (let i = 0; i < 30; i++) {
    const date = new Date()
    date.setDate(date.getDate() - (29 - i))
    const dateStr = date.toISOString().split('T')[0]
    last30Days.push(dateStr)
    scansByDate[dateStr] = 0
  }

  if (scanEvents && Array.isArray(scanEvents)) {
    (scanEvents as any[]).forEach((event: any) => {
      const date = new Date(event.scanned_at).toISOString().split('T')[0]
      if (scansByDate[date] !== undefined) {
        scansByDate[date]++
      }
    })
  }

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
            <div className="flex items-center gap-3">
              <ImpersonateButton restaurantId={rest.id} restaurantName={rest.name} />
              <Link href={`/admin/restaurants/${rest.id}/edit`}>
                <Button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700">
                  <span className="material-symbols-outlined mr-2" style={{ fontSize: '20px' }}>edit</span>
                  Düzenle
                </Button>
              </Link>
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
              Temel Bilgiler
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
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
              <div>
                <p className="text-sm text-slate-600">Desteklenen Diller</p>
                <div className="flex gap-2 mt-1">
                  {(rest.supported_languages || ['tr']).map((lang: string) => (
                    <span key={lang} className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {lang === 'tr' ? '🇹🇷 Türkçe' : lang === 'en' ? '🇬🇧 English' : lang}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm text-slate-600">Menü Düzeni</p>
                <p className="text-base font-medium text-slate-900">
                  {rest.layout_style === 'grid' ? '2\'li Grid' : 'Tekli Liste'}
                </p>
              </div>
            </div>
          </div>

          {/* Logo & Hero Images */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Logo</h2>
              {rest.logo_url ? (
                <img src={rest.logo_url} alt="Logo" className="max-h-32 object-contain rounded-lg border" />
              ) : (
                <div className="h-32 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400">
                  <span className="material-symbols-outlined text-4xl">image</span>
                </div>
              )}
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Hero Banner</h2>
              {rest.hero_url ? (
                <img src={rest.hero_url} alt="Hero" className="max-h-32 w-full object-cover rounded-lg border" />
              ) : (
                <div className="h-32 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400">
                  <span className="material-symbols-outlined text-4xl">panorama</span>
                </div>
              )}
            </div>
          </div>

          {/* Contact & Social Media */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">İletişim Bilgileri</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-slate-400">phone</span>
                  <span className="text-slate-900">{rest.phone || '-'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-slate-400">email</span>
                  <span className="text-slate-900">{rest.email || '-'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-slate-400">location_on</span>
                  <span className="text-slate-900">{rest.address || '-'}</span>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Sosyal Medya</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-green-500 font-bold">WhatsApp</span>
                  <span className="text-slate-900">{rest.whatsapp || '-'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-pink-500 font-bold">Instagram</span>
                  {rest.instagram ? (
                    <a href={rest.instagram} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate">{rest.instagram}</a>
                  ) : <span className="text-slate-900">-</span>}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-blue-600 font-bold">Facebook</span>
                  {rest.facebook ? (
                    <a href={rest.facebook} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate">{rest.facebook}</a>
                  ) : <span className="text-slate-900">-</span>}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-slate-800 font-bold">Twitter/X</span>
                  {rest.twitter ? (
                    <a href={rest.twitter} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate">{rest.twitter}</a>
                  ) : <span className="text-slate-900">-</span>}
                </div>
              </div>
            </div>
          </div>

          {/* Theme Colors */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Tema Renkleri</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
              <div className="text-center">
                <div className="w-12 h-12 rounded-lg border mx-auto mb-2" style={{ backgroundColor: rest.background_color || '#ffffff' }}></div>
                <p className="text-xs text-slate-600">Arka Plan</p>
                <p className="text-xs font-mono text-slate-500">{rest.background_color || '#ffffff'}</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-lg border mx-auto mb-2" style={{ backgroundColor: rest.surface_color || '#f9fafb' }}></div>
                <p className="text-xs text-slate-600">Kart</p>
                <p className="text-xs font-mono text-slate-500">{rest.surface_color || '#f9fafb'}</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-lg border mx-auto mb-2" style={{ backgroundColor: rest.text_color || '#111827' }}></div>
                <p className="text-xs text-slate-600">Yazı</p>
                <p className="text-xs font-mono text-slate-500">{rest.text_color || '#111827'}</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-lg border mx-auto mb-2" style={{ backgroundColor: rest.primary_color || '#FF6B35' }}></div>
                <p className="text-xs text-slate-600">Vurgu</p>
                <p className="text-xs font-mono text-slate-500">{rest.primary_color || '#FF6B35'}</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-lg border mx-auto mb-2" style={{ backgroundColor: rest.price_color || '#ef4444' }}></div>
                <p className="text-xs text-slate-600">Fiyat</p>
                <p className="text-xs font-mono text-slate-500">{rest.price_color || '#ef4444'}</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-lg border mx-auto mb-2" style={{ backgroundColor: rest.icon_color || '#111827' }}></div>
                <p className="text-xs text-slate-600">İkon</p>
                <p className="text-xs font-mono text-slate-500">{rest.icon_color || '#111827'}</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-lg border mx-auto mb-2" style={{ backgroundColor: rest.hamburger_bg_color || '#ffffff' }}></div>
                <p className="text-xs text-slate-600">Hamburger</p>
                <p className="text-xs font-mono text-slate-500">{rest.hamburger_bg_color || '#ffffff'}</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-lg border mx-auto mb-2" style={{ backgroundColor: rest.qr_logo_bg_color || '#FFFFFF' }}></div>
                <p className="text-xs text-slate-600">QR Logo</p>
                <p className="text-xs font-mono text-slate-500">{rest.qr_logo_bg_color || '#FFFFFF'}</p>
              </div>
            </div>
          </div>

          {/* About Us */}
          {rest.about_us && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Hakkımızda</h2>
              <p className="text-slate-700 whitespace-pre-wrap">{rest.about_us}</p>
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <p className="text-sm text-slate-600 mb-1">Bugün</p>
              <p className="text-3xl font-bold text-slate-900">
                {(stats as any).scans_today}
              </p>
              <p className="text-xs text-slate-500 mt-1">görüntüleme</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <p className="text-sm text-slate-600 mb-1">Son 7 Gün</p>
              <p className="text-3xl font-bold text-slate-900">
                {(stats as any).scans_7d}
              </p>
              <p className="text-xs text-slate-500 mt-1">görüntüleme</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <p className="text-sm text-slate-600 mb-1">Son 30 Gün</p>
              <p className="text-3xl font-bold text-slate-900">
                {(stats as any).scans_30d}
              </p>
              <p className="text-xs text-slate-500 mt-1">görüntüleme</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <p className="text-sm text-slate-600 mb-1">Toplam</p>
              <p className="text-3xl font-bold text-slate-900">
                {(stats as any).scans_total}
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

          {/* Menu Stats & Management */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-900">
                  Kategoriler
                </h2>
                <Link href={`/admin/restaurants/${rest.id}/categories`}>
                  <Button variant="outline" size="sm">
                    <span className="material-symbols-outlined mr-1" style={{ fontSize: '18px' }}>visibility</span>
                    Görüntüle
                  </Button>
                </Link>
              </div>
              <div className="text-center py-8">
                <p className="text-4xl font-bold text-slate-900 mb-2">
                  {(counts as any).categories}
                </p>
                <p className="text-sm text-slate-600">Toplam Kategori</p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-900">
                  Ürünler
                </h2>
                <Link href={`/admin/restaurants/${rest.id}/products`}>
                  <Button variant="outline" size="sm">
                    <span className="material-symbols-outlined mr-1" style={{ fontSize: '18px' }}>visibility</span>
                    Görüntüle
                  </Button>
                </Link>
              </div>
              <div className="text-center py-8">
                <p className="text-4xl font-bold text-slate-900 mb-2">
                  {(counts as any).products}
                </p>
                <p className="text-sm text-slate-600">Toplam Ürün</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              Hızlı İşlemler
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              <Link href={`/admin/restaurants/${rest.id}/categories`} className="flex items-center gap-3 p-4 rounded-lg border border-slate-200 hover:border-orange-300 hover:bg-orange-50 transition-colors">
                <span className="material-symbols-outlined text-orange-500" style={{ fontSize: '28px' }}>category</span>
                <div>
                  <p className="font-medium text-slate-900">Kategorileri Yönet</p>
                  <p className="text-sm text-slate-600">Kategori ekle, düzenle, sil</p>
                </div>
              </Link>
              <Link href={`/admin/restaurants/${rest.id}/products`} className="flex items-center gap-3 p-4 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-colors">
                <span className="material-symbols-outlined text-blue-500" style={{ fontSize: '28px' }}>restaurant_menu</span>
                <div>
                  <p className="font-medium text-slate-900">Ürünleri Yönet</p>
                  <p className="text-sm text-slate-600">Ürün ekle, düzenle, sil</p>
                </div>
              </Link>
              <a href={publicUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-4 rounded-lg border border-slate-200 hover:border-green-300 hover:bg-green-50 transition-colors">
                <span className="material-symbols-outlined text-green-500" style={{ fontSize: '28px' }}>open_in_new</span>
                <div>
                  <p className="font-medium text-slate-900">Menüyü Görüntüle</p>
                  <p className="text-sm text-slate-600">Herkese açık menü sayfası</p>
                </div>
              </a>
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