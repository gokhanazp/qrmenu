/**
 * Menü başlığındaki logo kutusunun boyutu (`restaurants.logo_size`).
 * Değer ya bir hazır seçenek (sm/md/lg/xl) ya da "GENİŞLİKxYÜKSEKLİK" (örn. "240x90").
 * Görsel kutuya "contain" ile sığdırılır; özel ölçüler güvenli aralığa kırpılır.
 */
export const LOGO_SIZES = {
  sm: { width: 150, height: 60 },
  md: { width: 200, height: 80 },
  lg: { width: 260, height: 100 },
  xl: { width: 320, height: 124 },
} as const

export type LogoPreset = keyof typeof LOGO_SIZES
export const LOGO_SIZE_KEYS: LogoPreset[] = ['sm', 'md', 'lg', 'xl']
export const DEFAULT_LOGO_SIZE: LogoPreset = 'md'

/** Özel ölçü sınırları (px). Başlık 448px genişliğinde; yanlarda menü ve arama düğmeleri var. */
export const LOGO_CUSTOM_LIMITS = { minWidth: 60, maxWidth: 320, minHeight: 30, maxHeight: 160 } as const

export const LOGO_SIZE_LABELS: Record<'tr' | 'en', Record<LogoPreset | 'custom', string>> = {
  tr: { sm: 'Küçük', md: 'Orta', lg: 'Büyük', xl: 'Çok Büyük', custom: 'Özel' },
  en: { sm: 'Small', md: 'Medium', lg: 'Large', xl: 'Extra large', custom: 'Custom' },
}

const CUSTOM_RE = /^(\d{2,3})x(\d{2,3})$/

export function isLogoPreset(value: unknown): value is LogoPreset {
  return typeof value === 'string' && value in LOGO_SIZES
}

export function clampLogoBox(width: number, height: number): { width: number; height: number } {
  const L = LOGO_CUSTOM_LIMITS
  const w = Math.min(L.maxWidth, Math.max(L.minWidth, Math.round(Number(width) || 0)))
  const h = Math.min(L.maxHeight, Math.max(L.minHeight, Math.round(Number(height) || 0)))
  return { width: w, height: h }
}

/** Kayıt için kanonik değer: hazır seçenek veya kırpılmış "GxY". Tanınmayan değer → md. */
export function normalizeLogoSize(value: unknown): string {
  if (isLogoPreset(value)) return value
  const m = typeof value === 'string' ? CUSTOM_RE.exec(value.trim()) : null
  if (m) {
    const { width, height } = clampLogoBox(Number(m[1]), Number(m[2]))
    return `${width}x${height}`
  }
  return DEFAULT_LOGO_SIZE
}

export function isCustomLogoSize(value: unknown): boolean {
  return !isLogoPreset(value) && typeof value === 'string' && CUSTOM_RE.test(value.trim())
}

/** Kutu ölçüsü; kategori sayfası gibi küçük başlıklar için `scale` ile küçültülür. */
export function logoBox(size: unknown, scale = 1): { width: number; height: number } {
  const canonical = normalizeLogoSize(size)
  const box = isLogoPreset(canonical) ? LOGO_SIZES[canonical] : (() => { const m = CUSTOM_RE.exec(canonical)!; return { width: Number(m[1]), height: Number(m[2]) } })()
  return { width: Math.round(box.width * scale), height: Math.round(box.height * scale) }
}
