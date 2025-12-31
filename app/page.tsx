'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { LocaleProvider, useLocale } from '@/lib/i18n/use-locale'
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
  const { t } = useLocale()
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 z-40 bg-[#0a0a0a]/98 backdrop-blur-xl flex flex-col items-center justify-center gap-8">
      <nav className="flex flex-col items-center gap-6 text-2xl">
        <Link href="#features" onClick={onClose} className="text-white/80 hover:text-white">{t.landing.nav.features}</Link>
        <Link href="/auth/login" onClick={onClose} className="text-white/80 hover:text-white">{t.landing.nav.login}</Link>
      </nav>
      <Link href="/auth/register" onClick={onClose}>
        <Button size="lg" className="bg-gradient-to-r from-violet-600 to-fuchsia-600 border-0">{t.landing.nav.freeStart}</Button>
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

function HomePageContent() {
  const { t } = useLocale()
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
    { icon: 'qr_code_2', title: t.landing.features.qrMenu.title, desc: t.landing.features.qrMenu.description, color: 'bg-violet-500' },
    { icon: 'edit_note', title: t.landing.features.easyManagement.title, desc: t.landing.features.easyManagement.description, color: 'bg-cyan-500' },
    { icon: 'trending_up', title: t.landing.features.analytics.title, desc: t.landing.features.analytics.description, color: 'bg-emerald-500' },
    { icon: 'palette', title: t.landing.features.customization.title, desc: t.landing.features.customization.description, color: 'bg-orange-500' },
    { icon: 'smartphone', title: t.landing.features.mobileFirst.title, desc: t.landing.features.mobileFirst.description, color: 'bg-pink-500' },
    { icon: 'translate', title: t.landing.features.multilingual.title, desc: t.landing.features.multilingual.description, color: 'bg-blue-500' },
  ]

  const testimonialColors = [
    'from-violet-500 to-fuchsia-500',
    'from-cyan-500 to-blue-500',
    'from-emerald-500 to-teal-500',
  ]

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden">
      <MobileMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      
      {searchOpen && (
        <div className="fixed inset-0 z-40 bg-[#0a0a0a]/95 backdrop-blur-xl flex items-start justify-center pt-32" onClick={() => setSearchOpen(false)}>
          <div className="w-full max-w-2xl mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-white/40">search</span>
              <input type="text" placeholder={t.common.search + '...'} className="w-full bg-white/10 border border-white/20 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-white/40 focus:outline-none focus:border-violet-500" autoFocus />
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
              <Button size="sm" className="bg-gradient-to-r from-violet-600 to-fuchsia-600 border-0 px-6">{t.landing.nav.start}</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col pt-20 overflow-hidden">
        <InteractiveGrid />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-fuchsia-600/20 rounded-full blur-[120px]" />
        </div>
        
        <div className="relative z-10 flex-1 flex items-center py-12 lg:py-0">
          <div className="max-w-7xl mx-auto px-4 w-full">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              <div className="text-center lg:text-left order-2 lg:order-1">
                <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2 mb-6 lg:mb-8">
                  <span className="material-symbols-outlined text-violet-400 text-sm">restaurant</span>
                  <span className="text-sm text-white/80">{t.landing.hero.badge}</span>
                </div>
                
                <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold mb-4 lg:mb-6 leading-tight">
                  <span className="text-white">{t.landing.hero.title1}</span><br />
                  <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-orange-400 bg-clip-text text-transparent">{t.landing.hero.title2}</span><br />
                  <span className="text-white">{t.landing.hero.title3}</span>
                </h1>
                
                <p className="text-lg sm:text-xl lg:text-2xl text-gray-400 mb-8 lg:mb-10 max-w-xl lg:mx-0 mx-auto">{t.landing.hero.subtitle}</p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8 lg:mb-12">
                  <Link href="/auth/register">
                    <Button size="lg" className="text-base lg:text-lg px-8 lg:px-10 py-5 lg:py-6 bg-gradient-to-r from-violet-600 to-fuchsia-600 border-0 w-full sm:w-auto">{t.landing.hero.cta}</Button>
                  </Link>
                  <Link href="#features">
                    <Button size="lg" variant="outline" className="text-base lg:text-lg px-8 lg:px-10 py-5 lg:py-6 border-white/30 bg-white/5 hover:bg-white/15 w-full sm:w-auto text-white">{t.landing.hero.ctaSecondary}</Button>
                  </Link>
                </div>
                
                <div className="flex items-center justify-center lg:justify-start gap-6 sm:gap-8 lg:gap-12 flex-wrap">
                  <div className="text-center"><div className="text-2xl lg:text-3xl font-bold">500+</div><div className="text-xs lg:text-sm text-gray-400">{t.landing.hero.stats.restaurants}</div></div>
                  <div className="w-px h-10 lg:h-12 bg-white/20" />
                  <div className="text-center"><div className="text-2xl lg:text-3xl font-bold">50K+</div><div className="text-xs lg:text-sm text-gray-400">{t.landing.hero.stats.views}</div></div>
                  <div className="w-px h-10 lg:h-12 bg-white/20" />
                  <div className="text-center"><div className="text-2xl lg:text-3xl font-bold">4.9</div><div className="text-xs lg:text-sm text-gray-400">{t.landing.hero.stats.rating}</div></div>
                </div>
              </div>
              
              <div className="flex justify-center items-center order-1 lg:order-2 mb-8 lg:mb-0">
                <div className="scale-75 sm:scale-90 lg:scale-100">
                  <PhoneMockup />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="relative z-10 w-full mt-8 lg:mt-16 pb-8">
          <div className="text-center mb-6 lg:mb-8">
            <h3 className="text-lg lg:text-xl font-semibold text-white/80 mb-2">{t.landing.showcase.title}</h3>
            <p className="text-gray-400 text-xs lg:text-sm">{t.landing.showcase.subtitle}</p>
          </div>
          <div className="overflow-hidden">
            <div className="flex gap-4 lg:gap-6" style={{ animation: 'marquee 30s linear infinite' }}>
              {[...showcaseItems, ...showcaseItems, ...showcaseItems].map((item, i) => (
                <a key={i} href={item.url} target="_blank" rel="noopener noreferrer" className="flex-shrink-0 group cursor-pointer">
                  <div className="relative w-[140px] sm:w-[180px] lg:w-[200px] h-[250px] sm:h-[320px] lg:h-[360px] bg-gradient-to-b from-gray-800 to-gray-900 rounded-[1.5rem] lg:rounded-[2rem] p-2 shadow-xl group-hover:shadow-violet-500/30 transition-all duration-300 group-hover:scale-105">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 lg:w-16 h-3 lg:h-4 bg-black rounded-b-xl z-10" />
                    <div className="w-full h-full bg-[#0a0a0a] rounded-[1.2rem] lg:rounded-[1.5rem] overflow-hidden flex items-center justify-center">
                      <span className="material-symbols-outlined text-violet-400 text-3xl lg:text-4xl">restaurant_menu</span>
                    </div>
                  </div>
                  <p className="text-center text-white/60 text-xs lg:text-sm mt-2 lg:mt-3 group-hover:text-violet-400 transition-colors">{item.name}</p>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-[#0f0f1a] to-[#0a0a0a]" />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-violet-600/10 rounded-full blur-[150px]" />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 rounded-full px-4 py-2 mb-6">
              <span className="material-symbols-outlined text-violet-400 text-sm">auto_awesome</span>
              <span className="text-sm text-violet-300">{t.landing.features.badge}</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">{t.landing.features.title} <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">{t.landing.features.titleHighlight}</span>?</h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg">{t.landing.features.subtitle}</p>
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

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-fuchsia-400 font-medium mb-4 block">{t.landing.howItWorks.badge}</span>
            <h2 className="text-4xl font-bold mb-4">{t.landing.howItWorks.title}</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">{t.landing.howItWorks.subtitle}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="relative">
              <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-full flex items-center justify-center text-xl font-bold">1</div>
              <div className="bg-white/5 p-8 pt-12 rounded-2xl border border-white/10 h-full">
                <span className="material-symbols-outlined text-violet-400 text-4xl mb-4 block">person_add</span>
                <h3 className="text-xl font-bold mb-2">{t.landing.howItWorks.step1.title}</h3>
                <p className="text-gray-400">{t.landing.howItWorks.step1.description}</p>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-full flex items-center justify-center text-xl font-bold">2</div>
              <div className="bg-white/5 p-8 pt-12 rounded-2xl border border-white/10 h-full">
                <span className="material-symbols-outlined text-fuchsia-400 text-4xl mb-4 block">menu_book</span>
                <h3 className="text-xl font-bold mb-2">{t.landing.howItWorks.step2.title}</h3>
                <p className="text-gray-400">{t.landing.howItWorks.step2.description}</p>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-full flex items-center justify-center text-xl font-bold">3</div>
              <div className="bg-white/5 p-8 pt-12 rounded-2xl border border-white/10 h-full">
                <span className="material-symbols-outlined text-cyan-400 text-4xl mb-4 block">share</span>
                <h3 className="text-xl font-bold mb-2">{t.landing.howItWorks.step3.title}</h3>
                <p className="text-gray-400">{t.landing.howItWorks.step3.description}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-[#0a0a0a] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-0 w-96 h-96 bg-violet-600/10 rounded-full blur-[150px]" />
          <div className="absolute top-1/2 right-0 w-96 h-96 bg-fuchsia-600/10 rounded-full blur-[150px]" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-pink-500/10 border border-pink-500/20 rounded-full px-4 py-2 mb-6">
              <span className="material-symbols-outlined text-pink-400 text-sm">format_quote</span>
              <span className="text-sm text-pink-300">{t.landing.testimonials.badge}</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">{t.landing.testimonials.title} <span className="bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent">{t.landing.testimonials.titleHighlight}</span></h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg">{t.landing.testimonials.subtitle}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {t.landing.testimonials.items.map((testimonial, i) => (
              <div key={i} className="bg-gradient-to-br from-white/[0.08] to-white/[0.02] p-8 rounded-3xl border border-white/10 hover:border-pink-500/30 transition-all duration-300">
                <div className="flex items-center gap-1 mb-4">
                  {[1,2,3,4,5].map(j => <span key={j} className="material-symbols-outlined text-yellow-400 text-lg">star</span>)}
                </div>
                <p className="text-gray-300 mb-6 leading-relaxed">&quot;{testimonial.text}&quot;</p>
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 bg-gradient-to-br ${testimonialColors[i]} rounded-full flex items-center justify-center text-white font-bold`}>{testimonial.initials}</div>
                  <div>
                    <h4 className="font-semibold">{testimonial.name}</h4>
                    <p className="text-sm text-gray-400">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-b from-[#0a0a0a] to-[#0f0f1a]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8">
            <div className="text-center p-6 bg-white/5 rounded-2xl border border-white/10">
              <div className="w-14 h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-white text-2xl lg:text-3xl">store</span>
              </div>
              <div className="text-3xl lg:text-4xl font-bold mb-2 bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">500+</div>
              <p className="text-gray-400 text-sm lg:text-base">{t.landing.stats.restaurants}</p>
            </div>
            <div className="text-center p-6 bg-white/5 rounded-2xl border border-white/10">
              <div className="w-14 h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-white text-2xl lg:text-3xl">visibility</span>
              </div>
              <div className="text-3xl lg:text-4xl font-bold mb-2 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">1M+</div>
              <p className="text-gray-400 text-sm lg:text-base">{t.landing.stats.views}</p>
            </div>
            <div className="text-center p-6 bg-white/5 rounded-2xl border border-white/10">
              <div className="w-14 h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-white text-2xl lg:text-3xl">qr_code_scanner</span>
              </div>
              <div className="text-3xl lg:text-4xl font-bold mb-2 bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">50K+</div>
              <p className="text-gray-400 text-sm lg:text-base">{t.landing.stats.scans}</p>
            </div>
            <div className="text-center p-6 bg-white/5 rounded-2xl border border-white/10">
              <div className="w-14 h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-white text-2xl lg:text-3xl">thumb_up</span>
              </div>
              <div className="text-3xl lg:text-4xl font-bold mb-2 bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">99%</div>
              <p className="text-gray-400 text-sm lg:text-base">{t.landing.stats.satisfaction}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <section className="py-20 bg-[#0f0f1a]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-gray-400 text-lg">{t.landing.partners.title}</p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-12 lg:gap-16">
            <div className="flex items-center gap-2 lg:gap-3 text-gray-500 hover:text-white transition-colors">
              <span className="material-symbols-outlined text-3xl lg:text-4xl">restaurant</span>
              <span className="text-lg lg:text-xl font-semibold">Lezzet Durağı</span>
            </div>
            <div className="flex items-center gap-2 lg:gap-3 text-gray-500 hover:text-white transition-colors">
              <span className="material-symbols-outlined text-3xl lg:text-4xl">local_pizza</span>
              <span className="text-lg lg:text-xl font-semibold">Pizza House</span>
            </div>
            <div className="flex items-center gap-2 lg:gap-3 text-gray-500 hover:text-white transition-colors">
              <span className="material-symbols-outlined text-3xl lg:text-4xl">ramen_dining</span>
              <span className="text-lg lg:text-xl font-semibold">Sushi Master</span>
            </div>
            <div className="flex items-center gap-2 lg:gap-3 text-gray-500 hover:text-white transition-colors">
              <span className="material-symbols-outlined text-3xl lg:text-4xl">local_cafe</span>
              <span className="text-lg lg:text-xl font-semibold">Cafe Mocha</span>
            </div>
            <div className="flex items-center gap-2 lg:gap-3 text-gray-500 hover:text-white transition-colors">
              <span className="material-symbols-outlined text-3xl lg:text-4xl">kebab_dining</span>
              <span className="text-lg lg:text-xl font-semibold">Cebi Döner</span>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-[#0a0a0a]">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-2 mb-6">
              <span className="material-symbols-outlined text-blue-400 text-sm">help</span>
              <span className="text-sm text-blue-300">{t.landing.faq.badge}</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">{t.landing.faq.title} <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">{t.landing.faq.titleHighlight}</span></h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg">{t.landing.faq.subtitle}</p>
          </div>
          <div className="space-y-4">
            {t.landing.faq.items.map((faq, i) => (
              <div key={i} className="bg-white/5 rounded-2xl border border-white/10 p-6 hover:border-blue-500/30 transition-colors">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-3">
                  <span className="material-symbols-outlined text-blue-400">help_outline</span>
                  {faq.q}
                </h3>
                <p className="text-gray-400 leading-relaxed">{faq.a}</p>
              </div>
            ))}
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
            <span className="text-sm text-white/80">{t.landing.cta.badge}</span>
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
            <span className="text-white">{t.landing.cta.title1}</span><br />
            <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-orange-400 bg-clip-text text-transparent">{t.landing.cta.title2}</span>
          </h2>
          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
            {t.landing.cta.subtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register">
              <Button size="lg" className="text-lg px-12 py-6 bg-gradient-to-r from-violet-600 to-fuchsia-600 border-0 w-full sm:w-auto shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-shadow">
                <span className="material-symbols-outlined mr-2">arrow_forward</span>
                {t.landing.cta.button}
              </Button>
            </Link>
            <Link href="#features">
              <Button size="lg" variant="outline" className="text-lg px-12 py-6 border-white/30 bg-white/5 hover:bg-white/15 w-full sm:w-auto text-white">
                <span className="material-symbols-outlined mr-2">play_circle</span>
                {t.landing.cta.buttonSecondary}
              </Button>
            </Link>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6 mt-12">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-400">check_circle</span>
              <span className="text-gray-400 text-sm">{t.landing.cta.features.noCard}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-400">check_circle</span>
              <span className="text-gray-400 text-sm">{t.landing.cta.features.freeTrial}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-400">check_circle</span>
              <span className="text-gray-400 text-sm">{t.landing.cta.features.cancelAnytime}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative overflow-hidden bg-[#0a0a0a]">
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
                  {t.landing.footer.description}
                </p>
                <div className="mb-6">
                  <h5 className="font-semibold mb-3 text-white/90">{t.landing.footer.newsletter.title}</h5>
                  <div className="flex gap-2">
                    <input type="email" placeholder={t.landing.footer.newsletter.placeholder} className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 transition-colors" />
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
                <h4 className="font-bold mb-6 text-lg">{t.landing.footer.product.title}</h4>
                <ul className="space-y-4">
                  <li><Link href="#features" className="text-gray-400 hover:text-violet-400 transition-colors flex items-center gap-2"><span className="material-symbols-outlined text-sm">auto_awesome</span>{t.landing.footer.product.features}</Link></li>
                  <li><Link href="#" className="text-gray-400 hover:text-violet-400 transition-colors flex items-center gap-2"><span className="material-symbols-outlined text-sm">play_circle</span>{t.landing.footer.product.demo}</Link></li>
                  <li><Link href="#" className="text-gray-400 hover:text-violet-400 transition-colors flex items-center gap-2"><span className="material-symbols-outlined text-sm">integration_instructions</span>{t.landing.footer.product.api}</Link></li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-bold mb-6 text-lg">{t.landing.footer.company.title}</h4>
                <ul className="space-y-4">
                  <li><Link href="#" className="text-gray-400 hover:text-violet-400 transition-colors flex items-center gap-2"><span className="material-symbols-outlined text-sm">info</span>{t.landing.footer.company.about}</Link></li>
                  <li><Link href="#" className="text-gray-400 hover:text-violet-400 transition-colors flex items-center gap-2"><span className="material-symbols-outlined text-sm">article</span>{t.landing.footer.company.blog}</Link></li>
                  <li><Link href="#" className="text-gray-400 hover:text-violet-400 transition-colors flex items-center gap-2"><span className="material-symbols-outlined text-sm">mail</span>{t.landing.footer.company.contact}</Link></li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-bold mb-6 text-lg">{t.landing.footer.support.title}</h4>
                <ul className="space-y-4">
                  <li><Link href="#" className="text-gray-400 hover:text-violet-400 transition-colors flex items-center gap-2"><span className="material-symbols-outlined text-sm">help</span>{t.landing.footer.support.helpCenter}</Link></li>
                  <li><Link href="#" className="text-gray-400 hover:text-violet-400 transition-colors flex items-center gap-2"><span className="material-symbols-outlined text-sm">description</span>{t.landing.footer.support.documentation}</Link></li>
                  <li><Link href="#" className="text-gray-400 hover:text-violet-400 transition-colors flex items-center gap-2"><span className="material-symbols-outlined text-sm">forum</span>{t.landing.footer.support.community}</Link></li>
                  <li><Link href="#" className="text-gray-400 hover:text-violet-400 transition-colors flex items-center gap-2"><span className="material-symbols-outlined text-sm">bug_report</span>{t.landing.footer.support.reportBug}</Link></li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="border-t border-white/10">
            <div className="max-w-7xl mx-auto px-4 py-8">
              <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500">
                  <Link href="#" className="hover:text-violet-400 transition-colors">{t.landing.footer.legal.privacy}</Link>
                  <Link href="#" className="hover:text-violet-400 transition-colors">{t.landing.footer.legal.terms}</Link>
                  <Link href="#" className="hover:text-violet-400 transition-colors">{t.landing.footer.legal.kvkk}</Link>
                  <Link href="#" className="hover:text-violet-400 transition-colors">{t.landing.footer.legal.cookies}</Link>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <span className="material-symbols-outlined text-emerald-400 text-lg">verified</span>
                    <span>{t.landing.footer.sslSecure}</span>
                  </div>
                  <div className="w-px h-4 bg-white/20" />
                  <p className="text-gray-500 text-sm">{t.landing.footer.copyright}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default function HomePage() {
  return (
    <LocaleProvider>
      <HomePageContent />
    </LocaleProvider>
  )
}
