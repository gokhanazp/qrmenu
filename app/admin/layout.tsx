'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { logout } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: 'dashboard' },
    { name: 'Restoranlar', href: '/admin/restaurants', icon: 'store' },
  ]

  const handleLogout = async () => {
    await logout()
    window.location.href = '/auth/login'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Top Navigation */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <Link href="/admin" className="flex items-center gap-3 hover:opacity-80 transition-all group">
                <div className="w-10 h-10 bg-gradient-to-br from-slate-700 to-slate-900 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                  <span className="material-symbols-outlined text-white" style={{ fontSize: '24px' }}>
                    admin_panel_settings
                  </span>
                </div>
                <div>
                  <span className="text-xl font-bold bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent">
                    Admin Panel
                  </span>
                  <p className="text-xs text-slate-500">QR Menü Yönetimi</p>
                </div>
              </Link>
            </div>
            
            <div className="flex items-center gap-3">
              <Link href="/panel">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 transition-colors"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                    restaurant
                  </span>
                  <span className="hidden sm:inline">Restoran Paneli</span>
                </Button>
              </Link>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="gap-2 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                  logout
                </span>
                <span className="hidden sm:inline">Çıkış</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Navigation */}
          <aside className="lg:w-72 flex-shrink-0">
            <nav className="space-y-2 bg-white rounded-2xl shadow-lg p-4 border border-slate-100">
              {navigation.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all group ${
                      isActive
                        ? 'bg-gradient-to-r from-slate-700 to-slate-900 text-white shadow-md shadow-slate-300'
                        : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <span 
                      className={`material-symbols-outlined transition-transform group-hover:scale-110 ${
                        isActive ? 'text-white' : 'text-slate-500'
                      }`}
                      style={{ fontSize: '22px' }}
                    >
                      {item.icon}
                    </span>
                    <span>{item.name}</span>
                  </Link>
                )
              })}
              
              <div className="pt-4 mt-4 border-t border-slate-200">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 w-full transition-all lg:hidden group"
                >
                  <span className="material-symbols-outlined transition-transform group-hover:scale-110" style={{ fontSize: '22px' }}>
                    logout
                  </span>
                  <span>Çıkış</span>
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