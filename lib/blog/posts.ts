/**
 * Blog içerikleri.
 *
 * SEO notu: Ana ticari sayfalar zaten "qr menü" (ana sayfa), "qr menü oluşturma"
 * (/qr-menu-olusturma) ve "ücretsiz qr menü" (/ucretsiz-qr-menu) terimlerini
 * hedefliyor. Buradaki yazılar aynı terimlerde o sayfalarla yarışmasın diye
 * bilgi amaçlı uzun kuyruk sorguları hedefler ve iç linklerle ticari sayfalara
 * yönlendirir. Böylece kümenin tamamı güçlenir, keyword cannibalization olmaz.
 */

export type Block =
  | { type: 'p'; text: string }
  | { type: 'list'; items: string[] }
  | { type: 'steps'; items: string[] }
  | { type: 'callout'; title: string; text: string }
  | { type: 'table'; head: string[]; rows: string[][] }

export type Section = {
  /** Sayfa içi gezinme (içindekiler) için kullanılır */
  id: string
  heading: string
  blocks: Block[]
}

export type BlogPost = {
  slug: string
  title: string
  /** <title> etiketi — genelde title'dan daha kısa/marka ekli */
  metaTitle: string
  description: string
  keywords: string[]
  /** ISO tarih (YYYY-MM-DD) */
  publishedAt: string
  updatedAt: string
  readingMinutes: number
  category: string
  icon: string
  excerpt: string
  /** Giriş paragrafları — H1'in hemen altında */
  intro: string[]
  sections: Section[]
  faq: Array<{ q: string; a: string }>
  /** İlgili yazı slug'ları */
  related: string[]
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: 'qr-menu-nedir',
    title: 'QR Menü Nedir? Nasıl Çalışır, Kimler Kullanır?',
    metaTitle: 'QR Menü Nedir? Nasıl Çalışır? (Tam Rehber) | QR Menülist',
    description:
      'QR menü nedir, nasıl çalışır ve restoranına ne kazandırır? QR kod menü sisteminin işleyişini, basılı menüden farklarını ve kurulum adımlarını örneklerle anlattık.',
    keywords: [
      'qr menü nedir',
      'qr kod menü nedir',
      'qr menü nasıl çalışır',
      'dijital menü nedir',
      'qr menü sistemi',
      'qr kodlu menü',
      'restoran qr menü',
    ],
    publishedAt: '2026-07-28',
    updatedAt: '2026-07-28',
    readingMinutes: 7,
    category: 'Başlangıç',
    icon: 'help_center',
    excerpt:
      'QR menü, masadaki bir kareyi telefonuyla tarayan müşterinin menüyü tarayıcıda görmesini sağlayan sistemdir. İşleyişi, maliyeti ve kurulumu bu yazıda.',
    intro: [
      'Son yıllarda restoran ve kafe masalarında küçük kare kodlar gördüyseniz, karşılaştığınız şey bir **QR menü**. Müşteri telefonunun kamerasını koda tutuyor, saniyeler içinde menü ekranda açılıyor. Uygulama indirmek, üye olmak ya da kimseyi beklemek gerekmiyor.',
      'Bu yazıda QR menünün ne olduğunu, arka planda nasıl çalıştığını, hangi işletme tiplerine uygun olduğunu ve kurulumun gerçekte ne kadar sürdüğünü anlatıyoruz. Doğrudan kurulum adımlarına geçmek isterseniz [qr menü oluşturma](/qr-menu-olusturma) rehberimiz adım adım anlatıyor.',
    ],
    sections: [
      {
        id: 'qr-menu-nedir',
        heading: 'QR Menü Nedir?',
        blocks: [
          {
            type: 'p',
            text: 'QR menü, restoranın ürün listesini basılı kâğıt yerine bir web sayfasında sunan ve bu sayfaya QR kod üzerinden erişim veren dijital menü sistemidir. Masaya yerleştirilen QR kod, aslında menü sayfanızın adresini (URL) makine tarafından okunabilir hâle getirmiş bir görselden başka bir şey değildir.',
          },
          {
            type: 'p',
            text: 'Buradaki kritik ayrım şu: QR kod menünüz değildir, menünüzün **kapısıdır**. Menü içeriği sunucuda durur. Bu yüzden fiyatı değiştirdiğinizde QR kodu yeniden basmanız gerekmez — kod aynı adrese bakmaya devam eder, adresteki içerik güncellenmiştir. Basılı menüde bir fiyat değişikliği tüm menülerin çöpe gitmesi anlamına gelirken, QR menüde 20 saniyelik bir düzenlemedir.',
          },
          {
            type: 'callout',
            title: 'Kısa tanım',
            text: 'QR menü = masadaki QR kod + telefonun tarayıcısında açılan, işletmenin panelden yönettiği güncel menü sayfası.',
          },
        ],
      },
      {
        id: 'nasil-calisir',
        heading: 'QR Menü Nasıl Çalışır? (4 Adımda İşleyiş)',
        blocks: [
          {
            type: 'p',
            text: 'Müşteri açısından tek bir hareket var, ama arka planda dört adım işliyor:',
          },
          {
            type: 'steps',
            items: [
              '**Kod okunur.** Müşteri kamerayı QR koda tutar. iPhone ve Android telefonlarda kamera uygulaması QR kodu yerleşik olarak tanır; ayrı bir uygulama gerekmez.',
              '**Adres çözümlenir.** Kodun içindeki URL telefona iletilir ve tarayıcıda bir bildirim/bağlantı olarak görünür.',
              '**Menü sayfası yüklenir.** Müşteri bağlantıya dokunur, menü sayfası açılır. İyi kurgulanmış bir menü mobil için tasarlanmıştır: büyük fotoğraflar, kategori sekmeleri, hızlı yükleme.',
              '**İçerik canlı gelir.** Sayfa, sizin panelden girdiğiniz güncel kategori, ürün, fiyat ve fotoğrafları çeker. Sabah yaptığınız fiyat değişikliği öğle servisinde geçerlidir.',
            ],
          },
          {
            type: 'p',
            text: 'Müşteri tarafında uygulama indirme, kayıt olma veya form doldurma adımı yoktur. Bu, QR menünün mobil uygulama tabanlı çözümlere göre en büyük avantajıdır: sürtünme sıfıra yakındır.',
          },
        ],
      },
      {
        id: 'basili-menuden-farki',
        heading: 'QR Menü ile Basılı Menü Arasındaki Farklar',
        blocks: [
          {
            type: 'table',
            head: ['Kriter', 'Basılı Menü', 'QR Menü'],
            rows: [
              ['Fiyat güncelleme', 'Yeniden tasarım + baskı', 'Panelden anında'],
              ['Yeni ürün ekleme', 'Bir sonraki baskıyı bekler', 'Dakikalar içinde'],
              ['Tükenen ürün', 'Garson sözlü olarak bildirir', 'Ürün menüden gizlenir'],
              ['Yabancı dil', 'Ayrı menü bastırılır', 'Aynı menü, dil seçimi ile'],
              ['Fotoğraf', 'Baskı maliyetini artırır', 'Her ürüne ücretsiz eklenir'],
              ['Yıpranma', 'Lekelenir, yırtılır, yenilenir', 'Yıpranmaz'],
              ['Veri', 'Ölçüm yok', 'Hangi ürün kaç kez görüntülendi'],
              ['İlk kurulum', 'Tasarım + matbaa süreci', 'Aynı gün yayında'],
            ],
          },
          {
            type: 'p',
            text: 'Tabloyu okurken şunu unutmayın: basılı menünün de güçlü tarafları var — fiziksel bir obje olarak marka algısı yaratır ve telefon kullanmak istemeyen misafiri zorlamaz. İki yöntemi karşılaştırmalı olarak ele aldığımız [QR menü mü basılı menü mü](/blog/qr-menu-mu-basili-menu-mu) yazısında bu dengeyi ayrıntılı tartışıyoruz.',
          },
        ],
      },
      {
        id: 'kimler-kullanir',
        heading: 'Hangi İşletmeler QR Menü Kullanıyor?',
        blocks: [
          {
            type: 'p',
            text: 'QR menü sadece büyük zincirlerin işi değil. Aksine, en hızlı fayda gören yerler menüsü sık değişen küçük işletmeler:',
          },
          {
            type: 'list',
            items: [
              '**Restoranlar** — mevsimlik menü değişikliği ve günün yemeği uygulaması olanlar',
              '**Kafeler ve kahveciler** — ürün çeşidi çok, fiyat hareketi sık',
              '**Bar ve gece işletmeleri** — kokteyl listesi sürekli güncellenir, ışık az olduğu için ekran okunaklıdır',
              '**Oteller** — oda servisi, havuz başı ve kahvaltı menüsünü tek panelden yönetir',
              '**Pastane ve fırınlar** — vitrindeki ürün her gün farklıdır',
              '**Turistik bölgedeki işletmeler** — çok dilli menü ihtiyacı en yüksek grup',
              '**Food truck ve mobil satış** — yer değiştiren işletme için basılı menü pratik değildir',
            ],
          },
          {
            type: 'p',
            text: 'Ortak nokta şu: menüsü değişen her işletme basılı menüde para kaybeder. Menü ne kadar sık değişiyorsa QR menünün getirisi o kadar yüksektir.',
          },
        ],
      },
      {
        id: 'ne-kadar-surer',
        heading: 'QR Menü Kurmak Ne Kadar Sürer?',
        blocks: [
          {
            type: 'p',
            text: 'Beklentiden kısa. İşin büyük kısmı menü içeriğini girmek; sistem tarafı zaten hazır. Gerçekçi bir zaman planı:',
          },
          {
            type: 'table',
            head: ['Adım', 'Süre'],
            rows: [
              ['Hesap açma', '1-2 dakika'],
              ['Restoran bilgileri (isim, logo, iletişim)', '3-5 dakika'],
              ['Kategori oluşturma (6-8 kategori)', '5 dakika'],
              ['Ürün girişi (ürün başına ~40 saniye)', '30-60 dakika'],
              ['Ürün fotoğrafı yükleme', 'Fotoğraflar hazırsa 15 dakika'],
              ['QR kodu indirip bastırma', '5 dakika + matbaa'],
            ],
          },
          {
            type: 'p',
            text: 'Yani 50-60 ürünlük bir menüyü tek oturumda, yaklaşık bir-bir buçuk saatte bitirebilirsiniz. En çok vakit alan kısım ürün fotoğrafları — bu yüzden fotoğrafları önceden toplayıp klasörlemek işi hızlandırır. İsterseniz fotoğrafları sonradan da ekleyebilirsiniz; menü fotoğrafsız da yayına girer.',
          },
          {
            type: 'callout',
            title: 'İpucu',
            text: 'Tüm menüyü birden girmeye çalışmayın. En çok satan 15 ürünle yayına girin, kalanını haftaya yayın. Yayında olan eksik menü, yayına girmemiş mükemmel menüden iyidir.',
          },
        ],
      },
      {
        id: 'dikkat-edilmesi-gerekenler',
        heading: 'QR Menüye Geçerken Dikkat Edilmesi Gerekenler',
        blocks: [
          {
            type: 'p',
            text: 'QR menü kurmak kolay, iyi bir QR menü kurmak biraz daha dikkat istiyor. Sık yapılan hatalar:',
          },
          {
            type: 'list',
            items: [
              '**PDF menü koymak.** QR kodun bir PDF dosyasına gitmesi en yaygın hata. PDF telefonda yavaş açılır, yakınlaştırma gerektirir ve güncellenmesi için yeni dosya yüklemek gerekir. Menü, mobil için tasarlanmış bir web sayfası olmalı.',
              '**QR kodu yanlış yere koymak.** Masanın kenarında kalan, örtünün altına giren ya da vazonun arkasında kaybolan kod taranmaz. Kod göz hizasında ve sabit olmalı.',
              '**Kodu çok küçük bastırmak.** Masa üstü kullanım için kenar uzunluğunun en az 2,5-3 cm olması gerekir. Daha küçüğü düşük ışıkta okunmaz.',
              '**Wi-Fi bilgisini paylaşmamak.** Mobil verisi zayıf olan misafir menüye ulaşamaz. QR kodun yanına Wi-Fi adı ve şifresini yazın.',
              '**Fiyatları güncellemeyi unutmak.** QR menünün en büyük avantajını kullanmamak. Zam yaptığınız gün panele girin.',
              '**Basılı menüyü tamamen kaldırmak.** Birkaç adet basılı menüyü elinizin altında tutun; telefonu olmayan ya da kullanmak istemeyen misafir için gerekir.',
            ],
          },
          {
            type: 'p',
            text: 'Menü içeriğini müşteriyi sipariş vermeye yaklaştıracak şekilde düzenlemek başlı başına bir konu. [QR menü tasarımı](/blog/qr-menu-tasarimi) yazısında kategori sıralaması, fotoğraf seçimi ve fiyat gösterimi üzerine somut kurallar var.',
          },
        ],
      },
      {
        id: 'nasil-baslarim',
        heading: 'Nereden Başlamalı?',
        blocks: [
          {
            type: 'p',
            text: 'QR menünün ne olduğunu anladıysanız sıradaki adım denemek. Menünüzü kurup masaya koymadan önce teoride kalan her şey tahmin olarak kalır. [Ücretsiz QR menü](/ucretsiz-qr-menu) hesabı açıp birkaç ürün girerek sistemin işletmenize uyup uymadığını yarım saatte görebilirsiniz.',
          },
          {
            type: 'p',
            text: 'Karar öncesi fayda tarafını netleştirmek isterseniz [QR menünün avantajları](/blog/qr-menu-avantajlari) yazısında 12 somut kazanç kalemini tek tek ele aldık.',
          },
        ],
      },
    ],
    faq: [
      {
        q: 'QR menü için müşterinin uygulama indirmesi gerekir mi?',
        a: 'Hayır. Güncel iPhone ve Android telefonların kamera uygulaması QR kodu yerleşik olarak okur. Menü telefonun normal tarayıcısında açılır, kurulum gerekmez.',
      },
      {
        q: 'QR menü internet olmadan çalışır mı?',
        a: 'Menü sayfası internetten yüklendiği için müşterinin mobil veri ya da Wi-Fi bağlantısına ihtiyacı vardır. Bu yüzden QR kodun yanına işletmenizin Wi-Fi adı ve şifresini yazmanız önerilir.',
      },
      {
        q: 'Fiyat değişince QR kodu yeniden bastırmam gerekir mi?',
        a: 'Gerekmez. QR kod sabit bir adrese işaret eder, menü içeriği o adreste durur. Panelden fiyatı güncellediğinizde aynı kodu tarayan müşteri yeni fiyatı görür.',
      },
      {
        q: 'QR menü ile PDF menü aynı şey mi?',
        a: 'Değil. PDF menü telefonda yavaş açılır, yakınlaştırma gerektirir ve güncellemek için yeni dosya yüklemek gerekir. Gerçek bir QR menü, mobil için tasarlanmış ve panelden yönetilen bir web sayfasıdır.',
      },
      {
        q: 'Yaş ortalaması yüksek müşterilerim QR menüyü kullanabilir mi?',
        a: 'Genelde evet, ama zorlamak gerekmez. Pratik çözüm, birkaç adet basılı menüyü elinizin altında tutmaktır. Ayrıca personelin ilk günlerde kodu tarama konusunda yardımcı olması geçişi kolaylaştırır.',
      },
      {
        q: 'QR menü kurmak için teknik bilgi gerekir mi?',
        a: 'Gerekmez. Kategori ve ürün girişi form doldurmaktan farklı değildir. Kod yazma veya tasarım bilgisi istemez; QR kod menü siz ürünleri girdikçe otomatik oluşur.',
      },
    ],
    related: ['qr-menu-avantajlari', 'qr-menu-mu-basili-menu-mu', 'qr-menu-tasarimi'],
  },

  {
    slug: 'qr-menu-avantajlari',
    title: "QR Menünün 12 Somut Avantajı",
    metaTitle: 'QR Menünün 12 Avantajı — Restoranlar İçin Fayda Analizi | QR Menülist',
    description:
      'QR menü avantajları: baskı maliyetinden kurtulmak, anında fiyat güncellemesi, çok dilli menü, ürün bazlı istatistik ve daha fazlası. 12 kalemi somut örneklerle inceledik.',
    keywords: [
      'qr menü avantajları',
      'qr menünün faydaları',
      'dijital menü avantajları',
      'qr menü neden kullanılmalı',
      'qr menüye geçmek',
      'restoran dijitalleşme',
    ],
    publishedAt: '2026-07-21',
    updatedAt: '2026-07-21',
    readingMinutes: 8,
    category: 'Rehber',
    icon: 'trending_up',
    excerpt:
      'QR menünün faydası "modern görünmek" değil. Baskı maliyeti, güncelleme hızı, çok dil, ürün istatistiği — 12 kalemi somut örneklerle ele aldık.',
    intro: [
      'QR menü tartışmaları çoğu zaman "modern görünmek" gibi ölçülemeyen bir yerde takılıyor. Oysa QR menünün faydaları büyük ölçüde sayılabilir kalemlerden oluşuyor: bastırmadığınız menü, düzeltemediğiniz için kaybettiğiniz fiyat farkı, anlatamadığınız ürün, ölçemediğiniz ilgi.',
      'Aşağıda 12 avantajı tek tek ele alıyoruz. Her birinde "bu bana ne kazandırır" sorusuna somut cevap vermeye çalıştık. Henüz QR menünün ne olduğundan emin değilseniz önce [QR menü nedir](/blog/qr-menu-nedir) yazısına bakmanız faydalı olur.',
    ],
    sections: [
      {
        id: 'maliyet',
        heading: '1. Baskı Maliyeti Tekrar Etmez',
        blocks: [
          {
            type: 'p',
            text: 'Basılı menünün maliyeti tek seferlik değildir; menü her değiştiğinde yeniden ödenir. 40 masalık bir işletme için 60-80 adet menü kartı gerekir, yılda iki kez menü yenilendiğinde bu kalem yılda iki kez ödenir. Buna tasarımcı ücreti ve yıpranan menülerin ara baskısı da eklenir.',
          },
          {
            type: 'p',
            text: 'QR menüde bastırdığınız şey sadece küçük bir QR kod etiketi. Menü 50 kez değişse de o etiket aynı kalır. Maliyet hesabını kendi işletmeniz için yapmak isterseniz [QR menü fiyatları](/blog/qr-menu-fiyatlari) yazısında adım adım bir hesap tablosu var.',
          },
        ],
      },
      {
        id: 'guncelleme',
        heading: '2. Fiyat Güncellemesi Aynı Gün Geçerli Olur',
        blocks: [
          {
            type: 'p',
            text: 'Bu, enflasyonist ortamda en değerli avantaj. Basılı menüde zam yaptığınızda iki seçeneğiniz vardır: yeni menü bastırmak ya da eski fiyatla satmaya devam etmek. İkincisi çoğu işletmenin yaptığı şeydir ve doğrudan kâr kaybıdır.',
          },
          {
            type: 'p',
            text: 'Maliyeti artan bir ürünün fiyatını üç ay geciktirmek, o üç ayda satılan her porsiyonda eski marjla çalışmak demektir. QR menüde bu gecikme sıfırdır: panele girip fiyatı yazarsınız, sonraki masa yeni fiyatı görür.',
          },
        ],
      },
      {
        id: 'tukenen-urun',
        heading: '3. Tükenen Ürün Menüden Kaybolur',
        blocks: [
          {
            type: 'p',
            text: 'Basılı menüde tükenen ürünü garson sözlü olarak bildirir. Bu her masada tekrar eden bir konuşma, müşteri tarafında ise küçük bir hayal kırıklığı: seçimini yaptıktan sonra vazgeçmek zorunda kalmak.',
          },
          {
            type: 'p',
            text: 'QR menüde ürünü pasife alırsınız, menüde görünmez. Müşteri olmayan bir şeyi seçmez, garson aynı cümleyi kırk kez söylemez.',
          },
        ],
      },
      {
        id: 'cok-dil',
        heading: '4. Çok Dilli Menü Ek Baskı Gerektirmez',
        blocks: [
          {
            type: 'p',
            text: 'Turistik bölgedeki bir işletme için İngilizce menü zorunluluktur. Basılı sistemde bu ikinci bir menü seti demek — ikinci tasarım, ikinci baskı, ikinci güncelleme yükü. Çoğu işletme bu yüzden İngilizce menüyü güncellemeyi bırakır ve iki menü arasındaki fiyatlar tutmaz hâle gelir.',
          },
          {
            type: 'p',
            text: 'QR menüde aynı menü, dil seçimiyle sunulur. Yapay zekâ destekli çeviriyle Türkçe menünüzü tek tıkla İngilizceye çevirebilir, ardından çeviriyi elle rötuşlayabilirsiniz. Tek kaynak olduğu için fiyat tutarsızlığı da ortadan kalkar.',
          },
        ],
      },
      {
        id: 'fotograf',
        heading: '5. Her Ürüne Fotoğraf Koyabilirsiniz',
        blocks: [
          {
            type: 'p',
            text: 'Basılı menüde fotoğraf pahalıdır: renkli baskı, daha kalın kâğıt, daha fazla sayfa. Bu yüzden çoğu menüde sadece birkaç ürünün fotoğrafı olur ya da hiç olmaz.',
          },
          {
            type: 'p',
            text: 'QR menüde fotoğrafın ek maliyeti yok. Bu önemli, çünkü müşteri tanımadığı bir yemeği adından okuyarak seçmekte tereddüt eder; fotoğrafını gördüğünde etmez. Özellikle yerel ve özgün ürünlerde fotoğraf doğrudan satış aracıdır.',
          },
        ],
      },
      {
        id: 'istatistik',
        heading: '6. Hangi Ürünün İlgi Çektiğini Ölçebilirsiniz',
        blocks: [
          {
            type: 'p',
            text: 'Basılı menüde müşterinin neye baktığını bilemezsiniz; sadece ne sipariş ettiğini bilirsiniz. Aradaki fark işletme için değerli bir bilgi.',
          },
          {
            type: 'p',
            text: 'QR menüde hangi kategorinin ve hangi ürünün kaç kez görüntülendiğini görürsünüz. Çok görüntülenip az satılan bir ürün varsa sorun ürünün kendisinde değil, sunumunda ya da fiyatındadır — fotoğrafını ya da açıklamasını değiştirmeyi denersiniz. Hiç görüntülenmeyen bir kategori varsa menüde yanlış yerde duruyordur.',
          },
        ],
      },
      {
        id: 'hijyen',
        heading: '7. Temassız ve Hijyenik',
        blocks: [
          {
            type: 'p',
            text: 'Basılı menü gün içinde onlarca kişinin eline geçen, silinmesi zor bir yüzeydir. QR menüde müşteri sadece kendi telefonuna dokunur. Pandemi sonrası bu beklenti kalıcı hâle geldi; birçok misafir için artık bir standart.',
          },
        ],
      },
      {
        id: 'upsell',
        heading: '8. Ürün Açıklaması İçin Yer Sıkıntısı Yok',
        blocks: [
          {
            type: 'p',
            text: 'Basılı menüde her satır yer kaplar, yer kâğıda, kâğıt paraya dönüşür. Bu yüzden ürünler tek satırda geçer: "Fırın Kebabı — 320 TL".',
          },
          {
            type: 'p',
            text: 'QR menüde açıklama yazmanın maliyeti yok. "Beş saat düşük ısıda pişen kuzu kol, kendi suyunda, közlenmiş patlıcan ile" cümlesi aynı ürünü daha değerli hâle getirir. İyi yazılmış açıklama, sessizce çalışan bir satış elemanıdır.',
          },
        ],
      },
      {
        id: 'personel',
        heading: '9. Personel Yükü Azalır',
        blocks: [
          {
            type: 'p',
            text: 'Menü dağıtmak, toplamak, silmek, yenisini bastırmaya karar vermek ve tükenen ürünleri her masada tekrar anlatmak — bunların hepsi personel zamanı. Yoğun servis saatinde bu zaman en kıymetli kaynaktır.',
          },
          {
            type: 'p',
            text: 'QR menü bu işlerin çoğunu ortadan kaldırır. Personel menü lojistiğiyle değil misafirle ilgilenir.',
          },
        ],
      },
      {
        id: 'esneklik',
        heading: '10. Günlük ve Mevsimlik Menü Pratikleşir',
        blocks: [
          {
            type: 'p',
            text: '"Günün çorbası", "haftanın tatlısı", "mevsim salatası" gibi uygulamalar basılı menüde ya ek bir kâğıtla ya da sözlü olarak yürür. İkisi de dağınık.',
          },
          {
            type: 'p',
            text: 'QR menüde bunlar menünün doğal bir parçası olur. Sabah pazardan ne aldıysanız o gün onu menüye koyabilirsiniz. Bu esneklik, mevsimlik çalışan mutfaklar için tek başına geçiş sebebi olabilir.',
          },
        ],
      },
      {
        id: 'seo',
        heading: '11. Google Aramalarında Görünürlük Kazanırsınız',
        blocks: [
          {
            type: 'p',
            text: 'Bu, çoğu işletmenin gözden kaçırdığı avantaj. Menünüz artık bir web sayfası — yani Google tarafından taranabilir bir içerik. "Kadıköy kahvaltı menüsü" ya da restoranınızın adı + menü şeklinde arama yapan biri sizi bulabilir.',
          },
          {
            type: 'p',
            text: 'Basılı menü Google için mevcut değildir. Dijital menü ise doğru kurulduğunda ürün adlarınız, kategorileriniz ve fiyatlarınızla birlikte arama sonuçlarında yer alabilir. Rezervasyon öncesi menüye bakan misafir sayısı düşünülünce bu ciddi bir kanaldır.',
          },
        ],
      },
      {
        id: 'cevre',
        heading: '12. Kâğıt Tüketimi Düşer',
        blocks: [
          {
            type: 'p',
            text: 'Yılda iki kez 80 menü bastırmayı bırakmak tek başına dünyayı kurtarmaz, ama sürdürülebilirlik iletişimi yapan işletmeler için tutarlı bir adımdır. Üstelik anlatması kolay, somut bir adım — pazarlama tarafında da kullanılabilir.',
          },
        ],
      },
      {
        id: 'sonuc',
        heading: 'Peki Dezavantajı Yok mu?',
        blocks: [
          {
            type: 'p',
            text: 'Var, ve dürüst olmak gerekir. QR menü müşterinin telefonuna ve internet bağlantısına bağımlıdır. Telefonu yanında olmayan, şarjı bitmiş ya da ekranda okumakta zorlanan misafir için deneyim basılı menüden kötüdür. Ayrıca bazı misafirler telefonu masaya koymayı sosyal olarak rahatsız edici bulur.',
          },
          {
            type: 'p',
            text: 'Pratik çözüm ikisini birlikte kullanmak: masalarda QR kod, kasada birkaç basılı menü. Bu yaklaşımı [QR menü mü basılı menü mü](/blog/qr-menu-mu-basili-menu-mu) yazısında kriter kriter açtık.',
          },
          {
            type: 'p',
            text: 'Denemek en hızlı karar verme yolu. [Ücretsiz QR menü](/ucretsiz-qr-menu) hesabıyla kendi menünüzü kurup masaya koyabilir, misafirlerinizin tepkisini bir haftada ölçebilirsiniz.',
          },
        ],
      },
    ],
    faq: [
      {
        q: 'QR menünün en büyük avantajı nedir?',
        a: 'Çoğu işletme için anında fiyat güncellemesi. Basılı menüde zam yaptığınızda yeni menü bastırana kadar eski fiyatla satmak zorunda kalırsınız; QR menüde bu gecikme sıfırdır ve doğrudan kâr marjını korur.',
      },
      {
        q: 'QR menü satışları artırır mı?',
        a: 'Doğrudan bir garanti yok, ama iki mekanizma satışı destekler: her ürüne fotoğraf ve ayrıntılı açıklama koyabilmek, tanınmayan ürünlerde tereddüdü azaltır. İstatistikler de çok görüntülenip az satılan ürünleri tespit edip düzeltmenizi sağlar.',
      },
      {
        q: 'Küçük bir kafe için QR menü mantıklı mı?',
        a: 'Genellikle daha da mantıklı. Küçük işletmede baskı maliyeti ciroya oranla daha ağırdır ve menü değişiklikleri daha sıktır. Ücretsiz bir planla başlayıp maliyetsiz test edebilirsiniz.',
      },
      {
        q: 'QR menü basılı menüyü tamamen ortadan kaldırır mı?',
        a: 'Kaldırmanız gerekmez. Önerilen yaklaşım masalarda QR kod, kasada yedek birkaç basılı menü bulundurmaktır. Telefonu olmayan veya kullanmak istemeyen misafir için bu esneklik gerekir.',
      },
      {
        q: 'Çok dilli menü için ayrı ücret ödemek gerekir mi?',
        a: 'QR Menülist tarafında Türkçe menünüzü yapay zekâ ile İngilizceye çevirme özelliği panelde yer alıyor. Çeviriyi sonradan elle düzenleyebilirsiniz; ayrı bir menü seti bastırmanız gerekmez.',
      },
    ],
    related: ['qr-menu-nedir', 'qr-menu-fiyatlari', 'qr-menu-mu-basili-menu-mu'],
  },

  {
    slug: 'qr-menu-fiyatlari',
    title: 'QR Menü Fiyatları: Maliyet Hesabı ve Nelere Dikkat Etmeli',
    metaTitle: 'QR Menü Fiyatları — Maliyet Hesabı ve Karşılaştırma | QR Menülist',
    description:
      'QR menü fiyatları nasıl belirlenir, basılı menüye kıyasla maliyeti ne? Kendi işletmeniz için hesap yapabileceğiniz tablo ve sözleşme öncesi sormanız gereken 7 soru.',
    keywords: [
      'qr menü fiyatları',
      'qr menü ücretleri',
      'qr menü ne kadar',
      'qr menü maliyeti',
      'ücretsiz qr menü',
      'dijital menü fiyatları',
      'basılı menü maliyeti',
    ],
    publishedAt: '2026-07-14',
    updatedAt: '2026-07-14',
    readingMinutes: 7,
    category: 'Maliyet',
    icon: 'payments',
    excerpt:
      'QR menü fiyatlarını karşılaştırmanın doğru yolu aylık ücrete bakmak değil. Kendi maliyet hesabınızı yapabileceğiniz tablo ve sözleşme öncesi 7 kritik soru.',
    intro: [
      '"QR menü ne kadar?" sorusunun tek bir cevabı yok, çünkü piyasada üç farklı fiyatlama modeli var ve hepsi farklı şeyi ölçüyor. Kimisi aylık abonelik alıyor, kimisi masa sayısına göre fiyatlıyor, kimisi tek seferlik kurulum ücreti isteyip sonra bakım için ayrıca ücretlendiriyor.',
      'Bu yazıda size bir fiyat listesi vermeyeceğiz — çünkü doğru soru "kaç para" değil, "**bana neye göre pahalı ya da ucuz**". Onun yerine kendi işletmeniz için maliyet hesabını nasıl yapacağınızı ve anlaşma öncesi neyi sormanız gerektiğini anlatıyoruz.',
    ],
    sections: [
      {
        id: 'fiyatlama-modelleri',
        heading: 'Piyasadaki 3 Fiyatlama Modeli',
        blocks: [
          {
            type: 'table',
            head: ['Model', 'Nasıl İşler', 'Dikkat Edilmesi Gereken'],
            rows: [
              [
                'Aylık / yıllık abonelik',
                'Sabit ücret, sınırsız güncelleme',
                'Ürün ya da masa sayısı limiti var mı?',
              ],
              [
                'Tek seferlik kurulum',
                'Bir kez ödenir, menü teslim edilir',
                'Sonraki güncellemeler ücretli mi?',
              ],
              [
                'Ücretsiz + Pro yükseltme',
                'Temel kullanım bedelsiz, gelişmiş özellik ücretli',
                'Ücretsiz planda menü müşteriye görünüyor mu?',
              ],
            ],
          },
          {
            type: 'p',
            text: 'Üçüncü modelde en sık karşılaşılan tuzak şu: "ücretsiz" plan menüyü hazırlamanıza izin verir ama müşteriye yayınlamanıza izin vermez. Yani ücretsiz olan şey menüyü **oluşturmak**, kullanmak değil. Hesap açarken bunu net sorun.',
          },
          {
            type: 'callout',
            title: 'QR Menülist tarafında durum',
            text: 'Kayıt olan her işletmeye 2 ay ücretsiz deneme tanımlanır ve bu sürede menü müşterilerinize açıktır — yani gerçekten kullanabilirsiniz. Süre sonunda devam etmek için Pro plana geçilir. Pro fiyatı işletmenin ölçeğine göre belirlendiği için WhatsApp üzerinden netleştiriyoruz.',
          },
        ],
      },
      {
        id: 'basili-menu-maliyeti',
        heading: 'Karşılaştırma İçin: Basılı Menü Size Ne Kadara Geliyor?',
        blocks: [
          {
            type: 'p',
            text: 'QR menünün pahalı mı ucuz mu olduğuna karar vermek için önce mevcut maliyetinizi bilmeniz gerekir. Çoğu işletme bu hesabı hiç yapmadığı için basılı menüyü "bedava" sanır. Aşağıdaki kalemleri kendi sayılarınızla doldurun:',
          },
          {
            type: 'table',
            head: ['Kalem', 'Hesap', 'Örnek (40 masalık işletme)'],
            rows: [
              ['Menü adedi', 'Masa sayısı × 1,5', '60 adet'],
              ['Baskı birim maliyeti', 'Matbaadan alınan teklif', 'Adet başına baskı bedeli'],
              ['Yıllık yenileme sayısı', 'Menü kaç kez değişiyor?', '2 kez'],
              ['Tasarım / dizgi', 'Her yenilemede tasarımcı ücreti', 'Yılda 2 kez'],
              ['Yıpranma ara baskısı', 'Yırtılan/lekelenen menüler', 'Yılda ~%20 yenileme'],
              ['İngilizce menü seti', 'Ayrı tasarım + ayrı baskı', 'Turistik bölgede zorunlu'],
              ['Gizli kalem: geciken zam', 'Zam × gecikme süresi × satış adedi', 'Genelde en büyük kalem'],
            ],
          },
          {
            type: 'p',
            text: 'Son satır kritik. Diyelim bir ürünün fiyatını 20 TL artırmanız gerekiyor ama yeni menü baskısını bekliyorsunuz ve bu 2 ay sürüyor. O ürün ayda 300 porsiyon satıyorsa, tek bir üründe 12.000 TL gelirden vazgeçmişsinizdir. Menüdeki birkaç ürün için aynı durum geçerliyse bu kalem tüm baskı maliyetinizi geçer.',
          },
          {
            type: 'p',
            text: 'Bu yüzden QR menü fiyatını değerlendirirken sadece abonelik bedeline değil, ortadan kalkan bu kalemlerin toplamına bakmak gerekir. Kalem kalem faydaları [QR menünün avantajları](/blog/qr-menu-avantajlari) yazısında açtık.',
          },
        ],
      },
      {
        id: 'gizli-maliyetler',
        heading: 'QR Menüde Gizli Maliyet Olabilecek Kalemler',
        blocks: [
          {
            type: 'p',
            text: 'Abonelik ücretinin dışında sorulması gereken kalemler:',
          },
          {
            type: 'list',
            items: [
              '**QR kod baskısı.** Masa stickerı, akrilik stand ya da menü kartına basım. Tek seferlik ama bütçelenmesi gerekir.',
              '**Ürün fotoğrafı çekimi.** Fotoğrafları kendiniz çekerseniz maliyetsiz; profesyonel çekim ayrı bir kalem. İyi haber: telefon kamerası doğru ışıkla yeterli sonuç veriyor.',
              '**Menü girişi için harcanan zaman.** 60 ürünlük menü yaklaşık bir saatinizi alır. Personele yaptırırsanız o saatin maliyetini sayın.',
              '**Çeviri.** Yapay zekâ çevirisi dahil olan sistemlerde ek maliyet yok; olmayan sistemlerde çevirmen ücreti çıkar.',
              '**Alan adı / özel URL.** Kendi alan adınızda menü isterseniz ek ücret çıkabilir.',
              '**Veri taşıma.** Sistemi değiştirdiğinizde menünüzü dışa aktarabiliyor musunuz? Aktaramıyorsanız geçiş maliyeti yüksek olur.',
            ],
          },
        ],
      },
      {
        id: 'sorulacak-sorular',
        heading: 'Anlaşma Öncesi Sorulacak 7 Soru',
        blocks: [
          {
            type: 'steps',
            items: [
              'Ücretsiz planda menüm **müşterilerime görünüyor mu**, yoksa sadece hazırlık mı yapabiliyorum?',
              'Ürün, kategori veya masa sayısı limiti var mı? Limit aşılırsa ne oluyor?',
              'Menüyü ben mi güncelliyorum, her güncelleme için sizden destek istemem gerekiyor mu?',
              'Güncelleme sayısı sınırlı mı, sınırsız mı?',
              'Fiyat artışı olursa mevcut aboneliğim ne kadar süre korunuyor?',
              'Sistemden ayrılırsam menü verilerimi ve fotoğraflarımı dışa aktarabiliyor muyum?',
              'Menü sayfası Google tarafından taranabiliyor mu, yoksa aramalarda hiç görünmeyecek mi?',
            ],
          },
          {
            type: 'p',
            text: 'Üçüncü soru özellikle önemli. Her fiyat değişikliği için tedarikçinize e-posta atmanız gereken bir sistem, QR menünün en büyük avantajını elinizden alır — güncelleme paneli sizde olmalı.',
          },
        ],
      },
      {
        id: 'ucretsiz-baslamak',
        heading: 'En Doğru Fiyat Araştırması: Ücretsiz Denemek',
        blocks: [
          {
            type: 'p',
            text: 'Fiyat karşılaştırmasının en zayıf tarafı, karşılaştırdığınız şeyin gerçekte işinize uyup uymadığını bilmemeniz. Ekran görüntüleri ve özellik listeleri, menünüzü kendi elinizle girip masaya koymanın yerini tutmuyor.',
          },
          {
            type: 'p',
            text: 'Bu yüzden ödeme yapmadan önce mutlaka deneyin. [Ücretsiz QR menü](/ucretsiz-qr-menu) hesabı açıp en çok satan 15 ürününüzü girin, QR kodu bir masaya koyun ve bir hafta izleyin. Bir haftanın sonunda fiyatın size uygun olup olmadığına dair tahminden çok daha sağlam bir fikriniz olur.',
          },
          {
            type: 'p',
            text: 'Kurulumun adımlarını görmek isterseniz [qr menü oluşturma](/qr-menu-olusturma) sayfası süreci baştan sona anlatıyor.',
          },
        ],
      },
    ],
    faq: [
      {
        q: 'Gerçekten ücretsiz QR menü var mı?',
        a: 'Ücretsiz planlar var, ama kapsamı değişiyor. QR Menülist tarafında kayıt olan her işletmeye 2 ay ücretsiz deneme tanımlanır ve bu sürede menü müşterilerinize açıktır. Bazı sistemlerde "ücretsiz" sadece menü hazırlamayı kapsar, yayınlamayı kapsamaz — kayıt öncesi bunu sormanız gerekir.',
      },
      {
        q: 'QR Menülist Pro planı ne kadar?',
        a: 'Pro plan fiyatı işletmenin ölçeğine ve ihtiyacına göre belirlendiği için sabit bir liste fiyatı yayınlamıyoruz. WhatsApp üzerinden yazdığınızda işletmenize uygun fiyatı iletiyoruz.',
      },
      {
        q: 'QR menü basılı menüden daha mı ekonomik?',
        a: 'Menüsü sık değişen işletmelerde neredeyse her zaman evet. Karşılaştırmayı doğru yapmak için baskı bedeline ek olarak tasarım ücreti, yıpranma ara baskıları, ikinci dil seti ve geciken zamlardan kaynaklanan gelir kaybını da hesaba katmak gerekir.',
      },
      {
        q: 'Kurulum için ayrıca ücret ödeyecek miyim?',
        a: 'QR Menülist tarafında menüyü kendiniz panelden kuruyorsunuz, ayrı bir kurulum ücreti yok. Bütçelemeniz gereken tek fiziksel kalem QR kod etiketi ya da stand baskısı.',
      },
      {
        q: 'QR menü aboneliğini iptal edersem menüm ne olur?',
        a: 'Bu soruyu her tedarikçiye ayrıca sormalısınız. Kritik nokta menü verilerinizi ve fotoğraflarınızı dışa aktarabilmeniz; aktaramıyorsanız sistem değiştirmenin maliyeti aboneliğin kendisinden yüksek olabilir.',
      },
    ],
    related: ['qr-menu-avantajlari', 'qr-menu-mu-basili-menu-mu', 'qr-menu-nedir'],
  },

  {
    slug: 'qr-menu-tasarimi',
    title: 'QR Menü Tasarımı: Sipariş Artıran 10 Kural',
    metaTitle: 'QR Menü Tasarımı — Sipariş Artıran 10 Kural | QR Menülist',
    description:
      'QR menü tasarımında kategori sıralaması, ürün fotoğrafı, açıklama yazımı ve fiyat gösterimi nasıl olmalı? Mobil menüde dönüşümü artıran 10 uygulanabilir kural.',
    keywords: [
      'qr menü tasarımı',
      'dijital menü tasarımı',
      'menü fotoğrafı çekimi',
      'menü kategori sıralaması',
      'mobil menü tasarımı',
      'menü açıklaması yazma',
    ],
    publishedAt: '2026-07-07',
    updatedAt: '2026-07-07',
    readingMinutes: 9,
    category: 'Tasarım',
    icon: 'palette',
    excerpt:
      'İyi bir QR menü güzel görünen menü değil, seçim yaptıran menüdür. Kategori sırası, fotoğraf, açıklama ve fiyat gösterimi için 10 somut kural.',
    intro: [
      'QR menü kurmak kolay, işleyen bir QR menü kurmak biraz düşünmek gerektiriyor. Aynı ürünler, aynı fiyatlar, farklı düzen — sonuç farklı oluyor. Çünkü müşteri menüyü baştan sona okumaz; ilk ekranda gördüklerine bakıp karar verir.',
      'Aşağıdaki 10 kural, mobil ekranda menüyü hem okunur hem satış yapan hâle getirmek için. Hepsi panelden uygulanabilir şeyler; tasarımcıya ihtiyaç yok.',
    ],
    sections: [
      {
        id: 'kategori-sirasi',
        heading: '1. Kategori Sırası Rastgele Olmasın',
        blocks: [
          {
            type: 'p',
            text: 'Mobil menüde ilk iki kategori diğerlerinin toplamından fazla ilgi görür, çünkü kaydırma gerektirmez. Bu yüzden kategori sırası bir tasarım kararı değil, satış kararıdır.',
          },
          {
            type: 'p',
            text: 'Pratik kural: **en kârlı ve en imzalı kategoriyi başa alın.** Alfabetik ya da "geleneksel menü sırası" (çorbalar, salatalar, ana yemekler...) müşterinin değil matbaanın alışkanlığıdır. Kahve satışı yüksek bir kafede ilk kategori içecekler olmalı, çorba olmamalı.',
          },
          {
            type: 'p',
            text: 'Servis saatine göre de düşünün: kahvaltı ağırlıklı çalışıyorsanız sabah "Kahvaltı" kategorisini başa almak, akşam "Ana Yemek"e döndürmek anlamlıdır.',
          },
        ],
      },
      {
        id: 'kategori-sayisi',
        heading: '2. Kategori Sayısını 8’in Altında Tutun',
        blocks: [
          {
            type: 'p',
            text: 'Çok kategori, seçim kolaylaştırmaz; felç eder. 14 kategorilik bir menüde müşteri nereye bakacağını bilemez ve genelde ilk gördüğü şeyi seçer.',
          },
          {
            type: 'p',
            text: '6-8 kategori çoğu işletme için ideal. Kategori sayısı şişiyorsa birleştirin: "Soğuk İçecekler" ve "Sıcak İçecekler" yerine tek "İçecekler" kategorisi, içinde gruplanmış hâlde daha iyi çalışır.',
          },
        ],
      },
      {
        id: 'fotograf',
        heading: '3. Fotoğrafta Tutarlılık Kaliteden Önce Gelir',
        blocks: [
          {
            type: 'p',
            text: 'Menüde 5 tanesi profesyonel, 20 tanesi telefonla çekilmiş fotoğraf varsa menü kötü görünür. Hepsi telefonla çekilmiş ama aynı ışıkta, aynı açıdan, aynı zeminde çekilmişse menü iyi görünür. Tutarlılık, tek tek kalitesinden daha belirleyici.',
          },
          {
            type: 'list',
            items: [
              '**Tek bir zemin seçin** — ahşap masa, düz renk tabak altlığı ya da tepsi. Tüm ürünlerde aynısını kullanın.',
              '**Gün ışığında çekin.** Pencere kenarı, öğlen saati. Tavan lambası yemeği sarı ve yağlı gösterir.',
              '**Flaş kullanmayın.** Yemek fotoğrafını bozan tek şey.',
              '**Açıyı sabitleyin.** Ya hepsi tepeden ya hepsi 45 derece. Karışık olmasın.',
              '**Porsiyonu gerçek gösterin.** Fotoğraftan büyük görünen porsiyon, masaya gelince hayal kırıklığı yaratır ve yorumlara yansır.',
            ],
          },
          {
            type: 'callout',
            title: 'Pratik yöntem',
            text: 'Serviste boşluk olan bir öğleden sonra 20-30 ürünü tek seansta çekin. Aynı ışık, aynı zemin, yarım saat. Sonuç, ürünleri farklı günlerde tek tek çekmekten çok daha tutarlı olur.',
          },
        ],
      },
      {
        id: 'fotografsiz-urun',
        heading: '4. Fotoğrafı Olmayan Ürünü Fotoğraflıların Arasına Koymayın',
        blocks: [
          {
            type: 'p',
            text: 'Fotoğraflı ürünlerin arasındaki fotoğrafsız ürün, eksik görünür ve daha az seçilir. Bu, o ürün için sessiz bir cezadır.',
          },
          {
            type: 'p',
            text: 'İki çözüm var: ya o ürünün de fotoğrafını çekin, ya da fotoğrafsız ürünleri kendi kategorisinde toplayın (örneğin "Ekstralar" ya da "Yan Ürünler"). Karışık liste en kötü seçenek.',
          },
        ],
      },
      {
        id: 'aciklama',
        heading: '5. Açıklamayı Malzeme Listesi Gibi Yazmayın',
        blocks: [
          {
            type: 'p',
            text: 'Basılı menüde yer kısıtı yüzünden açıklamalar malzeme listesine dönüşür: "Kuzu, patlıcan, domates, tereyağı". QR menüde bu kısıt yok ve fırsatı kaçırmak yazık olur.',
          },
          {
            type: 'p',
            text: 'İyi bir açıklama üç şeyden en az ikisini söyler: **pişirme yöntemi**, **öne çıkan malzemenin niteliği**, **nereden geldiği**. "Beş saat düşük ısıda pişen kuzu kol, közlenmiş patlıcan ezmesi üzerinde" cümlesi aynı ürünü daha değerli hâle getirir.',
          },
          {
            type: 'p',
            text: 'Uzunluk için pratik sınır: iki satır. Daha uzunu mobilde okunmaz, daha kısası bilgi vermez.',
          },
        ],
      },
      {
        id: 'alerjen',
        heading: '6. Alerjen ve Diyet Bilgisini Ürünün Yanına Yazın',
        blocks: [
          {
            type: 'p',
            text: 'Vejetaryen, vegan, glutensiz, laktozsuz, acı, fındık içerir — bu bilgiler menünün sonunda bir açıklama bloğunda değil, ürünün yanında olmalı. Bu bilgiyi arayan misafir menünün sonuna kadar inmez, garsona sorar; siz de personelinizi gereksiz bir soru döngüsüne sokarsınız.',
          },
          {
            type: 'p',
            text: 'Alerjen bilgisi ayrıca bir güven sinyalidir. Kısıtı olan misafir için menüde bu bilgiyi görmek, o restoranı seçme sebebi olabilir.',
          },
        ],
      },
      {
        id: 'fiyat',
        heading: '7. Fiyatı Gizlemeyin, Ama Öne de Çıkarmayın',
        blocks: [
          {
            type: 'p',
            text: 'Fiyatı ürün adından daha büyük ya da daha renkli göstermek, müşteriyi ürüne değil fiyata odaklar. Sonuç: en ucuzu seçme eğilimi.',
          },
          {
            type: 'p',
            text: 'Fiyat okunur ama sakin olmalı — ürün adıyla aynı boyutta ya da bir tık küçük, nötr renkte. Ayrıca fiyatları sağa hizalı bir kolonda alt alta dizmek de karşılaştırmayı kolaylaştırır ve yine en ucuza yönlendirir; fiyatı ürün bilgisinin doğal bir parçası olarak konumlandırmak daha iyi çalışır.',
          },
        ],
      },
      {
        id: 'urun-sayisi',
        heading: '8. Her Kategoride 5-7 Ürün Yeterli',
        blocks: [
          {
            type: 'p',
            text: 'Bir kategoride 20 ürün varsa müşteri seçim yapmakta zorlanır ve alışkanlığına döner. Menüyü kısaltmak sadece kararı kolaylaştırmaz; mutfak tarafında da stok, hazırlık ve israf yükünü düşürür.',
          },
          {
            type: 'p',
            text: 'Menüdeki her ürünün satış verisine bakın. Hiç satılmayan ürünler menüyü kalabalıklaştırıyor. QR menüde bu kararı vermek kolay: ürünü pasife alın, bir ay izleyin, kimse sormuyorsa menüden çıkarın.',
          },
        ],
      },
      {
        id: 'imza-urun',
        heading: '9. İmza Ürünlerinizi İşaretleyin',
        blocks: [
          {
            type: 'p',
            text: 'Menüde 40 ürün varsa müşteri hangisinin sizi temsil ettiğini bilemez. "Şefin önerisi", "en çok satan" ya da "yeni" gibi işaretler bu boşluğu doldurur ve kararı hızlandırır.',
          },
          {
            type: 'p',
            text: 'Ama ölçülü olun: 40 üründen 15’i "en çok satan" olarak işaretlenmişse işaret anlamını yitirir. Kategori başına en fazla bir-iki ürün.',
          },
        ],
      },
      {
        id: 'test',
        heading: '10. Menüyü Kendi Telefonunuzda Test Edin',
        blocks: [
          {
            type: 'p',
            text: 'Menüyü bilgisayarda hazırlar, bilgisayarda kontrol eder, öyle yayınlarız. Ama müşteri onu 6 inçlik bir ekranda, akşam ışığında, muhtemelen zayıf bir bağlantıyla görüyor.',
          },
          {
            type: 'list',
            items: [
              'QR kodu **kendi masanızdan** tarayın, müşteri gibi gezinin.',
              'Akşam, restoranın gerçek ışığında bakın — açık renkli metin okunuyor mu?',
              'Mobil veriyle deneyin, Wi-Fi ile değil. Fotoğraflar makul sürede yükleniyor mu?',
              'Menünün en altına kadar inin. Kaç saniye sürdü?',
              'Personelinizden birine tarattırın ve nereye baktığını izleyin. Genelde en öğretici test bu.',
            ],
          },
          {
            type: 'p',
            text: 'Bu testi ayda bir tekrarlayın. Menü zamanla büyür, kategori sırası bozulur, fotoğrafsız ürünler birikir.',
          },
        ],
      },
      {
        id: 'sonuc',
        heading: 'Özet',
        blocks: [
          {
            type: 'p',
            text: 'İyi QR menü tasarımının özü şu: müşteri ilk ekranda ne göreceğine siz karar veriyorsunuz. Kategori sırası, fotoğraf tutarlılığı ve açıklama kalitesi bu kararın araçları. Üçünü düzenlemek bir öğleden sonra sürer, etkisi kalıcı olur.',
          },
          {
            type: 'p',
            text: 'Menünüzü henüz kurmadıysanız [qr menü oluşturma](/qr-menu-olusturma) rehberi adım adım anlatıyor; bu yazıdaki kuralları kurarken uygularsanız sonradan düzeltmekten kurtulursunuz.',
          },
        ],
      },
    ],
    faq: [
      {
        q: 'QR menüde ürün fotoğrafı zorunlu mu?',
        a: 'Zorunlu değil, ama tanınmayan ürünlerde satışı belirgin şekilde destekler. Fotoğraf ekleyecekseniz tutarlılığa dikkat edin: bir kısmı fotoğraflı bir kısmı fotoğrafsız menü, hiç fotoğrafsız menüden kötü görünür.',
      },
      {
        q: 'Menü fotoğraflarını profesyonel çektirmem gerekir mi?',
        a: 'Gerekmez. Telefon kamerası, gün ışığı ve sabit bir zeminle yeterli sonuç alınır. Belirleyici olan ekipman değil, tüm fotoğrafların aynı ışık ve açıyla çekilmiş olması.',
      },
      {
        q: 'QR menüde kaç kategori olmalı?',
        a: 'Çoğu işletme için 6-8 kategori ideal. Daha fazlası mobil ekranda seçim yapmayı zorlaştırır. Kategori sayısı şişiyorsa benzer olanları tek kategoride gruplamak daha iyi çalışır.',
      },
      {
        q: 'Fiyatları menüde göstermemek mantıklı mı?',
        a: 'Hayır. Fiyat görmeyen misafir garsona sorar ya da tereddüt eder; ikisi de deneyimi bozar. Doğru yaklaşım fiyatı göstermek ama ürün adından daha baskın hâle getirmemektir.',
      },
      {
        q: 'Menü tasarımını sonradan değiştirebilir miyim?',
        a: 'Evet. Kategori sırası, ürün açıklamaları, fotoğraflar ve renkler panelden istediğiniz zaman değiştirilebilir. QR kod aynı kaldığı için masalardaki etiketleri yenilemeniz gerekmez.',
      },
    ],
    related: ['qr-menu-nedir', 'qr-menu-avantajlari', 'qr-menu-fiyatlari'],
  },

  {
    slug: 'qr-menu-mu-basili-menu-mu',
    title: 'QR Menü mü Basılı Menü mü? 6 Kriterde Karşılaştırma',
    metaTitle: 'QR Menü mü Basılı Menü mü? 6 Kriterde Karşılaştırma | QR Menülist',
    description:
      'QR menü mü basılı menü mi? Maliyet, güncelleme hızı, müşteri deneyimi, marka algısı ve erişilebilirlik kriterlerinde dürüst bir karşılaştırma ve hibrit çözüm önerisi.',
    keywords: [
      'qr menü mü basılı menü mi',
      'qr menü basılı menü karşılaştırma',
      'basılı menü maliyeti',
      'menü kartı mı qr menü mi',
      'dijital menü mü kağıt menü mü',
    ],
    publishedAt: '2026-06-30',
    updatedAt: '2026-06-30',
    readingMinutes: 8,
    category: 'Karşılaştırma',
    icon: 'compare_arrows',
    excerpt:
      '"QR menüye geçelim mi?" sorusunun cevabı işletmeye göre değişiyor. Altı kriterde dürüst bir karşılaştırma ve çoğu işletme için en iyi çözüm olan hibrit yaklaşım.',
    intro: [
      'QR menü tartışmasında iki uç var: "kâğıt menü bitti" diyenler ve "misafirimi telefona bakmaya zorlamam" diyenler. İkisi de bir doğruya değiniyor ama ikisi de eksik.',
      'Bu yazıda altı kriterde karşılaştırma yapıyoruz ve her kriterde hangi yöntemin kazandığını açıkça söylüyoruz. Sonunda çoğu işletme için en mantıklı olan üçüncü yolu — hibrit kullanımı — anlatıyoruz.',
    ],
    sections: [
      {
        id: 'ozet-tablo',
        heading: 'Özet: Hangi Kriterde Hangisi Kazanıyor?',
        blocks: [
          {
            type: 'table',
            head: ['Kriter', 'Kazanan', 'Neden'],
            rows: [
              ['Maliyet', 'QR menü', 'Baskı tekrar etmez, güncelleme bedava'],
              ['Güncelleme hızı', 'QR menü', 'Panelden anında, matbaa beklenmez'],
              ['Çok dilli sunum', 'QR menü', 'Tek menü, dil seçimi ile'],
              ['Marka algısı / dokunsal deneyim', 'Basılı menü', 'Fiziksel obje kalite hissi verir'],
              ['Erişilebilirlik', 'Basılı menü', 'Telefon, şarj ve internet gerekmez'],
              ['Ölçümleme', 'QR menü', 'Görüntülenme verisi toplanabilir'],
            ],
          },
          {
            type: 'p',
            text: 'Skor QR menü lehine 4-2. Ama skor tek başına karar vermez — kaybettiği iki kriterin sizin işletmeniz için ne kadar önemli olduğu belirleyici. Fine dining bir restoranda "marka algısı" kalemi diğer hepsinden ağır olabilir.',
          },
        ],
      },
      {
        id: 'maliyet',
        heading: '1. Maliyet — QR Menü',
        blocks: [
          {
            type: 'p',
            text: 'Basılı menünün maliyeti tek seferlik değil, tekrar eden bir gider. Her menü değişikliğinde tasarım ve baskı yeniden ödenir; yıpranan menüler için ara baskılar yapılır; ikinci dil için ayrı bir set gerekir.',
          },
          {
            type: 'p',
            text: 'Ama en büyük kalem genelde faturada görünmeyen kalem: **geciken zam.** Yeni menü baskısını beklerken eski fiyatla satmaya devam etmek, çoğu işletmede tüm baskı maliyetinden büyük bir gelir kaybı yaratır. Hesabı kendi sayılarınızla yapmak için [QR menü fiyatları](/blog/qr-menu-fiyatlari) yazısındaki tabloyu kullanabilirsiniz.',
          },
          {
            type: 'p',
            text: 'QR menüde tekrar eden fiziksel maliyet yok. Bastırdığınız QR kod etiketi menü 50 kez değişse de geçerli kalır.',
          },
        ],
      },
      {
        id: 'guncelleme',
        heading: '2. Güncelleme Hızı — QR Menü',
        blocks: [
          {
            type: 'p',
            text: 'Bu kriterde karşılaştırma bile zor. Basılı menüde bir fiyat değişikliği tasarım revizyonu, onay, baskı ve dağıtım demek — en iyi durumda günler. QR menüde aynı işlem panelde 20 saniye.',
          },
          {
            type: 'p',
            text: 'Fark sadece hızda değil, **davranışta**. Güncelleme zahmetli olduğunda işletmeler güncellemeyi biriktirir; kolay olduğunda anında yapar. Menüsü sık değişen, mevsimlik çalışan ya da günün yemeği uygulaması olan mutfaklar için bu kriter tek başına belirleyici olabilir.',
          },
        ],
      },
      {
        id: 'cok-dil',
        heading: '3. Çok Dilli Sunum — QR Menü',
        blocks: [
          {
            type: 'p',
            text: 'Basılı sistemde her dil ayrı bir menü seti demek. İki dilli çalışan bir işletme baskı ve güncelleme yükünü ikiye katlar. Pratikte olan şu: İngilizce menü bir kez bastırılır ve güncellenmez, zamanla Türkçe menüyle fiyatları tutmaz hâle gelir.',
          },
          {
            type: 'p',
            text: 'QR menüde tek kaynak var, dil seçimi o kaynağın sunumunu değiştirir. Fiyat tutarsızlığı yapısal olarak mümkün değil. Yapay zekâ çevirisi olan sistemlerde çeviri de tek tıkla oluşturulup elle rötuşlanabiliyor.',
          },
        ],
      },
      {
        id: 'marka',
        heading: '4. Marka Algısı ve Dokunsal Deneyim — Basılı Menü',
        blocks: [
          {
            type: 'p',
            text: 'Burada basılı menü net kazanıyor ve bunu kabul etmek gerekir. Kaliteli kâğıda basılmış, ciltli, ağırlığı olan bir menü fiziksel bir kalite sinyalidir. Misafir onu eline aldığında işletme hakkında bir izlenim edinir — ekranda bu izlenim oluşmaz.',
          },
          {
            type: 'p',
            text: 'Bu, üst segment restoranlar için ciddi bir argüman. Kişi başı harcamanın yüksek olduğu, deneyimin kendisinin ürün olduğu yerlerde masaya telefon sokmak deneyimi zayıflatır.',
          },
          {
            type: 'p',
            text: 'Bu tür işletmeler için mantıklı kurgu şu: basılı menü ana sunum aracı, QR menü ise yardımcı — güncel fiyatlar, çok dilli erişim ve rezervasyon öncesi menüye bakmak isteyenler için.',
          },
        ],
      },
      {
        id: 'erisilebilirlik',
        heading: '5. Erişilebilirlik — Basılı Menü',
        blocks: [
          {
            type: 'p',
            text: 'QR menü, müşterinin bir telefona, çalışan bir kameraya, şarja ve internet bağlantısına sahip olmasını varsayar. Bu varsayım her masada geçerli değil:',
          },
          {
            type: 'list',
            items: [
              'Telefonu yanında olmayan ya da şarjı bitmiş misafir',
              'Küçük ekranda okumakta zorlanan misafir',
              'Mobil verisi olmayan yabancı turist (Wi-Fi paylaşmak bunu çözer)',
              'Eski model telefonda QR okuyucusu olmayan kullanıcı',
              'Telefonu masada kullanmayı sosyal olarak uygunsuz bulan misafir',
              'Masada tek telefonu paylaşmak zorunda kalan kalabalık gruplar',
            ],
          },
          {
            type: 'p',
            text: 'Son madde küçük görünüp en sık yaşanan durum: altı kişilik masada altı kişi ayrı ayrı taramak yerine tek telefonu elden ele dolaştırır ve bu sipariş sürecini yavaşlatır. Çözüm basit — masaya birkaç basılı menü de koymak.',
          },
        ],
      },
      {
        id: 'olcum',
        heading: '6. Ölçümleme — QR Menü',
        blocks: [
          {
            type: 'p',
            text: 'Basılı menüde müşterinin neye baktığını bilemezsiniz, sadece ne sipariş ettiğini bilirsiniz. QR menüde hangi kategorinin ve ürünün kaç kez görüntülendiğini görürsünüz.',
          },
          {
            type: 'p',
            text: 'Bu veri iki soruyu cevaplar: hangi ürün ilgi çekiyor da satılmıyor (fiyat ya da sunum sorunu), hangi kategori hiç görülmüyor (menüde yanlış yerde). İkisi de doğrudan aksiyon alınabilecek bilgiler. Verinin nasıl kullanılacağına dair örnekler [QR menünün avantajları](/blog/qr-menu-avantajlari) yazısında var.',
          },
        ],
      },
      {
        id: 'hibrit',
        heading: 'Üçüncü Yol: Hibrit Kullanım',
        blocks: [
          {
            type: 'p',
            text: 'Karşılaştırmanın sonucu aslında "ikisini birden" çıkıyor ve bu bir uzlaşma değil, çoğu işletme için en iyi kurgu. Pratik uygulama:',
          },
          {
            type: 'steps',
            items: [
              '**Masalarda QR kod.** Ana erişim yolu bu olsun; güncel fiyatlar, fotoğraflar ve diller burada.',
              '**Kasada ya da servis istasyonunda 4-6 basılı menü.** İsteyen misafire uzatın. Kalabalık masalarda da işe yarar.',
              '**QR kodun yanına Wi-Fi bilgisi.** Bağlantı sorununu baştan çözer, özellikle turist misafirlerde.',
              '**Basılı menüyü sadeleştirin.** Fiyat yazmayan, sadece ürün adları ve kısa açıklamalar içeren bir set bastırın — fiyat değiştiğinde bu setin yenilenmesi gerekmez.',
              '**Personeli hazırlayın.** İlk günlerde misafire kodu taramada yardımcı olmak geçişi belirgin şekilde kolaylaştırır.',
            ],
          },
          {
            type: 'callout',
            title: 'Dördüncü madde neden işe yarıyor',
            text: 'Basılı menüden fiyatı çıkardığınızda o menünün ömrü menü içeriği değişene kadar uzar. Fiyat bilgisi QR menüde güncel kalır, basılı set yıllarca kullanılabilir. Baskı maliyeti bir kez ödenir.',
          },
        ],
      },
      {
        id: 'karar',
        heading: 'Sizin İşletmeniz İçin Karar',
        blocks: [
          {
            type: 'p',
            text: 'Basit bir eleme: menünüz yılda ikiden fazla değişiyorsa, turist misafir alıyorsanız ya da fiyatlarınız enflasyona bağlı hareket ediyorsa QR menü sizin için maliyet değil tasarruf kalemi. Menünüz yıllardır aynıysa ve kişi başı harcamanız yüksekse basılı menüde kalmak savunulabilir bir tercih.',
          },
          {
            type: 'p',
            text: 'Kararsızsanız test etmek en hızlı yol. [Ücretsiz QR menü](/ucretsiz-qr-menu) hesabıyla menünüzü kurup birkaç masaya koyun, iki hafta izleyin. Misafirlerinizin nasıl tepki verdiği, bu yazıdaki hiçbir argümandan daha güçlü bir veri.',
          },
          {
            type: 'p',
            text: 'Kurulum sürecini görmek isterseniz [qr menü oluşturma](/qr-menu-olusturma) sayfası adımları sırayla anlatıyor. Sistemin nasıl çalıştığından emin değilseniz [QR menü nedir](/blog/qr-menu-nedir) yazısı temelden başlıyor.',
          },
        ],
      },
    ],
    faq: [
      {
        q: 'QR menü basılı menünün yerini tamamen alır mı?',
        a: 'Çoğu işletmede tamamen almasına gerek yok. En işleyen kurgu masalarda QR kod, kasada birkaç yedek basılı menü bulundurmaktır. Böylece hem güncelleme esnekliğini hem erişilebilirliği korursunuz.',
      },
      {
        q: 'Müşterilerim QR menüden rahatsız olur mu?',
        a: 'Bir kısmı olabilir — özellikle telefonu masada kullanmak istemeyen ya da küçük ekranda okumakta zorlanan misafirler. Bu yüzden basılı menüyü tamamen kaldırmak yerine isteyene uzatabileceğiniz birkaç adet bulundurmak önerilir.',
      },
      {
        q: 'Kalabalık masalarda QR menü sorun yaratır mı?',
        a: 'Altı kişilik bir masada herkesin ayrı ayrı taraması yerine tek telefonun dolaştırılması sipariş sürecini yavaşlatabilir. Pratik çözüm bu masalara ek olarak bir-iki basılı menü koymaktır.',
      },
      {
        q: 'Basılı menüyü fiyatsız bastırmak mantıklı mı?',
        a: 'Evet, hibrit kullanımda en verimli yöntem bu. Fiyat bilgisi olmayan basılı set, menü içeriği değişmediği sürece yenilenmeye ihtiyaç duymaz; güncel fiyat QR menüde durur.',
      },
      {
        q: 'Üst segment bir restoran için QR menü uygun mu?',
        a: 'Ana sunum aracı olarak tartışmalı, çünkü kaliteli basılı menünün yarattığı dokunsal marka algısı ekranda oluşmaz. Ancak yardımcı kanal olarak faydalı: güncel fiyatlar, çok dilli erişim ve rezervasyon öncesi menüye bakmak isteyenler için.',
      },
    ],
    related: ['qr-menu-nedir', 'qr-menu-fiyatlari', 'qr-menu-avantajlari'],
  },
]

export function getPostBySlug(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((post) => post.slug === slug)
}

/** Yeniden eskiye sıralı liste */
export function getSortedPosts(): BlogPost[] {
  return [...BLOG_POSTS].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
}

export function getRelatedPosts(post: BlogPost): BlogPost[] {
  return post.related
    .map((slug) => getPostBySlug(slug))
    .filter((p): p is BlogPost => Boolean(p))
}
