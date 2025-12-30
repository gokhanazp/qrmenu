import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'

export default async function AdminRestaurantCategoriesPage({
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

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .eq('restaurant_id', params.id)
    .order('sort_order', { ascending: true })

  const rest = restaurant as { id: string; name: string; slug: string }
  const cats = (categories || []) as Array<{ id: string; name: string; image_url?: string; sort_order: number; is_active: boolean }>

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
                <h1 className="text-2xl font-bold text-slate-900">Kategoriler</h1>
                <p className="text-sm text-slate-600">{rest.name}</p>
              </div>
            </div>
            <Link href={`/admin/restaurants/${params.id}/categories/new`}>
              <Button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700">
                <span className="material-symbols-outlined mr-2">add</span>
                Yeni Kategori
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {cats.length > 0 ? (
          <div className="grid gap-4">
            {cats.map((category) => (
              <div key={category.id} className="bg-white rounded-lg shadow-sm p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {category.image_url ? (
                    <img src={category.image_url} alt={category.name} className="w-16 h-16 rounded-lg object-cover" />
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-slate-100 flex items-center justify-center">
                      <span className="material-symbols-outlined text-slate-400">category</span>
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-slate-900">{category.name}</h3>
                    <p className="text-sm text-slate-600">Sıra: {category.sort_order}</p>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${category.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {category.is_active ? 'Aktif' : 'Pasif'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link href={`/admin/restaurants/${params.id}/categories/${category.id}/edit`}>
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
            <span className="material-symbols-outlined text-6xl text-slate-300 mb-4">category</span>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Henüz kategori yok</h3>
            <p className="text-slate-600 mb-4">Bu restoran için henüz kategori eklenmemiş.</p>
            <Link href={`/admin/restaurants/${params.id}/categories/new`}>
              <Button className="bg-gradient-to-r from-orange-500 to-orange-600">
                <span className="material-symbols-outlined mr-2">add</span>
                İlk Kategoriyi Ekle
              </Button>
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}