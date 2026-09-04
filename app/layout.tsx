import type { Metadata, Viewport } from "next"
import { Inter, Work_Sans } from "next/font/google"
import "./globals.css"
import { LocaleProvider } from "@/lib/i18n/use-locale"
import { getSiteUrl } from "@/lib/seo/jsonld"
import { FREE_OFFER } from "@/lib/offer"
import Script from "next/script"

const inter = Inter({ subsets: ["latin", "latin-ext"], display: "swap" })

// Restoran menü sayfaları Work Sans kullanıyor. Eskiden fonts.googleapis.com'dan
// render-blocking bir <link> ile çekiliyordu; next/font ile self-host edilince
// üçüncü parti bağlantı ve FOUT ortadan kalkıyor. latin-ext alt kümesi Türkçe
// karakterler (ş, ğ, ı, İ, ö, ü, ç) için gerekli.
const workSans = Work_Sans({
  subsets: ["latin", "latin-ext"],
  display: "swap",
  variable: "--font-work-sans",
})

const SITE_TITLE = "QR Menü | Restoran ve Kafeler İçin Dijital Menü — QR Menülist"
const SITE_DESCRIPTION = `Restoranın için 5 dakikada QR menü oluştur. ${FREE_OFFER.sentence} Sınırsız güncelleme, yapay zeka çevirisi, görüntüleme istatistikleri.`

// Get the site URL with proper fallback
export const metadata: Metadata = {
  title: {
    default: SITE_TITLE,
    template: "%s | QR Menülist"
  },
  icons: {
    icon: '/qrmenu-logo.png',
    apple: '/qrmenu-logo.png',
  },
  description: SITE_DESCRIPTION,
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
  // hreflang BİLEREK yok. Eskiden tr-TR / en-US / x-default üçü de aynı URL'e
  // (ana sayfaya) bakıyordu; Google böyle bir işaretlemeyi ya yok sayar ya da
  // çelişki olarak raporlar. Pazarlama sayfalarının (ana sayfa, landing'ler,
  // blog) İngilizce karşılığı yok — dolayısıyla alternate verilecek bir şey de
  // yok. Gerçek çoklu dil yalnızca restoran menülerinde var ve oradaki
  // alternate'ler restorant/[slug] generateMetadata içinde, sadece restoranın
  // supported_languages değerine göre üretiliyor.
  alternates: {
    canonical: '/',
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
    siteName: 'QR Menülist',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
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
    title: SITE_TITLE,
    description: `Restoranın için QR menü oluştur. ${FREE_OFFER.sentence}`,
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
    <html lang="tr" className={workSans.variable}>
      <head>
        {/*
          fonts.googleapis.com'a giden iki render-blocking <link> kaldırıldı:
            1) Work Sans   -> next/font ile self-host ediliyor (yukarı bak)
            2) Material Symbols Outlined -> inline SVG'ye çevrildi
               (components/icon.tsx). Ölçülen FCP 2,77 sn'nin ana sebebi buydu:
               sayfada 70'e yakın ikon span'i vardı ve ikon fontu ~150 KB.
          Material Symbols yalnızca /panel ve /admin içinde kullanılmaya devam
          ediyor; stylesheet o layout'ların içinde yükleniyor (ikisi de auth
          arkasında ve robots.txt'te disallow, yani SEO'yu etkilemiyor).
        */}
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
            gtag('config', 'AW-18341719321');
          `}
        </Script>
      </head>
      <body className={inter.className}>
        <LocaleProvider>
          {children}
        </LocaleProvider>
      </body>
    </html>
  )
}