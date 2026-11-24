import { defineCloudflareConfig } from '@opennextjs/cloudflare'
import staticAssetsIncrementalCache from '@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache'

/**
 * Cloudflare (OpenNext) cache ayarı.
 *
 * Build çıktısında ISR sayfası yok: /restorant/* sayfaları cookie okuduğu için
 * her istekte dinamik üretiliyor (ƒ), Supabase fetch'leri de Next 15'te
 * varsayılan olarak cache'lenmiyor. Önceden üretilen sayfalar yalnızca statik
 * (○) ve SSG (●, blog) sayfaları. Bu yüzden ek servis (R2/D1/Durable Object)
 * gerektirmeyen, build'deki HTML'i statik asset olarak sunan cache yeterli.
 *
 * İleride gerçek ISR (revalidate ile cache'lenen sayfa) eklenirse R2
 * incremental cache + DO queue + D1 tag cache'e geçilmeli:
 * https://opennext.js.org/cloudflare/caching
 */
export default defineCloudflareConfig({
  incrementalCache: staticAssetsIncrementalCache,
  enableCacheInterception: true,
})
