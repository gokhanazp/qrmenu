'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { logout } from '@/app/actions/auth'
import { getImpersonationStatus, stopImpersonation } from '@/app/actions/admin'
import { Button } from '@/components/ui/button'
import { LocaleProvider, useLocale } from '@/lib/i18n/use-locale'
import { LanguageSwitcher } from '@/components/language-switcher'

function PanelLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { t } = useLocale()
  const [impersonation, setImpersonation] = useState<{ isImpersonating: boolean; restaurant?: { restaurantName: string; restaurantId: string } } | null>(null)

  useEffect(() => {
    const checkImpersonation = async () => {
      const status = await getImpersonationStatus()
      setImpersonation(status)
    }
    checkImpersonation()
  }, [])

  const handleStopImpersonation = async () => {
    const result = await stopImpersonation()
    if (result.success && result.redirectUrl) {
      router.push(result.redirectUrl)
    }
  }

  const navigation = [
    { name: t.panel.dashboard.title, href: '/panel', icon: 'home' },
    { name: t.panel.categories.title, href: '/panel/categories', icon: 'category' },
    { name: t.panel.products.title, href: '/panel/products', icon: 'restaurant_menu' },
    { name: t.panel.dashboard.qrCode, href: '/panel/qr', icon: 'qr_code_2' },
    { name: t.panel.settings.title, href: '/panel/settings', icon: 'settings' },
  ]

  const handleLogout = async () => {
    await logout()
    window.location.href = '/auth/login'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Impersonation Banner */}
      {impersonation?.isImpersonating && (
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white py-2 px-4 sticky top-0 z-[60]">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>admin_panel_settings</span>
              <span className="text-sm font-medium">
                Admin olarak görüntülüyorsunuz: <strong>{impersonation.restaurant?.restaurantName}</strong>
              </span>
            </div>
            <button
              onClick={handleStopImpersonation}
              className="flex items-center gap-1 px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_back</span>
              Admin Paneline Dön
            </button>
          </div>
        </div>
      )}

      {/* Top Navigation */}
      <header className={`bg-white/80 backdrop-blur-md border-b border-gray-200 sticky ${impersonation?.isImpersonating ? 'top-[44px]' : 'top-0'} z-50 shadow-sm`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <Link href="/panel" className="flex items-center gap-3 hover:opacity-80 transition-all group">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                  <span className="material-symbols-outlined text-white" style={{ fontSize: '24px' }}>
                    restaurant
                  </span>
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
                  QR Menü
                </span>
              </Link>
            </div>
            
            <div className="flex items-center gap-3">
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
              {navigation.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
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
                  </Link>
                )
              })}
              
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