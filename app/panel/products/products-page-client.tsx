'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ProductsListClient } from '@/components/products-list-client'
import { useLocale } from '@/lib/i18n/use-locale'

interface ProductsPageClientProps {
  products: any[]
  categories: any[]
}

export function ProductsPageClient({ products, categories }: ProductsPageClientProps) {
  const { t } = useLocale()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pb-6">
      {/* Header */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-3xl text-orange-500">restaurant_menu</span>
                {t.panel.products.title}
              </h1>
              <p className="text-sm text-gray-600 mt-1">{t.panel.products.manageProducts}</p>
            </div>
            <Link href="/panel/products/new">
              <Button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700">
                <span className="material-symbols-outlined mr-2">add</span>
                {t.panel.products.add}
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <ProductsListClient products={products} categories={categories} />
    </div>
  )
}