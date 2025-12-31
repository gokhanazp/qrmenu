
'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ImageUpload } from '@/components/image-upload'
import { getRestaurantById, updateRestaurantByAdmin } from '@/app/actions/admin'

export default function EditRestaurantPage() {
  const params = useParams()
  const restaurantId = params.id as string
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [restaurantName, setRestaurantName] = useState('')
  const [isUploadingLogo, setIsUploadingLogo] = useState(false)
  const [isUploadingHero, setIsUploadingHero] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '', slug: '', slogan: '', phone: '', email: '', address: '', whatsapp: '',
    instagram: '', facebook: '', twitter: '', about_us: '', logo_url: '', hero_url: '',
    layout_style: 'grid', background_color: '#ffffff', surface_color: '#f9fafb',
    text_color: '#111827', primary_color: '#FF6B35', price_color: '#ef4444',
    icon_color: '#111827', hamburger_bg_color: '#ffffff', qr_logo_bg_color: '#FFFFFF',
    is_active: true,
    supported_languages: ['tr'] as string[]
  })

  useEffect(() => {
    async function loadRestaurant() {
      if (!restaurantId) return
      const result = await getRestaurantById(restaurantId)
      if ('error' in result && result.error) {
        setError(result.error)
      } else if ('restaurant' in result && result.restaurant) {
        const r = result.restaurant as any
        setRestaurantName(r.name || '')
        setFormData({
          name: r.name || '', slug: r.slug || '', slogan: r.slogan || '',
          phone: r.phone || '', email: r.email || '', address: r.address || '',
          whatsapp: r.whatsapp || '', instagram: r.instagram || '',
          facebook: r.facebook || '', twitter: r.twitter || '',
          about_us: r.about_us || '', logo_url: r.logo_url || '',
          hero_url: r.hero_url || '', layout_style: r.layout_style || 'grid',
          background_color: r.background_color || '#ffffff',
          surface_color: r.surface_color || '#f9fafb',
          text_color: r.text_color || '#111827',
          primary_color: r.primary_color || '#FF6B35',
          price_color: r.price_color || '#ef4444',
          icon_color: r.icon_color || '#111827',
          hamburger_bg_color: r.hamburger_bg_color || '#ffffff',
          qr_logo_bg_color: r.qr_logo_bg_color || '#FFFFFF',
          is_active: r.is_active ?? true,
          supported_languages: r.supported_languages || ['tr']
        })
      }
      setIsLoading(false)
    }
    loadRestaurant()
  }, [restaurantId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isUploadingLogo || isUploadingHero) {
      setError('Lütfen görsellerin yüklenmesini bekleyin')
      return
    }
    setIsSaving(true)
    setError(null)
    setSuccess(false)
    try {
      const result = await updateRestaurantByAdmin({ restaurantId, ...formData })
      if (result.success) {
        setSuccess(true)
        setTimeout(() => setSuccess(false), 3000)
      } else {
        setError(result.error || 'Bir hata oluştu')
      }
    } catch {
      setError('Beklenmeyen bir hata oluştu')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <span className="material-symbols-outlined text-4xl text-orange-500 animate-spin">sync</span>
          <p className="mt-2 text-slate-600">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  if (error && !restaurantName) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
          <span className="material-symbols-outlined text-4xl text-red-500 mb-4">error</span>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Hata</h2>
          <p className="text-slate-600 mb-4">{error}</p>
          <Link href="/admin/restaurants"><Button>Geri Dön</Button></Link>
        </div>
      </div>
    )
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
            <Link href={`/admin/restaurants/${restaurantId}`}>
              <Button variant="outline" size="sm">
                <span className="material-symbols-outlined mr-2">arrow_back</span>Geri
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Restoran Düzenle</h1>
              <p className="text-sm text-slate-600">{restaurantName}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            {success && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                <span className="material-symbols-outlined text-green-600">check_circle</span>
                <p className="text-green-700">Değişiklikler başarıyla kaydedildi!</p>
              </div>
            )}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                <span className="material-symbols-outlined text-red-600">error</span>
                <p className="text-red-700">{error}</p>
              </div>
            )}

            {/* Temel Bilgiler */}
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
                <div className="flex items-center gap-3 text-white">
                  <span className="material-symbols-outlined text-3xl">info</span>
                  <div><h2 className="text-lg font-bold">Temel Bilgiler</h2><p className="text-sm text-blue-100">Restoran adı ve URL</p></div>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div><Label htmlFor="name">Restoran Adı *</Label><Input id="name" value={formData.name} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} required /></div>
                  <div><Label htmlFor="slug">URL Slug *</Label><Input id="slug" value={formData.slug} onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))} required /><p className="text-xs text-slate-500 mt-1">Menü URL: /restorant/{formData.slug || 'slug'}</p></div>
                </div>
                <div><Label htmlFor="slogan">Slogan</Label><Input id="slogan" value={formData.slogan} onChange={(e) => setFormData(prev => ({ ...prev, slogan: e.target.value }))} placeholder="Örn: Lezzetin Adresi" /></div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="is_active" checked={formData.is_active} onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))} className="w-4 h-4 rounded border-gray-300" />
                  <Label htmlFor="is_active" className="cursor-pointer">Restoran aktif (Menü yayında)</Label>
                </div>
              </div>
            </div>

            {/* Dil Ayarları */}
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="bg-gradient-to-r from-teal-500 to-teal-600 px-6 py-4">
                <div className="flex items-center gap-3 text-white">
                  <span className="material-symbols-outlined text-3xl">translate</span>
                  <div><h2 className="text-lg font-bold">Dil Ayarları</h2><p className="text-sm text-teal-100">Desteklenen diller</p></div>
                </div>
              </div>
              <div className="p-6">
                <p className="text-sm text-slate-600 mb-4">Restoranın menüsünde hangi dillerin destekleneceğini seçin. İngilizce seçilirse, ürün ve kategori eklerken İngilizce alanları da doldurmanız gerekecektir.</p>
                <div className="flex flex-wrap gap-3">
                  <label className="flex items-center gap-2 px-4 py-3 rounded-xl border-2 cursor-pointer transition-all bg-orange-50 border-orange-500">
                    <input type="checkbox" checked={true} disabled className="w-4 h-4 rounded border-gray-300" />
                    <span className="text-2xl">🇹🇷</span>
                    <span className="font-medium text-slate-900">Türkçe</span>
                    <span className="text-xs text-slate-500">(Varsayılan)</span>
                  </label>
                  <label className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 cursor-pointer transition-all ${formData.supported_languages.includes('en') ? 'bg-blue-50 border-blue-500' : 'border-gray-200 hover:border-gray-300'}`}>
                    <input
                      type="checkbox"
                      checked={formData.supported_languages.includes('en')}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData(prev => ({ ...prev, supported_languages: [...prev.supported_languages, 'en'] }))
                        } else {
                          setFormData(prev => ({ ...prev, supported_languages: prev.supported_languages.filter(l => l !== 'en') }))
                        }
                      }}
                      className="w-4 h-4 rounded border-gray-300"
                    />
                    <span className="text-2xl">🇬🇧</span>
                    <span className="font-medium text-slate-900">English</span>
                  </label>
                </div>
                {formData.supported_languages.includes('en') && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-start gap-2">
                      <span className="material-symbols-outlined text-blue-600">info</span>
                      <div>
                        <p className="text-sm font-medium text-blue-800">İngilizce Desteği Aktif</p>
                        <p className="text-sm text-blue-700 mt-1">Ürün ve kategori ekleme/düzenleme ekranlarında İngilizce alanları göreceksiniz. Bu alanları doldurarak menünüzü İngilizce olarak da sunabilirsiniz.</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Logo */}
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-6 py-4">
                <div className="flex items-center gap-3 text-white">
                  <span className="material-symbols-outlined text-3xl">image</span>
                  <div><h2 className="text-lg font-bold">Logo</h2><p className="text-sm text-purple-100">Menü başlığında görünecek</p></div>
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
                  <div><Label htmlFor="email">E-posta</Label><Input id="email" type="email" value={formData.email} onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))} placeholder="info@restoran.com" /></div>
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
              <Link href={`/admin/restaurants/${restaurantId}`}>
                <Button type="button" variant="outline">İptal</Button>
              </Link>
              <Button type="submit" disabled={isSaving || isUploadingLogo || isUploadingHero} className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700">
                {isSaving ? (<><span className="material-symbols-outlined animate-spin mr-2">sync</span>Kaydediliyor...</>) : (<><span className="material-symbols-outlined mr-2">save</span>Kaydet</>)}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}