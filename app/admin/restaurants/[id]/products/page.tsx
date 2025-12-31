'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { getRestaurantById, deleteProductByAdmin } from '@/app/actions/admin'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency } from '@/lib/utils/currency'

interface Product {
  id: string
  name: string
  name_en?: string
  description?: string
  price: number
  image_url?: string
  sort_order: number
  is_available: boolean
  is_featured: boolean
  is_daily_special: boolean
  categories?: { id: string; name: string }
}

export default function ProductsPage() {
  const params = useParams()
  const restaurantId = params.id as string
  const [products, setProducts] = useState<Product[]>([])
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

      // Get products
      const supabase = createClient()
      const { data } = await supabase
        .from('products')
        .select('*, categories(id, name)')
        .eq('restaurant_id', restaurantId)
        .order('sort_order', { ascending: true })

      if (data) {
        setProducts(data as Product[])
      }
      setLoading(false)
    }
    loadData()
  }, [restaurantId])

  const handleDelete = async (productId: string) => {
    if (!confirm('Bu ürünü silmek istediğinize emin misiniz? Bu işlem geri alınamaz.')) {
      return
    }
    setDeleting(productId)
    const result = await deleteProductByAdmin(productId)
    if (result.success) {
      setProducts(prev => prev.filter(p => p.id !== productId))
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
                <h1 className="text-2xl font-bold text-slate-900">Ürünler</h1>
                <p className="text-sm text-slate-600">{restaurantName}</p>
              </div>
            </div>
            <Link href={`/admin/restaurants/${restaurantId}/products/new`}>
              <Button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700">
                <span className="material-symbols-outlined mr-2">add</span>
                Yeni Ürün
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {products.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
            <span className="material-symbols-outlined text-6xl text-slate-300">restaurant_menu</span>
            <h3 className="mt-4 text-lg font-medium text-slate-900">Henüz ürün yok</h3>
            <p className="mt-2 text-slate-600">İlk ürününüzü ekleyerek başlayın.</p>
            <Link href={`/admin/restaurants/${restaurantId}/products/new`}>
              <Button className="mt-4 bg-gradient-to-r from-orange-500 to-orange-600">
                <span className="material-symbols-outlined mr-2">add</span>
                Ürün Ekle
              </Button>
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    <th className="text-left px-6 py-3 text-sm font-medium text-slate-600">Görsel</th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-slate-600">Ad</th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-slate-600">Kategori</th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-slate-600">Fiyat</th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-slate-600">Durum</th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-slate-600">Özellikler</th>
                    <th className="text-right px-6 py-3 text-sm font-medium text-slate-600">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {products.map(product => (
                    <tr key={product.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4">
                        {product.image_url ? (
                          <Image
                            src={product.image_url}
                            alt={product.name}
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
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-slate-900">{product.name}</p>
                          {product.name_en && (
                            <p className="text-sm text-slate-500">{product.name_en}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {product.categories?.name || '-'}
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-900">
                        {formatCurrency(product.price)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          product.is_available
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {product.is_available ? 'Mevcut' : 'Tükendi'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-1">
                          {product.is_featured && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                              Öne Çıkan
                            </span>
                          )}
                          {product.is_daily_special && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                              Günün Özel
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/admin/restaurants/${restaurantId}/products/${product.id}/edit`}>
                            <Button variant="outline" size="sm">
                              <span className="material-symbols-outlined text-sm">edit</span>
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(product.id)}
                            disabled={deleting === product.id}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            {deleting === product.id ? (
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
          </div>
        )}
      </main>
    </div>
  )
}