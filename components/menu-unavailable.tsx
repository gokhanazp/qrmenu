import { CONTACT_WHATSAPP_DISPLAY, whatsappUrl } from '@/lib/contact'

/**
 * Deneme süresi dolmuş ve Pro'ya geçmemiş restoranların public menüsü
 * yerine gösterilen sayfa. QR okutan müşteriye nötr bir mesaj gösterir,
 * restoran sahibi için de iletişim bilgisini içerir.
 */
export function MenuUnavailable({
  restaurantName,
  isEnglish = false,
}: {
  restaurantName?: string
  isEnglish?: boolean
}) {
  const t = isEnglish
    ? {
        title: 'Menu Temporarily Unavailable',
        desc: 'This digital menu is currently not being displayed. Please try again later.',
        ownerNote: 'Restaurant owner? To reactivate your menu, please get in touch:',
        cta: 'Contact us on WhatsApp',
      }
    : {
        title: 'Menü Geçici Olarak Kapalı',
        desc: 'Bu dijital menü şu anda görüntülenemiyor. Lütfen daha sonra tekrar deneyin.',
        ownerNote: 'Restoran sahibi misiniz? Menünüzü tekrar yayına almak için bizimle iletişime geçin:',
        cta: "WhatsApp'tan iletişime geçin",
      }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-gray-100">
        <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <span className="material-symbols-outlined text-amber-600" style={{ fontSize: '36px' }}>
            lock_clock
          </span>
        </div>

        {restaurantName && (
          <p className="text-sm font-medium text-gray-400 mb-1">{restaurantName}</p>
        )}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{t.title}</h1>
        <p className="text-gray-600 mb-8">{t.desc}</p>

        <div className="border-t border-gray-100 pt-6">
          <p className="text-sm text-gray-500 mb-4">{t.ownerNote}</p>
          <a
            href={whatsappUrl(
              isEnglish
                ? `Hello, I want to reactivate my menu${restaurantName ? ` (${restaurantName})` : ''} and upgrade to the paid plan.`
                : `Merhaba, menümü${restaurantName ? ` (${restaurantName})` : ''} tekrar yayına almak ve Pro plana geçmek istiyorum.`
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 w-full bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
              chat
            </span>
            {t.cta}
          </a>
          <p className="text-sm font-medium text-gray-700 mt-3">{CONTACT_WHATSAPP_DISPLAY}</p>
        </div>
      </div>
    </div>
  )
}
