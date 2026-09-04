/**
 * Ana sayfadaki müşteri yorumları ve `AggregateRating` schema'sının kaynağı.
 *
 * NEDEN BOŞ: Sayfada daha önce Ahmet Kaya / Lezzet Durağı, Mehmet Yılmaz /
 * Pizza House, Zeynep Demir / Cafe Mocha imzalı üç yorum vardı — hiçbiri
 * gerçek müşteri listesiyle örtüşmüyordu. Aynı zamanda schema'da
 * `aggregateRating: 4.9 / ratingCount: 500` işaretlemesi duruyordu.
 *
 * Google'ın yapılandırılmış veri politikası, sayfada doğrulanabilir karşılığı
 * olmayan puan/yorum işaretlemesini MANUEL İŞLEM (manual action) sebebi
 * sayıyor. Bu yüzden uydurma yorumlar kaldırıldı; yerine gerçek yorum
 * konmadığı için de aggregateRating üretilmiyor.
 *
 * NASIL DOLDURULUR:
 *   1. 3–5 gerçek müşteriden isim + işletme + puan + yorum izni al
 *      (WhatsApp'tan 10 dakikalık iş — zaten iletişimdesin).
 *   2. Aşağıdaki diziye ekle. `slug` verirsen yorum, o restoranın canlı
 *      menüsüne link olur — hem doğrulanabilirlik hem iç link kazancı.
 *   3. Dizi boş olmadığı anda hem yorumlar bölümü hem `AggregateRating` +
 *      `Review` schema'sı otomatik geri gelir; reviewCount gerçek sayı olur.
 *
 * Gerçek müşteriler (referans olarak kullanılabilecekler): L'amour Chocolate &
 * Coffee, Çebi Döner, Riverside Burgers, Verna Cafe & Bistro, Hilton Garden
 * Inn Pendik, Sea Soul Beach Hotel, Ciğerci Atilla Usta, Terass Restorant.
 */

export type Testimonial = {
  /** Yorumu yapan kişinin gerçek adı */
  name: string
  /** İşletme adı + rolü, ör. "Çebi Döner — İşletme Sahibi" */
  role: string
  /** Avatar yerine kullanılan baş harfler */
  initials: string
  /** 1–5 arası puan */
  rating: number
  /** Yorumun kendisi — müşterinin kendi cümleleri */
  text: string
  /** Varsa restoranın site içindeki slug'ı (canlı menüye link verilir) */
  slug?: string
}

export const TESTIMONIALS: Testimonial[] = [
  // ÖRNEK (yorumu aldıktan sonra yorum işaretini kaldır ve gerçek veriyi yaz):
  // {
  //   name: 'Gerçek İsim',
  //   role: 'Çebi Döner — İşletme Sahibi',
  //   initials: 'Gİ',
  //   rating: 5,
  //   text: 'Müşterinin kendi cümleleriyle yorumu.',
  //   slug: 'cebi-doner',
  // },
]

/** Sayfada listelenen yorumlardan hesaplanan ortalama; yorum yoksa null. */
export function aggregateRating(): { ratingValue: string; reviewCount: number } | null {
  if (TESTIMONIALS.length === 0) return null
  const total = TESTIMONIALS.reduce((sum, t) => sum + t.rating, 0)
  return {
    ratingValue: (total / TESTIMONIALS.length).toFixed(1),
    reviewCount: TESTIMONIALS.length,
  }
}

/**
 * Ana sayfada "Güvenilir markalar tarafından tercih ediliyor" bölümünde
 * gösterilen GERÇEK müşteriler. Eskiden burada Pizza House / Sushi Master /
 * Cafe Mocha gibi uydurma isimler vardı; artık her biri sitedeki canlı
 * menüsüne link — yani hem doğrulanabilir hem iç link.
 */
export const REFERENCE_CUSTOMERS: Array<{ name: string; slug: string; icon: string }> = [
  { name: "L'amour Chocolate & Coffee", slug: 'lamour-chocolate-coffee', icon: 'local_cafe' },
  { name: 'Çebi Döner', slug: 'cebi-doner', icon: 'kebab_dining' },
  { name: 'Riverside Burgers', slug: 'riverside-burgers', icon: 'lunch_dining' },
  { name: 'Verna Cafe & Bistro', slug: 'verna-cafe-bistro', icon: 'local_cafe' },
  { name: 'Terass Restorant', slug: 'terass-restorant', icon: 'restaurant' },
]
