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
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      // Generate QR code data
      QRCode.toDataURL(url, {
        errorCorrectionLevel: 'H',
        margin: 0,
        width: 1000,
      }).then(() => {
        // Get QR code matrix
        const qr = QRCode.create(url, { errorCorrectionLevel: 'H' })
        const modules = qr.modules
        const moduleCount = modules.size
        
        // Canvas settings
        const size = 400
        const margin = 20
        const availableSize = size - margin * 2
        const moduleSize = availableSize / moduleCount
        const dotRadius = moduleSize * 0.4 // Dot radius for rounded look
        
        canvas.width = size
        canvas.height = size
        
        // Clear canvas with white background
        ctx.fillStyle = '#FFFFFF'
        ctx.fillRect(0, 0, size, size)
        
        // Calculate center area for logo (approximately 25% of QR code)
        const centerAreaSize = moduleCount * 0.28
        const centerStart = Math.floor((moduleCount - centerAreaSize) / 2)
        const centerEnd = Math.ceil((moduleCount + centerAreaSize) / 2)
        
        // Draw QR code with dots style
        ctx.fillStyle = '#000000'
        
        for (let row = 0; row < moduleCount; row++) {
          for (let col = 0; col < moduleCount; col++) {
            if (modules.get(row, col)) {
              const x = margin + col * moduleSize + moduleSize / 2
              const y = margin + row * moduleSize + moduleSize / 2
              
              // Check if this is a finder pattern (corner squares)
              const isFinderPattern =
                (row < 7 && col < 7) || // Top-left
                (row < 7 && col >= moduleCount - 7) || // Top-right
                (row >= moduleCount - 7 && col < 7) // Bottom-left
              
              // Skip center area for logo
              const isInCenterArea =
                row >= centerStart && row < centerEnd &&
                col >= centerStart && col < centerEnd
              
              if (isInCenterArea && showLogo && logoUrl) {
                continue // Skip drawing in center area
              }
              
              if (isFinderPattern) {
                // Draw finder patterns with special style (squares with rounded corners)
                drawFinderPattern(ctx, row, col, moduleCount, margin, moduleSize)
              } else {
                // Draw regular modules as dots
                ctx.beginPath()
                ctx.arc(x, y, dotRadius, 0, Math.PI * 2)
                ctx.fill()
              }
            }
          }
        }
        
        // Draw logo if enabled
        if (showLogo && logoUrl) {
          const img = new Image()
          img.crossOrigin = 'anonymous'
          img.onload = () => {
            const centerX = size / 2
            const centerY = size / 2
            
            // Logo oranını hesapla
            const imgAspect = img.width / img.height
            
            // Container boyutlarını logo oranına göre dinamik ayarla
            const maxContainerWidth = availableSize * 0.32  // Maksimum genişlik
            const maxContainerHeight = availableSize * 0.20 // Maksimum yükseklik
            const padding = 12 // Logo etrafındaki boşluk
            
            let containerWidth: number
            let containerHeight: number
            let logoWidth: number
            let logoHeight: number
            
            if (imgAspect > 1.5) {
              // Yatay logo (geniş)
              containerWidth = maxContainerWidth
              logoWidth = containerWidth - padding * 2
              logoHeight = logoWidth / imgAspect
              containerHeight = logoHeight + padding * 2
            } else if (imgAspect < 0.7) {
              // Dikey logo (uzun)
              containerHeight = maxContainerHeight * 1.3
              logoHeight = containerHeight - padding * 2
              logoWidth = logoHeight * imgAspect
              containerWidth = logoWidth + padding * 2
            } else {
              // Kare veya kareye yakın logo
              const baseSize = availableSize * 0.22
              if (imgAspect > 1) {
                containerWidth = baseSize
                logoWidth = containerWidth - padding * 2
                logoHeight = logoWidth / imgAspect
                containerHeight = logoHeight + padding * 2
              } else {
                containerHeight = baseSize
                logoHeight = containerHeight - padding * 2
                logoWidth = logoHeight * imgAspect
                containerWidth = logoWidth + padding * 2
              }
            }
            
            // Container pozisyonu (merkez)
            const containerX = centerX - containerWidth / 2
            const containerY = centerY - containerHeight / 2
            
            // Yumuşak gölge efekti
            ctx.save()
            ctx.shadowColor = 'rgba(0, 0, 0, 0.12)'
            ctx.shadowBlur = 8
            ctx.shadowOffsetX = 0
            ctx.shadowOffsetY = 2
            
            // Yuvarlatılmış köşeli beyaz arka plan
            const borderRadius = Math.min(containerWidth, containerHeight) * 0.12
            ctx.fillStyle = logoBgColor
            ctx.beginPath()
            ctx.roundRect(containerX, containerY, containerWidth, containerHeight, borderRadius)
            ctx.fill()
            
            ctx.restore()
            
            // İnce çerçeve
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.06)'
            ctx.lineWidth = 1
            ctx.beginPath()
            ctx.roundRect(containerX, containerY, containerWidth, containerHeight, borderRadius)
            ctx.stroke()
            
            // Logo'yu merkeze çiz
            const logoX = centerX - logoWidth / 2
            const logoY = centerY - logoHeight / 2
            
            ctx.drawImage(img, logoX, logoY, logoWidth, logoHeight)
          }
          img.onerror = () => {
            console.error('Logo yüklenemedi')
          }
          img.src = logoUrl
        }
      }).catch(console.error)
    }
  }, [url, showLogo, logoUrl, logoBgColor])

  // Draw finder pattern (the three corner squares)
  function drawFinderPattern(
    ctx: CanvasRenderingContext2D,
    row: number,
    col: number,
    moduleCount: number,
    margin: number,
    moduleSize: number
  ) {
    // Determine which finder pattern this belongs to
    let patternRow = 0
    let patternCol = 0
    
    if (row < 7 && col < 7) {
      // Top-left
      patternRow = row
      patternCol = col
    } else if (row < 7 && col >= moduleCount - 7) {
      // Top-right
      patternRow = row
      patternCol = col - (moduleCount - 7)
    } else if (row >= moduleCount - 7 && col < 7) {
      // Bottom-left
      patternRow = row - (moduleCount - 7)
      patternCol = col
    }
    
    const x = margin + col * moduleSize
    const y = margin + row * moduleSize
    
    // Outer ring (positions 0 and 6)
    if (patternRow === 0 || patternRow === 6 || patternCol === 0 || patternCol === 6) {
      // Draw as rounded rectangle for outer edge
      const radius = moduleSize * 0.3
      ctx.beginPath()
      ctx.roundRect(x, y, moduleSize, moduleSize, radius)
      ctx.fill()
    }
    // Inner square (positions 2-4)
    else if (patternRow >= 2 && patternRow <= 4 && patternCol >= 2 && patternCol <= 4) {
      const radius = moduleSize * 0.3
      ctx.beginPath()
      ctx.roundRect(x, y, moduleSize, moduleSize, radius)
      ctx.fill()
    }
  }

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