import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="relative min-h-screen bg-[#0a0a0a] flex items-center justify-center overflow-hidden">
      {/* Avant-garde Ambient Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-tr from-violet-600/10 via-fuchsia-600/5 to-transparent rounded-full blur-[150px] animate-pulse" 
          style={{ animationDuration: '4s' }} 
        />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-[120px] mix-blend-screen" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-pink-600/10 rounded-full blur-[150px] mix-blend-screen" />
      </div>

      <div className="relative z-10 w-full max-w-3xl px-6 flex flex-col items-center justify-center text-center mt-[-5%]">
        {/* Animated Object / Icon */}
        <div className="relative mb-10 group">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-full blur-2xl opacity-40 group-hover:opacity-70 transition-opacity duration-700" />
          <div className="relative w-32 h-32 bg-[#0f0f1a] border border-white/10 rounded-full flex items-center justify-center shadow-2xl overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
             <span className="material-symbols-outlined text-5xl text-white/80" style={{ animation: 'bounce 3s infinite' }}>
                restaurant_menu
             </span>
          </div>
        </div>
        
        {/* Typography */}
        <div className="space-y-6 mb-12">
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-5 py-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-sm font-medium tracking-widest text-white/80 uppercase">Hazırlanıyor</span>
          </div>
          <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight">
            <span className="text-white">Çok</span><br />
            <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-orange-400 bg-clip-text text-transparent">
              Yakında
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-400 max-w-xl mx-auto font-light leading-relaxed">
            Bu mekanın dijital menüsü şu anda büyük bir özenle tasarlanıyor. Eşsiz bir deneyim için lütfen daha sonra tekrar ziyaret edin.
          </p>
        </div>
        
        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-5 justify-center w-full sm:w-auto">
          <Link href="/">
            <Button size="lg" className="h-14 px-8 text-base bg-white text-black hover:bg-gray-200 hover:text-black rounded-full font-semibold transition-all hover:scale-105 w-full sm:w-auto">
              <span className="material-symbols-outlined mr-2 text-lg">arrow_back</span>
              Ana Sayfaya Dön
            </Button>
          </Link>
          <Link href="/auth/login">
            <Button size="lg" variant="outline" className="h-14 px-8 text-base border-white/20 bg-white/5 text-white hover:bg-white/15 hover:text-white rounded-full font-semibold backdrop-blur-md transition-all w-full sm:w-auto">
              <span className="material-symbols-outlined mr-2 text-lg">login</span>
              Yönetici Girişi
            </Button>
          </Link>
        </div>
        
        {/* Aesthetic Lines */}
        <div className="mt-24 flex items-center justify-center gap-4 opacity-40">
          <div className="w-16 h-px bg-gradient-to-r from-transparent to-white/40" />
          <div className="w-1.5 h-1.5 rounded-full bg-white/40" />
          <div className="w-16 h-px bg-gradient-to-l from-transparent to-white/40" />
        </div>
      </div>
      
      {/* Noise Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.02] pointer-events-none" 
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }} 
      />
    </div>
  )
}