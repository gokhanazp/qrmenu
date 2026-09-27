/**
 * next/image yalnızca next.config.js'te izinli alan adlarını optimize eder
 * (Supabase Storage, microlink). Pazaryerinden gelen görsel adresleri
 * depomuza KOPYALANMAZ; doğrudan kullanılır ve optimizasyon atlanır.
 */
const OPTIMIZED_HOSTS = [/\.supabase\.co$/i, /^api\.microlink\.io$/i]

export function isOptimizedImageHost(url: string | null | undefined): boolean {
  if (!url) return true
  if (url.startsWith('/')) return true
  try {
    const host = new URL(url).hostname
    return OPTIMIZED_HOSTS.some((re) => re.test(host))
  } catch {
    return true
  }
}

/** `<Image {...imageProps(url)} />` — dış adreslerde unoptimized */
export function imageProps(url: string | null | undefined): { unoptimized?: boolean } {
  return isOptimizedImageHost(url) ? {} : { unoptimized: true }
}
