'use client'

import { useEffect, useRef } from 'react'
import { trackScanEvent } from '@/app/actions/public'

export function ScanTracker({ restaurantId }: { restaurantId: string }) {
  const trackedRef = useRef(false)

  useEffect(() => {
    // Prevent double tracking in React Strict Mode during development
    if (trackedRef.current) return
    trackedRef.current = true

    const track = async () => {
      try {
        await trackScanEvent(
          restaurantId,
          window.navigator.userAgent,
          document.referrer
        )
      } catch (err) {
        console.error('Background tracking failed:', err)
      }
    }
    
    track()
  }, [restaurantId])

  return null
}
