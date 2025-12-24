import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getRestaurant } from '@/app/actions/restaurant'
import { getCategories } from '@/app/actions/category'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { DeleteButton } from '@/components/delete-button'

export default async function CategoriesPage() {
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

  const { categories } = await getCategories((restaurant as any).id)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pb-6">
      {/* Header */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-3xl text-purple-500">category</span>
                Kategoriler
              </h1>
              <p className="text-sm text-gray-600 mt-1">Menü kategorilerinizi yönetin</p>
            </div>
            <Link href="/panel/categories/new">
              <Button className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700">
                <span className="material-symbols-outlined mr-2">add</span>
                Yeni Kategori
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {categories.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-gray-300">
            <span className="material-symbols-outlined text-8xl text-gray-300 mb-4">category</span>
            <h3 className="text-2xl font-bold mb-2 text-gray-900">Henüz kategori yok</h3>
            <p className="text-gray-600 mb-6">İlk kategorinizi oluşturarak başlayın</p>
            <Link href="/panel/categories/new">
              <Button className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700">
                <span className="material-symbols-outlined mr-2">add</span>
                Kategori Ekle
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category: any) => (
              <div key={category.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all">
                {/* Category Image */}
                <div className="relative h-40 bg-gradient-to-br from-purple-100 to-purple-200">
                  {category.image_url ? (
                    <Image
                      src={category.image_url}
                      alt={category.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="material-symbols-outlined text-6xl text-purple-400">category</span>
                    </div>
                  )}
                  {/* Sort Order Badge */}
                  <div className="absolute top-3 left-3">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/90 text-purple-600 flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">sort</span>
                      Sıra: {category.sort_order}
                    </span>
                  </div>
                  {/* Status Badge */}
                  <div className="absolute top-3 right-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${
                      category.is_active
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-500 text-white'
                    }`}>
                      <span className="material-symbols-outlined text-sm">
                        {category.is_active ? 'check_circle' : 'cancel'}
                      </span>
                      {category.is_active ? 'Aktif' : 'Pasif'}
                    </span>
                  </div>
                </div>

                {/* Category Info */}
                <div className="p-4">
                  <h3 className="font-bold text-xl text-gray-900 mb-4">{category.name}</h3>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Link href={`/panel/categories/${category.id}/edit`} className="flex-1">
                      <Button variant="outline" className="w-full">
                        <span className="material-symbols-outlined text-lg mr-2">edit</span>
                        Düzenle
                      </Button>
                    </Link>
                    <DeleteButton categoryId={category.id} />
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