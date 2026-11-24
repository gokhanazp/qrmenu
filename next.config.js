/** @type {import('next').NextConfig} */
const securityHeaders = [
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN',
  },
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  },
]

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      {
        // Ana sayfadaki "Müşterilerimizin Menüleri" ekran görüntüleri.
        // next/image üzerinden geçirilince Cloudflare Images (IMAGES binding)
        // görseli optimize edip cache'liyor; böylece her ziyarette üçüncü
        // parti API'ye gidilmiyor ve API düşse bile bölüm boş kalmıyor.
        protocol: 'https',
        hostname: 'api.microlink.io',
        port: '',
        pathname: '/**',
      },
    ],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Not: Cloudflare'de minimumCacheTTL dikkate alınmıyor (Vercel'e özgüydü)
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
  },
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ['@supabase/supabase-js', '@supabase/ssr'],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ]
  },
  async redirects() {
    return [
      {
        // Google Ads reklamlarının hedef URL'i buraya gidiyor ve 404 dönüyordu
        // — her tıklama boşa gidiyor, Ads kalite puanı düşüyordu.
        // ⚠️ Bu yönlendirme sadece eski linkleri kurtarır; Ads panelindeki
        // "Final URL" alanını da /qr-menu-olusturma yapmak gerekiyor.
        source: '/qr-menu/olustur',
        destination: '/qr-menu-olusturma',
        permanent: true,
      },
      {
        source: '/qr-menu/olustur/:path*',
        destination: '/qr-menu-olusturma',
        permanent: true,
      },
      // Eski/yanlış yazılmış para sayfası adresleri
      {
        source: '/qr-menu-olustur',
        destination: '/qr-menu-olusturma',
        permanent: true,
      },
      {
        source: '/ucretsiz-qr-menu-olustur',
        destination: '/ucretsiz-qr-menu',
        permanent: true,
      },
    ]
  },
}

module.exports = nextConfig

// `next dev` sırasında Cloudflare binding'lerine (R2, D1, Images...) erişim
if (process.env.NODE_ENV === 'development') {
  import('@opennextjs/cloudflare').then((m) => m.initOpenNextCloudflareForDev())
}
