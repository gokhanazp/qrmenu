'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createProduct } from '@/app/actions/product'
import { getCategories } from '@/app/actions/category'
import { getRestaurant } from '@/app/actions/restaurant'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ImageUpload } from '@/components/image-upload'
import Link from 'next/link'

export default function NewProductPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [categories, setCategories] = useState<any[]>([])
  const [restaurantId, setRestaurantId] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      const { restaurant } = await getRestaurant()
      if (restaurant) {
        setRestaurantId((restaurant as any).id)
        const { categories: cats } = await getCategories((restaurant as any).id)
        setCategories(cats || [])
      }
      setIsLoading(false)
    }
    loadData()
  }, [])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    const name = formData.get('name') as string
    const description = formData.get('description') as string
    const price = parseFloat(formData.get('price') as string)
    const categoryId = formData.get('category_id') as string
    const sortOrder = parseInt(formData.get('sort_order') as string)
    const isActive = formData.get('is_active') === 'on'
    const isFeatured = formData.get('is_featured') === 'on'
    const isDailySpecial = formData.get('is_daily_special') === 'on'

    const result = await createProduct({
      restaurant_id: restaurantId,
      category_id: categoryId || null,
      name,
      description: description || null,
      price,
      image_url: imageUrl || null,
      sort_order: sortOrder,
      is_active: isActive,
      is_featured: isFeatured,
      is_daily_special: isDailySpecial
    })

    if (result.error) {
      setError(result.error)
      setIsSubmitting(false)
    } else {
      router.push('/panel/products')
      router.refresh()
    }
  }

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="text-center">Yükleniyor...</div>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Yeni Ürün</h1>
        <p className="text-gray-600 mt-1">Menünüze yeni ürün ekleyin</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div>
          <Label htmlFor="name">Ürün Adı *</Label>
          <Input
            id="name"
            name="name"
            type="text"
            required
            placeholder="Örn: Margherita Pizza"
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="description">Açıklama</Label>
          <textarea
            id="description"
            name="description"
            rows={3}
            placeholder="Ürün açıklaması..."
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div>
          <Label htmlFor="price">Fiyat (TL) *</Label>
          <Input
            id="price"
            name="price"
            type="number"
            step="0.01"
            min="0"
            required
            placeholder="0.00"
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="category_id">Kategori</Label>
          <select
            id="category_id"
            name="category_id"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">Kategori Seçin</option>
            {categories.map((cat: any) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          <p className="text-sm text-gray-500 mt-1">
            Ürünü bir kategoriye atayabilirsiniz
          </p>
        </div>

        <ImageUpload
          bucket="product-images"
          path="products"
          currentImageUrl={imageUrl}
          onUploadComplete={(url) => {
            setImageUrl(url)
            setIsUploading(false)
          }}
          onUploadStart={() => setIsUploading(true)}
          label="Ürün Fotoğrafı"
        />

        <div>
          <Label htmlFor="sort_order">Sıra No *</Label>
          <Input
            id="sort_order"
            name="sort_order"
            type="number"
            required
            defaultValue="1"
            min="1"
            className="mt-1"
          />
          <p className="text-sm text-gray-500 mt-1">
            Ürünlerin menüde görüneceği sırayı belirler
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_active"
              name="is_active"
              defaultChecked
              className="w-4 h-4 text-blue-600 rounded"
            />
            <Label htmlFor="is_active" className="cursor-pointer">
              Aktif (Menüde göster)
            </Label>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_featured"
              name="is_featured"
              className="w-4 h-4 text-blue-600 rounded"
            />
            <Label htmlFor="is_featured" className="cursor-pointer">
              ⭐ Öne Çıkan (Ana sayfada göster)
            </Label>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_daily_special"
              name="is_daily_special"
              className="w-4 h-4 text-orange-600 rounded"
            />
            <Label htmlFor="is_daily_special" className="cursor-pointer">
              🌟 Günün Menüsü (Özel bölümde göster)
            </Label>
          </div>
        </div>

        <div className="flex gap-4">
          <Button type="submit" disabled={isSubmitting || isUploading}>
            {isUploading ? 'Fotoğraf yükleniyor...' : isSubmitting ? 'Kaydediliyor...' : 'Kaydet'}
          </Button>
          <Link href="/panel/products">
            <Button type="button" variant="outline">
              İptal
            </Button>
          </Link>
        </div>
      </form>
    </div>
  )
}