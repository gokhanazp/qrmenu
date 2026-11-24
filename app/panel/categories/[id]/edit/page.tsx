'use client'

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation'
import { getCategory, updateCategory } from '@/app/actions/category'
import { getRestaurant } from '@/app/actions/restaurant'
import { translateToEnglish } from '@/app/actions/translate'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ImageUpload } from '@/components/image-upload'
import Link from 'next/link'
import { useLocale } from '@/lib/i18n/use-locale'

export default function EditCategoryPage(props: { params: Promise<{ id: string }> }) {
  const params = use(props.params);
  const router = useRouter()
  const { t } = useLocale()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isTranslating, setIsTranslating] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [category, setCategory] = useState<any>(null)
  const [imageUrl, setImageUrl] = useState('')
  const [supportedLanguages, setSupportedLanguages] = useState<string[]>(['tr'])
  const [nameEn, setNameEn] = useState('')

  useEffect(() => {
    async function loadData() {
      const [categoryResult, restaurantResult] = await Promise.all([
        getCategory(params.id),
        getRestaurant()
      ])
      
      if (categoryResult.error || !categoryResult.category) {
        setError(t.panel.categories.restaurantNotFound)
      } else {
        setCategory(categoryResult.category)
        setImageUrl((categoryResult.category as any).image_url || '')
        setNameEn((categoryResult.category as any).name_en || '')
      }
      
      if ((restaurantResult as any).restaurant) {
        setSupportedLanguages((restaurantResult as any).restaurant.supported_languages || ['tr'])
      }
      
      setIsLoading(false)
    }
    loadData()
  }, [params.id])

  const handleTranslate = async () => {
    const nameInput = document.getElementById('name') as HTMLInputElement
    
    if (!nameInput?.value) {
      setError(t.panel.categories.enterNameFirst || 'Lütfen önce Türkçe kategori adını girin')
      return
    }

    setIsTranslating(true)
    setError('')

    try {
      const nameResult = await translateToEnglish(nameInput.value)
      if (nameResult.success && nameResult.translation) {
        setNameEn(nameResult.translation)
      }
    } catch (err) {
      setError(t.panel.categories.translationError || 'Çeviri sırasında bir hata oluştu')
    } finally {
      setIsTranslating(false)
    }
  }

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
      name_en: nameEn || null,
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
        <div className="text-center">{t.common.loading}</div>
      </div>
    )
  }

  if (!category) {
    return (
      <div className="p-8">
        <div className="text-center text-red-600">{error || t.panel.categories.restaurantNotFound}</div>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">{t.panel.categories.edit}</h1>
        <p className="text-gray-600 mt-1">{t.panel.categories.updateCategory}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div>
          <Label htmlFor="name">{t.panel.categories.categoryName} (Türkçe) *</Label>
          <Input
            id="name"
            name="name"
            type="text"
            required
            defaultValue={category.name}
            placeholder={t.panel.categories.categoryNamePlaceholder}
            className="mt-1"
          />
        </div>

        {/* İngilizce Alanları - Sadece İngilizce destekleniyorsa göster */}
        {supportedLanguages.includes('en') && (
          <div className="border-t border-b border-blue-200 bg-blue-50 p-4 rounded-lg space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🇬🇧</span>
                <h3 className="font-semibold text-blue-800">{t.panel.categories.englishTranslation || 'İngilizce Çeviri'}</h3>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleTranslate}
                disabled={isTranslating}
                className="bg-white hover:bg-blue-100 border-blue-300"
              >
                {isTranslating ? (
                  <>
                    <span className="material-symbols-outlined animate-spin mr-2 text-sm">sync</span>
                    {t.panel.categories.translating || 'Çevriliyor...'}
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined mr-2 text-sm">translate</span>
                    {t.panel.categories.translateWithAI || 'AI ile Çevir'}
                  </>
                )}
              </Button>
            </div>
            
            <div>
              <Label htmlFor="name_en">Category Name (English)</Label>
              <Input
                id="name_en"
                name="name_en"
                type="text"
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                placeholder="e.g. Main Dishes"
                className="mt-1 bg-white"
              />
            </div>
          </div>
        )}

        <ImageUpload
          bucket="category-images"
          path={`categories`}
          currentImageUrl={imageUrl}
          onUploadComplete={(url) => {
            setImageUrl(url)
            setIsUploading(false)
          }}
          onUploadStart={() => setIsUploading(true)}
          label={t.panel.categories.categoryImage}
          recommendedSize="800x600 piksel (4:3 oran)"
        />

        <div>
          <Label htmlFor="sort_order">{t.panel.categories.sortOrder} *</Label>
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
            {t.panel.categories.sortOrderHelp || 'Kategorilerin menüde görüneceği sırayı belirler'}
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
            {t.panel.categories.isActive} ({t.panel.categories.showInMenu || 'Menüde göster'})
          </Label>
        </div>

        <div className="flex gap-4">
          <Button type="submit" disabled={isSubmitting || isUploading}>
            {isUploading ? t.panel.categories.uploadingPhoto || 'Fotoğraf yükleniyor...' : isSubmitting ? t.panel.categories.saving : t.panel.categories.updateCategory}
          </Button>
          <Link href="/panel/categories">
            <Button type="button" variant="outline">
              {t.panel.categories.cancel}
            </Button>
          </Link>
        </div>
      </form>
    </div>
  )
}