import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-slate-200">404</h1>
          <div className="text-6xl mb-4">🔍</div>
        </div>
        
        <h2 className="text-3xl font-bold text-slate-900 mb-4">
          Sayfa Bulunamadı
        </h2>
        
        <p className="text-slate-600 mb-8">
          Aradığınız sayfa mevcut değil veya taşınmış olabilir.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/">
            <Button>Ana Sayfaya Dön</Button>
          </Link>
          <Link href="/auth/login">
            <Button variant="outline">Giriş Yap</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}