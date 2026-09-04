import type { Metadata } from "next"
import { SeoLanding } from "@/components/seo-landing"
import { getSiteUrl } from "@/lib/seo/jsonld"
import { FREE_OFFER } from "@/lib/offer"

const SLUG = "ucretsiz-qr-menu"
const TITLE = "Ücretsiz QR Menü Oluştur — Kredi Kartı Gerekmez | QR Menülist"
const DESCRIPTION =
  `Ücretsiz QR menü oluştur: kayıt ol, ürünlerini ekle, QR kodunu indir. Menün ilk ${FREE_OFFER.months} ay tam özellikli ve ücretsiz yayında, kayıt için kredi kartı istemiyoruz. Türkçe-İngilizce menü desteği.`

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
      h1="Ücretsiz QR Menü"
      h1Highlight="Oluştur"
      breadcrumbName="Ücretsiz QR Menü"
      subtitle={`Restoranın için ücretsiz hesap aç, QR menünü hazırla, QR kodunu indir. Menün ilk ${FREE_OFFER.months} ay tam özellikli ve ücretsiz yayında — kredi kartı istemiyoruz.`}
      intro={`QR Menülist ile dakikalar içinde ücretsiz hesap açabilir, restoranın için QR menü hazırlayabilir, QR kodunu indirip masalarına koyabilirsin. Yeni hesaplarda menü ilk ${FREE_OFFER.months} ay (${FREE_OFFER.days} gün) tüm özellikleriyle ücretsiz yayında kalır ve kayıt sırasında kredi kartı bilgisi istemiyoruz. Süre sonunda menüyü yayında tutmak için Pro plana geçmen gerekir; menü, kategori ve ürünlerin silinmez.`}
      features={[
        {
          icon: "rocket_launch",
          title: "Hızlı Başlangıç",
          description: "Ücretsiz hesap aç, QR menünü 5 dakikada hazırla, denemeye başla.",
        },
        {
          icon: "credit_card_off",
          title: "Kredi Kartı İstemez",
          description: `Kayıt sırasında kredi kartı bilgisi vermenize gerek yok. İlk ${FREE_OFFER.months} ay ücretsiz.`,
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
          title: `${FREE_OFFER.months} Ay Sonrası`,
          description: `Süre sonunda menüyü yayında tutmak için Pro plana geçilir. Menü ve ürün verilerin silinmez.`,
        },
      ]}
      benefitsTitle="Neden QR Menülist?"
      benefits={[
        `İlk ${FREE_OFFER.months} ay ücretsiz — kredi kartı bilgisi vermeden başla`,
        "İlk QR kodunu 5 dakika içinde oluştur",
        "Türkçe + İngilizce çift dil desteği",
        "Yapay zeka destekli menü çevirisi",
        "QR kodunu PNG olarak yüksek çözünürlükte indir",
        "Mobil cihazlarda mükemmel görünen menü tasarımı",
        "Renk, logo ve düzen özelleştirmesi",
        "Süre sonunda geçiş yaparken QR kodunu yeniden bastırmana gerek yok",
      ]}
      faq={[
        {
          q: "QR menü gerçekten ücretsiz mi, ne kadar süre?",
          a: FREE_OFFER.faqAnswer,
        },
        {
          q: "Kredi kartı bilgisi vermem gerekecek mi?",
          a: "Hayır. Ücretsiz hesap açarken yalnızca e-posta, telefon ve restoran adı istiyoruz. Kredi kartı bilgisi gerekmiyor.",
        },
        {
          q: `${FREE_OFFER.months} ayın sonunda ne oluyor?`,
          a: `Menünün herkese açık görüntülenmesi durur; panelinize erişiminiz devam eder. Menü, kategori ve ürün verileriniz silinmez — Pro plana geçtiğiniz anda menü aynı adresten ve aynı QR kodla yeniden yayına girer. Yani masadaki QR kodunu tekrar bastırmanız gerekmez.`,
        },
        {
          q: "QR kodumu nasıl indiririm?",
          a: "Kayıt olduktan sonra panelden 'QR Kod' bölümüne gir, indir butonuna bas. QR kodu yüksek çözünürlükte PNG olarak inecek, baskıya hazır.",
        },
        {
          q: "İngilizce menü desteği ücretsiz sürede var mı?",
          a: "Evet. Türkçe-İngilizce çift dilli menü ve yapay zeka destekli çeviri, ücretsiz süre boyunca da kullanıma açıktır.",
        },
      ]}
      ctaTitle="Restoranını Hemen Dijitalleştir"
      ctaSubtitle={`Ücretsiz hesap aç, ilk QR menünü 5 dakikada hazırla. ${FREE_OFFER.short}.`}
    />
  )
}
