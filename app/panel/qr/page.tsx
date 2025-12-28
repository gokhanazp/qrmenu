"use client"

export const dynamic = 'force-dynamic'

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import QRCodeDisplay from "@/components/qr-code-display"
import { getRestaurant } from "@/app/actions/restaurant"
import { createClient } from "@/lib/supabase/client"

export default function QRPage() {
  const router = useRouter()
  const [restaurant, setRestaurant] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>("")

  useEffect(() => {
    async function loadRestaurant() {
      const data = await getRestaurant()
      
      if ('error' in data) {
        setError(data.error || 'Bir hata oluştu')
      } else {
        setRestaurant(data.restaurant)
      }
      setLoading(false)
    }
    
    loadRestaurant()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-600">Yükleniyor...</p>
      </div>
    )
  }

  if (error || !restaurant) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Hata</h1>
          <p className="text-slate-600 mb-4">{error || 'Restoran bulunamadı'}</p>
          <Link href="/panel">
            <Button>Panele Dön</Button>
          </Link>
        </div>
      </div>
    )
  }

  const publicUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/restorant/${restaurant.slug}`

  const handleDownload = () => {
    const canvas = document.querySelector('canvas')
    if (canvas) {
      const link = document.createElement('a')
      link.download = `qr-${restaurant.slug}.png`
      link.href = canvas.toDataURL()
      link.click()
    }
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicUrl)
    alert('Link kopyalandı!')
  }

  const handleSaveLogoBgColor = async (color: string) => {
    const supabase = createClient()
    
    const { error } = await supabase
      .from('restaurants')
      .update({ qr_logo_bg_color: color } as never)
      .eq('id', restaurant.id)
    
    if (error) {
      throw error
    }
    
    // Update local state
    setRestaurant({ ...restaurant, qr_logo_bg_color: color })
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <Link href="/panel" className="text-blue-600 hover:text-blue-700 text-sm">
                ← Panele Dön
              </Link>
              <h1 className="text-2xl font-bold text-slate-900 mt-2">
                QR Kod
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-2">
                {restaurant.name}
              </h2>
              <p className="text-sm text-slate-600">
                Müşterileriniz bu QR kodu okutarak menünüze ulaşabilir
              </p>
            </div>

            {/* QR Code */}
            <QRCodeDisplay
              url={publicUrl}
              restaurantName={restaurant.name}
              logoUrl={restaurant.logo_url}
              initialLogoBgColor={restaurant.qr_logo_bg_color || '#FFFFFF'}
              onSaveLogoBgColor={handleSaveLogoBgColor}
            />

            {/* URL Display */}
            <div className="mt-8 bg-slate-50 rounded-lg p-4">
              <p className="text-sm text-slate-600 mb-2">Menü URL:</p>
              <a
                href={publicUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 font-medium break-all text-sm"
              >
                {publicUrl}
              </a>
            </div>

            {/* Actions */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Button className="flex-1" onClick={handleDownload}>
                QR Kodu İndir (PNG)
              </Button>
              <Button variant="outline" className="flex-1" onClick={handleCopyLink}>
                Linki Kopyala
              </Button>
            </div>

            {/* Instructions */}
            <div className="mt-8 border-t border-slate-200 pt-8">
              <h3 className="font-semibold text-slate-900 mb-4">
                Nasıl Kullanılır?
              </h3>
              <ol className="space-y-3 text-sm text-slate-600">
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold">
                    1
                  </span>
                  <span>QR kodu indirin veya ekran görüntüsü alın</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold">
                    2
                  </span>
                  <span>QR kodu masalarınıza, vitrininize veya menülerinize yerleştirin</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold">
                    3
                  </span>
                  <span>Müşterileriniz telefonlarıyla QR kodu okutarak menünüze ulaşsın</span>
                </li>
              </ol>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}