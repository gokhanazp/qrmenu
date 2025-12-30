import { redirect } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { getRestaurantWithStats } from "@/app/actions/restaurant"
import { Button } from "@/components/ui/button"

export default async function PanelPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const data = await getRestaurantWithStats()

  if ('error' in data) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center border border-red-100">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-red-600" style={{ fontSize: '32px' }}>
              error
            </span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Hata</h1>
          <p className="text-gray-600 mb-6">{data.error}</p>
          <p className="text-sm text-gray-500 mb-4">
            Restoran kaydınız bulunamadı. Lütfen çıkış yapıp tekrar kayıt olun.
          </p>
          <Link href="/auth/login">
            <Button className="w-full">
              Giriş Sayfasına Dön
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const { restaurant, subscription, stats, counts } = data
  const publicUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/restorant/${(restaurant as any).slug}`

  // Kayıt tarihi ve kalan gün hesaplama
  const createdAt = new Date((restaurant as any).created_at)
  const registrationDate = createdAt.toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
  
  // 1 yıllık abonelik bitiş tarihi hesaplama
  const subscriptionEndDate = new Date(createdAt)
  subscriptionEndDate.setFullYear(subscriptionEndDate.getFullYear() + 1)
  
  // Kalan gün hesaplama
  const today = new Date()
  const timeDiff = subscriptionEndDate.getTime() - today.getTime()
  const daysRemaining = Math.ceil(timeDiff / (1000 * 60 * 60 * 24))
  
  // Uyarı seviyesi belirleme
  const isExpired = daysRemaining <= 0
  const isWarning = daysRemaining > 0 && daysRemaining <= 30
  const isCaution = daysRemaining > 30 && daysRemaining <= 60

  return (
    <div className="space-y-6">
      {/* Subscription Warning Banner */}
      {(isExpired || isWarning || isCaution) && (
        <div className={`rounded-2xl shadow-lg p-4 border ${
          isExpired
            ? 'bg-red-50 border-red-200'
            : isWarning
              ? 'bg-amber-50 border-amber-200'
              : 'bg-yellow-50 border-yellow-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              isExpired
                ? 'bg-red-100'
                : isWarning
                  ? 'bg-amber-100'
                  : 'bg-yellow-100'
            }`}>
              <span className={`material-symbols-outlined ${
                isExpired
                  ? 'text-red-600'
                  : isWarning
                    ? 'text-amber-600'
                    : 'text-yellow-600'
              }`} style={{ fontSize: '28px' }}>
                {isExpired ? 'error' : 'warning'}
              </span>
            </div>
            <div className="flex-1">
              <h3 className={`font-bold ${
                isExpired
                  ? 'text-red-800'
                  : isWarning
                    ? 'text-amber-800'
                    : 'text-yellow-800'
              }`}>
                {isExpired
                  ? 'Aboneliğiniz Sona Erdi!'
                  : isWarning
                    ? 'Aboneliğiniz Yakında Sona Erecek!'
                    : 'Abonelik Hatırlatması'}
              </h3>
              <p className={`text-sm ${
                isExpired
                  ? 'text-red-600'
                  : isWarning
                    ? 'text-amber-600'
                    : 'text-yellow-600'
              }`}>
                {isExpired
                  ? 'Menünüz artık görüntülenemiyor. Lütfen aboneliğinizi yenileyin.'
                  : `Aboneliğinizin bitmesine ${daysRemaining} gün kaldı. Yıllık ödemenizi yapmayı unutmayın.`}
              </p>
            </div>
            <div className={`text-right ${
              isExpired
                ? 'text-red-700'
                : isWarning
                  ? 'text-amber-700'
                  : 'text-yellow-700'
            }`}>
              <p className="text-2xl font-bold">{isExpired ? '0' : daysRemaining}</p>
              <p className="text-xs">gün kaldı</p>
            </div>
          </div>
        </div>
      )}

      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl shadow-xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Hoş Geldiniz! 👋
            </h1>
            <p className="text-orange-100 text-lg">
              {(restaurant as any).name}
            </p>
            <p className="text-orange-200 text-sm mt-1">
              {user.email}
            </p>
          </div>
          <div className="hidden md:block">
            <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <span className="material-symbols-outlined text-white" style={{ fontSize: '48px' }}>
                restaurant
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid - Görüntüleme İstatistikleri */}
      <div className="grid grid-cols-3 gap-4">
        {/* Today's Scans */}
        <div className="bg-white rounded-2xl shadow-lg p-5 border border-gray-100 hover:shadow-xl transition-shadow group">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-white" style={{ fontSize: '20px' }}>
                today
              </span>
            </div>
            <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
              Bugün
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mb-1">
            {stats.scans_today}
          </p>
          <p className="text-xs text-gray-500">görüntüleme</p>
        </div>

        {/* 7 Days Scans */}
        <div className="bg-white rounded-2xl shadow-lg p-5 border border-gray-100 hover:shadow-xl transition-shadow group">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-white" style={{ fontSize: '20px' }}>
                calendar_month
              </span>
            </div>
            <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
              7 Gün
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mb-1">
            {stats.scans_7d}
          </p>
          <p className="text-xs text-gray-500">görüntüleme</p>
        </div>

        {/* Total Scans */}
        <div className="bg-white rounded-2xl shadow-lg p-5 border border-gray-100 hover:shadow-xl transition-shadow group">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-white" style={{ fontSize: '20px' }}>
                trending_up
              </span>
            </div>
            <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">
              Toplam
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mb-1">
            {stats.scans_total}
          </p>
          <p className="text-xs text-gray-500">görüntüleme</p>
        </div>
      </div>

      {/* Subscription Card - Abonelik Bilgileri */}
      <div className={`bg-white rounded-2xl shadow-lg p-6 border ${
        isExpired ? 'border-red-300 bg-red-50/30' : isWarning ? 'border-amber-300 bg-amber-50/30' : 'border-gray-100'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          {/* Sol: Plan ve Durum */}
          <div className="flex items-center gap-4 flex-1">
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center shadow-lg ${
              isExpired
                ? 'bg-gradient-to-br from-red-500 to-red-600'
                : 'bg-gradient-to-br from-amber-500 to-amber-600'
            }`}>
              <span className="material-symbols-outlined text-white" style={{ fontSize: '28px' }}>
                {isExpired ? 'timer_off' : 'workspace_premium'}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold text-gray-900 capitalize">
                  {(subscription as any)?.plan || 'free'}
                </p>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                  isExpired ? 'text-red-600 bg-red-100' : isWarning ? 'text-amber-600 bg-amber-100' : 'text-green-600 bg-green-100'
                }`}>
                  {isExpired ? 'Süresi Doldu' : 'Aktif'}
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1">Yıllık Abonelik</p>
            </div>
          </div>

          {/* Orta: Kalan Gün */}
          <div className={`flex-shrink-0 rounded-xl px-6 py-3 text-center ${
            isExpired
              ? 'bg-red-100 border border-red-200'
              : isWarning
                ? 'bg-amber-100 border border-amber-200'
                : 'bg-green-100 border border-green-200'
          }`}>
            <p className={`text-3xl font-bold ${
              isExpired ? 'text-red-600' : isWarning ? 'text-amber-600' : 'text-green-600'
            }`}>
              {isExpired ? '0' : daysRemaining}
            </p>
            <p className={`text-xs font-medium ${
              isExpired ? 'text-red-700' : isWarning ? 'text-amber-700' : 'text-green-700'
            }`}>
              gün kaldı
            </p>
          </div>

          {/* Sağ: Tarihler */}
          <div className="flex-1 bg-gray-50 rounded-xl p-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center gap-1 mb-1">
                  <span className="material-symbols-outlined text-green-600" style={{ fontSize: '16px' }}>event_available</span>
                  <span className="text-xs text-gray-500">Kayıt Tarihi</span>
                </div>
                <p className="text-sm font-semibold text-gray-900">{registrationDate}</p>
              </div>
              <div>
                <div className="flex items-center gap-1 mb-1">
                  <span className={`material-symbols-outlined ${isExpired ? 'text-red-600' : 'text-amber-600'}`} style={{ fontSize: '16px' }}>event_busy</span>
                  <span className="text-xs text-gray-500">Bitiş Tarihi</span>
                </div>
                <p className={`text-sm font-semibold ${isExpired ? 'text-red-600' : 'text-gray-900'}`}>
                  {subscriptionEndDate.toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* QR Code Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
            <span className="material-symbols-outlined text-white" style={{ fontSize: '22px' }}>
              qr_code_2
            </span>
          </div>
          <h2 className="text-xl font-bold text-gray-900">
            QR Menü Linkiniz
          </h2>
        </div>
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 mb-4 border border-gray-200">
          <p className="text-sm text-gray-600 mb-2 font-medium">Public Menü URL:</p>
          <a
            href={publicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-orange-600 hover:text-orange-700 font-medium break-all flex items-center gap-2 group"
          >
            <span className="material-symbols-outlined text-orange-500 group-hover:scale-110 transition-transform" style={{ fontSize: '18px' }}>
              link
            </span>
            {publicUrl}
          </a>
        </div>
        <div className="flex gap-3">
          <Link href="/panel/qr" className="flex-1">
            <Button className="w-full gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700">
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                qr_code_scanner
              </span>
              QR Kod Görüntüle
            </Button>
          </Link>
          <Link href={publicUrl} target="_blank" className="flex-1">
            <Button variant="outline" className="w-full gap-2 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200">
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                visibility
              </span>
              Menüyü Görüntüle
            </Button>
          </Link>
        </div>
      </div>

      {/* Menu Management */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Categories */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined text-white" style={{ fontSize: '22px' }}>
                  category
                </span>
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                Kategoriler
              </h2>
            </div>
            <Link href="/panel/categories">
              <Button size="sm" variant="outline" className="gap-2 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200">
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                  settings
                </span>
                Yönet
              </Button>
            </Link>
          </div>
          <div className="text-center py-8 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
            <p className="text-5xl font-bold text-blue-600 mb-2">
              {counts.categories}
            </p>
            <p className="text-sm text-blue-700 font-medium">Toplam Kategori</p>
          </div>
        </div>

        {/* Products */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined text-white" style={{ fontSize: '22px' }}>
                  restaurant_menu
                </span>
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                Ürünler
              </h2>
            </div>
            <Link href="/panel/products">
              <Button size="sm" variant="outline" className="gap-2 hover:bg-purple-50 hover:text-purple-600 hover:border-purple-200">
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                  settings
                </span>
                Yönet
              </Button>
            </Link>
          </div>
          <div className="text-center py-8 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
            <p className="text-5xl font-bold text-purple-600 mb-2">
              {counts.products}
            </p>
            <p className="text-sm text-purple-700 font-medium">Toplam Ürün</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
            <span className="material-symbols-outlined text-white" style={{ fontSize: '22px' }}>
              bolt
            </span>
          </div>
          <h2 className="text-xl font-bold text-gray-900">
            Hızlı İşlemler
          </h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/panel/categories/new">
            <Button variant="outline" className="w-full gap-2 h-auto py-4 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 group">
              <span className="material-symbols-outlined group-hover:scale-110 transition-transform" style={{ fontSize: '24px' }}>
                add_circle
              </span>
              <span className="font-semibold">Yeni Kategori</span>
            </Button>
          </Link>
          <Link href="/panel/products/new">
            <Button variant="outline" className="w-full gap-2 h-auto py-4 hover:bg-purple-50 hover:text-purple-600 hover:border-purple-200 group">
              <span className="material-symbols-outlined group-hover:scale-110 transition-transform" style={{ fontSize: '24px' }}>
                add_box
              </span>
              <span className="font-semibold">Yeni Ürün</span>
            </Button>
          </Link>
          <Link href="/panel/settings">
            <Button variant="outline" className="w-full gap-2 h-auto py-4 hover:bg-amber-50 hover:text-amber-600 hover:border-amber-200 group">
              <span className="material-symbols-outlined group-hover:scale-110 transition-transform" style={{ fontSize: '24px' }}>
                settings
              </span>
              <span className="font-semibold">Ayarlar</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}