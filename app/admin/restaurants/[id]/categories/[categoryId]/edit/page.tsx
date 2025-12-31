'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ImageUpload } from '@/components/image-upload'
import { getCategoryById, updateCategoryByAdmin, deleteCategoryByAdmin, getRestaurantById } from '@/app/actions/admin'

export default function EditCategoryPage() {
  const params = useParams()
  const restaurantId = params.id as string
  const categoryId = params.categoryId as string
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [supportedLanguages, setSupportedLanguages] = useState<string[]>(['tr'])
  
  const [formData, setFormData] = useState({
    name: '',
    name_en: '',
    image_url: '',
    sort_order: 0,
    is_active: true
  })

  useEffect(() => {
    const loadData = async () => {
      // Load restaurant to get supported languages
      const restResult = await getRestaurantById(restaurantId) as any
      if (restResult.restaurant) {
        setSupportedLanguages(restResult.restaurant.supported_languages || ['tr'])
      }
      
      // Load category
      const catResult = await getCategoryById(categoryId)
      if (catResult.success && catResult.data) {
        const data = catResult.data as any
        setFormData({
          name: data.name || '',
          name_en: data.name_en || '',
          image_url: data.image_url || '',
          sort_order: data.sort_order || 0,
          is_active: data.is_active ?? true
        })
      } else {
        setError('Kategori bulunamadı')
      }
      setInitialLoading(false)
    }
    loadData()
  }, [restaurantId, categoryId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isUploading) {
      setError('Lütfen görsel yüklenmesini bekleyin')
      return
    }
    setIsLoading(true)
    setError(null)
    try {
      const result = await updateCategoryByAdmin(categoryId, {
        name: formData.name,
        name_en: formData.name_en || undefined,
        image_url: formData.image_url || undefined,
        sort_order: formData.sort_order,
        is_active: formData.is_active
      })
      if (result.success) {
        router.push(`/admin/restaurants/${restaurantId}/categories`)
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
    if (!confirm('Bu kategoriyi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) return
    setIsDeleting(true)
    try {
      const result = await deleteCategoryByAdmin(categoryId)
      if (result.success) {
        router.push(`/admin/restaurants/${restaurantId}/categories`)
      } else {
        setError(result.error || 'Silme işlemi başarısız')
      }
    } catch {
      setError('Beklenmeyen bir hata oluştu')
    } finally {
      setIsDeleting(false)
    }
  }

  const supportsEnglish = supportedLanguages.includes('en')

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
              <Link href={`/admin/restaurants/${restaurantId}/categories`}>
                <Button variant="outline" size="sm">
                  <span className="material-symbols-outlined mr-2">arrow_back</span>
                  Geri
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Kategori Düzenle</h1>
                <p className="text-sm text-slate-600">{formData.name}</p>
              </div>
            </div>
            <Button variant="outline" onClick={handleDelete} disabled={isDeleting} className="text-red-600 border-red-200 hover:bg-red-50">
              {isDeleting ? (
                <>
                  <span className="material-symbols-outlined animate-spin mr-2">sync</span>
                  Siliniyor...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined mr-2">delete</span>
                  Sil
                </>
              )}
            </Button>
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

            <div className="bg-white rounded-xl shadow-sm border p-6 space-y-4">
              <div>
                <Label htmlFor="name">Kategori Adı (Türkçe) *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Örn: Ana Yemekler"
                  required
                />
              </div>
              
              {supportsEnglish && (
                <div>
                  <Label htmlFor="name_en">Kategori Adı (İngilizce)</Label>
                  <Input
                    id="name_en"
                    value={formData.name_en}
                    onChange={(e) => setFormData(prev => ({ ...prev, name_en: e.target.value }))}
                    placeholder="E.g: Main Courses"
                  />
                  <p className="text-xs text-slate-500 mt-1">İngilizce menü için kategori adı</p>
                </div>
              )}
              
              <div>
                <Label htmlFor="sort_order">Sıra Numarası</Label>
                <Input
                  id="sort_order"
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) => setFormData(prev => ({ ...prev, sort_order: parseInt(e.target.value) || 0 }))}
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <Label htmlFor="is_active" className="cursor-pointer">Aktif</Label>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border p-6">
              <Label>Kategori Görseli</Label>
              <div className="mt-2">
                <ImageUpload
                  id="category-image"
                  currentImageUrl={formData.image_url}
                  onUploadComplete={(url: string) => {
                    setFormData(prev => ({ ...prev, image_url: url }))
                    setIsUploading(false)
                  }}
                  bucket="category-images"
                  path="categories"
                  onUploadStart={() => setIsUploading(true)}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Link href={`/admin/restaurants/${restaurantId}/categories`}>
                <Button type="button" variant="outline">İptal</Button>
              </Link>
              <Button
                type="submit"
                disabled={isLoading || isUploading}
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
              >
                {isLoading ? (
                  <>
                    <span className="material-symbols-outlined animate-spin mr-2">sync</span>
                    Kaydediliyor...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined mr-2">save</span>
                    Kaydet
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