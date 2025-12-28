"use client"

import { useEffect, useRef, useState } from "react"
import QRCode from "qrcode"

interface QRCodeDisplayProps {
  url: string
  restaurantName: string
  logoUrl?: string | null
  initialLogoBgColor?: string
  onSaveLogoBgColor?: (color: string) => Promise<void>
}

export default function QRCodeDisplay({
  url,
  restaurantName,
  logoUrl,
  initialLogoBgColor = '#FFFFFF',
  onSaveLogoBgColor
}: QRCodeDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [showLogo, setShowLogo] = useState(!!logoUrl)
  const [logoBgColor, setLogoBgColor] = useState(initialLogoBgColor)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (canvasRef.current) {
      // Generate QR code
      QRCode.toCanvas(
        canvasRef.current,
        url,
        {
          width: 400,
          margin: 2,
          color: {
            dark: "#000000",
            light: "#FFFFFF",
          },
          errorCorrectionLevel: 'H', // High error correction for logo overlay
        },
        (error: Error | null | undefined) => {
          if (error) {
            console.error(error)
            return
          }

          // If logo is enabled and exists, overlay it on the QR code
          if (showLogo && logoUrl && canvasRef.current) {
            const canvas = canvasRef.current
            const ctx = canvas.getContext('2d')
            if (!ctx) return

            const img = new Image()
            img.crossOrigin = 'anonymous'
            img.onload = () => {
              // Calculate logo container size (about 20% of QR code size)
              const containerSize = canvas.width * 0.2
              const padding = 8
              
              // Calculate logo dimensions to fit within container while maintaining aspect ratio
              const imgAspect = img.width / img.height
              let logoWidth = containerSize
              let logoHeight = containerSize
              
              if (imgAspect > 1) {
                // Landscape image
                logoHeight = containerSize / imgAspect
              } else {
                // Portrait or square image
                logoWidth = containerSize * imgAspect
              }
              
              // Center the logo
              const x = (canvas.width - logoWidth) / 2
              const y = (canvas.height - logoHeight) / 2

              // Enable image smoothing for better quality
              ctx.imageSmoothingEnabled = true
              ctx.imageSmoothingQuality = 'high'

              // Draw background circle for logo with selected color
              ctx.fillStyle = logoBgColor
              ctx.beginPath()
              ctx.arc(canvas.width / 2, canvas.height / 2, containerSize / 2 + padding, 0, 2 * Math.PI)
              ctx.fill()

              // Draw logo with proper aspect ratio and high quality
              ctx.drawImage(img, x, y, logoWidth, logoHeight)
            }
            img.onerror = () => {
              console.error('Logo yüklenemedi')
            }
            img.src = logoUrl
          }
        }
      )
    }
  }, [url, showLogo, logoUrl, logoBgColor])

  const handleSaveColor = async () => {
    if (onSaveLogoBgColor) {
      setIsSaving(true)
      try {
        await onSaveLogoBgColor(logoBgColor)
        alert('Renk kaydedildi!')
      } catch (error) {
        console.error('Renk kaydedilemedi:', error)
        alert('Renk kaydedilemedi. Lütfen tekrar deneyin.')
      } finally {
        setIsSaving(false)
      }
    }
  }

  return (
    <div className="flex flex-col items-center">
      <div className="bg-white p-8 rounded-lg shadow-inner">
        <canvas ref={canvasRef} className="max-w-full h-auto" />
      </div>
      
      {logoUrl && (
        <div className="mt-4 space-y-3">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="show-logo"
              checked={showLogo}
              onChange={(e) => setShowLogo(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <label htmlFor="show-logo" className="text-sm text-slate-600 cursor-pointer">
              QR kod üzerine logo ekle
            </label>
          </div>
          
          {showLogo && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <label htmlFor="logo-bg-color" className="text-sm text-slate-600">
                  Logo arka plan rengi:
                </label>
                <input
                  type="color"
                  id="logo-bg-color"
                  value={logoBgColor}
                  onChange={(e) => setLogoBgColor(e.target.value)}
                  className="w-10 h-10 rounded border border-slate-300 cursor-pointer"
                />
                <span className="text-xs text-slate-500">{logoBgColor}</span>
              </div>
              
              {onSaveLogoBgColor && logoBgColor !== initialLogoBgColor && (
                <button
                  onClick={handleSaveColor}
                  disabled={isSaving}
                  className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
                >
                  {isSaving ? 'Kaydediliyor...' : 'Rengi Kaydet'}
                </button>
              )}
            </div>
          )}
        </div>
      )}
      
      <p className="mt-2 text-sm text-slate-600 text-center">
        {restaurantName} - QR Menü
      </p>
    </div>
  )
}