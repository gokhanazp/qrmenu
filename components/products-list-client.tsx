'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { DeleteButton } from '@/components/delete-button'
import { formatCurrency } from '@/lib/utils/currency'
import { updateProduct } from '@/app/actions/product'

interface Category {
  id: string
  name: string
}

interface Product {
  id: string
  name: string
  description?: string
  price: number
  image_url?: string
  is_active: boolean
  is_featured: boolean
  is_daily_special: boolean
  category_id: string
  categories?: {
    name: string
  }
}

interface ProductsListClientProps {
  products: Product[]
  categories: Category[]
}

function InlinePrice({ product }: { product: Product }) {
  const [isEditing, setIsEditing] = useState(false)
  const [price, setPrice] = useState(product.price.toString())
  const [isPending, startTransition] = useTransition()

  const handleSave = () => {
    const newPrice = parseFloat(price)
    if (isNaN(newPrice) || newPrice < 0) {
      setPrice(product.price.toString())
      setIsEditing(false)
      return
    }

    startTransition(async () => {
      const result = await updateProduct(product.id, { price: newPrice })
      if (result.error) {
        setPrice(product.price.toString())
        alert('Fiyat güncellenirken hata oluştu: ' + result.error)
      }
      setIsEditing(false)
    })
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave()
    } else if (e.key === 'Escape') {
      setPrice(product.price.toString())
      setIsEditing(false)
    }
  }

  if (isEditing) {
    return (
      <div className="flex items-center gap-1">
        <span className="text-orange-600 font-bold">₺</span>
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          onFocus={(e) => e.target.select()}
          className="w-24 px-2 py-1 text-lg font-bold text-orange-600 border border-orange-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
          autoFocus
          disabled={isPending}
          step="0.01"
          min="0"
        />
        {isPending && (
          <span className="material-symbols-outlined text-orange-500 animate-spin text-sm">sync</span>
        )}
      </div>
    )
  }

  return (
    <button
      onClick={() => setIsEditing(true)}
      className="text-xl font-bold text-orange-600 whitespace-nowrap hover:bg-orange-50 px-2 py-1 rounded transition-colors group flex items-center gap-1"
      title="Fiyatı düzenlemek için tıklayın"
    >
      {formatCurrency(product.price)}
      <span className="material-symbols-outlined text-sm opacity-0 group-hover:opacity-50 transition-opacity">edit</span>
    </button>
  )
}

export function ProductsListClient({ products, categories }: ProductsListClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const filteredProducts = selectedCategory === 'all'
    ? products
    : products.filter(product => product.category_id === selectedCategory)

  return (
    <div>
      {/* Category Tabs */}
      <div className="bg-white border-b sticky top-[73px] z-10">
        <div className="container mx-auto px-4">
          <div className="flex gap-2 py-3 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                selectedCategory === 'all'
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Tümü ({products.length})
            </button>
            {categories.map((category) => {
              const count = products.filter(p => p.category_id === category.id).length
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                    selectedCategory === category.id
                      ? 'bg-orange-500 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category.name} ({count})
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Products List */}
      <div className="container mx-auto px-4 py-6">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-gray-300">
            <span className="material-symbols-outlined text-8xl text-gray-300 mb-4">restaurant_menu</span>
            <h3 className="text-2xl font-bold mb-2 text-gray-900">
              {selectedCategory === 'all' ? 'Henüz ürün yok' : 'Bu kategoride ürün yok'}
            </h3>
            <p className="text-gray-600 mb-6">
              {selectedCategory === 'all' ? 'İlk ürününüzü oluşturarak başlayın' : 'Bu kategoriye ürün ekleyin'}
            </p>
            <Link href="/panel/products/new">
              <Button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700">
                <span className="material-symbols-outlined mr-2">add</span>
                Ürün Ekle
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredProducts.map((product) => (
              <div key={product.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all">
                <div className="flex gap-4 p-4">
                  {/* Product Image */}
                  <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                    {product.image_url ? (
                      <Image
                        src={product.image_url}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="material-symbols-outlined text-4xl text-gray-400">restaurant_menu</span>
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg text-gray-900 truncate">{product.name}</h3>
                        {product.description && (
                          <p className="text-sm text-gray-600 line-clamp-2 mt-1">{product.description}</p>
                        )}
                      </div>
                      <InlinePrice product={product} />
                    </div>

                    {/* Category and Badges */}
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      {product.categories?.name && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-700">
                          <span className="material-symbols-outlined text-sm">category</span>
                          {product.categories.name}
                        </span>
                      )}
                      {product.is_featured && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-yellow-100 text-yellow-800">
                          <span className="material-symbols-outlined text-sm">star</span>
                          Öne Çıkan
                        </span>
                      )}
                      {product.is_daily_special && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-orange-100 text-orange-800">
                          <span className="material-symbols-outlined text-sm">today</span>
                          Günün Menüsü
                        </span>
                      )}
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold ${
                        product.is_active
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        <span className="material-symbols-outlined text-sm">
                          {product.is_active ? 'check_circle' : 'cancel'}
                        </span>
                        {product.is_active ? 'Aktif' : 'Pasif'}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Link href={`/panel/products/${product.id}/edit`}>
                        <Button variant="outline" size="sm" className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100">
                          <span className="material-symbols-outlined text-lg mr-1">edit</span>
                          Düzenle
                        </Button>
                      </Link>
                      <DeleteButton productId={product.id} />
                    </div>
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