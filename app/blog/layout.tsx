import Link from "next/link"
import { Button } from "@/components/ui/button"
import { SiteFooter } from "@/components/site-footer"

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

      <SiteFooter />
    </div>
  )
}
