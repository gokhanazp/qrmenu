import { TRIAL_DAYS } from './subscription'

/**
 * Ücretsiz teklifin TEK metni.
 *
 * Sorun: site üç ayrı şey söylüyordu — hero'da "İlk 2 ay ücretsiz", alt CTA'da
 * "14 gün ücretsiz", SSS'de "Ücretsiz plan süresiz olarak geçerlidir". Üçü de
 * aynı sayfada. Bu hem dönüşümü düşürüyor hem Google'ın sayfa güvenilirliği
 * değerlendirmesinde olumsuz.
 *
 * Doğrusu koddaki davranış: `TRIAL_DAYS = 60` — ücretsiz planda 2 ay sonunda
 * public menü kapanıyor ve Pro'ya geçmek gerekiyor. Dolayısıyla "süresiz
 * ücretsiz" iddiası ürünle çelişiyordu; her yerde 2 ay yazıyoruz.
 *
 * Deneme süresi değişirse TEK yer: subscription.ts içindeki TRIAL_DAYS.
 */

const MONTHS = Math.round(TRIAL_DAYS / 30)

export const FREE_OFFER = {
  /** Deneme süresi — ay cinsinden ("2") */
  months: String(MONTHS),
  /** Deneme süresi — gün cinsinden ("60") */
  days: String(TRIAL_DAYS),

  /** Rozet / footer / mikro-kopya: "İlk 2 ay ücretsiz · Kredi kartı gerekmez" */
  short: `İlk ${MONTHS} ay ücretsiz · Kredi kartı gerekmez`,

  /** Buton altı tek satır: "İlk 2 ay ücretsiz" */
  badge: `İlk ${MONTHS} ay ücretsiz`,

  /** Kredi kartı vurgusu (ayrı listelemek için) */
  noCard: 'Kredi kartı gerekmez',

  /** Meta description ve intro paragrafları için cümle */
  sentence: `İlk ${MONTHS} ay ücretsiz, kredi kartı gerekmez.`,

  /** SSS cevabı — ürünle birebir uyumlu, abartısız */
  faqAnswer: `Yeni açtığınız hesapta menünüz ilk ${MONTHS} ay (${TRIAL_DAYS} gün) ücretsiz ve tam özellikli olarak yayında kalır; kayıt için kredi kartı bilgisi istemiyoruz. ${MONTHS} ayın sonunda menünüzü yayında tutmak için Pro plana geçmeniz gerekir — panelinizdeki menü, kategori ve ürünler silinmez, Pro'ya geçtiğiniz anda menü yeniden açılır. Fiyat bilgisi için WhatsApp üzerinden bize yazabilirsiniz.`,
} as const
