import type { Metadata } from "next"
import { SeoLanding } from "@/components/seo-landing"
import { getSiteUrl } from "@/lib/seo/jsonld"

const SLUG = "restoran-menu-programi"
const TITLE = "Restoran Menü Programı - Online Menü Yönetimi | QR Menülist"
const DESCRIPTION =
  "Restoran menü programı arayanlar için tam donanımlı online menü yönetim sistemi. Kategori, ürün, fiyat, görsel yönetimi ve QR kod entegrasyonu bir arada."

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  keywords: [
    "restoran menü programı",
    "restoran menü yönetim sistemi",
    "kafe menü programı",
    "restoran yazılımı",
    "menü yönetim yazılımı",
    "online menü yönetimi",
    "menü düzenleme programı",
    "restoran menü uygulaması",
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

export default function RestoranMenuProgramiPage() {
  return (
    <SeoLanding
      slug={SLUG}
      badge="PROFESYONEL ÇÖZÜM"
      h1="Restoran Menü Programı"
      h1Highlight="Tam Donanımlı"
      subtitle="Restoranını profesyonel yönetmek için ihtiyacın olan tüm özellikler tek bir panelde. Menü, kategori, fiyat, görsel, dil ve istatistik yönetimi."
      intro="Restoran menü programı, restoran sahiplerinin menülerini online ortamda yönetmesini sağlayan kapsamlı bir yazılım çözümüdür. QR Menülist, restoranlar ve kafeler için özel olarak tasarlanmış, kategori-ürün hiyerarşisi, çoklu dil yönetimi, görsel yükleme, fiyat takibi, müşteri istatistikleri ve QR kod entegrasyonu sunan profesyonel bir restoran menü programıdır."
      features={[
        {
          icon: "dashboard",
          title: "Yönetim Paneli",
          description: "Tek bir panelden tüm menünü, ürünlerini ve istatistiklerini yönet.",
        },
        {
          icon: "image",
          title: "Görsel Yönetimi",
          description: "Ürün ve kategori görselleri Supabase üzerinde optimize edilerek yüklenir.",
        },
        {
          icon: "edit",
          title: "Hızlı Düzenleme",
          description: "Ürün adı, açıklaması, fiyatı sürekli güncel — anlık değişiklik yap.",
        },
        {
          icon: "auto_awesome",
          title: "AI Çeviri Modülü",
          description: "Tek tıkla yapay zekayla Türkçe menünü İngilizceye çevir.",
        },
        {
          icon: "drag_handle",
          title: "Sıralama Özelleştirmesi",
          description: "Kategori ve ürün sıralamasını sürükle-bırak ile değiştir.",
        },
        {
          icon: "monitoring",
          title: "İstatistik Raporları",
          description: "Tarama sayısı, popüler ürünler, saatlik dağılım — hepsi raporlanır.",
        },
        {
          icon: "star",
          title: "Öne Çıkanlar & Günün Menüsü",
          description: "Özel ürünleri öne çıkar, günün menüsü olarak işaretle.",
        },
        {
          icon: "share",
          title: "Sosyal Medya Bağlantıları",
          description: "Instagram, Facebook, WhatsApp ve telefonunu menüde göster.",
        },
        {
          icon: "qr_code_2",
          title: "QR Kod Üretici",
          description: "QR kodunu logolu özelleştir, PNG olarak indir, baskıya hazır.",
        },
      ]}
      benefitsTitle="Restoran Menü Programı Neler Sunmalı?"
      benefits={[
        "Kategori ve ürün yönetimi (planına göre kapasite)",
        "Görsel yükleme ve otomatik optimizasyon (WebP)",
        "Çoklu dil desteği — Türkçe + İngilizce",
        "Yapay zeka destekli otomatik çeviri",
        "Fiyat ve ürün güncelleme anlık yansır",
        "Stokta olmayan ürünü hızla pasifleştir",
        "Müşteri davranış istatistikleri",
        "Marka uyumlu özelleştirilebilir tasarım",
        "QR kod üretimi ve baskıya hazır indirme",
        "Mobil tarayıcıda mükemmel performans",
      ]}
      faq={[
        {
          q: "Restoran menü programı yüklemem gerekiyor mu?",
          a: "Hayır. QR Menülist bulut tabanlı bir restoran menü programıdır. Herhangi bir yazılım kurulumu gerekmez — tarayıcıdan paneline erişip menünü yönetirsin.",
        },
        {
          q: "Birden fazla şubem var, hepsini tek hesaptan yönetebilir miyim?",
          a: "Şu anda her restoran için ayrı bir slug ve panel kullanılmaktadır. Şubeler için bizimle iletişime geçerek özel kurulum talep edebilirsin.",
        },
        {
          q: "Restoran menü programınız hangi cihazlarda çalışır?",
          a: "Tarayıcı tabanlı olduğu için Windows, macOS, iOS, Android — internet bağlantısı olan tüm cihazlarda çalışır. Müşterilerin için ise telefon tarayıcısı yeterlidir.",
        },
        {
          q: "Verilerim güvende mi?",
          a: "Evet. Veritabanı Supabase üzerinde tutulur, tüm bağlantılar SSL ile şifrelidir. Müşteri kişisel verisi toplanmaz — sadece anonim tarama istatistikleri tutulur.",
        },
        {
          q: "Eğitim ya da destek alabilir miyim?",
          a: `Tabii. WhatsApp üzerinden bizimle iletişime geçerek kurulum desteği ve eğitim alabilirsin.`,
        },
      ]}
      ctaTitle="Restoranını Profesyonel Yönet"
      ctaSubtitle="Restoran menü programını ücretsiz dene, ihtiyacın büyüdükçe Pro'ya yükselt."
    />
  )
}
