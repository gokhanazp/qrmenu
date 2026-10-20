/**
 * Menü başlığındaki logo kutusunun boyutu (`restaurants.logo_size`).
 * Genişlik/yükseklik piksel; görsel kutuya "contain" ile sığdırılır.
 */
export const LOGO_SIZES = {
  sm: { width: 150, height: 60 },
  md: { width: 200, height: 80 },
  lg: { width: 260, height: 100 },
  xl: { width: 320, height: 124 },
} as const

export type LogoSize = keyof typeof LOGO_SIZES
export const LOGO_SIZE_KEYS: LogoSize[] = ['sm', 'md', 'lg', 'xl']
export const DEFAULT_LOGO_SIZE: LogoSize = 'md'

export const LOGO_SIZE_LABELS: Record<'tr' | 'en', Record<LogoSize, string>> = {
  tr: { sm: 'Küçük', md: 'Orta', lg: 'Büyük', xl: 'Çok Büyük' },
  en: { sm: 'Small', md: 'Medium', lg: 'Large', xl: 'Extra large' },
}

export function normalizeLogoSize(value: unknown): LogoSize {
  return typeof value === 'string' && value in LOGO_SIZES ? (value as LogoSize) : DEFAULT_LOGO_SIZE
}

/** Kutu ölçüsü; kategori sayfası gibi küçük başlıklar için `scale` ile küçültülür. */
export function logoBox(size: unknown, scale = 1): { width: number; height: number } {
  const box = LOGO_SIZES[normalizeLogoSize(size)]
  return { width: Math.round(box.width * scale), height: Math.round(box.height * scale) }
}
