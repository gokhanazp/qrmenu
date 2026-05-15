import type { Metadata } from "next"
import { SeoLanding } from "@/components/seo-landing"
import { getSiteUrl } from "@/lib/seo/jsonld"

const SLUG = "ucretsiz-qr-menu"
const H1 = "Ücretsiz QR Menü"
const TITLE = "Ücretsiz QR Menü Oluştur - Kredi Kartı İstemez | QR Menülist"
const DESCRIPTION =
  "Tamamen ücretsiz QR menü oluşturma platformu. Restoranın için sınırsız menü, kategori ve ürün ekle. Kayıt için kredi kartı gerekmez, gizli ücret yok."

export const metadata: Metadata = {
  title: TITLE,
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
      badge="100% ÜCRETSİZ"
      h1="Ücretsiz QR Menü Oluştur"
      h1Highlight="Hemen Başla"
      subtitle="Restoranın için tamamen ücretsiz QR menü hazırla. Kredi kartı yok, deneme süresi yok, gizli ücret yok."
      intro="QR Menülist ile dakikalar içinde ücretsiz QR menüne sahip olabilirsin. Sınırsız sayıda kategori ve ürün ekleyebilir, menünü dilediğin gibi özelleştirebilir, QR kodunu indirip masalarına yerleştirebilirsin. Tüm bu özellikler hiçbir aylık ücret ödemeden, tamamen ücretsiz kullanımına açık."
      features={[
        {
          icon: "money_off",
          title: "Tamamen Ücretsiz",
          description: "Aylık ya da yıllık ödeme yok. Üye ol, menünü oluştur, QR kodunu kullan.",
        },
        {
          icon: "credit_card_off",
          title: "Kredi Kartı İstemez",
          description: "Kayıt sırasında kredi kartı bilgisi vermenize gerek yok. Hemen başla.",
        },
        {
          icon: "all_inclusive",
          title: "Sınırsız Ürün",
          description: "Kaç ürün ya da kategori eklersen ekle, ücret limitiyle karşılaşmazsın.",
        },
        {
          icon: "qr_code_2",
          title: "Ücretsiz QR Kod",
          description: "QR kodunu yüksek çözünürlükte ücretsiz indir, baskıya hazır PNG formatında.",
        },
        {
          icon: "language",
          title: "Çoklu Dil",
          description: "Türkçe + İngilizce menü desteği ücretsiz. Yapay zeka çevirisi dahil.",
        },
        {
          icon: "analytics",
          title: "Müşteri İstatistikleri",
          description: "Menünü kaç kişi taradı, hangi saatlerde popüler — hepsi ücretsiz raporlanır.",
        },
      ]}
      benefitsTitle="Neden Ücretsiz QR Menülist?"
      benefits={[
        "Hiçbir kredi kartı bilgisi vermeden hesap aç",
        "İlk QR kodunu 5 dakika içinde oluştur",
        "Sınırsız ürün ve kategori ekleme hakkı",
        "Yapay zeka destekli İngilizce çeviri ücretsiz",
        "QR kodunu PNG olarak yüksek çözünürlükte indir",
        "Mobil cihazlarda mükemmel görünen menü tasarımı",
        "Renk, font ve düzen özelleştirmesi ücretsiz",
        "Müşterilerin menüyü kaç kez taradığını gör",
      ]}
      faq={[
        {
          q: "QR menü gerçekten ücretsiz mi?",
          a: "Evet, QR Menülist platformunda menü oluşturma, QR kod indirme ve temel istatistik takibi tamamen ücretsizdir. Aylık ücret ya da deneme süresi yoktur.",
        },
        {
          q: "Kredi kartı bilgisi vermem gerekecek mi?",
          a: "Hayır. Kayıt sırasında yalnızca e-posta, telefon ve restoran adı istiyoruz. Kredi kartı bilgisi gerekmiyor.",
        },
        {
          q: "Kaç tane ürün ekleyebilirim?",
          a: "Sınırsız. İstediğin kadar kategori ve ürün ekleyebilirsin, ücretsiz hesabında üst limit yoktur.",
        },
        {
          q: "QR kodumu nasıl indiririm?",
          a: "Kayıt olduktan sonra panelden 'QR Kod' bölümüne gir, indir butonuna bas. QR kodu yüksek çözünürlükte PNG olarak inecek, baskıya hazır.",
        },
        {
          q: "İngilizce menü için ek ücret var mı?",
          a: "Hayır. Türkçe-İngilizce çift dilli menü ve yapay zeka destekli çeviri özelliği ücretsiz hesabında dahildir.",
        },
      ]}
      ctaTitle="Restoranını Hemen Dijitalleştir"
      ctaSubtitle="Ücretsiz hesabını aç, ilk QR menünü 5 dakikada oluştur."
    />
  )
}
