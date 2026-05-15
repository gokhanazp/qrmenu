import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'QR Menülist - Ücretsiz QR Menü Oluşturma',
    short_name: 'QR Menülist',
    description:
      'Ücretsiz QR menü oluştur, restoranın için dijital menü hazırla. Başlangıç planı ücretsiz, ileri özellikler için Pro plan mevcut.',
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
