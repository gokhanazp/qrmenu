export const CONTACT_WHATSAPP_NUMBER = '905375102084'
export const CONTACT_WHATSAPP_DISPLAY = '+90 537 510 20 84'

export function whatsappUrl(message?: string): string {
  const base = `https://wa.me/${CONTACT_WHATSAPP_NUMBER}`
  if (!message) return base
  return `${base}?text=${encodeURIComponent(message)}`
}
