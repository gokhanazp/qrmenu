'use client'

import { deleteCategory } from '@/app/actions/category'
import { deleteProduct } from '@/app/actions/product'
import { useState } from 'react'
import { useLocale } from '@/lib/i18n/use-locale'

interface DeleteButtonProps {
  categoryId?: string
  productId?: string
}

export function DeleteButton({ categoryId, productId }: DeleteButtonProps) {
  const { t } = useLocale()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    const confirmMessage = categoryId
      ? t.panel.categories.deleteConfirm
      : t.panel.products.deleteConfirm
    
    if (!confirm(confirmMessage)) {
      return
    }

    setIsDeleting(true)
    
    const result = categoryId
      ? await deleteCategory(categoryId)
      : await deleteProduct(productId!)
    
    if (result.error) {
      alert(t.common.error + ': ' + result.error)
      setIsDeleting(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="text-red-600 hover:text-red-900 disabled:opacity-50"
    >
      {isDeleting ? t.common.loading : t.common.delete}
    </button>
  )
}