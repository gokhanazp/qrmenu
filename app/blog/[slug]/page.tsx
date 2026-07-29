import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { JsonLd } from "@/components/json-ld"
import { WhatsAppIcon } from "@/components/whatsapp-icon"
import { BlockRenderer, Inline } from "@/components/blog-content"
import { BLOG_POSTS, getPostBySlug, getRelatedPosts, type BlogPost } from "@/lib/blog/posts"
import {
  articleJsonLd,
  breadcrumbJsonLd,
  faqPageJsonLd,
  getSiteUrl,
} from "@/lib/seo/jsonld"
import { whatsappUrl } from "@/lib/contact"

export const dynamicParams = false

export function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({ slug: post.slug }))
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const post = getPostBySlug(params.slug)
  if (!post) return {}

  const url = `${getSiteUrl()}/blog/${post.slug}`

  return {
    title: { absolute: post.metaTitle },
    description: post.description,
    keywords: post.keywords,
    alternates: { canonical: url },
    openGraph: {
      title: post.title,
      description: post.description,
      url,
      type: "article",
      locale: "tr_TR",
      siteName: "QR Menülist",
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
    },
  }
}

function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  })
}

/** Article schema'daki wordCount için kaba bir sayım */
function countWords(post: BlogPost): number {
  const texts: string[] = [...post.intro]

  for (const section of post.sections) {
    texts.push(section.heading)
    for (const block of section.blocks) {
      switch (block.type) {
        case "p":
          texts.push(block.text)
          break
        case "list":
        case "steps":
          texts.push(...block.items)
          break
        case "callout":
          texts.push(block.title, block.text)
          break
        case "table":
          texts.push(...block.head, ...block.rows.flat())
          break
      }
    }
  }

  for (const item of post.faq) {
    texts.push(item.q, item.a)
  }

  return texts.join(" ").split(/\s+/).filter(Boolean).length
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = getPostBySlug(params.slug)
  if (!post) notFound()

  const siteUrl = getSiteUrl()
  const related = getRelatedPosts(post)

  return (
    <>
      <JsonLd
        data={[
          articleJsonLd({
            slug: post.slug,
            title: post.title,
            description: post.description,
            publishedAt: post.publishedAt,
            updatedAt: post.updatedAt,
            keywords: post.keywords,
            section: post.category,
            wordCount: countWords(post),
          }),
          faqPageJsonLd(post.faq),
          breadcrumbJsonLd([
            { name: "Ana Sayfa", url: siteUrl },
            { name: "Blog", url: `${siteUrl}/blog` },
            { name: post.title, url: `${siteUrl}/blog/${post.slug}` },
          ]),
        ]}
      />

      <article className="relative">
        {/* Başlık bloğu */}
        <header className="relative py-14 lg:py-16 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/3 w-96 h-96 bg-violet-600/15 rounded-full blur-[120px]" />
          </div>

          <div className="relative z-10 max-w-3xl mx-auto px-4">
            {/* Breadcrumb */}
            <nav aria-label="Breadcrumb" className="mb-6">
              <ol className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
                <li>
                  <Link href="/" className="hover:text-violet-400 transition-colors">
                    Ana Sayfa
                  </Link>
                </li>
                <li aria-hidden="true">/</li>
                <li>
                  <Link href="/blog" className="hover:text-violet-400 transition-colors">
                    Blog
                  </Link>
                </li>
                <li aria-hidden="true">/</li>
                <li className="text-gray-400">{post.category}</li>
              </ol>
            </nav>

            <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold mb-6 leading-tight">
              {post.title}
            </h1>

            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
              <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
              <span aria-hidden="true">·</span>
              <span>{post.readingMinutes} dk okuma</span>
              <span aria-hidden="true">·</span>
              <span className="text-violet-400">{post.category}</span>
            </div>
          </div>
        </header>

        {/* Giriş */}
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-lg text-gray-300 leading-relaxed border-l-2 border-violet-500/40 pl-5 mb-12">
            {post.intro.map((paragraph, i) => (
              <p key={i} className={i > 0 ? "mt-4" : undefined}>
                <Inline text={paragraph} />
              </p>
            ))}
          </div>

          {/* İçindekiler */}
          <nav
            aria-label="İçindekiler"
            className="mb-12 rounded-2xl border border-white/10 bg-white/[0.03] p-6"
          >
            <p className="font-semibold text-white mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-violet-400 text-xl">list</span>
              İçindekiler
            </p>
            <ol className="space-y-2">
              {post.sections.map((section, i) => (
                <li key={section.id} className="text-gray-400 text-sm leading-relaxed">
                  <span className="text-gray-600 mr-2 tabular-nums">{i + 1}.</span>
                  <a
                    href={`#${section.id}`}
                    className="hover:text-violet-400 transition-colors"
                  >
                    {section.heading}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          {/* Gövde */}
          {post.sections.map((section) => (
            <section key={section.id} id={section.id} className="mb-12 scroll-mt-24">
              <h2 className="text-2xl sm:text-3xl font-bold mb-5 leading-snug">
                {section.heading}
              </h2>
              {section.blocks.map((block, i) => (
                <BlockRenderer key={i} block={block} />
              ))}
            </section>
          ))}

          {/* Yazı içi CTA */}
          <aside className="my-14 rounded-3xl border border-violet-500/25 bg-gradient-to-br from-violet-600/[0.14] to-fuchsia-600/[0.06] p-8 text-center">
            <h2 className="text-2xl font-bold mb-3">Kendi QR Menünü Kur</h2>
            <p className="text-gray-400 mb-6 max-w-lg mx-auto">
              2 ay ücretsiz deneme. Kayıt ol, ürünlerini ekle, QR kodunu indir — menün aynı gün
              masada olsun.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/auth/register">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-violet-600 to-fuchsia-600 border-0 w-full sm:w-auto px-8"
                >
                  Ücretsiz Başla
                </Button>
              </Link>
              <a
                href={whatsappUrl(
                  `Merhaba, "${post.title}" yazısından geldim. Bilgi almak istiyorum.`
                )}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  size="lg"
                  className="bg-[#25D366] hover:bg-[#1ebe5b] border-0 w-full sm:w-auto gap-2 px-8"
                >
                  <WhatsAppIcon className="w-5 h-5" />
                  WhatsApp
                </Button>
              </a>
            </div>
          </aside>

          {/* SSS */}
          <section className="mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6">Sıkça Sorulan Sorular</h2>
            <div className="space-y-4">
              {post.faq.map((item, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 hover:border-blue-500/30 transition-colors"
                >
                  <h3 className="text-base font-semibold mb-3 flex items-start gap-3">
                    <span className="material-symbols-outlined text-blue-400 text-xl flex-shrink-0">
                      help_outline
                    </span>
                    {item.q}
                  </h3>
                  <p className="text-gray-400 leading-relaxed pl-8">{item.a}</p>
                </div>
              ))}
            </div>
          </section>

          {/* İlgili yazılar */}
          {related.length > 0 && (
            <section className="mb-16">
              <h2 className="text-2xl font-bold mb-6">İlgili Yazılar</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {related.map((item) => (
                  <Link
                    key={item.slug}
                    href={`/blog/${item.slug}`}
                    className="group rounded-2xl border border-white/10 bg-white/[0.03] p-5 hover:border-violet-500/40 transition-all"
                  >
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                      <span className="material-symbols-outlined text-violet-400 text-base">
                        {item.icon}
                      </span>
                      {item.category}
                    </div>
                    <p className="font-semibold leading-snug group-hover:text-violet-300 transition-colors">
                      {item.title}
                    </p>
                    <p className="text-sm text-gray-500 mt-2">{item.readingMinutes} dk okuma</p>
                  </Link>
                ))}
              </div>
            </section>
          )}

          <div className="pb-16">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-violet-400 hover:text-violet-300 transition-colors"
            >
              <span className="material-symbols-outlined text-base">arrow_back</span>
              Tüm yazılara dön
            </Link>
          </div>
        </div>
      </article>
    </>
  )
}
