import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: {
    default: "QR Menü SaaS - Dijital Menü Yönetim Sistemi",
    template: "%s | QR Menü SaaS"
  },
  description: "Restoranlar için modern dijital menü yönetim sistemi. QR kod ile kolay erişim, online menü yönetimi ve müşteri takibi.",
  keywords: [
    "qr menü",
    "dijital menü",
    "online menü",
    "restoran yönetim sistemi",
    "qr kod menü",
    "mobil menü",
    "restoran yazılımı"
  ],
  authors: [{ name: "QR Menü SaaS" }],
  creator: "QR Menü SaaS",
  publisher: "QR Menü SaaS",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    siteName: 'QR Menü SaaS',
    title: 'QR Menü SaaS - Dijital Menü Yönetim Sistemi',
    description: 'Restoranlar için modern dijital menü yönetim sistemi',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'QR Menü SaaS',
    description: 'Restoranlar için dijital menü yönetim sistemi',
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
    // Google Search Console verification (eklenecek)
    // google: 'your-verification-code',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="tr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Work+Sans:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  )
}