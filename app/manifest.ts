import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'QR Menülist — QR Menü Oluşturma',
    short_name: 'QR Menülist',
    // Metin lib/offer.ts ile aynı teklifi söylemeli — manifest bir statik
    // dosya olarak üretildiği için değer buraya elle yazılıyor.
    description:
      'Restoranın için QR menü oluştur, dijital menü hazırla. İlk 2 ay ücretsiz, kredi kartı gerekmez.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0a0a0a',
    theme_color: '#8b5cf6',
    orientation: 'portrait-primary',
    scope: '/',
    lang: 'tr-TR',
    categories: ['food', 'business', 'productivity'],
    icons: [
      {
        src: '/qrmenu-logo.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/qrmenu-logo.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/qrmenu-logo.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  }
}
