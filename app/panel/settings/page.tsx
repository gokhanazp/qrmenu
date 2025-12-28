'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getRestaurant, updateRestaurant } from '@/app/actions/restaurant'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ImageUpload } from '@/components/image-upload'
import { generateSlug } from '@/lib/utils/slug'
import Link from 'next/link'

export default function SettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    slogan: '',
    logo_url: '',
    hero_url: '',
    is_active: true,
    layout_style: 'grid' as 'grid' | 'list',
    background_color: '#ffffff',
    surface_color: '#f9fafb',
    text_color: '#111827',
    primary_color: '#FF6B35',
    price_color: '#ef4444',
    icon_color: '#111827',
    hamburger_bg_color: '#ffffff',
    about_us: '',
    phone: '',
    email: '',
    address: '',
    whatsapp: '',
    instagram: '',
    facebook: '',
    twitter: '',
  })

  const [isUploadingLogo, setIsUploadingLogo] = useState(false)
  const [isUploadingHero, setIsUploadingHero] = useState(false)

  useEffect(() => {
    loadRestaurant()
  }, [])

  async function loadRestaurant() {
    try {
      const { restaurant, error } = await getRestaurant()
      
      if (error) {
        setError(error)
        return
      }

      if (restaurant) {
        const rest = restaurant as any
        setFormData({
          name: rest.name || '',
          slug: rest.slug || '',
          slogan: rest.slogan || '',
          logo_url: rest.logo_url || '',
          hero_url: rest.hero_url || '',
          is_active: rest.is_active ?? true,
          layout_style: rest.layout_style || 'grid',
          background_color: rest.background_color || '#ffffff',
          surface_color: rest.surface_color || '#f9fafb',
          text_color: rest.text_color || '#111827',
          primary_color: rest.primary_color || '#FF6B35',
          price_color: rest.price_color || '#ef4444',
          icon_color: rest.icon_color || '#111827',
          hamburger_bg_color: rest.hamburger_bg_color || '#ffffff',
          about_us: rest.about_us || '',
          phone: rest.phone || '',
          email: rest.email || '',
          address: rest.address || '',
          whatsapp: rest.whatsapp || '',
          instagram: rest.instagram || '',
          facebook: rest.facebook || '',
          twitter: rest.twitter || '',
        })
      }
    } catch (err) {
      setError('Restoran bilgileri yüklenirken hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    if (isUploadingLogo || isUploadingHero) {
      setError('Lütfen görsellerin yüklenmesini bekleyin')
      return
    }

    setError('')
    setSuccess('')
    setSaving(true)

    try {
      const result = await updateRestaurant(formData)

      if (result.success) {
        setSuccess('Ayarlar başarıyla güncellendi')
        setTimeout(() => {
          router.push('/panel')
        }, 1500)
      } else {
        setError(result.error || 'Güncelleme başarısız')
      }
    } catch (err) {
      setError('Bir hata oluştu')
    } finally {
      setSaving(false)
    }
  }

  function handleNameChange(name: string) {
    setFormData(prev => ({
      ...prev,
      name,
      slug: generateSlug(name)
    }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pb-24">
      <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="container max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Link href="/panel" className="text-gray-600 hover:text-gray-900">
              <span className="material-symbols-outlined">arrow_back</span>
            </Link>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-gray-900">Restoran Ayarları</h1>
              <p className="text-sm text-gray-600">Bilgilerinizi düzenleyin</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container max-w-4xl mx-auto px-4 py-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg border border-red-200 flex items-center gap-2">
              <span className="material-symbols-outlined">error</span>
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 text-green-600 px-4 py-3 rounded-lg border border-green-200 flex items-center gap-2">
              <span className="material-symbols-outlined">check_circle</span>
              {success}
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
              <div className="flex items-center gap-3 text-white">
                <span className="material-symbols-outlined text-3xl">info</span>
                <div>
                  <h2 className="text-lg font-bold">Temel Bilgiler</h2>
                  <p className="text-sm text-blue-100">Restoran adı ve URL</p>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Restoran Adı *</Label>
                <Input id="name" value={formData.name} onChange={(e) => handleNameChange(e.target.value)} placeholder="Örn: Lezzet Durağı" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">URL Slug *</Label>
                <Input id="slug" value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} placeholder="lezzet-duragi" required />
                <p className="text-sm text-gray-500">Menü URL'iniz: /restorant/{formData.slug || 'slug'}</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="slogan">Slogan</Label>
                <Input id="slogan" value={formData.slogan} onChange={(e) => setFormData({ ...formData, slogan: e.target.value })} placeholder="Örn: Lezzetin Adresi" />
              </div>
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="is_active" checked={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} className="w-4 h-4 rounded border-gray-300" />
                <Label htmlFor="is_active" className="cursor-pointer">Restoran aktif (Menü yayında)</Label>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-6 py-4">
              <div className="flex items-center gap-3 text-white">
                <span className="material-symbols-outlined text-3xl">image</span>
                <div>
                  <h2 className="text-lg font-bold">Logo</h2>
                  <p className="text-sm text-purple-100">Menü başlığında görünecek</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <ImageUpload id="logo-upload" currentImageUrl={formData.logo_url} onUploadComplete={(url: string) => { setFormData({ ...formData, logo_url: url }); setIsUploadingLogo(false) }} bucket="restaurant-images" path="logos" onUploadStart={() => setIsUploadingLogo(true)} />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
            <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4">
              <div className="flex items-center gap-3 text-white">
                <span className="material-symbols-outlined text-3xl">panorama</span>
                <div>
                  <h2 className="text-lg font-bold">Hero Banner</h2>
                  <p className="text-sm text-green-100">Menü üst görseli</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <ImageUpload id="hero-upload" currentImageUrl={formData.hero_url} onUploadComplete={(url: string) => { setFormData({ ...formData, hero_url: url }); setIsUploadingHero(false) }} bucket="restaurant-images" path="heroes" onUploadStart={() => setIsUploadingHero(true)} />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
            <div className="bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-4">
              <div className="flex items-center gap-3 text-white">
                <span className="material-symbols-outlined text-3xl">view_module</span>
                <div>
                  <h2 className="text-lg font-bold">Menü Düzeni</h2>
                  <p className="text-sm text-amber-100">Görünüm stili</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-3">
                <button type="button" onClick={() => setFormData({ ...formData, layout_style: 'grid' })} className={`p-4 rounded-xl border-2 transition-all ${formData.layout_style === 'grid' ? 'border-orange-500 bg-orange-50 shadow-md' : 'border-gray-200 hover:border-gray-300'}`}>
                  <span className="material-symbols-outlined text-4xl mb-2 text-orange-500">grid_view</span>
                  <div className="font-semibold text-sm">2'li Grid</div>
                  <div className="text-xs text-gray-600 mt-1">Yan yana</div>
                </button>
                <button type="button" onClick={() => setFormData({ ...formData, layout_style: 'list' })} className={`p-4 rounded-xl border-2 transition-all ${formData.layout_style === 'list' ? 'border-orange-500 bg-orange-50 shadow-md' : 'border-gray-200 hover:border-gray-300'}`}>
                  <span className="material-symbols-outlined text-4xl mb-2 text-orange-500">view_list</span>
                  <div className="font-semibold text-sm">Tekli Liste</div>
                  <div className="text-xs text-gray-600 mt-1">Alt alta</div>
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
            <div className="bg-gradient-to-r from-pink-500 to-pink-600 px-6 py-4">
              <div className="flex items-center gap-3 text-white">
                <span className="material-symbols-outlined text-3xl">palette</span>
                <div>
                  <h2 className="text-lg font-bold">Renk Özelleştirmesi</h2>
                  <p className="text-sm text-pink-100">Tema renkleri</p>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="background_color">Arka Plan Rengi</Label>
                  <div className="flex gap-2">
                    <input type="color" id="background_color" value={formData.background_color} onChange={(e) => setFormData({ ...formData, background_color: e.target.value })} className="w-16 h-10 rounded border cursor-pointer" />
                    <Input value={formData.background_color} onChange={(e) => setFormData({ ...formData, background_color: e.target.value })} placeholder="#ffffff" className="flex-1" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="surface_color">Kart Arka Plan Rengi</Label>
                  <div className="flex gap-2">
                    <input type="color" id="surface_color" value={formData.surface_color} onChange={(e) => setFormData({ ...formData, surface_color: e.target.value })} className="w-16 h-10 rounded border cursor-pointer" />
                    <Input value={formData.surface_color} onChange={(e) => setFormData({ ...formData, surface_color: e.target.value })} placeholder="#f9fafb" className="flex-1" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="text_color">Yazı Rengi</Label>
                  <div className="flex gap-2">
                    <input type="color" id="text_color" value={formData.text_color} onChange={(e) => setFormData({ ...formData, text_color: e.target.value })} className="w-16 h-10 rounded border cursor-pointer" />
                    <Input value={formData.text_color} onChange={(e) => setFormData({ ...formData, text_color: e.target.value })} placeholder="#111827" className="flex-1" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="primary_color">Vurgu Rengi</Label>
                  <div className="flex gap-2">
                    <input type="color" id="primary_color" value={formData.primary_color} onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })} className="w-16 h-10 rounded border cursor-pointer" />
                    <Input value={formData.primary_color} onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })} placeholder="#FF6B35" className="flex-1" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price_color">Fiyat Rengi</Label>
                  <div className="flex gap-2">
                    <input type="color" id="price_color" value={formData.price_color} onChange={(e) => setFormData({ ...formData, price_color: e.target.value })} className="w-16 h-10 rounded border cursor-pointer" />
                    <Input value={formData.price_color} onChange={(e) => setFormData({ ...formData, price_color: e.target.value })} placeholder="#ef4444" className="flex-1" />
                  </div>
                  <p className="text-xs text-gray-500">Ürün fiyatlarının rengi</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="icon_color">İkon Rengi</Label>
                  <div className="flex gap-2">
                    <input type="color" id="icon_color" value={formData.icon_color} onChange={(e) => setFormData({ ...formData, icon_color: e.target.value })} className="w-16 h-10 rounded border cursor-pointer" />
                    <Input value={formData.icon_color} onChange={(e) => setFormData({ ...formData, icon_color: e.target.value })} placeholder="#111827" className="flex-1" />
                  </div>
                  <p className="text-xs text-gray-500">Hamburger menü, arama ve diğer ikonların rengi</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hamburger_bg_color">Hamburger Menü Arka Plan</Label>
                  <div className="flex gap-2">
                    <input type="color" id="hamburger_bg_color" value={formData.hamburger_bg_color} onChange={(e) => setFormData({ ...formData, hamburger_bg_color: e.target.value })} className="w-16 h-10 rounded border cursor-pointer" />
                    <Input value={formData.hamburger_bg_color} onChange={(e) => setFormData({ ...formData, hamburger_bg_color: e.target.value })} placeholder="#ffffff" className="flex-1" />
                  </div>
                  <p className="text-xs text-gray-500">Hamburger menü butonunun arka plan rengi</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
            <div className="bg-gradient-to-r from-cyan-500 to-cyan-600 px-6 py-4">
              <div className="flex items-center gap-3 text-white">
                <span className="material-symbols-outlined text-3xl">description</span>
                <div>
                  <h2 className="text-lg font-bold">Hakkımızda</h2>
                  <p className="text-sm text-cyan-100">Restoran bilgisi</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-2">
                <Label htmlFor="about_us">Hakkımızda Metni</Label>
                <textarea id="about_us" value={formData.about_us} onChange={(e) => setFormData({ ...formData, about_us: e.target.value })} placeholder="Restoranınız hakkında bilgi yazın..." rows={4} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 px-6 py-4">
              <div className="flex items-center gap-3 text-white">
                <span className="material-symbols-outlined text-3xl">contact_phone</span>
                <div>
                  <h2 className="text-lg font-bold">İletişim Bilgileri</h2>
                  <p className="text-sm text-indigo-100">Telefon, e-posta, adres</p>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefon</Label>
                  <Input id="phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="+90 555 123 45 67" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-posta</Label>
                  <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="info@restoran.com" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Adres</Label>
                <textarea id="address" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} placeholder="Tam adresinizi yazın..." rows={2} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
            <div className="bg-gradient-to-r from-rose-500 to-rose-600 px-6 py-4">
              <div className="flex items-center gap-3 text-white">
                <span className="material-symbols-outlined text-3xl">share</span>
                <div>
                  <h2 className="text-lg font-bold">Sosyal Medya</h2>
                  <p className="text-sm text-rose-100">Sosyal medya linkleri</p>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="whatsapp">WhatsApp</Label>
                <Input id="whatsapp" value={formData.whatsapp} onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })} placeholder="+90 555 123 45 67" />
                <p className="text-xs text-gray-500">Ülke kodu ile birlikte girin (örn: +90 555 123 45 67)</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="instagram">Instagram</Label>
                <Input id="instagram" value={formData.instagram} onChange={(e) => setFormData({ ...formData, instagram: e.target.value })} placeholder="https://instagram.com/restoraniniz" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="facebook">Facebook</Label>
                <Input id="facebook" value={formData.facebook} onChange={(e) => setFormData({ ...formData, facebook: e.target.value })} placeholder="https://facebook.com/restoraniniz" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="twitter">Twitter / X</Label>
                <Input id="twitter" value={formData.twitter} onChange={(e) => setFormData({ ...formData, twitter: e.target.value })} placeholder="https://twitter.com/restoraniniz" />
              </div>
            </div>
          </div>

          <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4 z-20">
            <div className="container max-w-4xl mx-auto flex gap-3">
              <Button type="button" variant="outline" onClick={() => router.push('/panel')} disabled={saving} className="flex-1">
                <span className="material-symbols-outlined text-lg mr-2">close</span>
                İptal
              </Button>
              <Button type="submit" disabled={saving || isUploadingLogo || isUploadingHero} className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700">
                {saving ? (<><span className="material-symbols-outlined text-lg mr-2 animate-spin">progress_activity</span>Kaydediliyor...</>) : (<><span className="material-symbols-outlined text-lg mr-2">save</span>Kaydet</>)}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
