import Link from "next/link"
import { Button } from "@/components/ui/button"
import { WhatsAppIcon } from "@/components/whatsapp-icon"
import { whatsappUrl, CONTACT_WHATSAPP_DISPLAY } from "@/lib/contact"

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <header className="sticky top-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <img src="/qrmenu-logo.png" alt="QR Menülist" className="h-10 w-auto" />
            <span className="font-bold text-xl">
              <span className="bg-gradient-to-r from-violet-500 to-fuchsia-500 bg-clip-text text-transparent">
                qr
              </span>
              <span className="text-white">menülist</span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/blog"
              className="hidden sm:inline text-sm text-gray-400 hover:text-violet-400 transition-colors"
            >
              Blog
            </Link>
            <Link
              href="/qr-menu-olusturma"
              className="hidden md:inline text-sm text-gray-400 hover:text-violet-400 transition-colors"
            >
              QR Menü Oluşturma
            </Link>
            <Link href="/auth/register">
              <Button size="sm" className="bg-gradient-to-r from-violet-600 to-fuchsia-600 border-0">
                Ücretsiz Başla
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {children}

      <footer className="py-10 border-t border-white/10 bg-[#0a0a0a]">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid sm:grid-cols-3 gap-8 mb-8 text-sm">
            <div>
              <h3 className="font-semibold text-white mb-3">Rehberler</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/blog/qr-menu-nedir" className="hover:text-violet-400 transition-colors">
                    QR Menü Nedir?
                  </Link>
                </li>
                <li>
                  <Link href="/blog/qr-menu-avantajlari" className="hover:text-violet-400 transition-colors">
                    QR Menünün Avantajları
                  </Link>
                </li>
                <li>
                  <Link href="/blog/qr-menu-fiyatlari" className="hover:text-violet-400 transition-colors">
                    QR Menü Fiyatları
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-3">Ürün</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/qr-menu-olusturma" className="hover:text-violet-400 transition-colors">
                    QR Menü Oluşturma
                  </Link>
                </li>
                <li>
                  <Link href="/ucretsiz-qr-menu" className="hover:text-violet-400 transition-colors">
                    Ücretsiz QR Menü
                  </Link>
                </li>
                <li>
                  <Link href="/dijital-menu" className="hover:text-violet-400 transition-colors">
                    Dijital Menü
                  </Link>
                </li>
                <li>
                  <Link href="/restoran-menu-programi" className="hover:text-violet-400 transition-colors">
                    Restoran Menü Programı
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-3">İletişim</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/" className="hover:text-violet-400 transition-colors">
                    Ana Sayfa
                  </Link>
                </li>
                <li>
                  <a
                    href={whatsappUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-emerald-400 transition-colors inline-flex items-center gap-2"
                  >
                    <WhatsAppIcon />
                    {CONTACT_WHATSAPP_DISPLAY}
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <p className="text-sm text-gray-500 pt-6 border-t border-white/10">
            © {new Date().getFullYear()} QR Menülist — Ücretsiz QR Menü Oluşturma Platformu
          </p>
        </div>
      </footer>
    </div>
  )
}
