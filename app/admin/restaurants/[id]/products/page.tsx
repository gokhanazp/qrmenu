import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils/currency'

export default async function AdminRestaurantProductsPage({
  params
}: {
  params: { id: string }
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: isAdminUser } = await supabase.rpc('is_admin')
  if (!isAdminUser) {
    redirect('/panel')
  }

  const { data: restaurant } = await supabase
    .from('restaurants')
    .select('id, name, slug')
    .eq('id', params.id)
    .single()

  if (!restaurant) {
    notFound()
  }

  const { data: products } = await supabase
    .from('products')
    .select('*, categories(name)')
    .eq('restaurant_id', params.id)
    .order('sort_order', { ascending: true })

  const rest = restaurant as { id: string; name: string; slug: string }
  const prods = (products || []) as Array<{ 
    id: string; name: string; description?: string; price: number; 
    image_url?: string; sort_order: number; is_active: boolean;
    categories?: { name: string } | null
  }>

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href={`/admin/restaurants/${params.id}`}>
                <Button variant="outline" size="sm">
                  <span className="material-symbols-outlined mr-2">arrow_back</span>
                  Geri
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Ürünler</h1>
                <p className="text-sm text-slate-600">{rest.name}</p>
              </div>
            </div>
            <Link href={`/admin/restaurants/${params.id}/products/new`}>
              <Button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700">
                <span className="material-symbols-outlined mr-2">add</span>
                Yeni Ürün
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {prods.length > 0 ? (
          <div className="grid gap-4">
            {prods.map((product) => (
              <div key={product.id} className="bg-white rounded-lg shadow-sm p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.name} className="w-16 h-16 rounded-lg object-cover" />
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-slate-100 flex items-center justify-center">
                      <span className="material-symbols-outlined text-slate-400">restaurant_menu</span>
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-slate-900">{product.name}</h3>
                    <p className="text-sm text-slate-600">{product.categories?.name || 'Kategorisiz'}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-bold text-orange-600">{formatCurrency(product.price)}</span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${product.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {product.is_active ? 'Aktif' : 'Pasif'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link href={`/admin/restaurants/${params.id}/products/${product.id}/edit`}>
                    <Button variant="outline" size="sm">
                      <span className="material-symbols-outlined">edit</span>
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <span className="material-symbols-outlined text-6xl text-slate-300 mb-4">restaurant_menu</span>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Henüz ürün yok</h3>
            <p className="text-slate-600 mb-4">Bu restoran için henüz ürün eklenmemiş.</p>
            <Link href={`/admin/restaurants/${params.id}/products/new`}>
              <Button className="bg-gradient-to-r from-orange-500 to-orange-600">
                <span className="material-symbols-outlined mr-2">add</span>
                İlk Ürünü Ekle
              </Button>
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}