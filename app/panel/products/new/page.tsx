'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createProduct } from '@/app/actions/product'
import { getCategories } from '@/app/actions/category'
import { getRestaurant } from '@/app/actions/restaurant'
import { translateToEnglish } from '@/app/actions/translate'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ImageUpload } from '@/components/image-upload'
import Link from 'next/link'
import { useLocale } from '@/lib/i18n/use-locale'

export default function NewProductPage() {
  const router = useRouter()
  const { t } = useLocale()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isTranslating, setIsTranslating] = useState(false)
  const [error, setError] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [categories, setCategories] = useState<any[]>([])
  const [restaurantId, setRestaurantId] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [supportedLanguages, setSupportedLanguages] = useState<string[]>(['tr'])
  const [nameEn, setNameEn] = useState('')
  const [descriptionEn, setDescriptionEn] = useState('')

  useEffect(() => {
    async function loadData() {
      const { restaurant } = await getRestaurant()
      if (restaurant) {
        setRestaurantId((restaurant as any).id)
        setSupportedLanguages((restaurant as any).supported_languages || ['tr'])
        const { categories: cats } = await getCategories((restaurant as any).id)
        setCategories(cats || [])
      }
      setIsLoading(false)
    }
    loadData()
  }, [])

  const handleTranslate = async () => {
    const nameInput = document.getElementById('name') as HTMLInputElement
    const descInput = document.getElementById('description') as HTMLTextAreaElement
    
    if (!nameInput?.value) {
      setError(t.panel.products.enterNameFirst)
      return
    }

    setIsTranslating(true)
    setError('')

    try {
      // Translate name
      const nameResult = await translateToEnglish(nameInput.value)
      if (nameResult.success && nameResult.translation) {
        setNameEn(nameResult.translation)
      }

      // Translate description if exists
      if (descInput?.value) {
        const descResult = await translateToEnglish(descInput.value)
        if (descResult.success && descResult.translation) {
          setDescriptionEn(descResult.translation)
        }
      }
    } catch (err) {
      setError(t.panel.products.translationError)
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
      name_en: nameEn || null,
      description: description || null,
      description_en: descriptionEn || null,
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
        <div className="text-center">{t.common.loading}</div>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">{t.panel.products.add}</h1>
        <p className="text-gray-600 mt-1">{t.panel.products.manageProducts}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div>
          <Label htmlFor="name">{t.panel.products.productName} (Türkçe) *</Label>
          <Input
            id="name"
            name="name"
            type="text"
            required
            placeholder={t.panel.products.productNamePlaceholder}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="description">{t.panel.products.description} (Türkçe)</Label>
          <textarea
            id="description"
            name="description"
            rows={3}
            placeholder={t.panel.products.descriptionPlaceholder}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* İngilizce Alanları - Sadece İngilizce destekleniyorsa göster */}
        {supportedLanguages.includes('en') && (
          <div className="border-t border-b border-blue-200 bg-blue-50 p-4 rounded-lg space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🇬🇧</span>
                <h3 className="font-semibold text-blue-800">{t.panel.products.englishTranslation}</h3>
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
                    {t.panel.products.translating}
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined mr-2 text-sm">translate</span>
                    {t.panel.products.translateWithAI}
                  </>
                )}
              </Button>
            </div>
            
            <div>
              <Label htmlFor="name_en">Product Name (English)</Label>
              <Input
                id="name_en"
                name="name_en"
                type="text"
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                placeholder="e.g. Margherita Pizza"
                className="mt-1 bg-white"
              />
            </div>

            <div>
              <Label htmlFor="description_en">Description (English)</Label>
              <textarea
                id="description_en"
                name="description_en"
                rows={3}
                value={descriptionEn}
                onChange={(e) => setDescriptionEn(e.target.value)}
                placeholder="Product description..."
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
              />
            </div>
          </div>
        )}

        <div>
          <Label htmlFor="price">{t.panel.products.price} (TL) *</Label>
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
          <Label htmlFor="category_id">{t.panel.products.category}</Label>
          <select
            id="category_id"
            name="category_id"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">{t.panel.products.selectCategory}</option>
            {categories.map((cat: any) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          <p className="text-sm text-gray-500 mt-1">
            {t.panel.products.categoryHelp}
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
          label={t.panel.products.productImage}
          recommendedSize="600x600 piksel (1:1 kare)"
        />

        <div>
          <Label htmlFor="sort_order">{t.panel.products.sortOrder} *</Label>
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
            {t.panel.products.sortOrderHelp}
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
              {t.panel.products.isActive} ({t.panel.products.showInMenu})
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
              ⭐ {t.panel.products.isFeatured} ({t.panel.products.showOnHomepage})
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
              🌟 {t.panel.products.dailySpecial} ({t.panel.products.showInSpecialSection})
            </Label>
          </div>
        </div>

        <div className="flex gap-4">
          <Button type="submit" disabled={isSubmitting || isUploading}>
            {isUploading ? t.panel.products.uploadingPhoto : isSubmitting ? t.panel.products.saving : t.panel.products.save}
          </Button>
          <Link href="/panel/products">
            <Button type="button" variant="outline">
              {t.panel.products.cancel}
            </Button>
          </Link>
        </div>
      </form>
    </div>
  )
}