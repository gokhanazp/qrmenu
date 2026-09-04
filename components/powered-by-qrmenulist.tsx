import Link from 'next/link'

/**
 * "Bu menü QR Menülist ile hazırlandı" — müşteri menülerinin altındaki imza.
 *
 * İki işi var:
 *  1. SEO: 12 müşteri menüsü sitenin en güçlü doğal iç link ağı. Her menü
 *     sayfasından para sayfasına giden bir link, o sayfalara doğrudan otorite
 *     akıtır. Menü sayfaları `index, follow` olduğu için bu linkler sayılır.
 *  2. Satış: menüyü tarayan gerçek insanlar (çoğu başka işletme sahibi de
 *     olabilir) ürünü buradan keşfediyor — organik satış kanalı.
 *
 * Restoranın kendi tema renklerini kullanır ki menünün tasarımını bozmasın.
 */
export function PoweredByQrMenulist({
  textColor = '#111827',
  footerBgColor,
  isEnglish = false,
}: {
  textColor?: string
  footerBgColor?: string
  isEnglish?: boolean
}) {
  const muted = textColor + '99'
  const borderColor = textColor + '18'

  return (
    <section
      className="px-4 py-6 text-center border-t"
      style={{ backgroundColor: footerBgColor, borderColor }}
    >
      <p className="text-sm" style={{ color: muted }}>
        {isEnglish ? 'This menu was built with ' : 'Bu menü '}
        <Link
          href="/"
          className="font-semibold underline underline-offset-4 hover:opacity-80 transition-opacity"
          style={{ color: textColor }}
        >
          QR Menülist
        </Link>
        {isEnglish ? '.' : ' ile hazırlandı.'}{' '}
        <Link
          href="/ucretsiz-qr-menu"
          className="underline underline-offset-4 hover:opacity-80 transition-opacity"
          style={{ color: muted }}
        >
          {isEnglish
            ? 'Create a free QR menu for your own restaurant'
            : 'Kendi restoranın için ücretsiz QR menü oluştur'}
        </Link>
      </p>
    </section>
  )
}
