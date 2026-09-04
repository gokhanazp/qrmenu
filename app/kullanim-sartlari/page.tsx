import type { Metadata } from "next"
import Link from "next/link"
import { Bullets, ContentPage, Section } from "@/components/content-page"
import { getSiteUrl } from "@/lib/seo/jsonld"
import { hasLegalName, legalEntity } from "@/lib/company"
import { FREE_OFFER } from "@/lib/offer"

const SLUG = "kullanim-sartlari"
const TITLE = "Kullanım Şartları"
const DESCRIPTION =
  "QR Menülist kullanım şartları: hesap açma, ücretsiz deneme süresi, Pro plana geçiş, içerik sorumluluğu, hizmetin askıya alınması ve fesih koşulları."

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

export default function KullanimSartlariPage() {
  return (
    <ContentPage
      slug={SLUG}
      breadcrumbName={TITLE}
      title={TITLE}
      lead="QR Menülist'te hesap açtığınızda bu şartları kabul etmiş olursunuz. Şartlar; hizmetin kapsamını, ücretsiz deneme süresini, karşılıklı sorumlulukları ve fesih koşullarını düzenler."
      showLegalNotice
    >
      <Section heading="1. Taraflar ve konu">
        <p>
          Bu şartlar, bir tarafta{" "}
          <strong className="text-white">{legalEntity()}</strong>
          {hasLegalName() ? ' ("QR Menülist")' : ''}, diğer tarafta hesap açan
          işletme veya kişi
          (&quot;Kullanıcı&quot;) arasındaki hizmet ilişkisini düzenler. Konu, QR
          kod ile erişilen dijital menü oluşturma ve yönetme hizmetidir.
        </p>
      </Section>

      <Section heading="2. Hesap açma ve doğruluk">
        <Bullets
          items={[
            "Hesap açarken verdiğiniz bilgilerin (e-posta, telefon, işletme adı) doğru ve güncel olmasından siz sorumlusunuz.",
            "Hesap bilgilerinizin ve şifrenizin gizliliğini korumak sizin sorumluluğunuzdadır. Hesabınız üzerinden yapılan işlemler size aittir.",
            "Bir işletme adına hesap açıyorsanız, o işletmeyi temsil etme yetkiniz olduğunu beyan etmiş sayılırsınız.",
            "Hesap açmak için 18 yaşını doldurmuş olmanız gerekir.",
          ]}
        />
      </Section>

      <Section heading="3. Ücretsiz deneme süresi ve Pro plan">
        <p>
          Yeni açtığınız hesapta menünüz{" "}
          <strong className="text-white">
            ilk {FREE_OFFER.months} ay ({FREE_OFFER.days} gün)
          </strong>{" "}
          ücretsiz ve tam özellikli olarak yayında kalır. Kayıt sırasında kredi
          kartı bilgisi istenmez.
        </p>
        <Bullets
          items={[
            `Deneme süresi hesabın oluşturulduğu tarihte başlar ve ${FREE_OFFER.days} gün sürer.`,
            "Deneme süresi dolduğunda menünüzün herkese açık (public) görüntülenmesi durur. Panelinize erişiminiz devam eder.",
            "Menü, kategori ve ürün verileriniz süre dolduğu için silinmez; Pro plana geçtiğinizde menü aynı adresten yeniden yayına girer.",
            "Pro plan ücretleri ve ödeme yöntemi, sizinle iletişim (WhatsApp/e-posta) üzerinden bildirilir ve Pro'ya geçiş yönetim tarafından tanımlanır.",
            "Fiyatlar önceden bildirimde bulunularak değiştirilebilir. Değişiklik, mevcut ödenmiş dönemi etkilemez.",
          ]}
        />
      </Section>

      <Section heading="4. İçerik sorumluluğu">
        <p>
          Menünüze eklediğiniz her şey — ürün adları, açıklamalar, fiyatlar,
          fotoğraflar, logo, işletme bilgileri —{" "}
          <strong className="text-white">sizin içeriğinizdir</strong> ve
          sorumluluğu size aittir.
        </p>
        <Bullets
          items={[
            "Yüklediğiniz görsellerin kullanım hakkına sahip olduğunuzu beyan edersiniz. Üçüncü kişilerin telif hakkını ihlal eden görselleri yüklemeyin.",
            "Menüde gösterilen fiyatların ve ürün bilgilerinin doğruluğundan siz sorumlusunuz. Alerjen ve besin değeri bilgisi vermek zorundaysanız mevzuata uygunluk sizin yükümlülüğünüzdür.",
            "Yanıltıcı, hukuka aykırı, nefret söylemi içeren veya üçüncü kişilerin haklarını ihlal eden içerik yayınlanamaz.",
            "İçeriğinizi hizmeti sunabilmek için (menüyü yayınlamak, önbelleğe almak, görselleri boyutlandırmak) işleme hakkını bize vermiş olursunuz. Bunun dışında içeriğiniz üzerinde hak iddia etmeyiz.",
          ]}
        />
      </Section>

      <Section heading="5. Müşteri yorumları">
        <p>
          Menü sayfanızda misafirler yorum ve puan bırakabilir. Yorumların
          moderasyonu panelinizden yapılabilir. Hukuka aykırı veya hakaret içeren
          yorumları kaldırma hakkımız saklıdır.
        </p>
      </Section>

      <Section heading="6. Kabul edilmeyen kullanımlar">
        <Bullets
          items={[
            "Hizmeti tersine mühendislik yapmak, kaynak kodunu izinsiz elde etmeye çalışmak.",
            "Otomatik araçlarla anormal yük oluşturmak, altyapıyı zorlamak veya güvenlik önlemlerini aşmaya çalışmak.",
            "Başka bir kullanıcının hesabına veya verisine izinsiz erişmeye çalışmak.",
            "Hizmeti, dijital menü dışında bir amaçla (ör. genel dosya barındırma) kullanmak.",
          ]}
        />
      </Section>

      <Section heading="7. Hizmetin sürekliliği">
        <p>
          Hizmeti kesintisiz sunmak için makul çabayı gösteririz ancak bakım,
          altyapı sağlayıcısı kaynaklı arıza veya mücbir sebep hâllerinde geçici
          kesintiler yaşanabilir. Planlı bakımları mümkün olduğunca yoğun olmayan
          saatlerde yapar ve önceden duyurmaya çalışırız.
        </p>
      </Section>

      <Section heading="8. Askıya alma ve fesih">
        <Bullets
          items={[
            "Bu şartlara aykırı kullanım tespit edilirse hesabı önce uyarır, sürmesi hâlinde askıya alabilir veya kapatabiliriz. Açık hukuka aykırılık veya güvenlik riski hâlinde uyarı beklemeden askıya alabiliriz.",
            "Hesabınızı dilediğiniz zaman kapatmak isteyebilirsiniz; talebiniz üzerine hesabınız ve menü verileriniz silinir.",
            "Hesap kapandığında QR kodunuzun işaret ettiği adres yayından kalkar.",
          ]}
        />
      </Section>

      <Section heading="9. Sorumluluğun sınırı">
        <p>
          Hizmet &quot;olduğu gibi&quot; sunulur. Menünüzdeki bilgilerin
          doğruluğundan, menü üzerinden oluşan ticari sonuçlardan veya dolaylı
          zararlardan (kâr kaybı, itibar kaybı gibi) sorumlu tutulamayız.
          Sorumluluğumuz her hâlükârda, uyuşmazlığın doğduğu tarihten önceki
          on iki ayda bize ödediğiniz toplam ücretle sınırlıdır.
        </p>
      </Section>

      <Section heading="10. Kişisel veriler">
        <p>
          Kişisel verilerin işlenmesine ilişkin esaslar{" "}
          <Link href="/gizlilik-politikasi" className="text-violet-400 underline underline-offset-4">
            Gizlilik Politikası
          </Link>{" "}
          ve{" "}
          <Link href="/kvkk" className="text-violet-400 underline underline-offset-4">
            KVKK Aydınlatma Metni
          </Link>{" "}
          ile düzenlenir; bu şartların ayrılmaz parçasıdır.
        </p>
      </Section>

      <Section heading="11. Değişiklikler">
        <p>
          Bu şartları güncelleyebiliriz. Esaslı bir değişiklikte kayıtlı
          kullanıcıları e-posta ile bilgilendiririz. Değişiklikten sonra hizmeti
          kullanmaya devam etmeniz, güncel şartları kabul ettiğiniz anlamına gelir.
        </p>
      </Section>

      <Section heading="12. Uygulanacak hukuk ve yetkili mahkeme">
        <p>
          Bu şartlara Türkiye Cumhuriyeti hukuku uygulanır. Uyuşmazlıklarda
          yetkili mahkeme ve icra daireleri, veri sorumlusunun kayıtlı adresinin
          bulunduğu yer mahkemeleridir. Tüketici sıfatını haiz kullanıcıların
          tüketici hakem heyetlerine ve tüketici mahkemelerine başvurma hakkı
          saklıdır.
        </p>
      </Section>
    </ContentPage>
  )
}
