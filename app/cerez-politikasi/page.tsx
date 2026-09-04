import type { Metadata } from "next"
import Link from "next/link"
import { Bullets, ContentPage, Section } from "@/components/content-page"
import { getSiteUrl } from "@/lib/seo/jsonld"

const SLUG = "cerez-politikasi"
const TITLE = "Çerez Politikası"
const DESCRIPTION =
  "QR Menülist'te hangi çerezleri ve benzer teknolojileri kullanıyoruz, ne işe yarıyorlar, ne kadar süre kalıyorlar ve tarayıcınızdan nasıl kapatabilirsiniz."

export const metadata: Metadata = {
  title: { absolute: `${TITLE} | QR Menülist` },
  description: DESCRIPTION,
  alternates: { canonical: `${getSiteUrl()}/${SLUG}` },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: `${getSiteUrl()}/${SLUG}`,
    type: "website",
    locale: "tr_TR",
    siteName: "QR Menülist",
  },
}

export default function CerezPolitikasiPage() {
  return (
    <ContentPage
      slug={SLUG}
      breadcrumbName={TITLE}
      title={TITLE}
      lead="Bu sayfa, QR Menülist'te kullanılan çerezleri ve tarayıcı depolama teknolojilerini, ne için kullanıldıklarını ve nasıl kontrol edebileceğinizi listeler."
      showLegalNotice
    >
      <Section heading="Çerez nedir?">
        <p>
          Çerez (cookie), bir web sitesini ziyaret ettiğinizde tarayıcınıza
          kaydedilen küçük bir metin dosyasıdır. Oturumunuzun açık kalması,
          tercihlerinizin hatırlanması ve sitenin nasıl kullanıldığının ölçülmesi
          gibi işler için kullanılır. Aynı amaçla{" "}
          <code className="text-violet-300">localStorage</code> gibi tarayıcı
          depolama teknolojileri de kullanılabilir; bu politika onları da kapsar.
        </p>
      </Section>

      <Section heading="Kullandığımız çerezler">
        <h3 className="text-lg font-semibold text-white pt-2">
          1. Zorunlu çerezler
        </h3>
        <p>
          Bunlar olmadan hizmet çalışmaz; kapatılamazlar ve rıza gerektirmezler.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-white/15 text-left text-gray-400">
                <th className="py-3 pr-4 font-semibold">Çerez / kayıt</th>
                <th className="py-3 pr-4 font-semibold">Kaynak</th>
                <th className="py-3 pr-4 font-semibold">Amaç</th>
                <th className="py-3 font-semibold">Süre</th>
              </tr>
            </thead>
            <tbody className="text-gray-300">
              <tr className="border-b border-white/10">
                <td className="py-3 pr-4"><code>sb-*-auth-token</code></td>
                <td className="py-3 pr-4">Supabase</td>
                <td className="py-3 pr-4">Panel oturumunuzun açık kalması</td>
                <td className="py-3">Oturum + yenileme süresi</td>
              </tr>
              <tr className="border-b border-white/10">
                <td className="py-3 pr-4"><code>locale</code></td>
                <td className="py-3 pr-4">QR Menülist (localStorage)</td>
                <td className="py-3 pr-4">Arayüz dili tercihinizi hatırlamak</td>
                <td className="py-3">Siz silene kadar</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="text-lg font-semibold text-white pt-4">
          2. Analitik ve reklam çerezleri
        </h3>
        <p>
          Sitenin nasıl kullanıldığını ölçmek ve reklam performansını görmek için
          kullanılır. Bunlar zorunlu değildir; tarayıcınızdan veya Google&apos;ın
          sunduğu araçlarla kapatabilirsiniz.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-white/15 text-left text-gray-400">
                <th className="py-3 pr-4 font-semibold">Çerez</th>
                <th className="py-3 pr-4 font-semibold">Kaynak</th>
                <th className="py-3 pr-4 font-semibold">Amaç</th>
                <th className="py-3 font-semibold">Süre</th>
              </tr>
            </thead>
            <tbody className="text-gray-300">
              <tr className="border-b border-white/10">
                <td className="py-3 pr-4"><code>_ga</code>, <code>_ga_*</code></td>
                <td className="py-3 pr-4">Google Analytics 4</td>
                <td className="py-3 pr-4">Ziyaretçi ve oturum sayısını ölçmek</td>
                <td className="py-3">2 yıla kadar</td>
              </tr>
              <tr className="border-b border-white/10">
                <td className="py-3 pr-4"><code>_gcl_*</code></td>
                <td className="py-3 pr-4">Google Ads</td>
                <td className="py-3 pr-4">Reklam tıklamasının dönüşüme yol açıp açmadığını ölçmek</td>
                <td className="py-3">90 güne kadar</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-sm text-gray-400">
          Kullanılan ölçüm kodları: Google Analytics 4 (G-MMDJC2TFFP) ve Google Ads
          (AW-18341719321).
        </p>
      </Section>

      <Section heading="Menüyü tarayan misafirler">
        <p>
          Bir restoranın QR menüsünü açtığınızda menüyü görmek için çerez kabul
          etmeniz veya kayıt olmanız gerekmez. Menü ve ürün görüntüleme sayıları
          işletmeye <strong className="text-white">toplu</strong> olarak
          raporlanmak üzere ölçülür; sizi kişi olarak tanımlamayı amaçlamaz.
        </p>
      </Section>

      <Section heading="Çerezleri nasıl kapatırım?">
        <Bullets
          items={[
            "Tarayıcı ayarları: Chrome, Safari, Firefox ve Edge'in gizlilik/çerez ayarlarından çerezleri engelleyebilir veya mevcut çerezleri silebilirsiniz.",
            <>
              Google Analytics&apos;i tamamen kapatmak için Google&apos;ın{" "}
              <a
                href="https://tools.google.com/dlpage/gaoptout"
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="text-violet-400 underline underline-offset-4"
              >
                Analytics Opt-out eklentisini
              </a>{" "}
              kurabilirsiniz.
            </>,
            <>
              Reklam kişiselleştirmesini{" "}
              <a
                href="https://myadcenter.google.com/"
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="text-violet-400 underline underline-offset-4"
              >
                Google Reklam Ayarları
              </a>{" "}
              üzerinden kapatabilirsiniz.
            </>,
          ]}
        />
        <p>
          Zorunlu çerezleri engellerseniz panele giriş yapamayabilir veya oturumunuz
          sürekli kapanabilir.
        </p>
      </Section>

      <Section heading="İlgili metinler">
        <Bullets
          items={[
            <>
              <Link href="/gizlilik-politikasi" className="text-violet-400 underline underline-offset-4">
                Gizlilik Politikası
              </Link>
            </>,
            <>
              <Link href="/kvkk" className="text-violet-400 underline underline-offset-4">
                KVKK Aydınlatma Metni
              </Link>
            </>,
          ]}
        />
      </Section>
    </ContentPage>
  )
}
