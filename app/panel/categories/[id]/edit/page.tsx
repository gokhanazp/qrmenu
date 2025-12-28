'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getCategory, updateCategory } from '@/app/actions/category'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ImageUpload } from '@/components/image-upload'
import Link from 'next/link'

export default function EditCategoryPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [category, setCategory] = useState<any>(null)
  const [imageUrl, setImageUrl] = useState('')

  useEffect(() => {
    async function loadCategory() {
      const result = await getCategory(params.id)
      if (result.error || !result.category) {
        setError('Kategori bulunamadı')
      } else {
        setCategory(result.category)
        setImageUrl((result.category as any).image_url || '')
      }
      setIsLoading(false)
    }
    loadCategory()
  }, [params.id])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    const name = formData.get('name') as string
    const sortOrder = parseInt(formData.get('sort_order') as string)
    const isActive = formData.get('is_active') === 'on'

    const result = await updateCategory(params.id, {
      name,
      sort_order: sortOrder,
      is_active: isActive,
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

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="text-center">Yükleniyor...</div>
      </div>
    )
  }

  if (!category) {
    return (
      <div className="p-8">
        <div className="text-center text-red-600">{error || 'Kategori bulunamadı'}</div>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Kategori Düzenle</h1>
        <p className="text-gray-600 mt-1">Kategori bilgilerini güncelleyin</p>
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
            defaultValue={category.name}
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
        />

        <div>
          <Label htmlFor="sort_order">Sıra No *</Label>
          <Input
            id="sort_order"
            name="sort_order"
            type="number"
            required
            defaultValue={category.sort_order}
            min="1"
            className="mt-1"
          />
          <p className="text-sm text-gray-500 mt-1">
            Kategorilerin menüde görüneceği sırayı belirler
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="is_active"
            name="is_active"
            defaultChecked={category.is_active}
            className="w-4 h-4 text-blue-600 rounded"
          />
          <Label htmlFor="is_active" className="cursor-pointer">
            Aktif (Menüde göster)
          </Label>
        </div>

        <div className="flex gap-4">
          <Button type="submit" disabled={isSubmitting || isUploading}>
            {isUploading ? 'Fotoğraf yükleniyor...' : isSubmitting ? 'Kaydediliyor...' : 'Güncelle'}
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