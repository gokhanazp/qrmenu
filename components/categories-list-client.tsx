"use client"

import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { DeleteButton } from '@/components/delete-button'
import { useLocale } from '@/lib/i18n/use-locale'

interface Category {
  id: string
  name: string
  name_en?: string | null
  image_url: string | null
  sort_order: number
  is_active: boolean
}

interface CategoriesListClientProps {
  categories: Category[]
}

export function CategoriesListClient({ categories }: CategoriesListClientProps) {
  const { t, locale } = useLocale()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pb-6">
      {/* Header */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-3xl text-purple-500">category</span>
                {t.panel.categories.title}
              </h1>
              <p className="text-sm text-gray-600 mt-1">{t.panel.categories.manageCategories}</p>
            </div>
            <Link href="/panel/categories/new">
              <Button className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700">
                <span className="material-symbols-outlined mr-2">add</span>
                {t.panel.categories.add}
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {categories.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-gray-300">
            <span className="material-symbols-outlined text-8xl text-gray-300 mb-4">category</span>
            <h3 className="text-2xl font-bold mb-2 text-gray-900">{t.panel.categories.noCategoriesYet}</h3>
            <p className="text-gray-600 mb-6">{t.panel.categories.startWithFirst}</p>
            <Link href="/panel/categories/new">
              <Button className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700">
                <span className="material-symbols-outlined mr-2">add</span>
                {t.panel.categories.addCategory}
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category) => (
              <div key={category.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all">
                {/* Category Image */}
                <div className="relative h-40 bg-gradient-to-br from-purple-100 to-purple-200">
                  {category.image_url ? (
                    <Image
                      src={category.image_url}
                      alt={category.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="material-symbols-outlined text-6xl text-purple-400">category</span>
                    </div>
                  )}
                  {/* Sort Order Badge */}
                  <div className="absolute top-3 left-3">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/90 text-purple-600 flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">sort</span>
                      {t.panel.categories.order}: {category.sort_order}
                    </span>
                  </div>
                  {/* Status Badge */}
                  <div className="absolute top-3 right-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${
                      category.is_active
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-500 text-white'
                    }`}>
                      <span className="material-symbols-outlined text-sm">
                        {category.is_active ? 'check_circle' : 'cancel'}
                      </span>
                      {category.is_active ? t.panel.categories.active : t.panel.categories.inactive}
                    </span>
                  </div>
                </div>

                {/* Category Info */}
                <div className="p-4">
                  <h3 className="font-bold text-xl text-gray-900 mb-1">
                    {locale === 'en' && category.name_en ? category.name_en : category.name}
                  </h3>
                  {locale === 'en' && category.name_en && (
                    <p className="text-sm text-gray-500 mb-3">{category.name}</p>
                  )}
                  {locale !== 'en' && category.name_en && (
                    <p className="text-sm text-gray-500 mb-3">EN: {category.name_en}</p>
                  )}
                  {!category.name_en && <div className="mb-4" />}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Link href={`/panel/categories/${category.id}/edit`} className="flex-1">
                      <Button variant="outline" className="w-full">
                        <span className="material-symbols-outlined text-lg mr-2">edit</span>
                        {t.common.edit}
                      </Button>
                    </Link>
                    <DeleteButton categoryId={category.id} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}