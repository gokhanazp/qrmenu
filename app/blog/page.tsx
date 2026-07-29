import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { JsonLd } from "@/components/json-ld"
import { WhatsAppIcon } from "@/components/whatsapp-icon"
import { getSortedPosts } from "@/lib/blog/posts"
import { blogJsonLd, breadcrumbJsonLd, getSiteUrl } from "@/lib/seo/jsonld"
import { whatsappUrl } from "@/lib/contact"

const TITLE = "QR Menü Blog — Rehberler, Karşılaştırmalar ve Maliyet Analizleri"
const DESCRIPTION =
  "QR menü ve dijital menü üzerine rehberler: QR menü nedir, avantajları neler, fiyatları nasıl hesaplanır, menü tasarımı nasıl olmalı? Restoran ve kafe sahipleri için."

export const metadata: Metadata = {
  title: { absolute: `${TITLE} | QR Menülist` },
  description: DESCRIPTION,
  keywords: [
    "qr menü blog",
    "qr menü rehberi",
    "dijital menü rehberi",
    "restoran menü yönetimi",
    "qr menü nedir",
  ],
  alternates: {
    canonical: `${getSiteUrl()}/blog`,
  },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: `${getSiteUrl()}/blog`,
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

function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  })
}

export default function BlogIndexPage() {
  const siteUrl = getSiteUrl()
  const posts = getSortedPosts()
  const [featured, ...rest] = posts

  return (
    <>
      <JsonLd
        data={[
          blogJsonLd(posts),
          breadcrumbJsonLd([
            { name: "Ana Sayfa", url: siteUrl },
            { name: "Blog", url: `${siteUrl}/blog` },
          ]),
        ]}
      />

      {/* Hero */}
      <section className="relative py-16 lg:py-20 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-fuchsia-600/20 rounded-full blur-[120px]" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 rounded-full px-4 py-2 mb-6">
            <span className="material-symbols-outlined text-violet-400 text-sm">article</span>
            <span className="text-sm text-violet-300">QR MENÜ REHBERLERİ</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold mb-6 leading-tight">
            QR Menü{" "}
            <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-orange-400 bg-clip-text text-transparent">
              Blog
            </span>
          </h1>

          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Restoran ve kafe sahipleri için QR menü rehberleri. Maliyet hesabı, tasarım kuralları,
            basılı menü karşılaştırması ve geçiş sürecinde işe yarayan pratik bilgiler.
          </p>
        </div>
      </section>

      {/* Öne çıkan yazı */}
      {featured && (
        <section className="pb-4">
          <div className="max-w-5xl mx-auto px-4">
            <Link
              href={`/blog/${featured.slug}`}
              className="group block rounded-3xl border border-white/10 bg-gradient-to-br from-violet-600/[0.12] to-fuchsia-600/[0.06] p-8 lg:p-10 hover:border-violet-500/40 transition-all"
            >
              <div className="flex items-center gap-3 mb-5">
                <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-violet-300 bg-violet-500/15 border border-violet-500/25 rounded-full px-3 py-1">
                  Öne çıkan
                </span>
                <span className="text-xs text-gray-500">{featured.category}</span>
              </div>

              <h2 className="text-2xl lg:text-3xl font-bold mb-4 group-hover:text-violet-300 transition-colors">
                {featured.title}
              </h2>

              <p className="text-gray-400 leading-relaxed mb-6 max-w-2xl">{featured.excerpt}</p>

              <div className="flex items-center gap-4 text-sm text-gray-500">
                <time dateTime={featured.publishedAt}>{formatDate(featured.publishedAt)}</time>
                <span aria-hidden="true">·</span>
                <span>{featured.readingMinutes} dk okuma</span>
                <span className="ml-auto inline-flex items-center gap-1 text-violet-400 group-hover:gap-2 transition-all">
                  Oku
                  <span className="material-symbols-outlined text-base">arrow_forward</span>
                </span>
              </div>
            </Link>
          </div>
        </section>
      )}

      {/* Diğer yazılar */}
      <section className="py-10">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-6">
            {rest.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group flex flex-col rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-6 hover:border-violet-500/40 transition-all"
              >
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-white text-xl">{post.icon}</span>
                </div>

                <span className="text-xs text-gray-500 mb-2">{post.category}</span>

                <h2 className="text-lg font-bold mb-3 leading-snug group-hover:text-violet-300 transition-colors">
                  {post.title}
                </h2>

                <p className="text-sm text-gray-400 leading-relaxed mb-5 flex-1">{post.excerpt}</p>

                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
                  <span aria-hidden="true">·</span>
                  <span>{post.readingMinutes} dk</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-900/30 via-fuchsia-900/20 to-[#0a0a0a]" />
        <div className="relative z-10 max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-5">
            Okumak Yeter, Şimdi Kurma Sırası
          </h2>
          <p className="text-lg text-gray-400 mb-8">
            2 ay ücretsiz deneme ile kendi QR menünü kur, masaya koy, müşterilerinin tepkisini gör.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register">
              <Button
                size="lg"
                className="text-lg px-10 py-6 bg-gradient-to-r from-violet-600 to-fuchsia-600 border-0 w-full sm:w-auto shadow-lg shadow-violet-500/25"
              >
                Ücretsiz Başla
              </Button>
            </Link>
            <a
              href={whatsappUrl("Merhaba, blogdan geldim. QR menü hakkında bilgi almak istiyorum.")}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                size="lg"
                className="text-lg px-10 py-6 bg-[#25D366] hover:bg-[#1ebe5b] border-0 w-full sm:w-auto gap-2"
              >
                <WhatsAppIcon className="w-5 h-5" />
                WhatsApp İletişim
              </Button>
            </a>
          </div>
        </div>
      </section>
    </>
  )
}
