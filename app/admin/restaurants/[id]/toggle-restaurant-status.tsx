'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateRestaurantStatus } from '@/app/actions/admin'

interface ToggleRestaurantStatusProps {
  restaurantId: string
  currentStatus: boolean
}

export function ToggleRestaurantStatus({
  restaurantId,
  currentStatus
}: ToggleRestaurantStatusProps) {
  const router = useRouter()
  const [updating, setUpdating] = useState(false)

  async function handleToggle() {
    setUpdating(true)
    try {
      const result = await updateRestaurantStatus(restaurantId, !currentStatus)
      if (result.success) {
        router.refresh()
      } else {
        alert('Hata: ' + result.error)
      }
    } catch (err) {
      alert('Bir hata oluştu')
    } finally {
      setUpdating(false)
    }
  }

  return (
    <button
      onClick={handleToggle}
      disabled={updating}
      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
        currentStatus
          ? 'bg-green-100 text-green-800 hover:bg-green-200'
          : 'bg-red-100 text-red-800 hover:bg-red-200'
      } ${updating ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {updating ? 'Güncelleniyor...' : currentStatus ? 'Aktif' : 'Pasif'}
    </button>
  )
}