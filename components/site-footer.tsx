import Link from "next/link"
import { Icon } from "@/components/icon"
import { WhatsAppIcon } from "@/components/whatsapp-icon"
import { whatsappUrl, CONTACT_WHATSAPP_DISPLAY } from "@/lib/contact"
import { COMPANY, addressLine, socialLinks } from "@/lib/company"
import { FREE_OFFER } from "@/lib/offer"

/**
 * Sitenin TEK footer'ı.
 *
 * Neden tek bileşen: ana sayfa ile /blog farklı footer kullanıyordu ve ana
 * sayfa 4 para sayfasına (ucretsiz-qr-menu, qr-menu-olusturma, dijital-menu,
 * restoran-menu-programi) hiç link vermiyordu. Ana sayfa sitenin en fazla link
 * alan sayfası olduğu için bu, o sayfalara akacak PageRank'ın büyük kısmını
 * kaybettiriyordu.
 */

const PRODUCT_LINKS = [
  { href: "/qr-menu-olusturma", label: "QR Menü Oluşturma" },
  { href: "/ucretsiz-qr-menu", label: "Ücretsiz QR Menü" },
  { href: "/dijital-menu", label: "Dijital Menü" },
  { href: "/restoran-menu-programi", label: "Restoran Menü Programı" },
]

const GUIDE_LINKS = [
  { href: "/blog/qr-menu-nedir", label: "QR Menü Nedir?" },
  { href: "/blog/qr-menu-avantajlari", label: "QR Menünün Avantajları" },
  { href: "/blog/qr-menu-fiyatlari", label: "QR Menü Fiyatları" },
  { href: "/blog/qr-menu-tasarimi", label: "QR Menü Tasarımı" },
  { href: "/blog", label: "Tüm Yazılar" },
]

const COMPANY_LINKS = [
  { href: "/hakkimizda", label: "Hakkımızda" },
  { href: "/iletisim", label: "İletişim" },
  { href: "/blog", label: "Blog" },
]

const LEGAL_LINKS = [
  { href: "/gizlilik-politikasi", label: "Gizlilik Politikası" },
  { href: "/kullanim-sartlari", label: "Kullanım Şartları" },
  { href: "/kvkk", label: "KVKK Aydınlatma Metni" },
  { href: "/cerez-politikasi", label: "Çerez Politikası" },
]

export function SiteFooter() {
  const year = new Date().getFullYear()
  const address = addressLine()
  const socials = socialLinks()

  return (
    <footer className="relative overflow-hidden bg-[#0a0a0a] text-white">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-[#0f0f1a] to-[#0a0a0a]" />
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-violet-600/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-fuchsia-600/10 rounded-full blur-[150px]" />
      </div>

      <div className="relative z-10 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-14">
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">
            {/* Marka + iletişim */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-1.5 mb-5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/qrmenu-logo.png"
                  alt="QR Menülist logosu"
                  width={56}
                  height={56}
                  className="h-12 sm:h-14 w-auto drop-shadow-md"
                />
                <span className="font-bold text-2xl flex items-center tracking-tight">
                  <span className="bg-gradient-to-r from-violet-500 to-fuchsia-500 bg-clip-text text-transparent">
                    qr
                  </span>
                  <span className="text-white">menülist</span>
                </span>
              </div>

              <p className="text-gray-400 mb-6 max-w-sm leading-relaxed text-sm">
                Restoran, kafe ve oteller için QR menü oluşturma platformu. QR kod ile
                müşterileriniz menünüze telefonlarından anında ulaşır; fiyat ve ürün
                güncellemeleri baskı gerektirmeden aynı saniyede yansır.
              </p>

              <ul className="space-y-3 text-sm text-gray-400">
                <li>
                  <a
                    href={whatsappUrl("Merhaba, QR Menülist hakkında bilgi almak istiyorum.")}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition-colors font-medium"
                  >
                    <WhatsAppIcon className="w-4 h-4" />
                    {CONTACT_WHATSAPP_DISPLAY}
                  </a>
                </li>
                {!COMPANY.email.startsWith("TODO") && (
                  <li>
                    <a
                      href={`mailto:${COMPANY.email}`}
                      className="inline-flex items-center gap-2 hover:text-violet-400 transition-colors"
                    >
                      <Icon name="mail" className="text-base" />
                      {COMPANY.email}
                    </a>
                  </li>
                )}
                {address && (
                  <li className="flex items-start gap-2">
                    <Icon name="location_on" className="text-base mt-0.5" />
                    <span>{address}</span>
                  </li>
                )}
                <li className="flex items-center gap-2">
                  <Icon name="lock_clock" className="text-base" />
                  <span>{COMPANY.openingHours.display}</span>
                </li>
              </ul>

              {socials.length > 0 && (
                <div className="flex items-center gap-3 mt-6">
                  {socials.map((s) => (
                    <a
                      key={s.label}
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-gray-400 hover:text-violet-400 transition-colors"
                    >
                      {s.label}
                    </a>
                  ))}
                </div>
              )}
            </div>

            {/* Ürün — 4 para sayfası */}
            <nav aria-label="Ürün">
              <h2 className="font-bold mb-5 text-base">Ürün</h2>
              <ul className="space-y-3 text-sm">
                {PRODUCT_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-gray-400 hover:text-violet-400 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link
                    href="/#features"
                    className="text-gray-400 hover:text-violet-400 transition-colors"
                  >
                    Özellikler
                  </Link>
                </li>
              </ul>
            </nav>

            {/* Rehberler */}
            <nav aria-label="Rehberler">
              <h2 className="font-bold mb-5 text-base">Rehberler</h2>
              <ul className="space-y-3 text-sm">
                {GUIDE_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-gray-400 hover:text-violet-400 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Şirket */}
            <nav aria-label="Şirket">
              <h2 className="font-bold mb-5 text-base">Şirket</h2>
              <ul className="space-y-3 text-sm">
                {COMPANY_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-gray-400 hover:text-violet-400 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link
                    href="/auth/register"
                    className="text-gray-400 hover:text-violet-400 transition-colors"
                  >
                    Ücretsiz Kayıt
                  </Link>
                </li>
                <li>
                  <Link
                    href="/auth/login"
                    className="text-gray-400 hover:text-violet-400 transition-colors"
                  >
                    Giriş Yap
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        </div>

        {/* Yasal şerit */}
        <div className="relative z-10 border-t border-white/10">
          <div className="max-w-7xl mx-auto px-4 py-7">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-5">
              <nav aria-label="Yasal" className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-gray-500">
                {LEGAL_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="hover:text-violet-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>

              <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-2">
                  <Icon name="verified" className="text-emerald-400 text-lg" />
                  {FREE_OFFER.short}
                </span>
                <span className="hidden sm:block w-px h-4 bg-white/20" />
                <p>
                  © {year} {COMPANY.brand} — Tüm hakları saklıdır.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
