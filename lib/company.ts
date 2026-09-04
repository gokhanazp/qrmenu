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

  /** TODO: Resmî şirket unvanı (ör. "Voidu B.V." veya Türkiye tüzel kişiliği) */
  legalName: 'Voidu B.V.',

  /** TODO: Şirketin kuruluş yılı */
  foundedYear: '2024',

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

/** Adresi tek satırlık okunabilir metne çevirir; TODO alanlarını atlar. */
export function addressLine(): string {
  const a = COMPANY.address
  return [a.street, a.district, a.city, a.postalCode, a.country]
    .filter((part) => part && !part.startsWith('TODO'))
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
