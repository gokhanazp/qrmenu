import { formatCurrency } from '@/lib/utils/currency'

export interface OrderLine {
  name: string
  price: number
  qty: number
}

export type PaymentMethod = 'cash' | 'card'

export const PAYMENT_METHODS: PaymentMethod[] = ['cash', 'card']

export const PAYMENT_LABELS: Record<'tr' | 'en', Record<PaymentMethod, string>> = {
  tr: { cash: 'Kapıda Nakit Ödeme', card: 'Kapıda Kredi Kartı ile Ödeme' },
  en: { cash: 'Cash on Delivery', card: 'Card on Delivery' },
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
  paymentMethod?: PaymentMethod | null
  address?: string
  note?: string
  isEnglish?: boolean
}): string {
  const lang = input.isEnglish ? 'en' : 'tr'
  const t = input.isEnglish
    ? { title: 'New Order', total: 'Total', payment: 'Payment', address: 'Address', note: 'Note' }
    : { title: 'Yeni Sipariş', total: 'Toplam', payment: 'Ödeme', address: 'Adres', note: 'Not' }

  const lines: string[] = []
  lines.push(`🛒 *${t.title}* - ${input.restaurantName}`)
  lines.push('')
  for (const item of input.items) {
    lines.push(`• ${item.qty} x ${item.name} - ${formatCurrency(item.price * item.qty)}`)
  }
  lines.push('')
  lines.push(`💰 *${t.total}: ${formatCurrency(cartTotal(input.items))}*`)

  const details: string[] = []
  if (input.paymentMethod) {
    details.push(`💳 ${t.payment}: ${PAYMENT_LABELS[lang][input.paymentMethod]}`)
  }
  const address = input.address?.trim()
  if (address) details.push(`📍 ${t.address}: ${address}`)
  const note = input.note?.trim()
  if (note) details.push(`📝 ${t.note}: ${note}`)
  if (details.length) {
    lines.push('')
    lines.push(...details)
  }
  return lines.join('\n')
}

export function buildWhatsappOrderUrl(whatsapp: string, message: string): string {
  return `https://wa.me/${normalizeWhatsappNumber(whatsapp)}?text=${encodeURIComponent(message)}`
}
