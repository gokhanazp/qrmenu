import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getRestaurant } from '@/app/actions/restaurant'
import { getProducts } from '@/app/actions/product'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { DeleteButton } from '@/components/delete-button'
import { formatCurrency } from '@/lib/utils/currency'

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pb-6">
      {/* Header */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-10">
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

      <div className="container mx-auto px-4 py-6">
        {products.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-gray-300">
            <span className="material-symbols-outlined text-8xl text-gray-300 mb-4">restaurant_menu</span>
            <h3 className="text-2xl font-bold mb-2 text-gray-900">Henüz ürün yok</h3>
            <p className="text-gray-600 mb-6">İlk ürününüzü oluşturarak başlayın</p>
            <Link href="/panel/products/new">
              <Button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700">
                <span className="material-symbols-outlined mr-2">add</span>
                Ürün Ekle
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {products.map((product: any) => (
              <div key={product.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all">
                <div className="flex gap-4 p-4">
                  {/* Product Image */}
                  <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                    {product.image_url ? (
                      <Image
                        src={product.image_url}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="material-symbols-outlined text-4xl text-gray-400">restaurant_menu</span>
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg text-gray-900 truncate">{product.name}</h3>
                        {product.description && (
                          <p className="text-sm text-gray-600 line-clamp-2 mt-1">{product.description}</p>
                        )}
                      </div>
                      <span className="text-xl font-bold text-orange-600 whitespace-nowrap">
                        {formatCurrency(product.price)}
                      </span>
                    </div>

                    {/* Category and Badges */}
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      {product.categories?.name && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-700">
                          <span className="material-symbols-outlined text-sm">category</span>
                          {product.categories.name}
                        </span>
                      )}
                      {product.is_featured && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-yellow-100 text-yellow-800">
                          <span className="material-symbols-outlined text-sm">star</span>
                          Öne Çıkan
                        </span>
                      )}
                      {product.is_daily_special && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-orange-100 text-orange-800">
                          <span className="material-symbols-outlined text-sm">today</span>
                          Günün Menüsü
                        </span>
                      )}
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold ${
                        product.is_active
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        <span className="material-symbols-outlined text-sm">
                          {product.is_active ? 'check_circle' : 'cancel'}
                        </span>
                        {product.is_active ? 'Aktif' : 'Pasif'}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Link href={`/panel/products/${product.id}/edit`}>
                        <Button variant="outline" size="sm" className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100">
                          <span className="material-symbols-outlined text-lg mr-1">edit</span>
                          Düzenle
                        </Button>
                      </Link>
                      <DeleteButton productId={product.id} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}