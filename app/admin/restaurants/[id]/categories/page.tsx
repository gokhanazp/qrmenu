'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { getRestaurantById, deleteCategoryByAdmin } from '@/app/actions/admin'
import { createClient } from '@/lib/supabase/client'

interface Category {
  id: string
  name: string
  name_en?: string
  image_url?: string
  sort_order: number
  is_active: boolean
}

export default function CategoriesPage() {
  const params = useParams()
  const restaurantId = params.id as string
  const [categories, setCategories] = useState<Category[]>([])
  const [restaurantName, setRestaurantName] = useState('')
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      // Get restaurant info
      const restResult = await getRestaurantById(restaurantId) as any
      if (restResult.restaurant) {
        setRestaurantName(restResult.restaurant.name)
      }

      // Get categories
      const supabase = createClient()
      const { data } = await supabase
        .from('categories')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .order('sort_order', { ascending: true })

      if (data) {
        setCategories(data as Category[])
      }
      setLoading(false)
    }
    loadData()
  }, [restaurantId])

  const handleDelete = async (categoryId: string) => {
    if (!confirm('Bu kategoriyi silmek istediğinize emin misiniz? Bu işlem geri alınamaz.')) {
      return
    }
    setDeleting(categoryId)
    const result = await deleteCategoryByAdmin(categoryId)
    if (result.success) {
      setCategories(prev => prev.filter(c => c.id !== categoryId))
    } else {
      alert(result.error || 'Silme işlemi başarısız')
    }
    setDeleting(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <span className="material-symbols-outlined text-4xl text-orange-500 animate-spin">sync</span>
          <p className="mt-2 text-slate-600">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-8">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href={`/admin/restaurants/${restaurantId}`}>
                <Button variant="outline" size="sm">
                  <span className="material-symbols-outlined mr-2">arrow_back</span>
                  Geri
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Kategoriler</h1>
                <p className="text-sm text-slate-600">{restaurantName}</p>
              </div>
            </div>
            <Link href={`/admin/restaurants/${restaurantId}/categories/new`}>
              <Button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700">
                <span className="material-symbols-outlined mr-2">add</span>
                Yeni Kategori
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {categories.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
            <span className="material-symbols-outlined text-6xl text-slate-300">category</span>
            <h3 className="mt-4 text-lg font-medium text-slate-900">Henüz kategori yok</h3>
            <p className="mt-2 text-slate-600">İlk kategorinizi ekleyerek başlayın.</p>
            <Link href={`/admin/restaurants/${restaurantId}/categories/new`}>
              <Button className="mt-4 bg-gradient-to-r from-orange-500 to-orange-600">
                <span className="material-symbols-outlined mr-2">add</span>
                Kategori Ekle
              </Button>
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="text-left px-6 py-3 text-sm font-medium text-slate-600">Görsel</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-slate-600">Ad</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-slate-600">Ad (EN)</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-slate-600">Sıra</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-slate-600">Durum</th>
                  <th className="text-right px-6 py-3 text-sm font-medium text-slate-600">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {categories.map(category => (
                  <tr key={category.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      {category.image_url ? (
                        <Image
                          src={category.image_url}
                          alt={category.name}
                          width={48}
                          height={48}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center">
                          <span className="material-symbols-outlined text-slate-400">image</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-900">{category.name}</td>
                    <td className="px-6 py-4 text-slate-600">{category.name_en || '-'}</td>
                    <td className="px-6 py-4 text-slate-600">{category.sort_order}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        category.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {category.is_active ? 'Aktif' : 'Pasif'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/admin/restaurants/${restaurantId}/categories/${category.id}/edit`}>
                          <Button variant="outline" size="sm">
                            <span className="material-symbols-outlined text-sm">edit</span>
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(category.id)}
                          disabled={deleting === category.id}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          {deleting === category.id ? (
                            <span className="material-symbols-outlined text-sm animate-spin">sync</span>
                          ) : (
                            <span className="material-symbols-outlined text-sm">delete</span>
                          )}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  )
}