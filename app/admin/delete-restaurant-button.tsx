'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { deleteRestaurant } from '@/app/actions/admin'

interface DeleteRestaurantButtonProps {
  restaurantId: string
  restaurantName: string
  variant?: 'icon' | 'full'
}

export default function DeleteRestaurantButton({ 
  restaurantId, 
  restaurantName,
  variant = 'icon'
}: DeleteRestaurantButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `"${restaurantName}" restoranını silmek istediğinize emin misiniz?\n\nBu işlem geri alınamaz. Restorana ait tüm veriler (kategoriler, ürünler, tarama verileri) kalıcı olarak silinecektir.`
    )

    if (!confirmed) return

    setIsDeleting(true)

    try {
      const result = await deleteRestaurant(restaurantId)

      if (result.success) {
        router.refresh()
      } else {
        alert(`Silme hatası: ${result.error}`)
      }
    } catch (error) {
      alert('Beklenmeyen bir hata oluştu.')
    } finally {
      setIsDeleting(false)
    }
  }

  if (variant === 'full') {
    return (
      <button
        onClick={handleDelete}
        disabled={isDeleting}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-sm"
      >
        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
          {isDeleting ? 'hourglass_top' : 'delete'}
        </span>
        {isDeleting ? 'Siliniyor...' : 'Sil'}
      </button>
    )
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      title={`"${restaurantName}" restoranını sil`}
      className="inline-flex items-center justify-center w-8 h-8 text-red-500 hover:text-white hover:bg-red-500 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
        {isDeleting ? 'hourglass_top' : 'delete'}
      </span>
    </button>
  )
}
