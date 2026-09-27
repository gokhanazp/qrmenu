/**
 * Kanal fiyatı kuralı (saf):
 *   use_master_price = true  → QR menü (master) fiyatı
 *   use_master_price = false → price_override varsa o; yoksa platformdaki mevcut fiyat (gönderilmez)
 */
export interface ChannelPriceInput {
  useMasterPrice: boolean
  priceOverride: number | null
  masterPrice: number
}

/** Platforma gönderilecek fiyat; null ise gönderilecek bir şey yok (platform fiyatı korunur). */
export function effectiveChannelPrice(input: ChannelPriceInput): number | null {
  if (input.useMasterPrice) return round2(input.masterPrice)
  if (input.priceOverride !== null && input.priceOverride !== undefined && Number.isFinite(input.priceOverride)) return round2(input.priceOverride)
  return null
}

export function round2(n: number): number {
  return Math.round(n * 100) / 100
}
