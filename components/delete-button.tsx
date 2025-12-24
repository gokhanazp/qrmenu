'use client'

import { deleteCategory } from '@/app/actions/category'
import { deleteProduct } from '@/app/actions/product'
import { useState } from 'react'

interface DeleteButtonProps {
  categoryId?: string
  productId?: string
}

export function DeleteButton({ categoryId, productId }: DeleteButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    const itemType = categoryId ? 'kategori' : 'ürün'
    if (!confirm(`Bu ${itemType}yi silmek istediğinizden emin misiniz?`)) {
      return
    }

    setIsDeleting(true)
    
    const result = categoryId
      ? await deleteCategory(categoryId)
      : await deleteProduct(productId!)
    
    if (result.error) {
      alert('Hata: ' + result.error)
      setIsDeleting(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="text-red-600 hover:text-red-900 disabled:opacity-50"
    >
      {isDeleting ? 'Siliniyor...' : 'Sil'}
    </button>
  )
}