import type { Metadata } from "next"
import Link from "next/link"
import { Bullets, ContentPage, Section } from "@/components/content-page"
import { getSiteUrl } from "@/lib/seo/jsonld"
import { COMPANY, addressLine, hasLegalName, legalEntity } from "@/lib/company"
import { CONTACT_WHATSAPP_DISPLAY, whatsappUrl } from "@/lib/contact"

const SLUG = "kvkk"
const TITLE = "KVKK Aydınlatma Metni"
const DESCRIPTION =
  "6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında QR Menülist aydınlatma metni: veri sorumlusu, işleme amaçları, hukuki sebepler, aktarım ve veri sahibi başvuru yolları."

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

export default function KvkkPage() {
  const address = addressLine()
  const email = COMPANY.privacyEmail.startsWith("TODO") ? null : COMPANY.privacyEmail

  return (
    <ContentPage
      slug={SLUG}
      breadcrumbName="KVKK"
      title={TITLE}
      lead="6698 sayılı Kişisel Verilerin Korunması Kanunu'nun 10. maddesi uyarınca, kişisel verilerinizi hangi sıfatla, hangi amaçla ve hangi hukuki sebeple işlediğimizi açıklıyoruz."
      showLegalNotice
    >
      <Section heading="1. Veri sorumlusunun kimliği">
        <p>
          Kişisel verilerinizin veri sorumlusu{" "}
          <strong className="text-white">{legalEntity()}</strong>&apos;tir.
        </p>
        <Bullets
          items={[
            // Unvan yalnızca lib/company.ts'te doldurulduğunda gösterilir;
            // doğrulanamayan bir tüzel kişilik adı yayınlamıyoruz.
            ...(hasLegalName()
              ? [
                  <>
                    <strong className="text-white">Unvan:</strong> {COMPANY.legalName}
                  </>,
                ]
              : []),
            ...(address
              ? [
                  <>
                    <strong className="text-white">Adres:</strong> {address}
                  </>,
                ]
              : []),
            ...(COMPANY.taxNumber.startsWith("TODO")
              ? []
              : [
                  <>
                    <strong className="text-white">Vergi bilgileri:</strong>{" "}
                    {COMPANY.taxOffice} / {COMPANY.taxNumber}
                  </>,
                ]),
            ...(email
              ? [
                  <>
                    <strong className="text-white">E-posta:</strong>{" "}
                    <a href={`mailto:${email}`} className="text-violet-400 underline underline-offset-4">
                      {email}
                    </a>
                  </>,
                ]
              : []),
            <>
              <strong className="text-white">Telefon / WhatsApp:</strong>{" "}
              {CONTACT_WHATSAPP_DISPLAY}
            </>,
          ]}
        />
      </Section>

      <Section heading="2. İşlenen kişisel veriler ve kategorileri">
        <Bullets
          items={[
            <>
              <strong className="text-white">Kimlik:</strong> ad-soyad (hesap
              açarken veya menüye yorum bırakırken verdiğiniz kadarıyla).
            </>,
            <>
              <strong className="text-white">İletişim:</strong> e-posta adresi,
              telefon numarası, işletme adresi.
            </>,
            <>
              <strong className="text-white">Müşteri işlem:</strong> abonelik ve
              deneme süresi durumu, panelde yapılan menü değişiklikleri.
            </>,
            <>
              <strong className="text-white">İşlem güvenliği:</strong> oturum
              kayıtları, IP adresi, tarayıcı ve cihaz bilgisi.
            </>,
            <>
              <strong className="text-white">Pazarlama / analitik:</strong> menü ve
              ürün görüntüleme sayıları, QR tarama sayıları, çerez tabanlı ölçüm
              verileri.
            </>,
          ]}
        />
        <p>
          Özel nitelikli kişisel veri (sağlık, biyometrik, inanç vb.) talep
          etmiyor ve işlemiyoruz.
        </p>
      </Section>

      <Section heading="3. İşleme amaçları">
        <Bullets
          items={[
            "Hesabınızı oluşturmak, menünüzü yayınlamak ve QR kodunuzu üretmek.",
            "Abonelik ve ücretsiz deneme süresini takip etmek, menü erişimini buna göre yönetmek.",
            "Destek taleplerinizi karşılamak ve sizinle iletişim kurmak.",
            "Hizmetin güvenliğini sağlamak, kötüye kullanımı ve yetkisiz erişimi engellemek.",
            "Menünüzün performansına dair istatistikleri size raporlamak.",
            "Yasal yükümlülükleri yerine getirmek ve hukuki uyuşmazlıklarda savunma hakkını kullanmak.",
          ]}
        />
      </Section>

      <Section heading="4. Hukuki sebepler (KVKK m.5)">
        <Bullets
          items={[
            <>
              <strong className="text-white">m.5/2-c</strong> — sözleşmenin kurulması
              veya ifası için gerekli olması (hesap ve menü verileri).
            </>,
            <>
              <strong className="text-white">m.5/2-ç</strong> — hukuki
              yükümlülüğümüzü yerine getirebilmemiz için zorunlu olması.
            </>,
            <>
              <strong className="text-white">m.5/2-e</strong> — bir hakkın tesisi,
              kullanılması veya korunması için zorunlu olması.
            </>,
            <>
              <strong className="text-white">m.5/2-f</strong> — temel hak ve
              özgürlüklerinize zarar vermemek kaydıyla meşru menfaatimiz (güvenlik,
              istatistik).
            </>,
            <>
              <strong className="text-white">m.5/1 (açık rıza)</strong> — zorunlu
              olmayan analitik/reklam çerezleri gibi, ayrıca onayınıza bağlı
              işlemeler.
            </>,
          ]}
        />
      </Section>

      <Section heading="5. Verilerin aktarıldığı taraflar ve amacı">
        <p>
          Kişisel verileriniz, hizmetin sunulabilmesi için altyapı ve analitik
          hizmet sağlayıcılarımıza (Supabase — veritabanı ve kimlik doğrulama,
          Vercel — barındırma, Google — analitik ve reklam ölçümü, Meta/WhatsApp —
          destek iletişimi) KVKK m.8 ve m.9 çerçevesinde aktarılabilir. Bu
          sağlayıcıların sunucuları yurt dışında bulunabilir.
        </p>
        <p>
          Ayrıca yetkili kamu kurum ve kuruluşlarına, yasal talep halinde ve
          talebin kapsamıyla sınırlı olarak aktarım yapılabilir.
        </p>
      </Section>

      <Section heading="6. Toplama yöntemi">
        <p>
          Kişisel verileriniz; kayıt formu, yönetim paneli, menü sayfalarındaki
          yorum formu, çerezler ve benzeri teknolojiler ile WhatsApp/e-posta
          yazışmaları üzerinden, elektronik ortamda otomatik ve kısmen otomatik
          yollarla toplanır.
        </p>
      </Section>

      <Section heading="7. Veri sahibi olarak haklarınız (KVKK m.11)">
        <Bullets
          items={[
            "Kişisel verilerinizin işlenip işlenmediğini öğrenme.",
            "İşlenmişse buna ilişkin bilgi talep etme.",
            "İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme.",
            "Yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme.",
            "Eksik veya yanlış işlenmişse düzeltilmesini isteme.",
            "Şartları oluştuğunda silinmesini veya yok edilmesini isteme.",
            "Düzeltme, silme ve yok edilme işlemlerinin aktarım yapılan üçüncü kişilere bildirilmesini isteme.",
            "Münhasıran otomatik sistemlerle analiz edilmesi sonucu aleyhinize bir sonuç doğması hâlinde buna itiraz etme.",
            "Kanuna aykırı işleme sebebiyle zarara uğramanız hâlinde zararın giderilmesini talep etme.",
          ]}
        />
      </Section>

      <Section heading="8. Başvuru yolu ve süresi" id="basvuru">
        <p>
          Yukarıdaki haklarınızı kullanmak için talebinizi{" "}
          <strong className="text-white">yazılı olarak</strong> aşağıdaki yollardan
          biriyle iletebilirsiniz. Başvurunuzda adınız-soyadınız, iletişim
          bilgileriniz, talebinizin konusu ve varsa kayıtlı olduğunuz e-posta
          adresi/işletme adı yer almalıdır.
        </p>
        <Bullets
          items={[
            ...(email
              ? [
                  <>
                    <strong className="text-white">E-posta:</strong>{" "}
                    <a href={`mailto:${email}`} className="text-violet-400 underline underline-offset-4">
                      {email}
                    </a>{" "}
                    (kayıtlı e-posta adresinizden gönderirseniz kimlik doğrulaması
                    hızlanır)
                  </>,
                ]
              : []),
            <>
              <strong className="text-white">WhatsApp:</strong>{" "}
              <a
                href={whatsappUrl("Merhaba, KVKK kapsamında veri sahibi başvurusu yapmak istiyorum.")}
                target="_blank"
                rel="noopener noreferrer"
                className="text-violet-400 underline underline-offset-4"
              >
                {CONTACT_WHATSAPP_DISPLAY}
              </a>
            </>,
            ...(address
              ? [
                  <>
                    <strong className="text-white">Posta:</strong> {address}
                  </>,
                ]
              : []),
          ]}
        />
        <p>
          Başvurunuz, talebin niteliğine göre{" "}
          <strong className="text-white">en kısa sürede ve en geç otuz gün içinde</strong>{" "}
          ücretsiz olarak sonuçlandırılır. İşlemin ayrıca bir maliyet gerektirmesi
          hâlinde Kişisel Verileri Koruma Kurulu tarafından belirlenen tarifedeki
          ücret alınabilir.
        </p>
        <p>
          Başvurunuzun reddedilmesi, verilen yanıtı yetersiz bulmanız veya süresinde
          yanıt verilmemesi hâlinde, yanıtı öğrendiğiniz tarihten itibaren otuz ve
          her hâlde başvuru tarihinden itibaren altmış gün içinde Kişisel Verileri
          Koruma Kurulu&apos;na şikâyette bulunabilirsiniz.
        </p>
      </Section>

      <Section heading="9. İlgili diğer metinler">
        <Bullets
          items={[
            <>
              <Link href="/gizlilik-politikasi" className="text-violet-400 underline underline-offset-4">
                Gizlilik Politikası
              </Link>{" "}
              — hangi verileri topladığımızın ayrıntısı
            </>,
            <>
              <Link href="/cerez-politikasi" className="text-violet-400 underline underline-offset-4">
                Çerez Politikası
              </Link>{" "}
              — çerezler ve ölçüm araçları
            </>,
            <>
              <Link href="/kullanim-sartlari" className="text-violet-400 underline underline-offset-4">
                Kullanım Şartları
              </Link>{" "}
              — hizmetin kullanım kuralları
            </>,
          ]}
        />
      </Section>
    </ContentPage>
  )
}
