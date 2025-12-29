'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { LocaleProvider } from '@/lib/i18n/use-locale'
import { LanguageSwitcher } from '@/components/language-switcher'
import { useState, useEffect, useRef } from 'react'

function HamburgerMenu({ isOpen, onClick }: { isOpen: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex flex-col justify-center items-center w-8 h-8 gap-1.5">
      <span className={`block w-6 h-0.5 bg-white transition-all ${isOpen ? 'rotate-45 translate-y-2' : ''}`} />
      <span className={`block w-6 h-0.5 bg-white transition-all ${isOpen ? 'opacity-0' : ''}`} />
      <span className={`block w-6 h-0.5 bg-white transition-all ${isOpen ? '-rotate-45 -translate-y-2' : ''}`} />
    </button>
  )
}

function MobileMenu({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 z-40 bg-[#0a0a0a]/98 backdrop-blur-xl flex flex-col items-center justify-center gap-8">
      <nav className="flex flex-col items-center gap-6 text-2xl">
        <Link href="#features" onClick={onClose} className="text-white/80 hover:text-white">Özellikler</Link>
        <Link href="#pricing" onClick={onClose} className="text-white/80 hover:text-white">Fiyatlandırma</Link>
        <Link href="/auth/login" onClick={onClose} className="text-white/80 hover:text-white">Giriş Yap</Link>
      </nav>
      <Link href="/auth/register" onClick={onClose}>
        <Button size="lg" className="bg-gradient-to-r from-violet-600 to-fuchsia-600 border-0">Ücretsiz Başla</Button>
      </Link>
    </div>
  )
}

function InteractiveGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mouseRef = useRef({ x: 0, y: 0 })
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight }
    resize()
    window.addEventListener('resize', resize)
    window.addEventListener('mousemove', (e) => { mouseRef.current = { x: e.clientX, y: e.clientY } })
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const { x: mx, y: my } = mouseRef.current
      for (let x = 0; x <= canvas.width; x += 60) {
        ctx.beginPath()
        for (let y = 0; y <= canvas.height; y += 5) {
          const d = Math.sqrt((x-mx)**2 + (y-my)**2)
          const ox = d < 120 && d > 0 ? ((x-mx)/d) * (1-d/120) * 12 : 0
          y === 0 ? ctx.moveTo(x+ox, y) : ctx.lineTo(x+ox, y)
        }
        ctx.strokeStyle = 'rgba(139,92,246,0.08)'
        ctx.stroke()
      }
      for (let y = 0; y <= canvas.height; y += 60) {
        ctx.beginPath()
        for (let x = 0; x <= canvas.width; x += 5) {
          const d = Math.sqrt((x-mx)**2 + (y-my)**2)
          const oy = d < 120 && d > 0 ? ((y-my)/d) * (1-d/120) * 12 : 0
          x === 0 ? ctx.moveTo(x, y+oy) : ctx.lineTo(x, y+oy)
        }
        ctx.strokeStyle = 'rgba(217,70,239,0.08)'
        ctx.stroke()
      }
      requestAnimationFrame(animate)
    }
    animate()
  }, [])
  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />
}

function PhoneMockup() {
  return (
    <div className="relative">
      <div className="absolute -top-8 -left-8 w-20 h-20 bg-gradient-to-br from-violet-500/30 to-fuchsia-500/30 rounded-2xl blur-xl animate-pulse" />
      <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-gradient-to-br from-cyan-500/30 to-blue-500/30 rounded-full blur-xl animate-pulse" />
      <div className="relative w-[300px] h-[600px] bg-gradient-to-b from-gray-800 to-gray-900 rounded-[3rem] p-3 shadow-2xl shadow-violet-500/20 transform rotate-3 hover:rotate-0 transition-transform duration-500">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-5 bg-black rounded-b-xl z-10" />
        <div className="w-full h-full bg-[#0a0a0a] rounded-[2.5rem] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-violet-900/20 to-fuchsia-900/20" />
          <div className="p-4 h-full flex flex-col relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-lg flex items-center justify-center">
                  <span className="material-symbols-outlined text-white text-sm">restaurant_menu</span>
                </div>
                <span className="text-sm font-bold text-white">Cebi Döner</span>
              </div>
              <span className="material-symbols-outlined text-white/60 text-lg">search</span>
            </div>
            <div className="flex gap-2 mb-4">
              <div className="px-3 py-1 bg-violet-500 rounded-full text-xs text-white">Tümü</div>
              <div className="px-3 py-1 bg-white/10 rounded-full text-xs text-white/70">Ana Yemek</div>
              <div className="px-3 py-1 bg-white/10 rounded-full text-xs text-white/70">İçecek</div>
            </div>
            <div className="space-y-3 flex-1">
              <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                <div className="flex gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg flex items-center justify-center text-lg">🍖</div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-white">Özel Döner</h4>
                    <p className="text-xs text-gray-400">Lezzetli döner</p>
                    <div className="text-sm font-bold text-violet-400 mt-1">₺85</div>
                  </div>
                </div>
              </div>
              <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                <div className="flex gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center text-lg">🍟</div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-white">Patates</h4>
                    <p className="text-xs text-gray-400">Çıtır patates</p>
                    <div className="text-sm font-bold text-violet-400 mt-1">₺35</div>
                  </div>
                </div>
              </div>
              <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                <div className="flex gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-400 to-pink-500 rounded-lg flex items-center justify-center text-lg">🥤</div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-white">İçecek</h4>
                    <p className="text-xs text-gray-400">Soğuk içecek</p>
                    <div className="text-sm font-bold text-violet-400 mt-1">₺25</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-around py-3 border-t border-white/10 mt-auto">
              <span className="material-symbols-outlined text-violet-400">home</span>
              <span className="material-symbols-outlined text-white/40">search</span>
              <span className="material-symbols-outlined text-white/40">favorite</span>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute -bottom-4 -left-8 w-20 h-20 bg-white rounded-xl p-2 shadow-2xl shadow-black/50 transform -rotate-12 hover:rotate-0 transition-transform">
        <div className="w-full h-full bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-lg flex items-center justify-center">
          <span className="material-symbols-outlined text-white text-3xl">qr_code_2</span>
        </div>
      </div>
    </div>
  )
}

export default function HomePage() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', h)
    return () => window.removeEventListener('scroll', h)
  }, [])

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') { setMenuOpen(false); setSearchOpen(false) } }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [])

  const showcaseItems = [
    { name: 'Cebi Döner', url: 'https://qrmenu-smoky.vercel.app/restorant/cebi-doner' },
    { name: 'Lezzet Durağı', url: '#' },
    { name: 'Pizza House', url: '#' },
    { name: 'Sushi Master', url: '#' },
    { name: 'Cafe Mocha', url: '#' },
  ]

  const features = [
    { icon: 'qr_code_2', title: 'QR Menü', desc: 'Müşterileriniz QR kodu tarayarak menünüze ulaşsın.', color: 'bg-violet-500' },
    { icon: 'edit_note', title: 'Kolay Yönetim', desc: 'Menünüzü kolayca güncelleyin.', color: 'bg-cyan-500' },
    { icon: 'trending_up', title: 'İstatistikler', desc: 'Görüntüleme istatistiklerini takip edin.', color: 'bg-emerald-500' },
    { icon: 'palette', title: 'Özelleştirme', desc: 'Markanıza uygun renkler.', color: 'bg-orange-500' },
    { icon: 'smartphone', title: 'Mobil Uyumlu', desc: 'Tüm cihazlarda mükemmel görünüm.', color: 'bg-pink-500' },
    { icon: 'translate', title: 'Çoklu Dil', desc: 'Türkçe ve İngilizce dil desteği.', color: 'bg-blue-500' },
  ]

  return (
    <LocaleProvider>
      <div className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden">
        <MobileMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
        
        {searchOpen && (
          <div className="fixed inset-0 z-40 bg-[#0a0a0a]/95 backdrop-blur-xl flex items-start justify-center pt-32" onClick={() => setSearchOpen(false)}>
            <div className="w-full max-w-2xl mx-4" onClick={(e) => e.stopPropagation()}>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-white/40">search</span>
                <input type="text" placeholder="Ara..." className="w-full bg-white/10 border border-white/20 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-white/40 focus:outline-none focus:border-violet-500" autoFocus />
              </div>
            </div>
          </div>
        )}
        
        <header className={`fixed top-0 left-0 right-0 z-50 transition-all ${scrolled ? 'bg-[#0a0a0a]/95 backdrop-blur-lg' : 'bg-transparent'}`}>
          <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-20">
            <div className="flex items-center gap-4">
              <HamburgerMenu isOpen={menuOpen} onClick={() => setMenuOpen(!menuOpen)} />
              <Link href="/" className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-xl flex items-center justify-center">
                  <span className="material-symbols-outlined text-white">restaurant_menu</span>
                </div>
                <span className="font-bold text-xl hidden sm:block">QR Menü</span>
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <button onClick={() => setSearchOpen(true)} className="w-10 h-10 flex items-center justify-center hover:bg-white/10 rounded-full">
                <span className="material-symbols-outlined text-white">search</span>
              </button>
              <div className="hidden sm:block"><LanguageSwitcher /></div>
              <Link href="/auth/register" className="hidden sm:block">
                <Button size="sm" className="bg-gradient-to-r from-violet-600 to-fuchsia-600 border-0 px-6">Başla</Button>
              </Link>
            </div>
          </div>
        </header>

        <section className="relative min-h-screen flex flex-col pt-20 overflow-hidden">
          <InteractiveGrid />
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-[120px]" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-fuchsia-600/20 rounded-full blur-[120px]" />
          </div>
          
          <div className="relative z-10 flex-1 flex items-center">
            <div className="max-w-7xl mx-auto px-4 w-full">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div className="text-center lg:text-left">
                  <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2 mb-8">
                    <span className="material-symbols-outlined text-violet-400 text-sm">restaurant</span>
                    <span className="text-sm text-white/80">Dijital Menü Sistemi</span>
                  </div>
                  
                  <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
                    <span className="text-white">Menünüzü</span><br />
                    <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-orange-400 bg-clip-text text-transparent">Dijitale</span><br />
                    <span className="text-white">Taşıyın</span>
                  </h1>
                  
                  <p className="text-xl sm:text-2xl text-gray-400 mb-10 max-w-xl lg:mx-0 mx-auto">QR kod ile müşterilerinize modern bir menü deneyimi sunun.</p>
                  
                  <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12">
                    <Link href="/auth/register">
                      <Button size="lg" className="text-lg px-10 py-6 bg-gradient-to-r from-violet-600 to-fuchsia-600 border-0 w-full sm:w-auto">Ücretsiz Başla</Button>
                    </Link>
                    <Link href="#features">
                      <Button size="lg" variant="outline" className="text-lg px-10 py-6 border-white/30 bg-white/5 hover:bg-white/15 w-full sm:w-auto text-white">Keşfet</Button>
                    </Link>
                  </div>
                  
                  <div className="flex items-center justify-center lg:justify-start gap-8 sm:gap-12 flex-wrap">
                    <div className="text-center"><div className="text-3xl font-bold">500+</div><div className="text-sm text-gray-400">Restoran</div></div>
                    <div className="w-px h-12 bg-white/20 hidden sm:block" />
                    <div className="text-center"><div className="text-3xl font-bold">50K+</div><div className="text-sm text-gray-400">Görüntüleme</div></div>
                    <div className="w-px h-12 bg-white/20 hidden sm:block" />
                    <div className="text-center"><div className="text-3xl font-bold">4.9</div><div className="text-sm text-gray-400">Puan</div></div>
                  </div>
                </div>
                
                <div className="hidden lg:flex justify-center items-center">
                  <PhoneMockup />
                </div>
              </div>
            </div>
          </div>
          
          <div className="relative z-10 w-full mt-16 pb-8">
            <div className="text-center mb-8">
              <h3 className="text-xl font-semibold text-white/80 mb-2">Müşterilerimizin Menüleri</h3>
              <p className="text-gray-400 text-sm">Gerçek restoranlardan örnekler</p>
            </div>
            <div className="overflow-hidden">
              <div className="flex gap-6" style={{ animation: 'marquee 30s linear infinite' }}>
                {[...showcaseItems, ...showcaseItems, ...showcaseItems].map((item, i) => (
                  <a key={i} href={item.url} target="_blank" rel="noopener noreferrer" className="flex-shrink-0 group cursor-pointer">
                    <div className="relative w-[200px] h-[360px] bg-gradient-to-b from-gray-800 to-gray-900 rounded-[2rem] p-2 shadow-xl group-hover:shadow-violet-500/30 transition-all duration-300 group-hover:scale-105">
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-4 bg-black rounded-b-xl z-10" />
                      <div className="w-full h-full bg-[#0a0a0a] rounded-[1.5rem] overflow-hidden flex items-center justify-center">
                        <span className="material-symbols-outlined text-violet-400 text-4xl">restaurant_menu</span>
                      </div>
                    </div>
                    <p className="text-center text-white/60 text-sm mt-3 group-hover:text-violet-400 transition-colors">{item.name}</p>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-[#0f0f1a] to-[#0a0a0a]" />
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-violet-600/10 rounded-full blur-[150px]" />
          </div>
          
          <div className="relative z-10 max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 rounded-full px-4 py-2 mb-6">
                <span className="material-symbols-outlined text-violet-400 text-sm">auto_awesome</span>
                <span className="text-sm text-violet-300">ÖZELLİKLER</span>
              </div>
              <h2 className="text-4xl sm:text-5xl font-bold mb-4">Neden <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">QR Menü</span>?</h2>
              <p className="text-gray-400 max-w-2xl mx-auto text-lg">Modern restoranlar için tasarlanmış güçlü özellikler.</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((f, i) => (
                <div key={i} className="group relative bg-gradient-to-br from-white/[0.08] to-white/[0.02] p-8 rounded-3xl border border-white/10 hover:border-violet-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-violet-500/10 hover:-translate-y-1">
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-violet-500/0 to-fuchsia-500/0 group-hover:from-violet-500/5 group-hover:to-fuchsia-500/5 transition-all duration-300" />
                  <div className="relative z-10">
                    <div className={`w-16 h-16 ${f.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg`}>
                      <span className="material-symbols-outlined text-white text-3xl">{f.icon}</span>
                    </div>
                    <h3 className="text-xl font-bold mb-3 group-hover:text-violet-300 transition-colors">{f.title}</h3>
                    <p className="text-gray-400 leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="how-it-works" className="py-24 bg-[#0a0a0a]">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <span className="text-fuchsia-400 font-medium mb-4 block">NASIL ÇALIŞIR</span>
              <h2 className="text-4xl font-bold mb-4">3 Adımda Başlayın</h2>
              <p className="text-gray-400 max-w-2xl mx-auto">Dakikalar içinde dijital menünüzü oluşturun.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="relative">
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-full flex items-center justify-center text-xl font-bold">1</div>
                <div className="bg-white/5 p-8 pt-12 rounded-2xl border border-white/10 h-full">
                  <span className="material-symbols-outlined text-violet-400 text-4xl mb-4 block">person_add</span>
                  <h3 className="text-xl font-bold mb-2">Kayıt Olun</h3>
                  <p className="text-gray-400">Ücretsiz hesap oluşturun ve restoran bilgilerinizi girin.</p>
                </div>
              </div>
              <div className="relative">
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-full flex items-center justify-center text-xl font-bold">2</div>
                <div className="bg-white/5 p-8 pt-12 rounded-2xl border border-white/10 h-full">
                  <span className="material-symbols-outlined text-fuchsia-400 text-4xl mb-4 block">menu_book</span>
                  <h3 className="text-xl font-bold mb-2">Menünüzü Oluşturun</h3>
                  <p className="text-gray-400">Kategoriler ve ürünler ekleyerek menünüzü hazırlayın.</p>
                </div>
              </div>
              <div className="relative">
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-full flex items-center justify-center text-xl font-bold">3</div>
                <div className="bg-white/5 p-8 pt-12 rounded-2xl border border-white/10 h-full">
                  <span className="material-symbols-outlined text-cyan-400 text-4xl mb-4 block">share</span>
                  <h3 className="text-xl font-bold mb-2">Paylaşın</h3>
                  <p className="text-gray-400">QR kodunuzu indirin ve masalarınıza yerleştirin.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="pricing" className="py-24 bg-[#0f0f0f]">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <span className="text-emerald-400 font-medium mb-4 block">FİYATLANDIRMA</span>
              <h2 className="text-4xl font-bold mb-4">Basit Fiyatlandırma</h2>
              <p className="text-gray-400 max-w-2xl mx-auto">İhtiyacınıza uygun planı seçin.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="bg-white/5 p-8 rounded-2xl border border-white/10">
                <h3 className="text-xl font-bold mb-2">Başlangıç</h3>
                <div className="text-4xl font-bold mb-4">Ücretsiz</div>
                <p className="text-gray-400 mb-6">Küçük işletmeler için</p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-2 text-gray-300"><span className="material-symbols-outlined text-emerald-400 text-lg">check_circle</span>1 Restoran</li>
                  <li className="flex items-center gap-2 text-gray-300"><span className="material-symbols-outlined text-emerald-400 text-lg">check_circle</span>10 Ürün</li>
                  <li className="flex items-center gap-2 text-gray-300"><span className="material-symbols-outlined text-emerald-400 text-lg">check_circle</span>QR Kod</li>
                </ul>
                <Link href="/auth/register"><Button variant="outline" className="w-full border-white/20 hover:bg-white/10">Başla</Button></Link>
              </div>
              <div className="bg-gradient-to-b from-violet-500/20 to-fuchsia-500/20 p-8 rounded-2xl border border-violet-500/50 relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-violet-500 to-fuchsia-500 px-4 py-1 rounded-full text-sm font-medium">Popüler</div>
                <h3 className="text-xl font-bold mb-2">Pro</h3>
                <div className="text-4xl font-bold mb-4">₺99<span className="text-lg text-gray-400">/ay</span></div>
                <p className="text-gray-400 mb-6">Büyüyen işletmeler için</p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-2 text-gray-300"><span className="material-symbols-outlined text-emerald-400 text-lg">check_circle</span>3 Restoran</li>
                  <li className="flex items-center gap-2 text-gray-300"><span className="material-symbols-outlined text-emerald-400 text-lg">check_circle</span>Sınırsız Ürün</li>
                  <li className="flex items-center gap-2 text-gray-300"><span className="material-symbols-outlined text-emerald-400 text-lg">check_circle</span>İstatistikler</li>
                </ul>
                <Link href="/auth/register"><Button className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 border-0">Başla</Button></Link>
              </div>
              <div className="bg-white/5 p-8 rounded-2xl border border-white/10">
                <h3 className="text-xl font-bold mb-2">İşletme</h3>
                <div className="text-4xl font-bold mb-4">₺249<span className="text-lg text-gray-400">/ay</span></div>
                <p className="text-gray-400 mb-6">Zincir restoranlar için</p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-2 text-gray-300"><span className="material-symbols-outlined text-emerald-400 text-lg">check_circle</span>Sınırsız Restoran</li>
                  <li className="flex items-center gap-2 text-gray-300"><span className="material-symbols-outlined text-emerald-400 text-lg">check_circle</span>Sınırsız Ürün</li>
                  <li className="flex items-center gap-2 text-gray-300"><span className="material-symbols-outlined text-emerald-400 text-lg">check_circle</span>Öncelikli Destek</li>
                </ul>
                <Link href="/auth/register"><Button variant="outline" className="w-full border-white/20 hover:bg-white/10">Başla</Button></Link>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-900/30 via-fuchsia-900/20 to-[#0a0a0a]" />
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-600/20 rounded-full blur-[150px]" />
          </div>
          <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2 mb-8">
              <span className="material-symbols-outlined text-violet-400 text-sm">rocket_launch</span>
              <span className="text-sm text-white/80">Hemen Başlayın</span>
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              <span className="text-white">Dijital Menünüzü</span><br />
              <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-orange-400 bg-clip-text text-transparent">Bugün Oluşturun</span>
            </h2>
            <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
              Binlerce restoran QR Menü ile müşterilerine modern bir deneyim sunuyor. Siz de aramıza katılın!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/register">
                <Button size="lg" className="text-lg px-12 py-6 bg-gradient-to-r from-violet-600 to-fuchsia-600 border-0 w-full sm:w-auto shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-shadow">
                  <span className="material-symbols-outlined mr-2">arrow_forward</span>
                  Ücretsiz Deneyin
                </Button>
              </Link>
              <Link href="#features">
                <Button size="lg" variant="outline" className="text-lg px-12 py-6 border-white/30 bg-white/5 hover:bg-white/15 w-full sm:w-auto text-white">
                  <span className="material-symbols-outlined mr-2">play_circle</span>
                  Demo İzle
                </Button>
              </Link>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-6 mt-12">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-400">check_circle</span>
                <span className="text-gray-400 text-sm">Kredi kartı gerekmez</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-400">check_circle</span>
                <span className="text-gray-400 text-sm">14 gün ücretsiz</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-400">check_circle</span>
                <span className="text-gray-400 text-sm">İstediğiniz zaman iptal</span>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-[#0f0f1a] to-[#0a0a0a]" />
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-violet-600/10 rounded-full blur-[150px]" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-fuchsia-600/10 rounded-full blur-[150px]" />
          </div>
          
          <div className="relative z-10 border-t border-white/10">
            <div className="max-w-7xl mx-auto px-4 py-16">
              <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-12">
                <div className="lg:col-span-2">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/25">
                      <span className="material-symbols-outlined text-white text-2xl">restaurant_menu</span>
                    </div>
                    <span className="font-bold text-2xl">QR Menü</span>
                  </div>
                  <p className="text-gray-400 mb-6 max-w-sm leading-relaxed">
                    Restoranlar için modern dijital menü çözümü. QR kod ile müşterilerinize benzersiz bir deneyim sunun.
                  </p>
                  <div className="mb-6">
                    <h5 className="font-semibold mb-3 text-white/90">Bültenimize Abone Olun</h5>
                    <div className="flex gap-2">
                      <input type="email" placeholder="E-posta adresiniz" className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 transition-colors" />
                      <Button className="bg-gradient-to-r from-violet-600 to-fuchsia-600 border-0 px-6">
                        <span className="material-symbols-outlined">send</span>
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <a href="#" className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center hover:bg-violet-500/20 border border-white/10 transition-all">
                      <span className="material-symbols-outlined text-gray-400 hover:text-violet-400">share</span>
                    </a>
                    <a href="#" className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center hover:bg-violet-500/20 border border-white/10 transition-all">
                      <span className="material-symbols-outlined text-gray-400 hover:text-violet-400">photo_camera</span>
                    </a>
                    <a href="#" className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center hover:bg-violet-500/20 border border-white/10 transition-all">
                      <span className="material-symbols-outlined text-gray-400 hover:text-violet-400">smart_display</span>
                    </a>
                    <a href="#" className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center hover:bg-violet-500/20 border border-white/10 transition-all">
                      <span className="material-symbols-outlined text-gray-400 hover:text-violet-400">link</span>
                    </a>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-bold mb-6 text-lg">Ürün</h4>
                  <ul className="space-y-4">
                    <li><Link href="#features" className="text-gray-400 hover:text-violet-400 transition-colors flex items-center gap-2"><span className="material-symbols-outlined text-sm">auto_awesome</span>Özellikler</Link></li>
                    <li><Link href="#pricing" className="text-gray-400 hover:text-violet-400 transition-colors flex items-center gap-2"><span className="material-symbols-outlined text-sm">payments</span>Fiyatlandırma</Link></li>
                    <li><Link href="#" className="text-gray-400 hover:text-violet-400 transition-colors flex items-center gap-2"><span className="material-symbols-outlined text-sm">play_circle</span>Demo</Link></li>
                    <li><Link href="#" className="text-gray-400 hover:text-violet-400 transition-colors flex items-center gap-2"><span className="material-symbols-outlined text-sm">integration_instructions</span>API</Link></li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-bold mb-6 text-lg">Şirket</h4>
                  <ul className="space-y-4">
                    <li><Link href="#" className="text-gray-400 hover:text-violet-400 transition-colors flex items-center gap-2"><span className="material-symbols-outlined text-sm">info</span>Hakkımızda</Link></li>
                    <li><Link href="#" className="text-gray-400 hover:text-violet-400 transition-colors flex items-center gap-2"><span className="material-symbols-outlined text-sm">article</span>Blog</Link></li>
                    <li><Link href="#" className="text-gray-400 hover:text-violet-400 transition-colors flex items-center gap-2"><span className="material-symbols-outlined text-sm">mail</span>İletişim</Link></li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-bold mb-6 text-lg">Destek</h4>
                  <ul className="space-y-4">
                    <li><Link href="#" className="text-gray-400 hover:text-violet-400 transition-colors flex items-center gap-2"><span className="material-symbols-outlined text-sm">help</span>Yardım Merkezi</Link></li>
                    <li><Link href="#" className="text-gray-400 hover:text-violet-400 transition-colors flex items-center gap-2"><span className="material-symbols-outlined text-sm">description</span>Dokümantasyon</Link></li>
                    <li><Link href="#" className="text-gray-400 hover:text-violet-400 transition-colors flex items-center gap-2"><span className="material-symbols-outlined text-sm">forum</span>Topluluk</Link></li>
                    <li><Link href="#" className="text-gray-400 hover:text-violet-400 transition-colors flex items-center gap-2"><span className="material-symbols-outlined text-sm">bug_report</span>Hata Bildir</Link></li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="border-t border-white/10">
              <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                  <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500">
                    <Link href="#" className="hover:text-violet-400 transition-colors">Gizlilik Politikası</Link>
                    <Link href="#" className="hover:text-violet-400 transition-colors">Kullanım Şartları</Link>
                    <Link href="#" className="hover:text-violet-400 transition-colors">KVKK</Link>
                    <Link href="#" className="hover:text-violet-400 transition-colors">Çerez Politikası</Link>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                      <span className="material-symbols-outlined text-emerald-400 text-lg">verified</span>
                      <span>SSL Güvenli</span>
                    </div>
                    <div className="w-px h-4 bg-white/20" />
                    <p className="text-gray-500 text-sm">© 2026 QR Menü. Tüm hakları saklıdır.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </LocaleProvider>
  )
}
