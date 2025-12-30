'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ImageUpload } from '@/components/image-upload'
import { createProductByAdmin, getCategoriesByRestaurant } from '@/app/actions/admin'

interface Category {
  id: string
  name: string
}

export default function NewProductPage() {
  const params = useParams()
  const restaurantId = params.id as string
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [loadingCategories, setLoadingCategories] = useState(true)
  
  const [formData, setFormData] = useState({
    category_id: '',
    name: '',
    description: '',
    price: 0,
    image_url: '',
    is_available: true,
    is_featured: false,
    is_daily_special: false,
    sort_order: 0
  })

  useEffect(() => {
    const loadCategories = async () => {
      const result = await getCategoriesByRestaurant(restaurantId)
      if (result.success && result.data) {
        const cats = result.data as Category[]
        setCategories(cats)
        if (cats.length > 0) {
          setFormData(prev => ({ ...prev, category_id: cats[0].id }))
        }
      }
      setLoadingCategories(false)
    }
    loadCategories()
  }, [restaurantId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isUploading) {
      setError('Lütfen görsel yüklenmesini bekleyin')
      return
    }
    if (!formData.category_id) {
      setError('Lütfen bir kategori seçin')
      return
    }
    setIsLoading(true)
    setError(null)
    try {
      const result = await createProductByAdmin({
        restaurantId,
        category_id: formData.category_id,
        name: formData.name,
        description: formData.description,
        price: formData.price,
        image_url: formData.image_url,
        is_available: formData.is_available,
        is_featured: formData.is_featured,
        is_daily_special: formData.is_daily_special,
        sort_order: formData.sort_order
      })
      if (result.success) {
        router.push(`/admin/restaurants/${restaurantId}/products`)
      } else {
        setError(result.error || 'Bir hata oluştu')
      }
    } catch {
      setError('Beklenmeyen bir hata oluştu')
    } finally {
      setIsLoading(false)
    }
  }

  if (loadingCategories) {
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
          <div className="flex items-center gap-4">
            <Link href={`/admin/restaurants/${restaurantId}/products`}>
              <Button variant="outline" size="sm">
                <span className="material-symbols-outlined mr-2">arrow_back</span>
                Geri
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Yeni Ürün</h1>
              <p className="text-sm text-slate-600">Yeni ürün ekle</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                <span className="material-symbols-outlined text-red-600">error</span>
                <p className="text-red-700">{error}</p>
              </div>
            )}

            {categories.length === 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center gap-3">
                <span className="material-symbols-outlined text-yellow-600">warning</span>
                <p className="text-yellow-700">Önce bir kategori oluşturmalısınız.</p>
              </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border p-6 space-y-4">
              <div>
                <Label htmlFor="category_id">Kategori *</Label>
                <select
                  id="category_id"
                  value={formData.category_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, category_id: e.target.value }))}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                >
                  <option value="">Kategori Seçin</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="name">Ürün Adı *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Örn: Adana Kebap"
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Açıklama</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Ürün açıklaması..."
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="price">Fiyat (₺) *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="sort_order">Sıra Numarası</Label>
                <Input
                  id="sort_order"
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) => setFormData(prev => ({ ...prev, sort_order: parseInt(e.target.value) || 0 }))}
                />
              </div>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_available"
                    checked={formData.is_available}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_available: e.target.checked }))}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <Label htmlFor="is_available" className="cursor-pointer">Mevcut</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_featured"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_featured: e.target.checked }))}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <Label htmlFor="is_featured" className="cursor-pointer">Öne Çıkan</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_daily_special"
                    checked={formData.is_daily_special}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_daily_special: e.target.checked }))}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <Label htmlFor="is_daily_special" className="cursor-pointer">Günün Özel</Label>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border p-6">
              <Label>Ürün Görseli</Label>
              <div className="mt-2">
                <ImageUpload
                  id="product-image"
                  currentImageUrl={formData.image_url}
                  onUploadComplete={(url: string) => {
                    setFormData(prev => ({ ...prev, image_url: url }))
                    setIsUploading(false)
                  }}
                  bucket="product-images"
                  path="products"
                  onUploadStart={() => setIsUploading(true)}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Link href={`/admin/restaurants/${restaurantId}/products`}>
                <Button type="button" variant="outline">İptal</Button>
              </Link>
              <Button
                type="submit"
                disabled={isLoading || isUploading || categories.length === 0}
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
              >
                {isLoading ? (
                  <>
                    <span className="material-symbols-outlined animate-spin mr-2">sync</span>
                    Oluşturuluyor...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined mr-2">add</span>
                    Ürün Ekle
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}