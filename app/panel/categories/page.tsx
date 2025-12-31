import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getRestaurant } from '@/app/actions/restaurant'
import { getCategories } from '@/app/actions/category'
import { CategoriesListClient } from '@/components/categories-list-client'

export default async function CategoriesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { restaurant } = await getRestaurant()

  if (!restaurant) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center bg-white p-8 rounded-2xl shadow-lg">
          <span className="material-symbols-outlined text-6xl text-gray-400 mb-4">store</span>
          <h2 className="text-2xl font-bold mb-2">Restoran Bulunamadı</h2>
          <p className="text-gray-600">Lütfen çıkış yapıp tekrar kayıt olun.</p>
        </div>
      </div>
    )
  }

  const { categories } = await getCategories((restaurant as any).id)

  return (
    <CategoriesListClient
      categories={categories.map((cat: any) => ({
        id: cat.id,
        name: cat.name,
        name_en: cat.name_en,
        image_url: cat.image_url,
        sort_order: cat.sort_order,
        is_active: cat.is_active,
      }))}
    />
  )
}