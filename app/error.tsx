'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="mb-8">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            Bir Hata Oluştu
          </h1>
        </div>
        
        <p className="text-slate-600 mb-2">
          Üzgünüz, bir şeyler ters gitti.
        </p>
        
        {error.message && (
          <p className="text-sm text-slate-500 mb-8 font-mono bg-slate-100 p-3 rounded">
            {error.message}
          </p>
        )}
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={reset}>
            Tekrar Dene
          </Button>
          <Link href="/">
            <Button variant="outline">Ana Sayfaya Dön</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}