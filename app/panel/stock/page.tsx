import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'
// Stok yönetimi Ürünler sayfasına taşındı
export default function StockPage() {
  redirect('/panel/products')
}
