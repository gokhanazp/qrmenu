import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getRestaurant } from '@/app/actions/restaurant'
import { getProducts } from '@/app/actions/product'
import { getCategories } from '@/app/actions/category'
import { ProductsPageClient } from './products-page-client'

export default async function ProductsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { restaurant } = await getRestaurant()

  if (!restaurant) {
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

  const { products } = await getProducts((restaurant as any).id)
  const { categories } = await getCategories((restaurant as any).id)

  return <ProductsPageClient products={products} categories={categories} />
}