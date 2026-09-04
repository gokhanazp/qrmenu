import type { Metadata } from "next"
import Link from "next/link"
import { Bullets, ContentPage, Section } from "@/components/content-page"
import { getSiteUrl } from "@/lib/seo/jsonld"
import { COMPANY, addressLine } from "@/lib/company"
import { FREE_OFFER } from "@/lib/offer"
import { REFERENCE_CUSTOMERS } from "@/lib/testimonials"

const SLUG = "hakkimizda"
const TITLE = "Hakkımızda"
const DESCRIPTION =
  "QR Menülist kimdir? Restoran, kafe ve oteller için QR menü oluşturma platformunu kim geliştiriyor, neden geliştirdik ve hangi işletmeler kullanıyor."

export const metadata: Metadata = {
  title: { absolute: `Hakkımızda — QR Menülist Kimdir? | QR Menülist` },
  description: DESCRIPTION,
  alternates: { canonical: `${getSiteUrl()}/${SLUG}` },
  openGraph: {
    title: "Hakkımızda — QR Menülist Kimdir?",
    description: DESCRIPTION,
    url: `${getSiteUrl()}/${SLUG}`,
    type: "website",
    locale: "tr_TR",
    siteName: "QR Menülist",
  },
}

export default function HakkimizdaPage() {
  const address = addressLine()

  return (
    <ContentPage
      slug={SLUG}
      breadcrumbName={TITLE}
      title="Hakkımızda"
      lead="QR Menülist, restoran ve kafelerin menüsünü karekod ile telefondan açılan dijital bir menüye çeviren bir Türkiye ekibi ürünüdür. Basılı menünün en can sıkıcı kısmını çözmek için kurulduk: fiyat değiştiğinde her şeyi yeniden bastırmak zorunda kalmak."
    >
      <Section heading="Neden bu ürünü yaptık">
        <p>
          Bir restoranda fiyat değişikliği menü basımından daha sık olur. Zam
          geldiğinde ya menüyü baştan bastırıyorsunuz ya da üzerine etiket
          yapıştırıyorsunuz — ikisi de işletmeye masraf, müşteriye kötü izlenim.
          Yeni bir ürün eklemek istediğinizde de aynı hikâye baştan başlıyor.
        </p>
        <p>
          QR Menülist bu döngüyü kırmak için var. QR kodu bir kez bastırıp masaya
          koyuyorsunuz; sonrasında fiyat, ürün, fotoğraf ne değişirse panelden
          değiştiriyorsunuz ve masadaki karekod hep güncel menüyü gösteriyor.
          Karekodun kendisi hiç değişmiyor.
        </p>
      </Section>

      <Section heading="Ne yapıyoruz">
        <Bullets
          items={[
            <>
              <strong className="text-white">QR menü oluşturma:</strong> kategoriler,
              ürünler, fiyatlar, fotoğraflar — panelden yönetilen ve anında yayına
              giren bir menü.{" "}
              <Link href="/qr-menu-olusturma" className="text-violet-400 underline underline-offset-4">
                Nasıl yapıldığını görün
              </Link>
              .
            </>,
            <>
              <strong className="text-white">Baskıya hazır QR kod:</strong> yüksek
              çözünürlüklü QR kodu panelden indirip masa standına, duvara veya
              vitrine koyabilirsiniz.
            </>,
            <>
              <strong className="text-white">Çift dilli menü:</strong> Türkçe +
              İngilizce. Çeviriyi yapay zeka ile tek tıkla üretip sonra elle
              düzeltebilirsiniz — turist yoğun bölgelerde en çok kullanılan özellik.
            </>,
            <>
              <strong className="text-white">Görüntüleme istatistikleri:</strong>{" "}
              menünüzün kaç kez tarandığı ve hangi ürünlerin daha çok görüntülendiği.
              Menü mühendisliği yapmak için gerçek veri.
            </>,
            <>
              <strong className="text-white">Marka uyumlu tasarım:</strong> renkler,
              logo ve düzen işletmenizin görünümüne göre ayarlanır; menü jenerik bir
              şablon gibi durmaz.
            </>,
            <>
              <strong className="text-white">Müşteri yorumları:</strong> misafirler
              menü sayfasından puan ve yorum bırakabilir; siz panelden yönetirsiniz.
            </>,
          ]}
        />
      </Section>

      <Section heading="Bizi kullanan işletmeler">
        <p>
          Kafeden dönercisine, bistrodan otel restoranına kadar farklı ölçekte
          işletmelerle çalışıyoruz. Menülerimiz herkese açık — hepsini
          inceleyebilirsiniz:
        </p>
        <ul className="grid sm:grid-cols-2 gap-3 pt-1">
          {REFERENCE_CUSTOMERS.map((customer) => (
            <li key={customer.slug}>
              <Link
                href={`/restorant/${customer.slug}`}
                className="block rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 hover:border-violet-500/40 transition-colors"
              >
                <span className="font-medium text-white">{customer.name}</span>
                <span className="block text-sm text-gray-500">
                  Menüyü ve fiyatları gör
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Section>

      <Section heading="Nasıl çalışıyoruz">
        <Bullets
          items={[
            `Yeni hesaplarda menü ilk ${FREE_OFFER.months} ay ücretsiz yayında kalır ve kayıt için kredi kartı istemiyoruz. Ürünü önce görün, sonra karar verin.`,
            "Menü kurulumunda takılırsanız WhatsApp'tan yazın; menünüzü sizin için kurabiliriz. Bu ek bir ücrete tabi değildir.",
            "Özellik taleplerini doğrudan işletmelerden alıyoruz. Yapay zeka çevirisi, günün menüsü ve yorum modülü bu şekilde geldi.",
          ]}
        />
      </Section>

      <Section heading="Şirket bilgileri">
        <Bullets
          items={[
            <>
              <strong className="text-white">Marka:</strong> {COMPANY.brand}
            </>,
            ...(COMPANY.legalName.startsWith("TODO")
              ? []
              : [
                  <>
                    <strong className="text-white">Unvan:</strong> {COMPANY.legalName}
                  </>,
                ]),
            ...(COMPANY.foundedYear.startsWith("TODO")
              ? []
              : [
                  <>
                    <strong className="text-white">Kuruluş:</strong>{" "}
                    {COMPANY.foundedYear}
                  </>,
                ]),
            ...(address
              ? [
                  <>
                    <strong className="text-white">Adres:</strong> {address}
                  </>,
                ]
              : []),
            <>
              <strong className="text-white">İletişim:</strong>{" "}
              <Link href="/iletisim" className="text-violet-400 underline underline-offset-4">
                iletişim sayfası
              </Link>
            </>,
          ]}
        />
      </Section>
    </ContentPage>
  )
}
