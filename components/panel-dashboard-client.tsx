"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useLocale } from "@/lib/i18n/use-locale"
import { isPro, getTrialEndsAt, getDaysRemaining, isTrialExpired } from "@/lib/subscription"
import { CONTACT_WHATSAPP_DISPLAY, whatsappUrl } from "@/lib/contact"

interface PanelDashboardClientProps {
  restaurant: {
    name: string
    slug: string
    created_at: string
  }
  subscription: {
    plan: string
    status?: string
    trial_ends_at?: string | null
  } | null
  stats: {
    scans_today: number
    scans_7d: number
    scans_total: number
  }
  counts: {
    categories: number
    products: number
  }
  userEmail: string
}

export function PanelDashboardClient({
  restaurant,
  subscription,
  stats,
  counts,
  userEmail,
}: PanelDashboardClientProps) {
  const { t, locale } = useLocale()
  
  const publicUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/restorant/${restaurant.slug}`

  // Kayıt tarihi ve kalan gün hesaplama
  const createdAt = new Date(restaurant.created_at)
  const registrationDate = createdAt.toLocaleDateString(locale === 'tr' ? 'tr-TR' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
  
  // Freemium: Pro ise süresiz, değilse 2 aylık deneme (trial_ends_at) üzerinden hesap
  const proPlan = isPro(subscription)
  const trialEnd = getTrialEndsAt(subscription, restaurant.created_at)
  const subscriptionEndDate = trialEnd // Pro'da da denemenin ne zaman bittiğini gösteririz
  const rawDaysRemaining = getDaysRemaining(subscription, restaurant.created_at)

  // Uyarı seviyeleri sadece ÜCRETSİZ (Pro olmayan) planlar için geçerli
  const daysRemaining = rawDaysRemaining !== null ? Math.max(rawDaysRemaining, 0) : 0
  const expired = !proPlan && isTrialExpired(subscription, restaurant.created_at)
  const isExpired = expired
  const isWarning = !proPlan && !expired && rawDaysRemaining !== null && rawDaysRemaining <= 14
  const isCaution = !proPlan && !expired && rawDaysRemaining !== null && rawDaysRemaining > 14 && rawDaysRemaining <= 30

  // Pro'ya geçmek / yenilemek için WhatsApp mesajı
  const upgradeWhatsappUrl = whatsappUrl(
    `Merhaba, "${restaurant.name}" restoranı için Pro plana geçmek / aboneliğimi yenilemek istiyorum.`
  )

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
                  ? t.panel.dashboard.subscriptionExpired
                  : isWarning
                    ? t.panel.dashboard.subscriptionExpiring
                    : t.panel.dashboard.subscriptionReminder}
              </h3>
              <p className={`text-sm ${
                isExpired
                  ? 'text-red-600'
                  : isWarning
                    ? 'text-amber-600'
                    : 'text-yellow-600'
              }`}>
                {isExpired
                  ? t.panel.dashboard.menuNotVisible
                  : t.panel.dashboard.daysRemainingMessage.replace('{days}', String(daysRemaining))}
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
              <p className="text-xs">{t.panel.dashboard.daysRemaining}</p>
            </div>
          </div>
          {/* Pro'ya geçiş / iletişim çağrısı */}
          <div className="mt-4 pt-4 border-t border-black/5 flex flex-col sm:flex-row sm:items-center gap-3">
            <p className={`text-sm flex-1 ${isExpired ? 'text-red-700' : 'text-gray-600'}`}>
              {t.panel.dashboard.upgradePrompt}
            </p>
            <a
              href={upgradeWhatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors whitespace-nowrap"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>chat</span>
              {t.panel.dashboard.contactToUpgrade}
            </a>
          </div>
        </div>
      )}

      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl shadow-xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              {t.panel.dashboard.welcome}! 👋
            </h1>
            <p className="text-orange-100 text-lg">
              {restaurant.name}
            </p>
            <p className="text-orange-200 text-sm mt-1">
              {userEmail}
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
              {t.panel.dashboard.stats.today}
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mb-1">
            {stats.scans_today}
          </p>
          <p className="text-xs text-gray-500">{t.panel.dashboard.stats.scans}</p>
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
              {t.panel.dashboard.stats.week}
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mb-1">
            {stats.scans_7d}
          </p>
          <p className="text-xs text-gray-500">{t.panel.dashboard.stats.scans}</p>
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
              {t.panel.dashboard.stats.total}
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mb-1">
            {stats.scans_total}
          </p>
          <p className="text-xs text-gray-500">{t.panel.dashboard.stats.scans}</p>
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
              proPlan
                ? 'bg-gradient-to-br from-emerald-500 to-emerald-600'
                : isExpired
                  ? 'bg-gradient-to-br from-red-500 to-red-600'
                  : 'bg-gradient-to-br from-amber-500 to-amber-600'
            }`}>
              <span className="material-symbols-outlined text-white" style={{ fontSize: '28px' }}>
                {proPlan ? 'verified' : isExpired ? 'timer_off' : 'workspace_premium'}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold text-gray-900 uppercase">
                  {subscription?.plan || 'free'}
                </p>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                  isExpired ? 'text-red-600 bg-red-100' : isWarning ? 'text-amber-600 bg-amber-100' : 'text-green-600 bg-green-100'
                }`}>
                  {isExpired ? t.panel.dashboard.expired : t.panel.dashboard.active}
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {proPlan ? t.panel.dashboard.proSubscription : t.panel.dashboard.trialSubscription}
              </p>
            </div>
          </div>

          {/* Orta: Kalan Gün */}
          <div className={`flex-shrink-0 rounded-xl px-6 py-3 text-center ${
            proPlan
              ? 'bg-emerald-100 border border-emerald-200'
              : isExpired
                ? 'bg-red-100 border border-red-200'
                : isWarning
                  ? 'bg-amber-100 border border-amber-200'
                  : 'bg-green-100 border border-green-200'
          }`}>
            <p className={`text-3xl font-bold ${
              proPlan ? 'text-emerald-600' : isExpired ? 'text-red-600' : isWarning ? 'text-amber-600' : 'text-green-600'
            }`}>
              {proPlan ? '∞' : isExpired ? '0' : daysRemaining}
            </p>
            <p className={`text-xs font-medium ${
              proPlan ? 'text-emerald-700' : isExpired ? 'text-red-700' : isWarning ? 'text-amber-700' : 'text-green-700'
            }`}>
              {proPlan ? t.panel.dashboard.active : t.panel.dashboard.daysRemaining}
            </p>
          </div>

          {/* Sağ: Tarihler */}
          <div className="flex-1 bg-gray-50 rounded-xl p-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center gap-1 mb-1">
                  <span className="material-symbols-outlined text-green-600" style={{ fontSize: '16px' }}>event_available</span>
                  <span className="text-xs text-gray-500">{t.panel.dashboard.registrationDate}</span>
                </div>
                <p className="text-sm font-semibold text-gray-900">{registrationDate}</p>
              </div>
              <div>
                <div className="flex items-center gap-1 mb-1">
                  <span className={`material-symbols-outlined ${isExpired ? 'text-red-600' : 'text-amber-600'}`} style={{ fontSize: '16px' }}>event_busy</span>
                  <span className="text-xs text-gray-500">{proPlan ? t.panel.dashboard.proSubscription : t.panel.dashboard.trialEndDate}</span>
                </div>
                <p className={`text-sm font-semibold ${isExpired ? 'text-red-600' : 'text-gray-900'}`}>
                  {proPlan
                    ? '∞'
                    : subscriptionEndDate
                      ? subscriptionEndDate.toLocaleDateString(locale === 'tr' ? 'tr-TR' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                      : '—'}
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
            {t.panel.dashboard.qrMenuLink}
          </h2>
        </div>
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 mb-4 border border-gray-200">
          <p className="text-sm text-gray-600 mb-2 font-medium">{t.panel.dashboard.publicMenuUrl}</p>
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
              {t.panel.dashboard.viewQrCode}
            </Button>
          </Link>
          <Link href={publicUrl} target="_blank" className="flex-1">
            <Button variant="outline" className="w-full gap-2 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200">
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                visibility
              </span>
              {t.panel.dashboard.viewMenu}
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
                {t.panel.dashboard.categories}
              </h2>
            </div>
            <Link href="/panel/categories">
              <Button size="sm" variant="outline" className="gap-2 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200">
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                  settings
                </span>
                {t.panel.dashboard.manage}
              </Button>
            </Link>
          </div>
          <div className="text-center py-8 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
            <p className="text-5xl font-bold text-blue-600 mb-2">
              {counts.categories}
            </p>
            <p className="text-sm text-blue-700 font-medium">{t.panel.dashboard.totalCategories}</p>
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
                {t.panel.dashboard.products}
              </h2>
            </div>
            <Link href="/panel/products">
              <Button size="sm" variant="outline" className="gap-2 hover:bg-purple-50 hover:text-purple-600 hover:border-purple-200">
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                  settings
                </span>
                {t.panel.dashboard.manage}
              </Button>
            </Link>
          </div>
          <div className="text-center py-8 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
            <p className="text-5xl font-bold text-purple-600 mb-2">
              {counts.products}
            </p>
            <p className="text-sm text-purple-700 font-medium">{t.panel.dashboard.totalProducts}</p>
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
            {t.panel.dashboard.quickActions}
          </h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/panel/categories/new">
            <Button variant="outline" className="w-full gap-2 h-auto py-4 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 group">
              <span className="material-symbols-outlined group-hover:scale-110 transition-transform" style={{ fontSize: '24px' }}>
                add_circle
              </span>
              <span className="font-semibold">{t.panel.dashboard.newCategory}</span>
            </Button>
          </Link>
          <Link href="/panel/products/new">
            <Button variant="outline" className="w-full gap-2 h-auto py-4 hover:bg-purple-50 hover:text-purple-600 hover:border-purple-200 group">
              <span className="material-symbols-outlined group-hover:scale-110 transition-transform" style={{ fontSize: '24px' }}>
                add_box
              </span>
              <span className="font-semibold">{t.panel.dashboard.newProduct}</span>
            </Button>
          </Link>
          <Link href="/panel/settings">
            <Button variant="outline" className="w-full gap-2 h-auto py-4 hover:bg-amber-50 hover:text-amber-600 hover:border-amber-200 group">
              <span className="material-symbols-outlined group-hover:scale-110 transition-transform" style={{ fontSize: '24px' }}>
                settings
              </span>
              <span className="font-semibold">{t.panel.dashboard.settings}</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}