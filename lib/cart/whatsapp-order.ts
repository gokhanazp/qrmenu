import { formatCurrency } from '@/lib/utils/currency'

export interface OrderLine {
  name: string
  price: number
  qty: number
}

/**
 * Restoranın serbest formatta girdiği WhatsApp numarasını wa.me'nin istediği
 * "ülke kodu + numara, sadece rakam" biçimine çevirir.
 *   "+90 534 284 44 44" -> "905342844444"
 *   "0534 284 44 44"    -> "905342844444"
 *   "534 284 44 44"     -> "905342844444"
 */
export function normalizeWhatsappNumber(raw: string | null | undefined): string {
  if (!raw) return ''
  let digits = raw.replace(/\D/g, '')
  if (digits.startsWith('00')) digits = digits.slice(2)
  if (digits.length === 11 && digits.startsWith('0')) digits = '9' + digits
  else if (digits.length === 10 && digits.startsWith('5')) digits = '90' + digits
  return digits
}

export function cartTotal(items: OrderLine[]): number {
  return items.reduce((sum, item) => sum + item.price * item.qty, 0)
}

export function buildOrderMessage(input: {
  restaurantName: string
  items: OrderLine[]
  tableNumber?: string
  note?: string
  isEnglish?: boolean
}): string {
  const t = input.isEnglish
    ? { title: 'New Order', table: 'Table', total: 'Total', note: 'Note' }
    : { title: 'Yeni Sipariş', table: 'Masa', total: 'Toplam', note: 'Not' }

  const lines: string[] = []
  lines.push(`🛒 *${t.title}* - ${input.restaurantName}`)
  const table = input.tableNumber?.trim()
  if (table) lines.push(`📍 ${t.table}: ${table}`)
  lines.push('')
  for (const item of input.items) {
    lines.push(`• ${item.qty} x ${item.name} - ${formatCurrency(item.price * item.qty)}`)
  }
  lines.push('')
  lines.push(`💰 *${t.total}: ${formatCurrency(cartTotal(input.items))}*`)
  const note = input.note?.trim()
  if (note) {
    lines.push('')
    lines.push(`📝 ${t.note}: ${note}`)
  }
  return lines.join('\n')
}

export function buildWhatsappOrderUrl(whatsapp: string, message: string): string {
  return `https://wa.me/${normalizeWhatsappNumber(whatsapp)}?text=${encodeURIComponent(message)}`
}
