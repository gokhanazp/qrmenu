/**
 * Kurumsal ve yasal bilgiler — TEK KAYNAK.
 *
 * /hakkimizda, /iletisim, /kvkk, /gizlilik-politikasi, /kullanim-sartlari,
 * /cerez-politikasi sayfaları ve LocalBusiness / Organization schema'ları
 * bu dosyadan besleniyor. Bilgi güncellemesi için başka dosyaya dokunmak
 * gerekmiyor.
 *
 * ⚠️ TODO ile işaretli alanlar doldurulmadan yasal sayfalar KVKK açısından
 * eksik sayılır. Aşağıdaki `IS_COMPLETE` bayrağı false olduğu sürece yasal
 * sayfalar "bilgiler güncelleniyor" uyarısı gösterir.
 */

export const COMPANY = {
  /** Ticari marka / site adı */
  brand: 'QR Menülist',

  /**
   * TODO: Resmî şirket unvanı (tüzel kişilik adı).
   *
   * Doldurulmadığı sürece yasal metinlerde ve schema'da marka adı
   * ("QR Menülist") kullanılır — bkz. `legalEntity()`. Yanlış veya
   * doğrulanamayan bir unvan yayınlamak, hiç yayınlamamaktan kötüdür.
   */
  legalName: 'TODO: Resmî şirket unvanı',

  /**
   * TODO: Şirketin kuruluş yılı (ör. '2025').
   *
   * Doldurulmadığı sürece /hakkimizda'da ve Organization schema'sında
   * gösterilmez — uydurma bir kuruluş yılı yayınlamıyoruz.
   */
  foundedYear: 'TODO',

  /** TODO: Açık adres (cadde, no, ilçe, il, ülke) */
  address: {
    street: 'TODO: Cadde / Sokak No',
    district: 'TODO: İlçe',
    city: 'TODO: İl',
    postalCode: 'TODO',
    country: 'Türkiye',
    countryCode: 'TR',
  },

  /** TODO: Vergi dairesi ve vergi kimlik numarası (KVKK aydınlatma metni için) */
  taxOffice: 'TODO: Vergi Dairesi',
  taxNumber: 'TODO: VKN',

  /** TODO: Kurumsal e-posta adresleri */
  email: 'TODO@qrmenulist.com',
  /** KVKK veri sahibi başvuruları için ayrı adres kullanılıyorsa burayı değiştir */
  privacyEmail: 'TODO@qrmenulist.com',

  /** Çalışma saatleri — schema.org openingHours formatı */
  openingHours: {
    display: 'Hafta içi 09:00 – 18:00',
    schema: ['Mo-Fr 09:00-18:00'],
  },

  /** TODO: Sosyal medya profilleri (boş bırakılanlar footer'da gösterilmez) */
  social: {
    instagram: '',
    youtube: '',
    linkedin: '',
    x: '',
  },
} as const

/**
 * Tüm TODO alanları doldurulduğunda bunu `true` yap — yasal sayfalardaki
 * "bilgiler güncelleniyor" uyarısı kalkar.
 */
export const COMPANY_INFO_COMPLETE = false

/** Yasal metinlerin son güncellenme tarihi (metni değiştirdikçe güncelle) */
export const LEGAL_LAST_UPDATED = '2026-09-04'

export function formatLegalDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

/** Unvan doldurulmuş mu? */
export function hasLegalName(): boolean {
  return !COMPANY.legalName.startsWith('TODO')
}

/**
 * Yasal metinlerde ve schema'da kullanılacak taraf adı.
 * Unvan girilmediyse marka adına düşer, böylece cümleler
 * "TODO: ..." ya da boş görünmez.
 */
export function legalEntity(): string {
  return hasLegalName() ? COMPANY.legalName : COMPANY.brand
}

/** Adresi tek satırlık okunabilir metne çevirir; TODO alanlarını atlar. */
export function addressLine(): string {
  const a = COMPANY.address
  const filled = (v: string) => Boolean(v) && !v.startsWith('TODO')

  // Ülke tek başına adres sayılmaz. `country` TODO olmadığı için filtreden
  // geçiyor ve adres alanı "Türkiye" olarak görünüyordu; en azından ilçe veya
  // il girilmediyse hiç adres göstermiyoruz.
  if (!filled(a.district) && !filled(a.city)) return ''

  return [a.street, a.district, a.city, a.postalCode, a.country]
    .filter(filled)
    .join(', ')
}

export function socialLinks(): Array<{ label: string; url: string }> {
  const s = COMPANY.social
  return [
    { label: 'Instagram', url: s.instagram },
    { label: 'YouTube', url: s.youtube },
    { label: 'LinkedIn', url: s.linkedin },
    { label: 'X', url: s.x },
  ].filter((item) => Boolean(item.url))
}
