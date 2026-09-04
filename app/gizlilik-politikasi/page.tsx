import type { Metadata } from "next"
import Link from "next/link"
import { Bullets, ContentPage, Section } from "@/components/content-page"
import { getSiteUrl } from "@/lib/seo/jsonld"
import { COMPANY, addressLine, hasLegalName, legalEntity } from "@/lib/company"

const SLUG = "gizlilik-politikasi"
const TITLE = "Gizlilik Politikası"
const DESCRIPTION =
  "QR Menülist gizlilik politikası: hangi kişisel verileri topluyoruz, neden topluyoruz, kimlerle paylaşıyoruz, ne kadar süre saklıyoruz ve haklarınızı nasıl kullanırsınız."

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

export default function GizlilikPolitikasiPage() {
  const address = addressLine()

  return (
    <ContentPage
      slug={SLUG}
      breadcrumbName={TITLE}
      title={TITLE}
      lead="Bu politika, QR Menülist'i kullandığınızda hangi verilerinizi işlediğimizi, bunu neden yaptığımızı ve verileriniz üzerinde hangi haklara sahip olduğunuzu açıklar."
      showLegalNotice
    >
      <Section heading="1. Veri sorumlusu">
        <p>
          Bu politikanın konusu olan kişisel verilerin veri sorumlusu{" "}
          <strong className="text-white">{legalEntity()}</strong>
          {hasLegalName() ? ' ("QR Menülist", "biz")' : ' ("biz")'} şirketidir.
          {address ? ` Adres: ${address}.` : ""}
          {!COMPANY.email.startsWith("TODO")
            ? ` İletişim: ${COMPANY.email}.`
            : ""}{" "}
          Bize <Link href="/iletisim" className="text-violet-400 underline underline-offset-4">iletişim sayfasından</Link>{" "}
          ulaşabilirsiniz.
        </p>
      </Section>

      <Section heading="2. Hangi verileri topluyoruz">
        <p>
          Platformda iki farklı kullanıcı grubu var ve her biri için topladığımız
          veri farklı:
        </p>

        <h3 className="text-lg font-semibold text-white pt-2">
          a) İşletme sahipleri (hesap açan kullanıcılar)
        </h3>
        <Bullets
          items={[
            "Hesap bilgileri: e-posta adresi, şifre (geri döndürülemez şekilde şifrelenerek saklanır), telefon numarası.",
            "İşletme bilgileri: restoran adı, adresi, telefonu, sosyal medya hesapları, logo ve görseller — bunları menünüzde yayınlanmak üzere siz giriyorsunuz.",
            "Menü içeriği: kategori ve ürün adları, açıklamalar, fiyatlar, ürün fotoğrafları.",
            "Kullanım kayıtları: oturum açma zamanları, panelde yaptığınız değişiklikler, abonelik ve deneme süresi durumu.",
          ]}
        />

        <h3 className="text-lg font-semibold text-white pt-2">
          b) Menüyü görüntüleyen misafirler
        </h3>
        <Bullets
          items={[
            "Görüntüleme istatistikleri: hangi menünün/ürünün kaç kez görüntülendiği, QR kod tarama sayısı, görüntüleme zamanı, cihaz tipi ve genel konum (ülke/şehir düzeyi).",
            "Yorum bırakırsanız: yazdığınız isim (takma ad kullanabilirsiniz), puan ve yorum metni.",
          ]}
        />
        <p>
          Menüyü görüntülemek için hesap açmanız, kayıt olmanız veya kimlik
          bilgisi vermeniz gerekmez. Misafir tarafında topladığımız istatistikler
          işletmeye toplu (anonim) olarak gösterilir; tek tek kişileri
          tanımlamayı amaçlamaz.
        </p>
      </Section>

      <Section heading="3. Verileri neden işliyoruz">
        <Bullets
          items={[
            "Hizmeti sunmak: menünüzü yayınlamak, QR kodunuzu üretmek, panele erişiminizi sağlamak (sözleşmenin ifası).",
            "Hesap güvenliği: yetkisiz erişimi engellemek, oturumları doğrulamak (meşru menfaat).",
            "İstatistik ve raporlama: menünüzün kaç kez görüntülendiğini size göstermek (meşru menfaat).",
            "Destek: WhatsApp veya e-posta üzerinden gelen taleplerinizi yanıtlamak (sözleşmenin ifası / meşru menfaat).",
            "Yasal yükümlülükler: mevzuattan doğan saklama ve bilgi verme yükümlülüklerini yerine getirmek.",
          ]}
        />
        <p>
          Kişisel verilerinizi <strong className="text-white">satmıyoruz</strong> ve
          reklam amacıyla üçüncü taraflara pazarlamıyoruz.
        </p>
      </Section>

      <Section heading="4. Kimlerle paylaşıyoruz">
        <p>
          Hizmeti çalıştırmak için hizmet sağlayıcılarla (işleyenlerle) çalışıyoruz.
          Bunlar yalnızca bize hizmet verdikleri ölçüde veriye erişir:
        </p>
        <Bullets
          items={[
            <>
              <strong className="text-white">Supabase</strong> — veritabanı, kimlik
              doğrulama ve görsel depolama altyapısı.
            </>,
            <>
              <strong className="text-white">Vercel</strong> — sitenin barındırıldığı
              ve sunulduğu altyapı.
            </>,
            <>
              <strong className="text-white">Google Analytics / Google Ads</strong> —
              site kullanımına ilişkin toplu ölçüm ve reklam performansı. Detay için{" "}
              <Link href="/cerez-politikasi" className="text-violet-400 underline underline-offset-4">
                çerez politikamıza
              </Link>{" "}
              bakın.
            </>,
            <>
              <strong className="text-white">WhatsApp (Meta)</strong> — destek
              iletişimi için, yalnızca siz bize yazdığınızda.
            </>,
          ]}
        />
        <p>
          Bunun dışında verilerinizi yalnızca yasal bir zorunluluk halinde (yetkili
          kamu kurumu talebi, mahkeme kararı) paylaşırız.
        </p>
      </Section>

      <Section heading="5. Verilerin yurt dışına aktarımı">
        <p>
          Kullandığımız altyapı sağlayıcılarının sunucuları Türkiye dışında da
          bulunabilir. Bu durumda kişisel veriler, KVKK&apos;nın 9. maddesi
          kapsamında ve sağlayıcılarla akdedilen sözleşmelerdeki koruma taahhütleri
          çerçevesinde yurt dışına aktarılabilir.
        </p>
      </Section>

      <Section heading="6. Saklama süresi">
        <Bullets
          items={[
            "Hesap ve menü verileri: hesabınız açık olduğu sürece. Hesabınızı sildirdiğinizde menü, kategori ve ürün verileriniz silinir.",
            "Deneme süresi dolan hesaplar: menü yayından kalkar ancak içerik verileri, tekrar Pro'ya geçmek isteyebileceğiniz için makul bir süre saklanır. Silinmesini isterseniz talebiniz üzerine silinir.",
            "Görüntüleme istatistikleri: toplu (anonim) hâlde süresiz saklanabilir.",
            "Yasal saklama süresi öngörülen kayıtlar: mevzuatta belirtilen süre boyunca.",
          ]}
        />
      </Section>

      <Section heading="7. Veri güvenliği">
        <Bullets
          items={[
            "Site tamamen HTTPS üzerinden sunulur; trafik şifrelenir.",
            "Şifreler geri döndürülemez şekilde (hash) saklanır; biz de göremeyiz.",
            "Veritabanı erişimi satır düzeyi güvenlik (RLS) kurallarıyla sınırlıdır: bir işletme yalnızca kendi verisine erişebilir.",
            "Panel ve yönetim arayüzleri oturum doğrulaması arkasındadır ve arama motorlarına kapalıdır.",
          ]}
        />
      </Section>

      <Section heading="8. Haklarınız">
        <p>
          KVKK&apos;nın 11. maddesi uyarınca; kişisel verilerinizin işlenip
          işlenmediğini öğrenme, işlenmişse bilgi talep etme, işlenme amacını
          öğrenme, aktarıldığı üçüncü kişileri bilme, yanlış veya eksik işlenmişse
          düzeltilmesini, koşulları oluştuğunda silinmesini veya yok edilmesini
          isteme, işleme faaliyetine itiraz etme ve zararınızın giderilmesini talep
          etme haklarına sahipsiniz.
        </p>
        <p>
          Başvuru yöntemi ve süreleri için{" "}
          <Link href="/kvkk" className="text-violet-400 underline underline-offset-4">
            KVKK aydınlatma metnimize
          </Link>{" "}
          bakabilirsiniz.
        </p>
      </Section>

      <Section heading="9. Çocukların verileri">
        <p>
          Platform işletmelere yöneliktir ve 18 yaşın altındaki kişilerden bilerek
          kişisel veri toplamayız. Böyle bir verinin bize ulaştığını
          düşünüyorsanız bizimle iletişime geçin; talebiniz üzerine silinir.
        </p>
      </Section>

      <Section heading="10. Bu politikada değişiklikler">
        <p>
          Bu politikayı hizmetteki veya mevzuattaki değişikliklere göre
          güncelleyebiliriz. Güncelleme yaptığımızda sayfanın üstündeki &quot;son
          güncelleme&quot; tarihini değiştiririz. Esaslı bir değişiklik olursa
          kayıtlı kullanıcılarımızı ayrıca bilgilendiririz.
        </p>
      </Section>
    </ContentPage>
  )
}
