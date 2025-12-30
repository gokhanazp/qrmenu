'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { impersonateRestaurant } from '@/app/actions/admin'

interface ImpersonateButtonProps {
  restaurantId: string
  restaurantName: string
}

export function ImpersonateButton({ restaurantId, restaurantName }: ImpersonateButtonProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleImpersonate = async () => {
    if (!confirm(`"${restaurantName}" restoranının paneline giriş yapmak istediğinizden emin misiniz?`)) {
      return
    }

    setIsLoading(true)
    try {
      const result = await impersonateRestaurant(restaurantId)
      if (result.success && result.redirectUrl) {
        router.push(result.redirectUrl)
      } else {
        alert(result.error || 'Bir hata oluştu')
      }
    } catch (error) {
      alert('Beklenmeyen bir hata oluştu')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      onClick={handleImpersonate}
      disabled={isLoading}
      className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
    >
      {isLoading ? (
        <>
          <span className="material-symbols-outlined animate-spin mr-2" style={{ fontSize: '20px' }}>sync</span>
          Giriş Yapılıyor...
        </>
      ) : (
        <>
          <span className="material-symbols-outlined mr-2" style={{ fontSize: '20px' }}>login</span>
          Panele Giriş Yap
        </>
      )}
    </Button>
  )
}