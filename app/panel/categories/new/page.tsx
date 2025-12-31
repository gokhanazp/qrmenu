'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createCategory } from '@/app/actions/category'
import { getRestaurant } from '@/app/actions/restaurant'
import { translateToEnglish } from '@/app/actions/translate'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ImageUpload } from '@/components/image-upload'
import Link from 'next/link'
import { useLocale } from '@/lib/i18n/use-locale'

export default function NewCategoryPage() {
  const router = useRouter()
  const { t } = useLocale()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isTranslating, setIsTranslating] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [supportedLanguages, setSupportedLanguages] = useState<string[]>(['tr'])
  const [nameEn, setNameEn] = useState('')
  const [restaurantId, setRestaurantId] = useState('')

  useEffect(() => {
    async function loadData() {
      const { restaurant } = await getRestaurant()
      if (restaurant) {
        setRestaurantId((restaurant as any).id)
        setSupportedLanguages((restaurant as any).supported_languages || ['tr'])
      }
      setIsLoading(false)
    }
    loadData()
  }, [])

  const handleTranslate = async () => {
    const nameInput = document.getElementById('name') as HTMLInputElement
    
    if (!nameInput?.value) {
      setError(t.panel.categories.enterNameFirst)
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
      setError(t.panel.categories.translationError)
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

    if (!restaurantId) {
      setError(t.panel.categories.restaurantNotFound)
      setIsSubmitting(false)
      return
    }

    const result = await createCategory({
      restaurant_id: restaurantId,
      name,
      name_en: nameEn || null,
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

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="text-center">{t.common.loading}</div>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">{t.panel.categories.add}</h1>
        <p className="text-gray-600 mt-1">{t.panel.categories.manageCategories}</p>
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
                <h3 className="font-semibold text-blue-800">{t.panel.categories.englishTranslation}</h3>
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
                    {t.panel.categories.translating}
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined mr-2 text-sm">translate</span>
                    {t.panel.categories.translateWithAI}
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
            defaultValue="1"
            min="1"
            className="mt-1"
          />
          <p className="text-sm text-gray-500 mt-1">
            {t.panel.categories.sortOrderHelp}
          </p>
        </div>

        <div className="flex gap-4">
          <Button type="submit" disabled={isSubmitting || isUploading}>
            {isUploading ? t.panel.categories.uploadingPhoto : isSubmitting ? t.panel.categories.saving : t.panel.categories.save}
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