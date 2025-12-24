'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { LocaleProvider, useLocale } from '@/lib/i18n/use-locale'
import { LanguageSwitcher } from '@/components/language-switcher'

function HomePageContent() {
  const { t } = useLocale()

  return (
    <div className="min-h-screen bg-white">
      {/* Top Bar */}
      <div className="bg-gray-900 text-white py-2">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center justify-between text-sm gap-2">
            <div className="flex items-center gap-4">
              <a href="tel:+905551234567" className="flex items-center gap-1 hover:text-orange-400 transition-colors">
                <span className="material-symbols-outlined text-base">call</span>
                <span className="hidden sm:inline">+90 555 123 45 67</span>
              </a>
              <a href="mailto:info@qrmenu.com" className="flex items-center gap-1 hover:text-orange-400 transition-colors">
                <span className="material-symbols-outlined text-base">mail</span>
                <span className="hidden sm:inline">info@qrmenu.com</span>
              </a>
            </div>
            <div className="flex items-center gap-3">
              <a href="#" className="hover:text-orange-400 transition-colors">
                <span className="material-symbols-outlined text-base">facebook</span>
              </a>
              <a href="#" className="hover:text-orange-400 transition-colors">
                <span className="material-symbols-outlined text-base">photo_camera</span>
              </a>
              <a href="#" className="hover:text-orange-400 transition-colors">
                <span className="material-symbols-outlined text-base">share</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="material-symbols-outlined text-white text-2xl">restaurant_menu</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">QR Menü SaaS</h1>
                <p className="text-xs text-gray-500">Dijital Menü Çözümü</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <LanguageSwitcher />
              <Link href="/auth/login">
                <Button variant="ghost" className="hidden sm:inline-flex">
                  <span className="material-symbols-outlined mr-2">login</span>
                  {t.auth.login}
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button className="bg-orange-500 hover:bg-orange-600">
                  <span className="material-symbols-outlined mr-2">rocket_launch</span>
                  {t.landing.hero.cta}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-orange-50 via-white to-blue-50 py-20 md:py-32">
        {/* Subtle Background Effects */}
        <div className="absolute inset-0 overflow-hidden opacity-30">
          <div className="absolute top-20 left-10 w-96 h-96 bg-orange-200 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-200 rounded-full blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-sm font-semibold">
                <span className="material-symbols-outlined text-lg">auto_awesome</span>
                Yeni Nesil Dijital Menü
              </div>
              <h2 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
                Restoranınızı
                <span className="block text-orange-500">Dijitale Taşıyın</span>
              </h2>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed max-w-2xl">
                QR kod ile müşterilerinize modern, hızlı ve kolay bir menü deneyimi sunun. Kağıt menülere veda edin!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12">
                <Link href="/auth/register">
                  <Button size="lg" className="text-lg px-8 py-6 bg-orange-500 hover:bg-orange-600">
                    <span className="material-symbols-outlined mr-2">rocket_launch</span>
                    Ücretsiz Başla
                  </Button>
                </Link>
                <Link href="#features">
                  <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-2">
                    <span className="material-symbols-outlined mr-2">play_circle</span>
                    Nasıl Çalışır?
                  </Button>
                </Link>
              </div>
              <div className="grid grid-cols-3 gap-6 max-w-lg mx-auto lg:mx-0">
                <div className="text-center lg:text-left">
                  <div className="text-3xl font-bold text-orange-500 mb-1">500+</div>
                  <div className="text-sm text-gray-600">Aktif Restoran</div>
                </div>
                <div className="text-center lg:text-left">
                  <div className="text-3xl font-bold text-orange-500 mb-1">50K+</div>
                  <div className="text-sm text-gray-600">Aylık Tarama</div>
                </div>
                <div className="text-center lg:text-left">
                  <div className="text-3xl font-bold text-orange-500 mb-1">99%</div>
                  <div className="text-sm text-gray-600">Memnuniyet</div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="relative z-10">
                <div className="bg-gray-900 rounded-[3rem] p-4 shadow-2xl">
                  <div className="bg-white rounded-[2.5rem] overflow-hidden">
                    <div className="bg-orange-500 p-6 text-white">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                          <span className="text-2xl">🍕</span>
                        </div>
                        <div>
                          <h3 className="font-bold text-lg">Pizza House</h3>
                          <p className="text-sm text-orange-100">Lezzetin Adresi</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 space-y-3 bg-gray-50">
                      <div className="bg-white p-4 rounded-xl shadow-sm flex items-center gap-3">
                        <div className="w-16 h-16 bg-orange-100 rounded-lg flex items-center justify-center text-2xl">🍕</div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">Margherita</h4>
                          <p className="text-xs text-gray-500">Klasik İtalyan lezzeti</p>
                        </div>
                        <span className="text-orange-600 font-bold text-lg">₺89</span>
                      </div>
                      <div className="bg-white p-4 rounded-xl shadow-sm flex items-center gap-3">
                        <div className="w-16 h-16 bg-orange-100 rounded-lg flex items-center justify-center text-2xl">🍕</div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">Pepperoni</h4>
                          <p className="text-xs text-gray-500">Baharatlı sucuk ile</p>
                        </div>
                        <span className="text-orange-600 font-bold text-lg">₺99</span>
                      </div>
                      <div className="bg-white p-4 rounded-xl shadow-sm flex items-center gap-3">
                        <div className="w-16 h-16 bg-orange-100 rounded-lg flex items-center justify-center text-2xl">🥗</div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">Vegetarian</h4>
                          <p className="text-xs text-gray-500">Taze sebzeler</p>
                        </div>
                        <span className="text-orange-600 font-bold text-lg">₺85</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="absolute -bottom-6 -right-6 bg-white p-4 rounded-2xl shadow-2xl">
                  <div className="w-24 h-24 bg-gray-900 rounded-xl flex items-center justify-center">
                    <span className="material-symbols-outlined text-white text-5xl">qr_code_2</span>
                  </div>
                  <p className="text-xs text-center mt-2 text-gray-600 font-medium">Tara & Gör</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 md:py-32 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-sm font-semibold">
                <span className="material-symbols-outlined text-lg">stars</span>
                Özellikler
              </div>
              <h3 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Her Şey Dahil</h3>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">Restoranınız için ihtiyacınız olan tüm dijital menü özellikleri</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="group bg-gradient-to-br from-orange-50 to-white p-8 rounded-2xl border-2 border-orange-100 hover:border-orange-300 hover:shadow-xl transition-all">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                  <span className="material-symbols-outlined text-white text-3xl">qr_code_2</span>
                </div>
                <h4 className="text-2xl font-bold text-gray-900 mb-3">QR Menü</h4>
                <p className="text-gray-600 leading-relaxed">Müşterileriniz QR kodu tarayarak anında menünüze ulaşsın.</p>
              </div>
              <div className="group bg-gradient-to-br from-blue-50 to-white p-8 rounded-2xl border-2 border-blue-100 hover:border-blue-300 hover:shadow-xl transition-all">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                  <span className="material-symbols-outlined text-white text-3xl">bolt</span>
                </div>
                <h4 className="text-2xl font-bold text-gray-900 mb-3">Kolay Yönetim</h4>
                <p className="text-gray-600 leading-relaxed">Ürünlerinizi dakikalar içinde güncelleyin. Teknik bilgi gerektirmez.</p>
              </div>
              <div className="group bg-gradient-to-br from-green-50 to-white p-8 rounded-2xl border-2 border-green-100 hover:border-green-300 hover:shadow-xl transition-all">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                  <span className="material-symbols-outlined text-white text-3xl">analytics</span>
                </div>
                <h4 className="text-2xl font-bold text-gray-900 mb-3">İstatistikler</h4>
                <p className="text-gray-600 leading-relaxed">Menünüzün kaç kez görüntülendiğini takip edin.</p>
              </div>
              <div className="group bg-gradient-to-br from-purple-50 to-white p-8 rounded-2xl border-2 border-purple-100 hover:border-purple-300 hover:shadow-xl transition-all">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                  <span className="material-symbols-outlined text-white text-3xl">smartphone</span>
                </div>
                <h4 className="text-2xl font-bold text-gray-900 mb-3">Mobil Uyumlu</h4>
                <p className="text-gray-600 leading-relaxed">Tüm cihazlarda mükemmel görünüm.</p>
              </div>
              <div className="group bg-gradient-to-br from-pink-50 to-white p-8 rounded-2xl border-2 border-pink-100 hover:border-pink-300 hover:shadow-xl transition-all">
                <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                  <span className="material-symbols-outlined text-white text-3xl">image</span>
                </div>
                <h4 className="text-2xl font-bold text-gray-900 mb-3">Görsel Yönetimi</h4>
                <p className="text-gray-600 leading-relaxed">Ürünlerinize fotoğraf ekleyin.</p>
              </div>
              <div className="group bg-gradient-to-br from-indigo-50 to-white p-8 rounded-2xl border-2 border-indigo-100 hover:border-indigo-300 hover:shadow-xl transition-all">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                  <span className="material-symbols-outlined text-white text-3xl">palette</span>
                </div>
                <h4 className="text-2xl font-bold text-gray-900 mb-3">Özelleştirilebilir</h4>
                <p className="text-gray-600 leading-relaxed">Menünüzü markanıza uygun şekilde kişiselleştirin.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 md:py-32 bg-gradient-to-br from-gray-900 to-gray-800 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-96 h-96 bg-orange-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
        </div>
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16 relative z-10">
              <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-white/10 backdrop-blur-sm text-white rounded-full text-sm font-semibold">
                <span className="material-symbols-outlined text-lg">lightbulb</span>
                Nasıl Çalışır?
              </div>
              <h3 className="text-4xl md:text-5xl font-bold mb-4">3 Adımda Başlayın</h3>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">Dakikalar içinde dijital menünüz hazır</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8 relative z-10">
              <div className="relative">
                <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl border border-white/20 hover:bg-white/20 transition-all">
                  <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                    <span className="text-white text-3xl font-bold">1</span>
                  </div>
                  <h4 className="text-2xl font-bold mb-3">Kayıt Olun</h4>
                  <p className="text-gray-300 leading-relaxed">Ücretsiz hesap oluşturun ve restoranınızın bilgilerini girin.</p>
                </div>
                <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-white/20"></div>
              </div>
              <div className="relative">
                <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl border border-white/20 hover:bg-white/20 transition-all">
                  <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                    <span className="text-white text-3xl font-bold">2</span>
                  </div>
                  <h4 className="text-2xl font-bold mb-3">Menü Oluşturun</h4>
                  <p className="text-gray-300 leading-relaxed">Kategorilerinizi ve ürünlerinizi ekleyin, fotoğraflar yükleyin.</p>
                </div>
                <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-white/20"></div>
              </div>
              <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl border border-white/20 hover:bg-white/20 transition-all">
                <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                  <span className="text-white text-3xl font-bold">3</span>
                </div>
                <h4 className="text-2xl font-bold mb-3">QR Paylaşın</h4>
                <p className="text-gray-300 leading-relaxed">QR kodunuzu indirin ve masalarınıza yerleştirin. Hepsi bu kadar!</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-32 bg-orange-500 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-4xl md:text-6xl font-bold mb-6">Hemen Başlayın</h3>
            <p className="text-xl md:text-2xl mb-12 text-orange-100">Restoranınızı dijitale taşımanın tam zamanı. Ücretsiz deneyin!</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/register">
                <Button size="lg" className="text-lg px-8 py-6 bg-white text-orange-600 hover:bg-gray-100">
                  <span className="material-symbols-outlined mr-2">rocket_launch</span>
                  Ücretsiz Başla
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-2 border-white text-white hover:bg-white/10">
                  <span className="material-symbols-outlined mr-2">login</span>
                  Giriş Yap
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
              <div className="lg:col-span-1">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
                    <span className="material-symbols-outlined text-white text-2xl">restaurant_menu</span>
                  </div>
                  <span className="text-xl font-bold text-white">QR Menü SaaS</span>
                </div>
                <p className="text-gray-400 leading-relaxed mb-6">Restoranlar için modern dijital menü çözümü</p>
                <div className="flex items-center gap-3">
                  <a href="#" className="w-10 h-10 bg-gray-800 hover:bg-orange-500 rounded-lg flex items-center justify-center transition-colors">
                    <span className="material-symbols-outlined text-white text-lg">facebook</span>
                  </a>
                  <a href="#" className="w-10 h-10 bg-gray-800 hover:bg-orange-500 rounded-lg flex items-center justify-center transition-colors">
                    <span className="material-symbols-outlined text-white text-lg">photo_camera</span>
                  </a>
                  <a href="#" className="w-10 h-10 bg-gray-800 hover:bg-orange-500 rounded-lg flex items-center justify-center transition-colors">
                    <span className="material-symbols-outlined text-white text-lg">share</span>
                  </a>
                </div>
              </div>
              <div>
                <h5 className="font-bold text-white mb-4">Ürün</h5>
                <ul className="space-y-2">
                  <li><Link href="#features" className="text-gray-400 hover:text-orange-400 transition-colors">Özellikler</Link></li>
                  <li><Link href="#" className="text-gray-400 hover:text-orange-400 transition-colors">Fiyatlandırma</Link></li>
                  <li><Link href="#" className="text-gray-400 hover:text-orange-400 transition-colors">Demo</Link></li>
                </ul>
              </div>
              <div>
                <h5 className="font-bold text-white mb-4">Şirket</h5>
                <ul className="space-y-2">
                  <li><Link href="#" className="text-gray-400 hover:text-orange-400 transition-colors">Hakkımızda</Link></li>
                  <li><Link href="#" className="text-gray-400 hover:text-orange-400 transition-colors">İletişim</Link></li>
                  <li><Link href="#" className="text-gray-400 hover:text-orange-400 transition-colors">Blog</Link></li>
                </ul>
              </div>
              <div>
                <h5 className="font-bold text-white mb-4">Destek</h5>
                <ul className="space-y-2">
                  <li><Link href="#" className="text-gray-400 hover:text-orange-400 transition-colors">Yardım</Link></li>
                  <li><Link href="#" className="text-gray-400 hover:text-orange-400 transition-colors">SSS</Link></li>
                  <li><Link href="#" className="text-gray-400 hover:text-orange-400 transition-colors">Gizlilik</Link></li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-800 pt-8 text-center">
              <p className="text-gray-400">&copy; 2024 QR Menü SaaS. Tüm hakları saklıdır.</p>
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
