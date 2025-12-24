"use client"

import { useEffect, useRef } from "react"
import QRCode from "qrcode"

interface QRCodeDisplayProps {
  url: string
  restaurantName: string
}

export default function QRCodeDisplay({ url, restaurantName }: QRCodeDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (canvasRef.current) {
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
        },
        (error: Error | null | undefined) => {
          if (error) console.error(error)
        }
      )
    }
  }, [url])

  return (
    <div className="flex flex-col items-center">
      <div className="bg-white p-8 rounded-lg shadow-inner">
        <canvas ref={canvasRef} className="max-w-full h-auto" />
      </div>
      <p className="mt-4 text-sm text-slate-600 text-center">
        {restaurantName} - QR Menü
      </p>
    </div>
  )
}