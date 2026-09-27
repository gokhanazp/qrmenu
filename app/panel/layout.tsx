'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { logout } from '@/app/actions/auth'
import { stopImpersonation } from '@/app/actions/admin'
import { getPanelContext, setActiveRestaurant, type PanelContext } from '@/app/actions/restaurant'
import { Button } from '@/components/ui/button'
import { LocaleProvider, useLocale } from '@/lib/i18n/use-locale'
import { LanguageSwitcher } from '@/components/language-switcher'
import { MaterialSymbolsStylesheet } from '@/components/material-symbols-stylesheet'
import type { FeatureKey } from '@/lib/features'

interface NavItem {
  name: string
  href: string
  icon: string
  /** Yalnızca bu özellik açıksa menüde görünür */
  feature?: FeatureKey
}

function BranchSwitcher({ context, compact }: { context: PanelContext; compact?: boolean }) {
  const { t } = useLocale()
  const [switching, setSwitching] = useState(false)

  if (!context.restaurant || context.restaurants.length < 2) return null

  const handleChange = async (restaurantId: string) => {
    if (!restaurantId || restaurantId === context.restaurant?.id) return
    setSwitching(true)
    const result = await setActiveRestaurant(restaurantId)
    if (result.success) {
      // Client sayfalar veriyi mount'ta çektiği için tam yenileme en güvenlisi
      window.location.href = '/panel'
    } else {
      setSwitching(false)
      alert(result.error || t.common.error)
    }
  }

  return (
    <label className={`flex items-center gap-2 ${compact ? '' : 'w-full'}`}>
      <span className="material-symbols-outlined text-orange-500" style={{ fontSize: '20px' }}>store</span>
      {!compact && (
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">{t.panel.branch.label}</span>
      )}
      <select
        value={context.restaurant.id}
        onChange={(e) => handleChange(e.target.value)}
        disabled={switching}
        aria-label={t.panel.branch.select}
        className="flex-1 min-w-0 rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-60"
      >
        {context.restaurants.map((r) => (
          <option key={r.id} value={r.id}>
            {r.name}
          </option>
        ))}
      </select>
      {switching && <span className="text-xs text-gray-500">{t.panel.branch.switching}</span>}
    </label>
  )
}

function PanelLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { t } = useLocale()
  const [context, setContext] = useState<PanelContext | null>(null)

  useEffect(() => {
    let cancelled = false
    getPanelContext().then((ctx) => {
      if (!cancelled) setContext(ctx)
    })
    return () => {
      cancelled = true
    }
  }, [pathname])

  const handleStopImpersonation = async () => {
    const result = await stopImpersonation()
    if (result.success && result.redirectUrl) {
      router.push(result.redirectUrl)
    }
  }

  const navigation: NavItem[] = [
    { name: t.panel.dashboard.title, href: '/panel', icon: 'home' },
    { name: t.panel.orders.title, href: '/panel/orders', icon: 'receipt_long', feature: 'direct_order' },
    { name: t.panel.categories.title, href: '/panel/categories', icon: 'category' },
    { name: t.panel.products.title, href: '/panel/products', icon: 'restaurant_menu' },
    { name: t.panel.reports.title, href: '/panel/reports', icon: 'bar_chart', feature: 'reports' },
    { name: t.panel.reviews.title, href: '/panel/reviews', icon: 'reviews' },
    { name: t.panel.dashboard.qrCode, href: '/panel/qr', icon: 'qr_code_2' },
    { name: t.panel.integrations.title, href: '/panel/integrations', icon: 'hub', feature: 'marketplace' },
    { name: t.panel.settings.title, href: '/panel/settings', icon: 'settings' },
  ]

  // Özelliğe bağlı menü öğeleri yalnızca özellik açıkken görünür;
  // QR-only müşteriler bugünkü sade menüyü görmeye devam eder.
  const visibleNavigation = navigation.filter(
    (item) => !item.feature || (context?.features || []).includes(item.feature)
  )

  const isImpersonating = Boolean(context?.isImpersonating)

  const handleLogout = async () => {
    await logout()
    window.location.href = '/auth/login'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <MaterialSymbolsStylesheet />
      {/* Impersonation Banner */}
      {isImpersonating && (
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white py-2 px-4 sticky top-0 z-[60]">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>admin_panel_settings</span>
              <span className="text-sm font-medium">
                {t.panel.impersonation.viewingAs} <strong>{context?.impersonatedName}</strong>
              </span>
            </div>
            <button
              onClick={handleStopImpersonation}
              className="flex items-center gap-1 px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_back</span>
              {t.panel.impersonation.backToAdmin}
            </button>
          </div>
        </div>
      )}

      {/* Top Navigation */}
      <header className={`bg-white/80 backdrop-blur-md border-b border-gray-200 sticky ${isImpersonating ? 'top-[44px]' : 'top-0'} z-50 shadow-sm`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <Link href="/panel" className="flex items-center gap-1.5 hover:opacity-80 transition-all group">
                <img src="/qrmenu-logo.png" alt="Logo" className="h-12 w-auto drop-shadow-sm" />
                <div className="flex flex-col">
                  <span className="font-bold text-xl tracking-tight leading-none">
                    <span className="bg-gradient-to-r from-violet-500 to-fuchsia-500 bg-clip-text text-transparent">qr</span>
                    <span className="text-gray-900">menülist</span>
                  </span>
                  <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wider mt-0.5">Restoran Paneli</span>
                </div>
              </Link>
            </div>
            
            <div className="flex items-center gap-3">
              {context && (
                <div className="hidden md:block max-w-xs">
                  <BranchSwitcher context={context} compact />
                </div>
              )}
              <LanguageSwitcher />
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="hidden sm:inline-flex gap-2 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                  logout
                </span>
                {t.auth.logout}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Navigation */}
          <aside className="lg:w-72 flex-shrink-0">
            <nav className="space-y-2 bg-white rounded-2xl shadow-lg p-4 border border-gray-100">
              {context && context.restaurants.length > 1 && (
                <div className="md:hidden pb-3 mb-2 border-b border-gray-200">
                  <BranchSwitcher context={context} />
                </div>
              )}
              {visibleNavigation.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (pathname.startsWith(item.href + '/') &&
                    !visibleNavigation.some((other) => other.href !== item.href && other.href.startsWith(item.href + '/') && pathname.startsWith(other.href)))
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all group ${
                      isActive
                        ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md shadow-orange-200'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <span
                      className={`material-symbols-outlined transition-transform group-hover:scale-110 ${
                        isActive ? 'text-white' : 'text-gray-500'
                      }`}
                      style={{ fontSize: '22px' }}
                    >
                      {item.icon}
                    </span>
                    <span>{item.name}</span>
                    {item.href === '/panel/orders' && (context?.newOrdersCount || 0) > 0 && (
                      <span className={`ml-auto min-w-[1.5rem] h-6 px-1.5 rounded-full text-xs font-bold flex items-center justify-center ${isActive ? 'bg-white text-orange-600' : 'bg-red-500 text-white'}`}>
                        {context?.newOrdersCount}
                      </span>
                    )}
                  </Link>
                )
              })}

              {context?.roleLabel && context.restaurants.length > 1 && (
                <p className="px-4 pt-2 text-xs text-gray-400">
                  {t.panel.branch.role}: <span className="font-medium text-gray-600">{context.roleLabel}</span>
                </p>
              )}
              
              <div className="pt-4 mt-4 border-t border-gray-200">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 w-full transition-all lg:hidden group"
                >
                  <span className="material-symbols-outlined transition-transform group-hover:scale-110" style={{ fontSize: '22px' }}>
                    logout
                  </span>
                  <span>{t.auth.logout}</span>
                </button>
              </div>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <LocaleProvider>
      <PanelLayoutContent>{children}</PanelLayoutContent>
    </LocaleProvider>
  )
}
