/**
 * Ana sayfada gösterilen sayılar — TEK KAYNAK.
 *
 * Sorun: aynı sayfada hero'da "50K+ Görüntüleme", alt bantta "1M+ Menü
 * Görüntüleme" ve "50K+ QR Tarama" yazıyordu. Üçü birbiriyle çelişiyor ve
 * hem dönüşümü hem Google'ın sayfa güvenilirliği değerlendirmesini düşürüyor.
 *
 * ⚠️ TODO: Aşağıdaki değerleri panel istatistiklerinizdeki GERÇEK sayılarla
 * değiştirin. Doğrulanamayan sayı, sayfada iddia edilen puan/yorum kadar
 * riskli değil ama abartılı sayılar dönüşümü de düşürüyor. İdeali bu değerleri
 * ileride Supabase'den (scans / views toplamı) hesaplamak.
 */
export const SITE_STATS = {
  restaurants: '500+',
  menuViews: '1M+',
  qrScans: '50K+',
  satisfaction: '99%',
} as const
