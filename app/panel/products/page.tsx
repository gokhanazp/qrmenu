import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getRestaurant } from '@/app/actions/restaurant'
import { getProducts } from '@/app/actions/product'
import { getCategories } from '@/app/actions/category'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ProductsListClient } from '@/components/products-list-client'

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pb-6">
      {/* Header */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-3xl text-orange-500">restaurant_menu</span>
                Ürünler
              </h1>
              <p className="text-sm text-gray-600 mt-1">Menü ürünlerinizi yönetin</p>
            </div>
            <Link href="/panel/products/new">
              <Button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700">
                <span className="material-symbols-outlined mr-2">add</span>
                Yeni Ürün
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <ProductsListClient products={products} categories={categories} />
    </div>
  )
}