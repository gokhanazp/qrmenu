'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ImageUpload } from '@/components/image-upload'
import { getProductById, updateProductByAdmin, deleteProductByAdmin, getCategoriesByRestaurant } from '@/app/actions/admin'

interface Category {
  id: string
  name: string
}

interface ProductFormData {
  category_id: string
  name: string
  description: string
  price: number
  image_url: string
  is_available: boolean
  is_featured: boolean
  is_daily_special: boolean
  sort_order: number
}

export default function EditProductPage() {
  const params = useParams()
  const restaurantId = params.id as string
  const productId = params.productId as string
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [categories, setCategories] = useState<Category[]>([])
  
  const [formData, setFormData] = useState<ProductFormData>({
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
    const loadData = async () => {
      const catResult = await getCategoriesByRestaurant(restaurantId)
      if (catResult.success && catResult.data) {
        setCategories(catResult.data)
      }

      const result = await getProductById(productId)
      if (result.success && result.data) {
        const product = result.data
        setFormData({
          category_id: product.category_id || '',
          name: product.name || '',
          description: product.description || '',
          price: product.price || 0,
          image_url: product.image_url || '',
          is_available: product.is_available ?? true,
          is_featured: product.is_featured ?? false,
          is_daily_special: product.is_daily_special ?? false,
          sort_order: product.sort_order || 0
        })
      } else {
        setError('Ürün bulunamadı')
      }
      setInitialLoading(false)
    }
    loadData()
  }, [restaurantId, productId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isUploading) {
      setError('Lütfen görsel yüklenmesini bekleyin')
      return
    }
    setIsLoading(true)
    setError(null)
    try {
      const result = await updateProductByAdmin(productId, formData)
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

  const handleDelete = async () => {
    if (!confirm('Bu ürünü silmek istediğinizden emin misiniz?')) return
    setIsDeleting(true)
    try {
      const result = await deleteProductByAdmin(productId)
      if (result.success) {
        router.push(`/admin/restaurants/${restaurantId}/products`)
      } else {
        setError(result.error || 'Silme işlemi başarısız')
      }
    } catch {
      setError('Beklenmeyen bir hata oluştu')
    } finally {
      setIsDeleting(false)
    }
  }

  if (initialLoading) {
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
              <Link href={`/admin/restaurants/${restaurantId}/products`}>
                <Button variant="outline" size="sm">
                  <span className="material-symbols-outlined mr-2">arrow_back</span>
                  Geri
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Ürün Düzenle</h1>
                <p className="text-sm text-slate-600">{formData.name}</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={handleDelete} 
              disabled={isDeleting} 
              className="text-red-600 border-red-200 hover:bg-red-50"
            >
              {isDeleting ? 'Siliniyor...' : 'Sil'}
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-700">{error}</p>
              </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border p-6 space-y-4">
              <div>
                <Label htmlFor="category_id">Kategori *</Label>
                <select
                  id="category_id"
                  value={formData.category_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, category_id: e.target.value }))}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
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
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Açıklama</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
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
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.is_available}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_available: e.target.checked }))}
                    className="w-4 h-4"
                  />
                  <span>Mevcut</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_featured: e.target.checked }))}
                    className="w-4 h-4"
                  />
                  <span>Öne Çıkan</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.is_daily_special}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_daily_special: e.target.checked }))}
                    className="w-4 h-4"
                  />
                  <span>Günün Özel</span>
                </label>
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
                disabled={isLoading || isUploading}
                className="bg-gradient-to-r from-orange-500 to-orange-600"
              >
                {isLoading ? 'Kaydediliyor...' : 'Kaydet'}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}