import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { LocaleProvider } from "@/lib/i18n/use-locale"
import Script from "next/script"

const inter = Inter({ subsets: ["latin"] })

// Get the site URL with proper fallback
function getSiteUrl(): string {
  // Check for Vercel URL first (automatically set by Vercel)
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }
  // Then check for custom site URL
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL
  }
  // Default fallback for local development
  return 'http://localhost:3000'
}

export const metadata: Metadata = {
  title: {
    default: "Ücretsiz QR Menü Oluşturma | Dijital Menü | QR Menülist",
    template: "%s | QR Menülist"
  },
  icons: {
    icon: '/qrmenu-logo.png',
    apple: '/qrmenu-logo.png',
  },
  description: "Ücretsiz QR menü oluştur, restoranın için dijital menü hazırla. QR kod ile müşterilerin menüye anında erişsin. Kayıt yok, kredi kartı yok - hemen başla!",
  keywords: [
    "qr menü",
    "ücretsiz qr menü",
    "qr menü oluşturma",
    "qr menü oluştur",
    "qr menü yapma",
    "qr kod menü",
    "qr kod menü oluşturma",
    "dijital menü",
    "dijital menü oluşturma",
    "online menü",
    "online menü oluşturma",
    "restoran qr menü",
    "kafe qr menü",
    "restoran menü programı",
    "restoran yönetim sistemi",
    "menü yönetim sistemi",
    "mobil menü",
    "ücretsiz dijital menü",
    "menü kartı qr kod",
    "yapay zeka menü çevirisi",
    "ai menü çevirisi",
    "otomatik menü çevirisi",
    "ingilizce menü çevirisi",
    "qr menülist",
  ],
  authors: [{ name: "QR Menülist" }],
  creator: "QR Menülist",
  publisher: "QR Menülist",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(getSiteUrl()),
  alternates: {
    canonical: '/',
    languages: {
      'tr-TR': '/',
      'en-US': '/?lang=en',
      'x-default': '/',
    },
  },
  manifest: '/manifest.webmanifest',
  applicationName: 'QR Menülist',
  appleWebApp: {
    capable: true,
    title: 'QR Menülist',
    statusBarStyle: 'black-translucent',
  },
  category: 'business',
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    alternateLocale: ['en_US'],
    siteName: 'QR Menülist',
    title: 'Ücretsiz QR Menü Oluşturma | Dijital Menü | QR Menülist',
    description: 'Ücretsiz QR menü oluştur, restoranın için dijital menü hazırla. QR kod ile müşterilerin menüye anında erişsin. Kayıt yok, kredi kartı yok - hemen başla!',
    url: getSiteUrl(),
    images: [
      {
        url: '/qrmenu-logo.png',
        width: 512,
        height: 512,
        alt: 'QR Menülist - Ücretsiz QR Menü Oluşturma',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ücretsiz QR Menü Oluşturma | QR Menülist',
    description: 'Restoranın için ücretsiz dijital QR menü hazırla. Kayıt yok, kredi kartı yok.',
    images: ['/qrmenu-logo.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'L6v3-SFuY2V1BWHuXDMojb2oY1Etf1ESZdJJpHED9YY',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
  colorScheme: 'light dark',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="tr">
      <head>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-MMDJC2TFFP"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-MMDJC2TFFP');
          `}
        </Script>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Work+Sans:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap" rel="stylesheet" />
      </head>
      <body className={inter.className}>
        <LocaleProvider>
          {children}
        </LocaleProvider>
      </body>
    </html>
  )
}