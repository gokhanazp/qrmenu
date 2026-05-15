import type { Metadata } from "next"
import { SeoLanding } from "@/components/seo-landing"
import { getSiteUrl } from "@/lib/seo/jsonld"

const SLUG = "dijital-menu"
const H1 = "Dijital Menü"
const TITLE = "Dijital Menü - Restoranınız İçin Online Menü Çözümü | QR Menülist"
const DESCRIPTION =
  "Restoranınız için modern dijital menü çözümü. QR kod ile erişilen, mobil uyumlu, çoklu dil destekli online menü sistemi. Yapay zeka çevirisi dahil."

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "dijital menü",
    "dijital menü oluşturma",
    "online menü",
    "online menü sistemi",
    "elektronik menü",
    "mobil menü",
    "interaktif menü",
    "dijital restoran menüsü",
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

export default function DijitalMenuPage() {
  return (
    <SeoLanding
      slug={SLUG}
      badge="MODERN ÇÖZÜM"
      h1="Dijital Menü Sistemi"
      h1Highlight="Müşteri Deneyimi"
      subtitle="Klasik basılı menüye veda et. Modern, hızlı, sürekli güncel kalan dijital menü ile müşterilerine fark yarat."
      intro="Dijital menü, restoranların basılı menü kartı yerine müşterilerine QR kod aracılığıyla sunduğu mobil uyumlu, online menü çözümüdür. QR Menülist ile sıfırdan tasarlanmış, hızlı yüklenen, yapay zeka destekli çeviri ile çoklu dil sunan, müşteri istatistiklerini takip eden tam donanımlı bir dijital menü platformuna sahip olursun."
      features={[
        {
          icon: "smartphone",
          title: "Mobil Uyumlu Tasarım",
          description: "Her ekran boyutunda mükemmel görünür. Müşterin telefonunda akıcı çalışır.",
        },
        {
          icon: "speed",
          title: "Saniyede Yüklenir",
          description: "Optimize edilmiş resim formatları (WebP/AVIF) ve cache yapısı ile çok hızlı açılır.",
        },
        {
          icon: "auto_awesome",
          title: "AI Destekli Çeviri",
          description: "Türkçe menünü yapay zeka ile İngilizceye çevir, yabancı turistlere kolay erişim.",
        },
        {
          icon: "palette",
          title: "Marka Renkleri",
          description: "Header, footer, buton renklerini kendi markana uygun özelleştir.",
        },
        {
          icon: "search",
          title: "Menü İçi Arama",
          description: "Müşterin aradığı ürünü saniyede bulsun. Akıllı arama özelliği dahil.",
        },
        {
          icon: "trending_up",
          title: "Davranış Analizi",
          description: "Hangi ürün popüler, hangi saatlerde tarama yoğun — verilerle gör.",
        },
      ]}
      benefitsTitle="Dijital Menüye Geçmenin Faydaları"
      benefits={[
        "Basılı menü baskı maliyeti tamamen sıfırlanır",
        "Fiyat değişikliği anında menüde yansır",
        "Mevsimsel ürünleri kolayca aç/kapat",
        "Stoksuz ürünü tek tıkla gizle",
        "Yabancı müşterilerin için otomatik İngilizce menü",
        "QR kod hijyenik — temassız menü erişimi",
        "Müşteri davranışını veriyle takip et",
        "Restoranın Google'da daha görünür hale gelir",
      ]}
      faq={[
        {
          q: "Dijital menü nedir, nasıl çalışır?",
          a: "Dijital menü, basılı menü kartı yerine müşteriye QR kod üzerinden sunulan online menüdür. Müşteri telefon kamerasıyla QR kodu tarar, restoranın menüsü tarayıcıda açılır.",
        },
        {
          q: "Dijital menü için ayrı bir uygulama indirmek gerekir mi?",
          a: "Hayır. Müşterilerinin telefonuna hiçbir uygulama indirmesi gerekmez. QR kodu tarayıp doğrudan tarayıcıda menüyü görürler.",
        },
        {
          q: "İnternet yoksa dijital menü çalışır mı?",
          a: "Dijital menüye erişim için müşterinin internetinin olması gerekir. Restoran içinde Wi-Fi sunmanı öneririz.",
        },
        {
          q: "Dijital menüyü kendi tasarımıma göre özelleştirebilir miyim?",
          a: "Evet. Logo, hero görseli, renkler (arka plan, metin, buton, fiyat rengi), düzen tipi (grid/list) gibi onlarca özelleştirme seçeneği mevcuttur.",
        },
        {
          q: "Birden fazla dilde menü gösterebilir miyim?",
          a: "Evet. Türkçe ve İngilizce dilleri desteklenir. Yapay zeka çevirisi ile mevcut Türkçe menünü tek tıkla İngilizceye çevirebilirsin.",
        },
      ]}
      ctaTitle="Dijital Menü Devrini Başlat"
      ctaSubtitle="Restoranını modern dijital menü deneyimiyle tanıştır."
    />
  )
}
