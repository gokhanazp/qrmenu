'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createCategory } from '@/app/actions/category'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ImageUpload } from '@/components/image-upload'
import Link from 'next/link'

export default function NewCategoryPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState('')
  const [imageUrl, setImageUrl] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    const name = formData.get('name') as string
    const sortOrder = parseInt(formData.get('sort_order') as string)

    // Get restaurant ID from a hidden field or context
    // For now, we'll need to fetch it
    const response = await fetch('/api/restaurant')
    const { restaurant } = await response.json()

    if (!restaurant) {
      setError('Restoran bulunamadı')
      setIsSubmitting(false)
      return
    }

    const result = await createCategory({
      restaurant_id: restaurant.id,
      name,
      sort_order: sortOrder,
      image_url: imageUrl
    })

    if (result.error) {
      setError(result.error)
      setIsSubmitting(false)
    } else {
      router.push('/panel/categories')
      router.refresh()
    }
  }

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Yeni Kategori</h1>
        <p className="text-gray-600 mt-1">Menünüze yeni bir kategori ekleyin</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div>
          <Label htmlFor="name">Kategori Adı *</Label>
          <Input
            id="name"
            name="name"
            type="text"
            required
            placeholder="Örn: Ana Yemekler"
            className="mt-1"
          />
        </div>

        <ImageUpload
          bucket="category-images"
          path={`categories`}
          currentImageUrl={imageUrl}
          onUploadComplete={(url) => {
            setImageUrl(url)
            setIsUploading(false)
          }}
          onUploadStart={() => setIsUploading(true)}
          label="Kategori Fotoğrafı"
          recommendedSize="800x600 piksel (4:3 oran)"
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
            Kategorilerin menüde görüneceği sırayı belirler
          </p>
        </div>

        <div className="flex gap-4">
          <Button type="submit" disabled={isSubmitting || isUploading}>
            {isUploading ? 'Fotoğraf yükleniyor...' : isSubmitting ? 'Kaydediliyor...' : 'Kaydet'}
          </Button>
          <Link href="/panel/categories">
            <Button type="button" variant="outline">
              İptal
            </Button>
          </Link>
        </div>
      </form>
    </div>
  )
}