import { redirect } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { getRestaurantWithStats } from "@/app/actions/restaurant"
import { Button } from "@/components/ui/button"
import { PanelDashboardClient } from "@/components/panel-dashboard-client"

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
            Restoran kaydı bulunamadı. Lütfen çıkış yapıp tekrar kayıt olun.
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

  return (
    <PanelDashboardClient
      restaurant={{
        name: (restaurant as any).name,
        slug: (restaurant as any).slug,
        created_at: (restaurant as any).created_at,
      }}
      subscription={subscription ? { plan: (subscription as any).plan } : null}
      stats={{
        scans_today: stats.scans_today,
        scans_7d: stats.scans_7d,
        scans_total: stats.scans_total,
      }}
      counts={{
        categories: counts.categories,
        products: counts.products,
      }}
      userEmail={user.email || ''}
    />
  )
}