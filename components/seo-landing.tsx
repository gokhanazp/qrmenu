import Link from "next/link"
import { Button } from "@/components/ui/button"
import { JsonLd } from "@/components/json-ld"
import { breadcrumbJsonLd, faqPageJsonLd, getSiteUrl } from "@/lib/seo/jsonld"
import { whatsappUrl, CONTACT_WHATSAPP_DISPLAY } from "@/lib/contact"

type LandingFeature = {
  icon: string
  title: string
  description: string
}

type FaqItem = { q: string; a: string }

export type SeoLandingProps = {
  slug: string
  badge: string
  h1: string
  h1Highlight: string
  subtitle: string
  intro: string
  features: LandingFeature[]
  benefitsTitle: string
  benefits: string[]
  faq: FaqItem[]
  ctaTitle: string
  ctaSubtitle: string
}

export function SeoLanding(props: SeoLandingProps) {
  const siteUrl = getSiteUrl()
  const pageUrl = `${siteUrl}/${props.slug}`

  const breadcrumb = breadcrumbJsonLd([
    { name: "Ana Sayfa", url: siteUrl },
    { name: props.h1, url: pageUrl },
  ])
  const faqSchema = faqPageJsonLd(props.faq)

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <JsonLd data={[breadcrumb, faqSchema]} />

      {/* Sticky header (basic) */}
      <header className="sticky top-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <img src="/qrmenu-logo.png" alt="QR Menülist" className="h-10 w-auto" />
            <span className="font-bold text-xl">
              <span className="bg-gradient-to-r from-violet-500 to-fuchsia-500 bg-clip-text text-transparent">
                qr
              </span>
              <span className="text-white">menülist</span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <a
              href={whatsappUrl(`Merhaba, "${props.h1}" sayfasından geldim. Bilgi almak istiyorum.`)}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex"
            >
              <Button size="sm" className="bg-[#25D366] hover:bg-[#1ebe5b] border-0 gap-2">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                </svg>
                WhatsApp
              </Button>
            </a>
            <Link href="/auth/register">
              <Button size="sm" className="bg-gradient-to-r from-violet-600 to-fuchsia-600 border-0">
                Ücretsiz Başla
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative py-20 lg:py-28 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-fuchsia-600/20 rounded-full blur-[120px]" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 rounded-full px-4 py-2 mb-6">
            <span className="material-symbols-outlined text-violet-400 text-sm">restaurant</span>
            <span className="text-sm text-violet-300">{props.badge}</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            {props.h1}{" "}
            <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-orange-400 bg-clip-text text-transparent">
              {props.h1Highlight}
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            {props.subtitle}
          </p>

          <div className="flex flex-col sm:flex-row flex-wrap gap-4 justify-center mb-10">
            <Link href="/auth/register">
              <Button
                size="lg"
                className="text-base lg:text-lg px-8 py-6 bg-gradient-to-r from-violet-600 to-fuchsia-600 border-0 w-full sm:w-auto"
              >
                Hemen Ücretsiz Başla
              </Button>
            </Link>
            <a
              href={whatsappUrl(`Merhaba, "${props.h1}" sayfasından geldim. Bilgi almak istiyorum.`)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                size="lg"
                className="text-base lg:text-lg px-8 py-6 bg-[#25D366] hover:bg-[#1ebe5b] border-0 w-full sm:w-auto gap-2"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                </svg>
                WhatsApp İletişim
              </Button>
            </a>
          </div>

          <div className="prose prose-invert prose-lg mx-auto text-gray-300 leading-relaxed">
            <p>{props.intro}</p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-[#0a0a0a] relative">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-[#0f0f1a] to-[#0a0a0a]" />
        <div className="relative z-10 max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {props.features.map((f, i) => (
              <div
                key={i}
                className="bg-gradient-to-br from-white/[0.08] to-white/[0.02] p-6 rounded-2xl border border-white/10 hover:border-violet-500/40 transition-all"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-xl flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-white text-2xl">{f.icon}</span>
                </div>
                <h3 className="text-lg font-bold mb-2">{f.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 bg-[#0a0a0a]">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl sm:text-4xl font-bold mb-10 text-center">
            {props.benefitsTitle}
          </h2>
          <ul className="grid sm:grid-cols-2 gap-4">
            {props.benefits.map((b, i) => (
              <li key={i} className="flex items-start gap-3 bg-white/5 p-4 rounded-xl border border-white/10">
                <span className="material-symbols-outlined text-emerald-400 flex-shrink-0">
                  check_circle
                </span>
                <span className="text-gray-300">{b}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-[#0a0a0a]">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl sm:text-4xl font-bold mb-10 text-center">Sıkça Sorulan Sorular</h2>
          <div className="space-y-4">
            {props.faq.map((item, i) => (
              <div
                key={i}
                className="bg-white/5 rounded-2xl border border-white/10 p-6 hover:border-blue-500/30 transition-colors"
              >
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-3">
                  <span className="material-symbols-outlined text-blue-400">help_outline</span>
                  {item.q}
                </h3>
                <p className="text-gray-400 leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-900/30 via-fuchsia-900/20 to-[#0a0a0a]" />
        <div className="relative z-10 max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-5xl font-bold mb-6">{props.ctaTitle}</h2>
          <p className="text-xl text-gray-400 mb-10">{props.ctaSubtitle}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register">
              <Button
                size="lg"
                className="text-lg px-10 py-6 bg-gradient-to-r from-violet-600 to-fuchsia-600 border-0 w-full sm:w-auto shadow-lg shadow-violet-500/25"
              >
                Hemen Ücretsiz Başla
              </Button>
            </Link>
            <a
              href={whatsappUrl(`Merhaba, "${props.h1}" sayfasından geldim. Bilgi almak istiyorum.`)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                size="lg"
                className="text-lg px-10 py-6 bg-[#25D366] hover:bg-[#1ebe5b] border-0 w-full sm:w-auto gap-2"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                </svg>
                {CONTACT_WHATSAPP_DISPLAY}
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Mini footer */}
      <footer className="py-8 border-t border-white/10 bg-[#0a0a0a]">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <p>© {new Date().getFullYear()} QR Menülist — Ücretsiz QR Menü Oluşturma Platformu</p>
          <div className="flex items-center gap-4">
            <Link href="/" className="hover:text-violet-400 transition-colors">Ana Sayfa</Link>
            <a
              href={whatsappUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-emerald-400 transition-colors"
            >
              WhatsApp: {CONTACT_WHATSAPP_DISPLAY}
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
