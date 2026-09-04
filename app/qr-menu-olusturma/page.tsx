import type { Metadata } from "next"
import { SeoLanding } from "@/components/seo-landing"
import { getSiteUrl, howToJsonLd } from "@/lib/seo/jsonld"
import { FREE_OFFER } from "@/lib/offer"

const SLUG = "qr-menu-olusturma"
const YEAR = new Date().getFullYear()
const TITLE = `QR Menü Oluşturma: 6 Adımda Ücretsiz Rehber (${YEAR}) | QR Menülist`
const DESCRIPTION =
  "QR menü oluşturma adım adım: hesap aç, kategori ekle, ürünleri yükle, çeviriyi yap, QR kodunu indir, masaya koy. 5 dakikada hazır, kredi kartı gerekmez."

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  keywords: [
    "qr menü oluşturma",
    "qr menü oluştur",
    "qr menü yapma",
    "qr menü nasıl yapılır",
    "qr menü hazırlama",
    "qr kod menü oluşturma",
    "online qr menü yapma",
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

/*
 * HowTo schema.
 *
 * Bu sorgunun SERP'i çok net bir şey söylüyor: 1. sayfada video paketi ve
 * görsel paketi var, sıralanan içerikler adım adım rehberler. Yani niyet
 * BİLGİLENDİRİCİ, satış sayfası değil. HowTo işaretlemesi Google'a sayfanın
 * tam olarak bu tür bir rehber olduğunu söyler ve adım adım zengin sonuç
 * ihtimalini açar.
 *
 * Adım metinleri sayfadaki "features" bloğuyla birebir örtüşüyor — Google
 * işaretlemenin sayfada karşılığını görmek istiyor.
 */
const howToSchema = howToJsonLd({
  name: "QR Menü Oluşturma",
  description:
    "Restoran veya kafeniz için QR menü oluşturma adımları: hesap açma, kategori ekleme, ürün yükleme, İngilizce çeviri, QR kodu indirme ve masaya yerleştirme.",
  url: `${getSiteUrl()}/${SLUG}`,
  totalMinutes: 5,
  steps: [
    {
      name: "Ücretsiz hesap oluştur",
      text: "E-posta ve telefonunla 30 saniyede ücretsiz hesap aç. Kayıt için kredi kartı bilgisi istenmez.",
      anchor: "adim-1",
    },
    {
      name: "Kategorilerini ekle",
      text: "Ana yemek, içecek, tatlı gibi kategorileri oluştur ve sürükle-bırak ile menüde görünecekleri sıraya diz.",
      anchor: "adim-2",
    },
    {
      name: "Ürünleri yükle",
      text: "Her ürün için ad, açıklama, fiyat ve fotoğraf gir. Fotoğraflı ürünler belirgin şekilde daha çok görüntülenir.",
      anchor: "adim-3",
    },
    {
      name: "İngilizce çeviriyi oluştur",
      text: "Türkçe menünü tek tıkla yapay zeka ile İngilizceye çevir, gerekiyorsa çeviriyi elle düzelt.",
      anchor: "adim-4",
    },
    {
      name: "QR kodunu indir",
      text: "Panelde otomatik oluşan QR kodunu yüksek çözünürlüklü PNG olarak indir. Kod bir daha değişmez.",
      anchor: "adim-5",
    },
    {
      name: "Bastır ve masaya yerleştir",
      text: "QR kodunu masa standına, menü kartına veya vitrine bastır. Bundan sonra fiyat değişikliklerini yalnızca panelden yaparsın.",
      anchor: "adim-6",
    },
  ],
})

export default function QrMenuOlusturmaPage() {
  return (
    <SeoLanding
      slug={SLUG}
      badge="6 ADIMDA HAZIR"
      h1="QR Menü Oluşturma:"
      h1Highlight="Adım Adım Rehber"
      breadcrumbName="QR Menü Oluşturma"
      extraJsonLd={howToSchema}
      subtitle="Restoranın için QR menü oluşturmak hiç bu kadar kolay olmamıştı. Kayıt ol, ürünlerini ekle, QR kodunu indir."
      intro="QR menü oluşturma süreci üç basit adımdan oluşur: önce ücretsiz hesabını oluştur, sonra kategorilerini ve ürünlerini panel üzerinden ekle, son olarak QR kodunu indir ve masalarına yerleştir. Kod yazmaya, tasarım bilgisine ya da teknik yetkinliğe gerek yok — paneli kullanmayı bilen herkes profesyonel bir dijital menü oluşturabilir."
      features={[
        {
          icon: "person_add",
          title: "1. Adım: Ücretsiz Hesap Aç",
          description: "E-posta ve telefonunla 30 saniyede ücretsiz hesap aç. Doğrulama gerekmiyor.",
        },
        {
          icon: "category",
          title: "2. Adım: Kategorileri Ekle",
          description: "Ana yemek, içecek, tatlı gibi kategorileri sürükle-bırak ile sırala.",
        },
        {
          icon: "restaurant_menu",
          title: "3. Adım: Ürünleri Yükle",
          description: "Ürün adı, açıklaması, fiyatı ve fotoğrafıyla menünü tamamla.",
        },
        {
          icon: "auto_awesome",
          title: "4. Adım: İngilizce Çeviri",
          description: "Türkçe menünü tek tıkla yapay zeka ile İngilizceye çevir.",
        },
        {
          icon: "qr_code_2",
          title: "5. Adım: QR Kodunu İndir",
          description: "Otomatik oluşan QR kodunu yüksek çözünürlükte PNG olarak indir.",
        },
        {
          icon: "print",
          title: "6. Adım: Bastır ve Yerleştir",
          description: "QR kodunu masa stickerlarına ya da menü kartlarına bas, müşterilerin taransın.",
        },
      ]}
      benefitsTitle="QR Menü Oluşturmanın Avantajları"
      benefits={[
        "Basılı menü maliyetini büyük oranda azaltır",
        "Fiyat ve ürün güncellemesi anında yapılır",
        "Müşteriye temassız, hijyenik deneyim sunar",
        "Yabancı turistler için otomatik İngilizce menü",
        "Hangi ürünün ilgi gördüğünü istatistiklerle gör",
        "Yeni ürünü 30 saniyede menüye ekle",
        "QR kodunu istediğin zaman yeniden indir",
        "Restoran sahibi olarak SEO faydası — Google'da çık",
      ]}
      faq={[
        {
          q: "QR menü oluşturmak ne kadar sürer?",
          a: "Hesap açtıktan sonra ilk QR menünü ortalama 5-10 dakikada oluşturabilirsin. Süre, ekleyeceğin ürün sayısına bağlıdır.",
        },
        {
          q: "QR menü oluşturmak için teknik bilgi gerekir mi?",
          a: "Hayır. Panel arayüzü tamamen kullanıcı dostu. Kod yazma ya da tasarım bilgisi gerekmiyor. Sürükle-bırak ile çalışıyorsun.",
        },
        {
          q: "QR kodumu nasıl test ederim?",
          a: "Panelden indirdiğin QR kodu telefonunla tara, menü sayfasının açıldığını gör. Aynı şekilde müşterilerin de görecek.",
        },
        {
          q: "Menüde ne kadar ürün gösterebilirim?",
          a: `Deneme süresinde ürün sayısında pratik bir sınır yoktur; menünü olduğu gibi girebilirsin. Menün ilk ${FREE_OFFER.months} ay ücretsiz yayında kalır, sonrasında yayında tutmak için Pro plana geçmen gerekir.`,
        },
        {
          q: "QR menüyü sonradan güncelleyebilir miyim?",
          a: "Evet. Panelden istediğin anda fiyat, açıklama, fotoğraf değişikliği yapabilirsin. QR kod aynı kalır, müşteri taradığında yeni menüyü görür.",
        },
      ]}
      ctaTitle="QR Menünü Şimdi Oluştur"
      ctaSubtitle="Ücretsiz hesap aç, 5 dakikada ilk QR menünü hazırla."
    />
  )
}
