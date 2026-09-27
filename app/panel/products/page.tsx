import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getProductsHubData } from '@/app/actions/products-hub'
import { ProductsHubClient } from './products-hub-client'

export const dynamic = 'force-dynamic'

export default async function ProductsPage({ searchParams }: { searchParams?: { tab?: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const data = await getProductsHubData()
  if (data.error === 'Restoran bulunamadı. Lütfen tekrar kayıt olun.' || (!data.restaurantId && data.error)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center bg-white p-8 rounded-2xl shadow-lg">
          <span className="material-symbols-outlined text-6xl text-gray-400 mb-4">store</span>
          <h2 className="text-2xl font-bold mb-2">Restoran Bulunamadı</h2>
          <p className="text-gray-600">Lütfen çıkış yapıp tekrar kayıt olun.</p>
        </div>
      </div>
    )
  }
  return <ProductsHubClient data={data} initialTab={searchParams?.tab === 'platform' ? 'platform' : 'list'} />
}
