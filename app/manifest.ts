import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'QR Menülist - Dijital Menü Yönetim Sistemi',
    short_name: 'QR Menülist',
    description:
      'Restoranlar için modern dijital menü yönetim sistemi. QR kod ile kolay erişim, online menü yönetimi ve müşteri takibi.',
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
