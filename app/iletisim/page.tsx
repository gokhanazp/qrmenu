import type { Metadata } from "next"
import Link from "next/link"
import { ContentPage, Section } from "@/components/content-page"
import { Icon } from "@/components/icon"
import { JsonLd } from "@/components/json-ld"
import { WhatsAppIcon } from "@/components/whatsapp-icon"
import { getSiteUrl, localBusinessJsonLd } from "@/lib/seo/jsonld"
import { COMPANY, addressLine, legalEntity } from "@/lib/company"
import { CONTACT_WHATSAPP_DISPLAY, whatsappUrl } from "@/lib/contact"

const SLUG = "iletisim"
const TITLE = "İletişim"
const DESCRIPTION = `QR Menülist iletişim: WhatsApp ${CONTACT_WHATSAPP_DISPLAY}, e-posta ve çalışma saatleri. QR menü kurulumu, Pro plan fiyatları ve destek talepleri için bize ulaşın.`

export const metadata: Metadata = {
  title: { absolute: `İletişim — QR Menü Desteği ve Fiyat Bilgisi | QR Menülist` },
  description: DESCRIPTION,
  alternates: { canonical: `${getSiteUrl()}/${SLUG}` },
  openGraph: {
    title: "İletişim — QR Menü Desteği ve Fiyat Bilgisi",
    description: DESCRIPTION,
    url: `${getSiteUrl()}/${SLUG}`,
    type: "website",
    locale: "tr_TR",
    siteName: "QR Menülist",
  },
}

export default function IletisimPage() {
  const address = addressLine()
  const email = COMPANY.email.startsWith("TODO") ? null : COMPANY.email
  const localBusiness = localBusinessJsonLd()

  return (
    <ContentPage
      slug={SLUG}
      breadcrumbName={TITLE}
      title="İletişim"
      lead="QR menü kurulumu, Pro plan fiyatları veya teknik destek — en hızlı yanıtı WhatsApp'tan alırsınız. Mesajlarınızı çalışma saatleri içinde aynı gün yanıtlıyoruz."
    >
      {localBusiness && <JsonLd data={localBusiness} />}

      {/* Birincil kanal: WhatsApp */}
      <div className="grid sm:grid-cols-2 gap-4 not-prose">
        <a
          href={whatsappUrl("Merhaba, QR menü hakkında bilgi almak istiyorum.")}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6 hover:border-emerald-400/60 transition-colors"
        >
          <div className="flex items-center gap-3 mb-2">
            <WhatsAppIcon className="w-6 h-6 text-emerald-400" />
            <span className="font-semibold text-white text-lg">WhatsApp</span>
          </div>
          <p className="text-emerald-300 font-medium">{CONTACT_WHATSAPP_DISPLAY}</p>
          <p className="text-sm text-gray-400 mt-2">
            En hızlı kanal. Menü kurulumunda takıldıysanız ekran görüntüsü
            atabilirsiniz.
          </p>
        </a>

        {email ? (
          <a
            href={`mailto:${email}`}
            className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 hover:border-violet-500/40 transition-colors"
          >
            <div className="flex items-center gap-3 mb-2">
              <Icon name="mail" className="text-violet-400 text-2xl" />
              <span className="font-semibold text-white text-lg">E-posta</span>
            </div>
            <p className="text-violet-300 font-medium break-all">{email}</p>
            <p className="text-sm text-gray-400 mt-2">
              Fatura, sözleşme ve KVKK başvuruları için.
            </p>
          </a>
        ) : (
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
            <div className="flex items-center gap-3 mb-2">
              <Icon name="mail" className="text-violet-400 text-2xl" />
              <span className="font-semibold text-white text-lg">E-posta</span>
            </div>
            <p className="text-sm text-gray-400">
              Kurumsal e-posta adresimiz yayına hazırlanıyor. Bu arada tüm
              taleplerinizi WhatsApp üzerinden iletebilirsiniz.
            </p>
          </div>
        )}
      </div>

      <Section heading="Çalışma saatleri">
        <p>
          {COMPANY.openingHours.display}. Bu saatler dışında gelen WhatsApp
          mesajlarını ilk iş günü sabahı yanıtlıyoruz.
        </p>
      </Section>

      {address && (
        <Section heading="Adres">
          <p>
            <strong className="text-white">{legalEntity()}</strong>
            <br />
            {address}
          </p>
        </Section>
      )}

      <Section heading="Hangi konuda yazmalısınız?">
        <div className="space-y-4">
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
            <h3 className="font-semibold text-white mb-1.5">
              Menümü kurmak için yardım istiyorum
            </h3>
            <p className="text-sm text-gray-400">
              Mevcut menünüzün fotoğrafını veya PDF&apos;ini WhatsApp&apos;tan
              gönderin; kategori ve ürünleri sizin için sisteme girebiliriz. Ek
              ücret yok.
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
            <h3 className="font-semibold text-white mb-1.5">
              Pro plan fiyatını öğrenmek istiyorum
            </h3>
            <p className="text-sm text-gray-400">
              İşletme tipinizi (kafe, restoran, otel) ve ürün sayınızı yazın; size
              uygun planı ve fiyatı iletelim.
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
            <h3 className="font-semibold text-white mb-1.5">
              Teknik bir sorun yaşıyorum
            </h3>
            <p className="text-sm text-gray-400">
              Kayıtlı e-posta adresinizi, hangi ekranda olduğunuzu ve varsa hata
              ekran görüntüsünü paylaşın — çözüm süresi belirgin şekilde kısalıyor.
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
            <h3 className="font-semibold text-white mb-1.5">
              KVKK kapsamında veri talebim var
            </h3>
            <p className="text-sm text-gray-400">
              Başvuru yöntemi, gereken bilgiler ve yasal süreler{" "}
              <Link href="/kvkk#basvuru" className="text-violet-400 underline underline-offset-4">
                KVKK aydınlatma metninin başvuru bölümünde
              </Link>{" "}
              açıklanmıştır.
            </p>
          </div>
        </div>
      </Section>

      <Section heading="Önce şunlara bakmak isteyebilirsiniz">
        <ul className="space-y-2.5">
          <li>
            <Link href="/qr-menu-olusturma" className="text-violet-400 underline underline-offset-4">
              QR menü oluşturma rehberi
            </Link>{" "}
            — adım adım kurulum
          </li>
          <li>
            <Link href="/ucretsiz-qr-menu" className="text-violet-400 underline underline-offset-4">
              Ücretsiz QR menü
            </Link>{" "}
            — deneme süresinde neler dahil
          </li>
          <li>
            <Link href="/blog/qr-menu-fiyatlari" className="text-violet-400 underline underline-offset-4">
              QR menü fiyatları
            </Link>{" "}
            — piyasa maliyet analizi
          </li>
          <li>
            <Link href="/blog" className="text-violet-400 underline underline-offset-4">
              Blog
            </Link>{" "}
            — rehberler ve karşılaştırmalar
          </li>
        </ul>
      </Section>
    </ContentPage>
  )
}
