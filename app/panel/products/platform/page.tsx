import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'
// Platform ürünleri Ürünler sayfasındaki sekmeye taşındı
export default function PlatformProductsPage() {
  redirect('/panel/products?tab=platform')
}
