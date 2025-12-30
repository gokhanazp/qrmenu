
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ImageUpload } from '@/components/image-upload'
import { createRestaurantWithUser } from '@/app/actions/admin'
import { generateSlug } from '@/lib/utils/slug'

export default function NewRestaurantPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isUploadingLogo, setIsUploadingLogo] = useState(false)
  const [isUploadingHero, setIsUploadingHero] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '', slug: '', email: '', password: '', slogan: '', phone: '', address: '',
    whatsapp: '', instagram: '', facebook: '', twitter: '', about_us: '',
    logo_url: '', hero_url: '', layout_style: 'grid',
    background_color: '#ffffff', surface_color: '#f9fafb', text_color: '#111827',
    primary_color: '#FF6B35', price_color: '#ef4444', icon_color: '#111827',
    hamburger_bg_color: '#ffffff', qr_logo_bg_color: '#FFFFFF',
    plan: 'free' as 'free' | 'pro'
  })

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value
    setFormData(prev => ({ ...prev, name, slug: generateSlug(name) }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isUploadingLogo || isUploadingHero) {
      setError('Lütfen görsellerin yüklenmesini bekleyin')
      return
    }
    setIsLoading(true)
    setError(null)
    try {
      const result = await createRestaurantWithUser(formData)
      if (result.success) {
        router.push('/admin/restaurants')
      } else {
        setError(result.error || 'Bir hata oluştu')
      }
    } catch {
      setError('Beklenmeyen bir hata oluştu')
    } finally {
      setIsLoading(false)
    }
  }

  const ColorInput = ({ label, field, placeholder }: { label: string; field: string; placeholder: string }) => (
    <div className="space-y-2">
      <Label htmlFor={field}>{label}</Label>
      <div className="flex gap-2">
        <input type="color" id={field} value={(formData as any)[field]} onChange={(e) => setFormData(prev => ({ ...prev, [field]: e.target.value }))} className="w-16 h-10 rounded border cursor-pointer" />
        <Input value={(formData as any)[field]} onChange={(e) => setFormData(prev => ({ ...prev, [field]: e.target.value }))} placeholder={placeholder} className="flex-1" />
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50 pb-8">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/admin/restaurants">
              <Button variant="outline" size="sm">
                <span className="material-symbols-outlined mr-2">arrow_back</span>Geri
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Yeni Restoran Ekle</h1>
              <p className="text-sm text-slate-600">Yeni bir restoran ve kullanıcı hesabı oluşturun</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                <span className="material-symbols-outlined text-red-600">error</span>
                <p className="text-red-700">{error}</p>
              </div>
            )}

            {/* Kullanıcı Hesabı */}
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
                <div className="flex items-center gap-3 text-white">
                  <span className="material-symbols-outlined text-3xl">person</span>
                  <div><h2 className="text-lg font-bold">Kullanıcı Hesabı</h2><p className="text-sm text-blue-100">Giriş bilgileri</p></div>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div><Label htmlFor="email">E-posta Adresi *</Label><Input id="email" type="email" value={formData.email} onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))} placeholder="ornek@email.com" required /><p className="text-xs text-slate-500 mt-1">Restoran sahibinin giriş yapacağı e-posta adresi</p></div>
                <div><Label htmlFor="password">Şifre *</Label><Input id="password" type="password" value={formData.password} onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))} placeholder="En az 6 karakter" minLength={6} required /></div>
              </div>
            </div>

            {/* Temel Bilgiler */}
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4">
                <div className="flex items-center gap-3 text-white">
                  <span className="material-symbols-outlined text-3xl">restaurant</span>
                  <div><h2 className="text-lg font-bold">Restoran Bilgileri</h2><p className="text-sm text-orange-100">Temel bilgiler</p></div>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div><Label htmlFor="name">Restoran Adı *</Label><Input id="name" value={formData.name} onChange={handleNameChange} placeholder="Örn: Lezzet Durağı" required /></div>
                  <div><Label htmlFor="slug">URL Slug *</Label><div className="flex items-center gap-2"><span className="text-slate-500 text-sm">/restorant/</span><Input id="slug" value={formData.slug} onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))} placeholder="lezzet-duragi" required /></div><p className="text-xs text-slate-500 mt-1">Menü URL&apos;inde kullanılacak benzersiz tanımlayıcı</p></div>
                </div>
                <div><Label htmlFor="slogan">Slogan</Label><Input id="slogan" value={formData.slogan} onChange={(e) => setFormData(prev => ({ ...prev, slogan: e.target.value }))} placeholder="Örn: Lezzetin Adresi" /></div>
              </div>
            </div>

            {/* Abonelik Planı */}
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-6 py-4">
                <div className="flex items-center gap-3 text-white">
                  <span className="material-symbols-outlined text-3xl">workspace_premium</span>
                  <div><h2 className="text-lg font-bold">Abonelik Planı</h2><p className="text-sm text-purple-100">Plan seçimi</p></div>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  <button type="button" onClick={() => setFormData(prev => ({ ...prev, plan: 'free' }))} className={`p-4 rounded-xl border-2 transition-all ${formData.plan === 'free' ? 'border-cyan-500 bg-cyan-50' : 'border-slate-200 hover:border-slate-300'}`}>
                    <div className="flex items-center gap-2 mb-2"><span className="material-symbols-outlined text-cyan-600">card_giftcard</span><span className="font-semibold text-slate-900">Free</span></div>
                    <p className="text-sm text-slate-600 text-left">Temel özellikler, sınırlı ürün sayısı</p>
                  </button>
                  <button type="button" onClick={() => setFormData(prev => ({ ...prev, plan: 'pro' }))} className={`p-4 rounded-xl border-2 transition-all ${formData.plan === 'pro' ? 'border-purple-500 bg-purple-50' : 'border-slate-200 hover:border-slate-300'}`}>
                    <div className="flex items-center gap-2 mb-2"><span className="material-symbols-outlined text-purple-600">workspace_premium</span><span className="font-semibold text-slate-900">Pro</span></div>
                    <p className="text-sm text-slate-600 text-left">Tüm özellikler, sınırsız ürün</p>
                  </button>
                </div>
              </div>
            </div>

            {/* Logo */}
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="bg-gradient-to-r from-violet-500 to-violet-600 px-6 py-4">
                <div className="flex items-center gap-3 text-white">
                  <span className="material-symbols-outlined text-3xl">image</span>
                  <div><h2 className="text-lg font-bold">Logo</h2><p className="text-sm text-violet-100">Menü başlığında görünecek</p></div>
                </div>
              </div>
              <div className="p-6">
                <ImageUpload id="logo-upload" currentImageUrl={formData.logo_url} onUploadComplete={(url: string) => { setFormData(prev => ({ ...prev, logo_url: url })); setIsUploadingLogo(false) }} bucket="restaurant-images" path="logos" onUploadStart={() => setIsUploadingLogo(true)} />
              </div>
            </div>

            {/* Hero Banner */}
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4">
                <div className="flex items-center gap-3 text-white">
                  <span className="material-symbols-outlined text-3xl">panorama</span>
                  <div><h2 className="text-lg font-bold">Hero Banner</h2><p className="text-sm text-green-100">Menü üst görseli</p></div>
                </div>
              </div>
              <div className="p-6">
                <ImageUpload id="hero-upload" currentImageUrl={formData.hero_url} onUploadComplete={(url: string) => { setFormData(prev => ({ ...prev, hero_url: url })); setIsUploadingHero(false) }} bucket="restaurant-images" path="heroes" onUploadStart={() => setIsUploadingHero(true)} />
              </div>
            </div>

            {/* Menü Düzeni */}
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-4">
                <div className="flex items-center gap-3 text-white">
                  <span className="material-symbols-outlined text-3xl">view_module</span>
                  <div><h2 className="text-lg font-bold">Menü Düzeni</h2><p className="text-sm text-amber-100">Görünüm stili</p></div>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 gap-3">
                  <button type="button" onClick={() => setFormData(prev => ({ ...prev, layout_style: 'grid' }))} className={`p-4 rounded-xl border-2 transition-all ${formData.layout_style === 'grid' ? 'border-orange-500 bg-orange-50 shadow-md' : 'border-gray-200 hover:border-gray-300'}`}>
                    <span className="material-symbols-outlined text-4xl mb-2 text-orange-500">grid_view</span>
                    <div className="font-semibold text-sm">2&apos;li Grid</div>
                    <div className="text-xs text-gray-600 mt-1">Yan yana</div>
                  </button>
                  <button type="button" onClick={() => setFormData(prev => ({ ...prev, layout_style: 'list' }))} className={`p-4 rounded-xl border-2 transition-all ${formData.layout_style === 'list' ? 'border-orange-500 bg-orange-50 shadow-md' : 'border-gray-200 hover:border-gray-300'}`}>
                    <span className="material-symbols-outlined text-4xl mb-2 text-orange-500">view_list</span>
                    <div className="font-semibold text-sm">Tekli Liste</div>
                    <div className="text-xs text-gray-600 mt-1">Alt alta</div>
                  </button>
                </div>
              </div>
            </div>

            {/* Renk Özelleştirmesi */}
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="bg-gradient-to-r from-pink-500 to-pink-600 px-6 py-4">
                <div className="flex items-center gap-3 text-white">
                  <span className="material-symbols-outlined text-3xl">palette</span>
                  <div><h2 className="text-lg font-bold">Renk Özelleştirmesi</h2><p className="text-sm text-pink-100">Tema renkleri</p></div>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ColorInput label="Arka Plan Rengi" field="background_color" placeholder="#ffffff" />
                  <ColorInput label="Kart Arka Plan Rengi" field="surface_color" placeholder="#f9fafb" />
                  <ColorInput label="Yazı Rengi" field="text_color" placeholder="#111827" />
                  <ColorInput label="Vurgu Rengi" field="primary_color" placeholder="#FF6B35" />
                  <ColorInput label="Fiyat Rengi" field="price_color" placeholder="#ef4444" />
                  <ColorInput label="İkon Rengi" field="icon_color" placeholder="#111827" />
                  <ColorInput label="Hamburger Menü Arka Plan" field="hamburger_bg_color" placeholder="#ffffff" />
                  <ColorInput label="QR Logo Arka Plan" field="qr_logo_bg_color" placeholder="#FFFFFF" />
                </div>
              </div>
            </div>

            {/* Hakkımızda */}
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="bg-gradient-to-r from-cyan-500 to-cyan-600 px-6 py-4">
                <div className="flex items-center gap-3 text-white">
                  <span className="material-symbols-outlined text-3xl">description</span>
                  <div><h2 className="text-lg font-bold">Hakkımızda</h2><p className="text-sm text-cyan-100">Restoran bilgisi</p></div>
                </div>
              </div>
              <div className="p-6">
                <Label htmlFor="about_us">Hakkımızda Metni</Label>
                <textarea id="about_us" value={formData.about_us} onChange={(e) => setFormData(prev => ({ ...prev, about_us: e.target.value }))} placeholder="Restoranınız hakkında bilgi yazın..." rows={4} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 mt-2" />
              </div>
            </div>

            {/* İletişim Bilgileri */}
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 px-6 py-4">
                <div className="flex items-center gap-3 text-white">
                  <span className="material-symbols-outlined text-3xl">contact_phone</span>
                  <div><h2 className="text-lg font-bold">İletişim Bilgileri</h2><p className="text-sm text-indigo-100">Telefon, e-posta, adres</p></div>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><Label htmlFor="phone">Telefon</Label><Input id="phone" value={formData.phone} onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))} placeholder="+90 555 123 45 67" /></div>
                </div>
                <div><Label htmlFor="address">Adres</Label><textarea id="address" value={formData.address} onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))} placeholder="Tam adresinizi yazın..." rows={2} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 mt-2" /></div>
              </div>
            </div>

            {/* Sosyal Medya */}
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="bg-gradient-to-r from-rose-500 to-rose-600 px-6 py-4">
                <div className="flex items-center gap-3 text-white">
                  <span className="material-symbols-outlined text-3xl">share</span>
                  <div><h2 className="text-lg font-bold">Sosyal Medya</h2><p className="text-sm text-rose-100">Sosyal medya linkleri</p></div>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div><Label htmlFor="whatsapp">WhatsApp</Label><Input id="whatsapp" value={formData.whatsapp} onChange={(e) => setFormData(prev => ({ ...prev, whatsapp: e.target.value }))} placeholder="+90 555 123 45 67" /><p className="text-xs text-gray-500 mt-1">Ülke kodu ile birlikte girin</p></div>
                <div><Label htmlFor="instagram">Instagram</Label><Input id="instagram" value={formData.instagram} onChange={(e) => setFormData(prev => ({ ...prev, instagram: e.target.value }))} placeholder="https://instagram.com/restoraniniz" /></div>
                <div><Label htmlFor="facebook">Facebook</Label><Input id="facebook" value={formData.facebook} onChange={(e) => setFormData(prev => ({ ...prev, facebook: e.target.value }))} placeholder="https://facebook.com/restoraniniz" /></div>
                <div><Label htmlFor="twitter">Twitter / X</Label><Input id="twitter" value={formData.twitter} onChange={(e) => setFormData(prev => ({ ...prev, twitter: e.target.value }))} placeholder="https://twitter.com/restoraniniz" /></div>
              </div>
            </div>

            {/* Kaydet Butonu */}
            <div className="flex justify-end gap-3">
              <Link href="/admin/restaurants">
                <Button type="button" variant="outline">İptal</Button>
              </Link>
              <Button type="submit" disabled={isLoading || isUploadingLogo || isUploadingHero} className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700">
                {isLoading ? (<><span className="material-symbols-outlined animate-spin mr-2">sync</span>Oluşturuluyor...</>) : (<><span className="material-symbols-outlined mr-2">add</span>Restoran Oluştur</>)}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}