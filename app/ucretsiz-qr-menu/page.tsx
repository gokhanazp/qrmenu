import type { Metadata } from "next"
import { SeoLanding } from "@/components/seo-landing"
import { getSiteUrl } from "@/lib/seo/jsonld"

const SLUG = "ucretsiz-qr-menu"
const TITLE = "Ücretsiz QR Menü Oluştur - Kredi Kartı İstemez | QR Menülist"
const DESCRIPTION =
  "Ücretsiz QR menü oluşturma platformu. Başlangıç planıyla menünü hemen hazırla, dene. İleri özellikler için Pro plana yükselt. Kayıt için kredi kartı gerekmez."

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  keywords: [
    "ücretsiz qr menü",
    "ücretsiz qr menü oluşturma",
    "bedava qr menü",
    "ücretsiz dijital menü",
    "ücretsiz restoran menüsü",
    "kayıtsız qr menü",
    "qr menü ücretsiz",
  ],
  alternates: {
    canonical: `${getSiteUrl()}/${SLUG}`,
  },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: `${getSiteUrl()}/${SLUG}`,
    type: "website",
    locale: "tr_TR",
    siteName: "QR Menülist",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
}

export default function UcretsizQrMenuPage() {
  return (
    <SeoLanding
      slug={SLUG}
      badge="ÜCRETSİZ BAŞLA"
      h1="Ücretsiz QR Menü Oluştur"
      h1Highlight="Denemek İçin Bedava"
      subtitle="Restoranın için ücretsiz hesap aç, QR menünü hazırla ve dene. İleri özellikler için Pro plana dilediğinde yükselt."
      intro="QR Menülist ile dakikalar içinde ücretsiz hesap açabilir, restoranın için QR menü hazırlayabilir, QR kodunu indirip kullanmaya başlayabilirsin. Başlangıç planı denemek ve küçük restoranlar için ideal — daha fazla özellik istediğinde Pro plana dilediğin zaman yükseltebilirsin."
      features={[
        {
          icon: "rocket_launch",
          title: "Hızlı Başlangıç",
          description: "Ücretsiz hesap aç, QR menünü 5 dakikada hazırla, denemeye başla.",
        },
        {
          icon: "credit_card_off",
          title: "Kredi Kartı İstemez",
          description: "Ücretsiz kayıt sırasında kredi kartı bilgisi vermenize gerek yok.",
        },
        {
          icon: "qr_code_2",
          title: "QR Kod İndir",
          description: "QR kodunu yüksek çözünürlükte indir, baskıya hazır PNG formatında.",
        },
        {
          icon: "language",
          title: "Çoklu Dil",
          description: "Türkçe + İngilizce menü desteği. Yapay zeka destekli çeviri dahil.",
        },
        {
          icon: "analytics",
          title: "Müşteri İstatistikleri",
          description: "Menünü kaç kişi taradı, hangi saatlerde popüler — temel raporları gör.",
        },
        {
          icon: "trending_up",
          title: "Pro ile Daha Fazlası",
          description: "Gelişmiş özelliklere ihtiyacın olduğunda Pro plana yükselt.",
        },
      ]}
      benefitsTitle="Neden QR Menülist?"
      benefits={[
        "Ücretsiz hesap aç, kredi kartı bilgisi vermeden başla",
        "İlk QR kodunu 5 dakika içinde oluştur",
        "Türkçe + İngilizce çift dil desteği",
        "Yapay zeka destekli menü çevirisi",
        "QR kodunu PNG olarak yüksek çözünürlükte indir",
        "Mobil cihazlarda mükemmel görünen menü tasarımı",
        "Renk, logo ve düzen özelleştirmesi",
        "İhtiyacın büyüdükçe Pro plana yükselt",
      ]}
      faq={[
        {
          q: "QR menüyü ücretsiz deneyebilir miyim?",
          a: "Evet, QR Menülist'te ücretsiz hesap açıp menünü hazırlayabilir, QR kodunu indirip kullanmaya başlayabilirsin. İleri özellikler için Pro plan da mevcuttur.",
        },
        {
          q: "Kredi kartı bilgisi vermem gerekecek mi?",
          a: "Hayır. Ücretsiz hesap açarken yalnızca e-posta, telefon ve restoran adı istiyoruz. Kredi kartı bilgisi gerekmiyor.",
        },
        {
          q: "Pro plan neler sunar?",
          a: "Pro plan, gelişmiş istatistikler, ek özelleştirme ve daha yüksek kapasite gibi ileri özellikler içerir. Detaylı bilgi için WhatsApp üzerinden bize ulaşabilirsin.",
        },
        {
          q: "QR kodumu nasıl indiririm?",
          a: "Kayıt olduktan sonra panelden 'QR Kod' bölümüne gir, indir butonuna bas. QR kodu yüksek çözünürlükte PNG olarak inecek, baskıya hazır.",
        },
        {
          q: "İngilizce menü desteği başlangıç planında var mı?",
          a: "Evet. Türkçe-İngilizce çift dilli menü ve yapay zeka destekli çeviri özelliği başlangıç planında kullanıma açıktır.",
        },
      ]}
      ctaTitle="Restoranını Hemen Dijitalleştir"
      ctaSubtitle="Ücretsiz hesap aç, ilk QR menünü 5 dakikada hazırla."
    />
  )
}
