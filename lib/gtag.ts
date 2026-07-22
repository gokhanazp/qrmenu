// Google Ads dönüşüm (conversion) yardımcıları.
// Global gtag, app/layout.tsx içinde yükleniyor (GA: G-MMDJC2TFFP, Ads: AW-18341719321).

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
  }
}

/** Google Ads "Satın alma / Kayıt" dönüşüm event'ini gönderir. */
export function trackSignupConversion(): void {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return
  window.gtag('event', 'conversion', {
    send_to: 'AW-18341719321/dSjOCIzxydQcEJnagapE',
    value: 1.0,
    currency: 'TRY',
    transaction_id: '',
  })
}
