import type { Metadata } from "next"
import { SeoLanding } from "@/components/seo-landing"
import { getSiteUrl } from "@/lib/seo/jsonld"

const SLUG = "qr-menu-olusturma"
const TITLE = "QR Menü Oluşturma - 5 Dakikada Hazır | QR Menülist"
const DESCRIPTION =
  "QR menü oluşturma rehberi: kayıt ol, kategori ekle, ürünleri yükle, QR kodunu indir. 5 dakikada profesyonel dijital menüne sahip ol."

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

export default function QrMenuOlusturmaPage() {
  return (
    <SeoLanding
      slug={SLUG}
      badge="3 ADIMDA HAZIR"
      h1="QR Menü Oluşturma"
      h1Highlight="5 Dakikada Bitir"
      subtitle="Restoranın için QR menü oluşturmak hiç bu kadar kolay olmamıştı. Kayıt ol, ürünlerini ekle, QR kodunu indir."
      intro="QR menü oluşturma süreci üç basit adımdan oluşur: önce ücretsiz hesabını oluştur, sonra kategorilerini ve ürünlerini panel üzerinden ekle, son olarak QR kodunu indir ve masalarına yerleştir. Kod yazmaya, tasarım bilgisine ya da teknik yetkinliğe gerek yok — paneli kullanmayı bilen herkes profesyonel bir dijital menü oluşturabilir."
      features={[
        {
          icon: "person_add",
          title: "1. Adım: Kayıt Ol",
          description: "E-posta ve telefonunla 30 saniyede ücretsiz hesap aç. Doğrulama gerekmiyor.",
        },
        {
          icon: "category",
          title: "2. Adım: Kategori Ekle",
          description: "Ana yemek, içecek, tatlı gibi kategorileri sürükle-bırak ile sırala.",
        },
        {
          icon: "restaurant_menu",
          title: "3. Adım: Ürün Yükle",
          description: "Ürün adı, açıklaması, fiyatı ve fotoğrafıyla menünü tamamla.",
        },
        {
          icon: "auto_awesome",
          title: "AI Çeviri",
          description: "Türkçe menünü tek tıkla yapay zeka ile İngilizceye çevir.",
        },
        {
          icon: "qr_code_2",
          title: "QR Kodunu İndir",
          description: "Otomatik oluşan QR kodunu yüksek çözünürlükte PNG olarak indir.",
        },
        {
          icon: "print",
          title: "Bastır ve Yerleştir",
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
          a: "Ücretsiz başlangıç planında menünü hazırlayıp deneyebilirsin. Daha yüksek kapasite ve gelişmiş özellikler için Pro plan mevcuttur.",
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
