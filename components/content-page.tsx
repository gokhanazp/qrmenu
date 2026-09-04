import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Icon } from "@/components/icon"
import { JsonLd } from "@/components/json-ld"
import { SiteFooter } from "@/components/site-footer"
import { WhatsAppIcon } from "@/components/whatsapp-icon"
import { breadcrumbJsonLd, getSiteUrl } from "@/lib/seo/jsonld"
import { whatsappUrl } from "@/lib/contact"
import { COMPANY_INFO_COMPLETE, LEGAL_LAST_UPDATED, formatLegalDate } from "@/lib/company"

/**
 * Yasal ve kurumsal sayfaların (gizlilik, KVKK, çerez, şartlar, hakkımızda,
 * iletişim) ortak kabuğu.
 *
 * Bu sayfalar footer'da `href="#"` olarak duruyordu: hem SaaS için doğrudan
 * bir E-E-A-T/güven kaybı hem Türkiye'de KVKK açısından yasal bir eksik.
 * Google, ödeme alan bir SaaS'ta iletişim/yasal sayfa yokluğunu kalite
 * sinyali olarak okuyor.
 */
export function ContentPage({
  title,
  lead,
  breadcrumbName,
  slug,
  children,
  showLegalNotice = false,
  lastUpdated = LEGAL_LAST_UPDATED,
}: {
  /** Sayfanın H1'i */
  title: string
  /** H1 altındaki giriş paragrafı */
  lead: string
  /** Breadcrumb'ta görünen kısa ad */
  breadcrumbName: string
  slug: string
  children: React.ReactNode
  /** Yasal metinlerde "son güncelleme" + eksik bilgi uyarısı gösterilsin mi */
  showLegalNotice?: boolean
  lastUpdated?: string
}) {
  const siteUrl = getSiteUrl()

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Ana Sayfa", url: siteUrl },
          { name: breadcrumbName, url: `${siteUrl}/${slug}` },
        ])}
      />

      <header className="sticky top-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/qrmenu-logo.png"
              alt="QR Menülist"
              width={40}
              height={40}
              className="h-10 w-auto"
            />
            <span className="font-bold text-xl">
              <span className="bg-gradient-to-r from-violet-500 to-fuchsia-500 bg-clip-text text-transparent">
                qr
              </span>
              <span className="text-white">menülist</span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/blog"
              className="hidden sm:inline text-sm text-gray-400 hover:text-violet-400 transition-colors"
            >
              Blog
            </Link>
            <Link
              href="/qr-menu-olusturma"
              className="hidden md:inline text-sm text-gray-400 hover:text-violet-400 transition-colors"
            >
              QR Menü Oluşturma
            </Link>
            <Link href="/auth/register">
              <Button size="sm" className="bg-gradient-to-r from-violet-600 to-fuchsia-600 border-0">
                Ücretsiz Başla
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="max-w-3xl mx-auto px-4 py-12 lg:py-16">
          {/* Görünür breadcrumb — schema ile birebir aynı */}
          <nav aria-label="Breadcrumb" className="mb-8">
            <ol className="flex items-center gap-2 text-sm text-gray-500">
              <li>
                <Link href="/" className="hover:text-violet-400 transition-colors">
                  Ana Sayfa
                </Link>
              </li>
              <li aria-hidden="true">
                <Icon name="chevron_right" className="text-base" />
              </li>
              <li className="text-gray-300" aria-current="page">
                {breadcrumbName}
              </li>
            </ol>
          </nav>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-5 leading-tight">
            {title}
          </h1>

          <p className="text-lg text-gray-400 leading-relaxed mb-8">{lead}</p>

          {showLegalNotice && (
            <div className="mb-10 space-y-3">
              <p className="text-sm text-gray-500">
                Son güncelleme: {formatLegalDate(lastUpdated)}
              </p>
              {!COMPANY_INFO_COMPLETE && (
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-200">
                  <strong className="font-semibold">Bilgiler güncelleniyor.</strong>{" "}
                  Bu metindeki şirket unvanı, adres ve başvuru adresi alanları
                  tamamlanma aşamasındadır. Güncel bilgi için{" "}
                  <a
                    href={whatsappUrl("Merhaba, yasal metinlerdeki şirket bilgileri hakkında bilgi almak istiyorum.")}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline underline-offset-4 hover:text-amber-100"
                  >
                    WhatsApp
                  </a>{" "}
                  üzerinden bize ulaşabilirsiniz.
                </div>
              )}
            </div>
          )}

          <div className="legal-prose space-y-6 text-gray-300 leading-relaxed">
            {children}
          </div>

          <div className="mt-14 pt-8 border-t border-white/10 flex flex-col sm:flex-row gap-4">
            <Link href="/auth/register" className="sm:w-auto">
              <Button
                size="lg"
                className="w-full sm:w-auto bg-gradient-to-r from-violet-600 to-fuchsia-600 border-0"
              >
                Ücretsiz QR Menü Oluştur
              </Button>
            </Link>
            <a
              href={whatsappUrl(`Merhaba, "${title}" sayfasından geldim. Bilgi almak istiyorum.`)}
              target="_blank"
              rel="noopener noreferrer"
              className="sm:w-auto"
            >
              <Button
                size="lg"
                className="w-full sm:w-auto bg-[#25D366] hover:bg-[#1ebe5b] border-0 gap-2"
              >
                <WhatsAppIcon className="w-5 h-5" />
                WhatsApp İletişim
              </Button>
            </a>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}

/** Yasal metinlerde bölüm başlığı */
export function Section({
  heading,
  id,
  children,
}: {
  heading: string
  id?: string
  children: React.ReactNode
}) {
  return (
    <section className="pt-4">
      <h2
        id={id}
        className="text-xl sm:text-2xl font-bold text-white mb-4 scroll-mt-24"
      >
        {heading}
      </h2>
      <div className="space-y-4">{children}</div>
    </section>
  )
}

/** Yasal metinlerde madde listesi */
export function Bullets({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="space-y-2.5 pl-1">
      {items.map((item, i) => (
        <li key={i} className="flex gap-3">
          <Icon name="check_circle" className="text-violet-400 text-lg mt-0.5" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}
