// Google Ads dönüşüm (conversion) yardımcıları.
// Global gtag, app/layout.tsx içinde yükleniyor (GA: G-MMDJC2TFFP, Ads: AW-18341719321).

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
  }
}

/**
 * Telefonu E.164 formatına yaklaştırır (+905551234567).
 * Gelişmiş dönüşümlerde telefon E.164 beklenir; gtag ayrıca normalize/hash eder.
 */
function normalizePhone(phone?: string): string | undefined {
  if (!phone) return undefined
  let p = phone.replace(/[^\d+]/g, '') // rakam ve + dışını temizle
  if (!p) return undefined
  if (p.startsWith('+')) return p
  if (p.startsWith('90')) return '+' + p
  if (p.startsWith('0')) return '+90' + p.slice(1) // 0555... -> +90555...
  return '+90' + p // ülke kodsuz girilmişse Türkiye varsay
}

/**
 * Google Ads "Satın alma / Kayıt" dönüşüm event'ini gönderir.
 * Gelişmiş dönüşümler için kullanıcı verisi (email/telefon) de iletilir;
 * gtag bu veriyi tarayıcıda normalize edip hash'ler (açık metin gönderilmez).
 */
export function trackSignupConversion(userData?: { email?: string; phone?: string }): void {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return

  const email = userData?.email?.trim().toLowerCase()
  const phone = normalizePhone(userData?.phone)

  if (email || phone) {
    window.gtag('set', 'user_data', {
      ...(email && { email }),
      ...(phone && { phone_number: phone }),
    })
  }

  window.gtag('event', 'conversion', {
    send_to: 'AW-18341719321/dSjOCIzxydQcEJnagapE',
    value: 1.0,
    currency: 'TRY',
    transaction_id: '',
  })
}
