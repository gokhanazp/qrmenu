"use client";

import Image from "next/image";
import { Icon } from "@/components/icon"
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LocaleProvider, useLocale } from "@/lib/i18n/use-locale";
import { LanguageSwitcher } from "@/components/language-switcher";
import { JsonLd } from "@/components/json-ld";
import {
  organizationJsonLd,
  websiteJsonLd,
  softwareApplicationJsonLd,
  faqPageJsonLd,
} from "@/lib/seo/jsonld";
import { WhatsAppFloat } from "@/components/whatsapp-float";
import { SiteFooter } from "@/components/site-footer";
import { whatsappUrl, CONTACT_WHATSAPP_DISPLAY } from "@/lib/contact";
import { SITE_STATS } from "@/lib/stats";
import { TESTIMONIALS, REFERENCE_CUSTOMERS } from "@/lib/testimonials";
import { useState, useEffect, useRef } from "react";

function HamburgerMenu({
  isOpen,
  onClick,
}: {
  isOpen: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col justify-center items-center w-8 h-8 gap-1.5"
    >
      <span
        className={`block w-6 h-0.5 bg-white transition-all ${isOpen ? "rotate-45 translate-y-2" : ""}`}
      />
      <span
        className={`block w-6 h-0.5 bg-white transition-all ${isOpen ? "opacity-0" : ""}`}
      />
      <span
        className={`block w-6 h-0.5 bg-white transition-all ${isOpen ? "-rotate-45 -translate-y-2" : ""}`}
      />
    </button>
  );
}

function MobileMenu({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { t } = useLocale();
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-40 bg-[#0a0a0a]/98 backdrop-blur-xl flex flex-col items-center justify-center gap-8">
      <nav className="flex flex-col items-center gap-6 text-2xl">
        <Link
          href="#features"
          onClick={onClose}
          className="text-white/80 hover:text-white"
        >
          {t.landing.nav.features}
        </Link>
        <Link
          href="/auth/login"
          onClick={onClose}
          className="text-white/80 hover:text-white"
        >
          {t.landing.nav.login}
        </Link>
      </nav>
      <Link href="/auth/register" onClick={onClose}>
        <Button
          size="lg"
          className="bg-gradient-to-r from-violet-600 to-fuchsia-600 border-0"
        >
          {t.landing.nav.freeStart}
        </Button>
      </Link>
    </div>
  );
}

function InteractiveGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", (e) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    });
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const { x: mx, y: my } = mouseRef.current;
      for (let x = 0; x <= canvas.width; x += 60) {
        ctx.beginPath();
        for (let y = 0; y <= canvas.height; y += 5) {
          const d = Math.sqrt((x - mx) ** 2 + (y - my) ** 2);
          const ox = d < 120 && d > 0 ? ((x - mx) / d) * (1 - d / 120) * 12 : 0;
          y === 0 ? ctx.moveTo(x + ox, y) : ctx.lineTo(x + ox, y);
        }
        ctx.strokeStyle = "rgba(139,92,246,0.08)";
        ctx.stroke();
      }
      for (let y = 0; y <= canvas.height; y += 60) {
        ctx.beginPath();
        for (let x = 0; x <= canvas.width; x += 5) {
          const d = Math.sqrt((x - mx) ** 2 + (y - my) ** 2);
          const oy = d < 120 && d > 0 ? ((y - my) / d) * (1 - d / 120) * 12 : 0;
          x === 0 ? ctx.moveTo(x, y + oy) : ctx.lineTo(x, y + oy);
        }
        ctx.strokeStyle = "rgba(217,70,239,0.08)";
        ctx.stroke();
      }
      requestAnimationFrame(animate);
    };
    animate();
  }, []);
  return (
    <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />
  );
}

function PhoneMockup() {
  return (
    <div className="relative">
      <div className="absolute -top-8 -left-8 w-20 h-20 bg-gradient-to-br from-violet-500/30 to-fuchsia-500/30 rounded-2xl blur-xl animate-pulse" />
      <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-gradient-to-br from-cyan-500/30 to-blue-500/30 rounded-full blur-xl animate-pulse" />
      <div className="relative w-[300px] h-[600px] bg-gradient-to-b from-gray-800 to-gray-900 rounded-[3rem] p-3 shadow-2xl shadow-violet-500/20 transform rotate-3 hover:rotate-0 transition-transform duration-500">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-5 bg-black rounded-b-xl z-10" />
        <div className="w-full h-full bg-[#0a0a0a] rounded-[2.5rem] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-violet-900/20 to-fuchsia-900/20" />
          <div className="p-4 h-full flex flex-col relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-lg flex items-center justify-center">
                  <Icon name="restaurant_menu" className="text-white text-sm" />
                </div>
                <span className="text-sm font-bold text-white">Cebi Döner</span>
              </div>
              <Icon name="search" className="text-white/60 text-lg" />
            </div>
            <div className="flex gap-2 mb-4">
              <div className="px-3 py-1 bg-violet-500 rounded-full text-xs text-white">
                Tümü
              </div>
              <div className="px-3 py-1 bg-white/10 rounded-full text-xs text-white/70">
                Ana Yemek
              </div>
              <div className="px-3 py-1 bg-white/10 rounded-full text-xs text-white/70">
                İçecek
              </div>
            </div>
            <div className="space-y-3 flex-1">
              <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                <div className="flex gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg flex items-center justify-center text-lg">
                    🍖
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-white">
                      Özel Döner
                    </h4>
                    <p className="text-xs text-gray-400">Lezzetli döner</p>
                    <div className="text-sm font-bold text-violet-400 mt-1">
                      ₺85
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                <div className="flex gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center text-lg">
                    🍟
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-white">
                      Patates
                    </h4>
                    <p className="text-xs text-gray-400">Çıtır patates</p>
                    <div className="text-sm font-bold text-violet-400 mt-1">
                      ₺35
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                <div className="flex gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-400 to-pink-500 rounded-lg flex items-center justify-center text-lg">
                    🥤
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-white">İçecek</h4>
                    <p className="text-xs text-gray-400">Soğuk içecek</p>
                    <div className="text-sm font-bold text-violet-400 mt-1">
                      ₺25
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-around py-3 border-t border-white/10 mt-auto">
              <Icon name="home" className="text-violet-400" />
              <Icon name="search" className="text-white/40" />
              <Icon name="favorite" className="text-white/40" />
            </div>
          </div>
        </div>
      </div>
      <div className="absolute -bottom-4 -left-8 w-20 h-20 bg-white rounded-xl p-2 shadow-2xl shadow-black/50 transform -rotate-12 hover:rotate-0 transition-transform">
        <div className="w-full h-full bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-lg flex items-center justify-center">
          <Icon name="qr_code_2" className="text-white text-3xl" />
        </div>
      </div>
    </div>
  );
}

function HomePageContent() {
  const { t } = useLocale();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        setSearchOpen(false);
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  // Müşteri menüleri. `slug` kullanıyoruz çünkü bunlar sitenin KENDİ sayfaları:
  // eskiden mutlak URL + target="_blank" ile dış link gibi veriliyorlardı.
  // next/link ile verilince Google bunları iç link olarak sayar.
  // (Aynı restoran iki kez listelenmişti — tekrar kaldırıldı.)
  const showcaseItems = [
    { name: "L'amour Chocolate & Coffee", slug: "lamour-chocolate-coffee" },
    { name: "Çebi Döner", slug: "cebi-doner" },
    { name: "Riverside Burgers", slug: "riverside-burgers" },
    { name: "Verna Cafe & Bistro", slug: "verna-cafe-bistro" },
  ];

  const features = [
    {
      icon: "qr_code_2",
      title: t.landing.features.qrMenu.title,
      desc: t.landing.features.qrMenu.description,
      color: "bg-violet-500",
    },
    {
      icon: "edit_note",
      title: t.landing.features.easyManagement.title,
      desc: t.landing.features.easyManagement.description,
      color: "bg-cyan-500",
    },
    {
      icon: "trending_up",
      title: t.landing.features.analytics.title,
      desc: t.landing.features.analytics.description,
      color: "bg-emerald-500",
    },
    {
      icon: "palette",
      title: t.landing.features.customization.title,
      desc: t.landing.features.customization.description,
      color: "bg-orange-500",
    },
    {
      icon: "smartphone",
      title: t.landing.features.mobileFirst.title,
      desc: t.landing.features.mobileFirst.description,
      color: "bg-pink-500",
    },
    {
      icon: "translate",
      title: t.landing.features.multilingual.title,
      desc: t.landing.features.multilingual.description,
      color: "bg-blue-500",
    },
    {
      icon: "auto_awesome",
      title: t.landing.features.aiTranslation.title,
      desc: t.landing.features.aiTranslation.description,
      color: "bg-gradient-to-br from-violet-500 to-fuchsia-500",
    },
  ];

  const testimonialColors = [
    "from-violet-500 to-fuchsia-500",
    "from-cyan-500 to-blue-500",
    "from-emerald-500 to-teal-500",
  ];

  const faqItems = t.landing.faq.items.map((f) => ({ q: f.q, a: f.a }))

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden">
      <JsonLd
        data={[
          organizationJsonLd(),
          websiteJsonLd(),
          softwareApplicationJsonLd(),
          faqPageJsonLd(faqItems),
        ]}
      />
      <WhatsAppFloat />
      <MobileMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />

      {searchOpen && (
        <div
          className="fixed inset-0 z-40 bg-[#0a0a0a]/95 backdrop-blur-xl flex items-start justify-center pt-32"
          onClick={() => setSearchOpen(false)}
        >
          <div
            className="w-full max-w-2xl mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative">
              <Icon name="search" className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                type="text"
                placeholder={t.common.search + "..."}
                className="w-full bg-white/10 border border-white/20 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-white/40 focus:outline-none focus:border-violet-500"
                autoFocus
              />
            </div>
          </div>
        </div>
      )}

      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all ${scrolled ? "bg-[#0a0a0a]/95 backdrop-blur-lg" : "bg-transparent"}`}
      >
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-20">
          <div className="flex items-center gap-2 sm:gap-4">
            <HamburgerMenu
              isOpen={menuOpen}
              onClick={() => setMenuOpen(!menuOpen)}
            />
            <Link href="/" className="flex items-center gap-1.5">
              <img src="/qrmenu-logo.png" alt="Logo" className="h-10 sm:h-14 w-auto drop-shadow-md" />
              <span className="font-bold text-xl sm:text-2xl flex items-center tracking-tight">
                <span className="bg-gradient-to-r from-violet-500 to-fuchsia-500 bg-clip-text text-transparent">qr</span>
                <span className="text-white">menülist</span>
              </span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSearchOpen(true)}
              className="w-10 h-10 flex items-center justify-center hover:bg-white/10 rounded-full"
            >
              <Icon name="search" className="text-white" />
            </button>
            <div className="hidden sm:block">
              <LanguageSwitcher />
            </div>
            <Link href="/auth/register" className="hidden sm:block">
              <Button
                size="sm"
                className="bg-gradient-to-r from-violet-600 to-fuchsia-600 border-0 px-6"
              >
                {t.landing.nav.start}
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col pt-20 overflow-hidden">
        <InteractiveGrid />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-fuchsia-600/20 rounded-full blur-[120px]" />
        </div>

        <div className="relative z-10 flex-1 flex items-center py-12 lg:py-0">
          <div className="max-w-7xl mx-auto px-4 w-full">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              <div className="text-center lg:text-left order-2 lg:order-1">
                <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2 mb-6 lg:mb-8">
                  <Icon name="restaurant" className="text-violet-400 text-sm" />
                  <span className="text-sm text-white/80">
                    {t.landing.hero.badge}
                  </span>
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold mb-4 lg:mb-6 leading-tight">
                  <span className="text-white">{t.landing.hero.title1}</span>
                  <br />
                  <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-orange-400 bg-clip-text text-transparent">
                    {t.landing.hero.title2}
                  </span>
                </h1>

                <p className="text-xl sm:text-2xl lg:text-3xl font-semibold text-white/90 mb-3 lg:mb-4">
                  {t.landing.hero.tagline}
                </p>

                <p className="text-lg sm:text-xl text-gray-400 mb-8 lg:mb-10 max-w-xl lg:mx-0 mx-auto">
                  {t.landing.hero.subtitle}
                </p>

                <div className="flex flex-col sm:flex-row flex-wrap gap-4 justify-center lg:justify-start mb-8 lg:mb-12">
                  <Link href="/auth/register">
                    <Button
                      size="lg"
                      className="text-base lg:text-lg px-8 lg:px-10 py-5 lg:py-6 bg-gradient-to-r from-violet-600 to-fuchsia-600 border-0 w-full sm:w-auto"
                    >
                      {t.landing.hero.cta}
                    </Button>
                  </Link>
                  <a
                    href={whatsappUrl("Merhaba, QR Menülist hakkında bilgi almak istiyorum.")}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex"
                  >
                    <Button
                      size="lg"
                      className="text-base lg:text-lg px-8 lg:px-10 py-5 lg:py-6 bg-[#25D366] hover:bg-[#1ebe5b] border-0 w-full sm:w-auto text-white gap-2"
                    >
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                      </svg>
                      WhatsApp İletişim
                    </Button>
                  </a>
                  <Link href="#features">
                    <Button
                      size="lg"
                      variant="outline"
                      className="text-base lg:text-lg px-8 lg:px-10 py-5 lg:py-6 border-white/30 bg-white/5 hover:bg-white/15 w-full sm:w-auto text-white"
                    >
                      {t.landing.hero.ctaSecondary}
                    </Button>
                  </Link>
                </div>

                {/* Ücretsiz deneme notu */}
                <div className="flex items-center justify-center lg:justify-start gap-2 mb-8 lg:mb-12 -mt-2 lg:-mt-6">
                  <Icon name="verified" className="text-emerald-400 text-lg" />
                  <span className="text-sm text-gray-300">{t.landing.hero.trialNote}</span>
                </div>

                <div className="flex items-center justify-center lg:justify-start gap-6 sm:gap-8 lg:gap-12 flex-wrap">
                  <div className="text-center">
                    <div className="text-2xl lg:text-3xl font-bold">
                      {SITE_STATS.restaurants}
                    </div>
                    <div className="text-xs lg:text-sm text-gray-400">
                      {t.landing.hero.stats.restaurants}
                    </div>
                  </div>
                  <div className="w-px h-10 lg:h-12 bg-white/20" />
                  <div className="text-center">
                    <div className="text-2xl lg:text-3xl font-bold">
                      {SITE_STATS.menuViews}
                    </div>
                    <div className="text-xs lg:text-sm text-gray-400">
                      {t.landing.hero.stats.views}
                    </div>
                  </div>
                  <div className="w-px h-10 lg:h-12 bg-white/20" />
                  <div className="text-center">
                    <div className="text-2xl lg:text-3xl font-bold">
                      {SITE_STATS.qrScans}
                    </div>
                    <div className="text-xs lg:text-sm text-gray-400">
                      {t.landing.hero.stats.scans}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-center items-center order-1 lg:order-2 mb-8 lg:mb-0">
                <div className="scale-75 sm:scale-90 lg:scale-100">
                  <PhoneMockup />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 w-full mt-8 lg:mt-16 pb-8">
          <div className="text-center mb-6 lg:mb-8">
            <h3 className="text-lg lg:text-xl font-semibold text-white/80 mb-2">
              {t.landing.showcase.title}
            </h3>
            <p className="text-gray-400 text-xs lg:text-sm">
              {t.landing.showcase.subtitle}
            </p>
          </div>
          <div className="overflow-hidden">
            <div
              className="flex gap-4 lg:gap-6"
              style={{ animation: "marquee 30s linear infinite" }}
            >
              {[...showcaseItems, ...showcaseItems, ...showcaseItems].map(
                (item, i) => (
                  <Link
                    key={`${item.slug}-${i}`}
                    href={`/restorant/${item.slug}`}
                    className="flex-shrink-0 group cursor-pointer"
                    aria-hidden={i >= showcaseItems.length}
                    tabIndex={i >= showcaseItems.length ? -1 : undefined}
                  >
                    <div className="relative w-[140px] sm:w-[180px] lg:w-[200px] h-[250px] sm:h-[320px] lg:h-[360px] bg-gradient-to-b from-gray-800 to-gray-900 rounded-[1.5rem] lg:rounded-[2rem] p-2 shadow-xl group-hover:shadow-violet-500/30 transition-all duration-300 group-hover:scale-105">
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 lg:w-16 h-3 lg:h-4 bg-black rounded-b-xl z-10" />
                      <div className="w-full h-full bg-[#0a0a0a] rounded-[1.2rem] lg:rounded-[1.5rem] overflow-hidden flex items-center justify-center relative">
                        {/*
                          Ekran görüntüleri api.microlink.io'dan geliyor ama artık
                          next/image üzerinden: Vercel görseli optimize edip 30 gün
                          cache'liyor (next.config.js -> minimumCacheTTL), WebP'ye
                          çeviriyor ve lazy yüklüyor. Böylece ne LCP'yi bloke ediyor
                          ne de microlink düşerse bölüm boşalıyor.
                        */}
                        <Image
                          src={`https://api.microlink.io/?url=${encodeURIComponent(
                            `https://www.qrmenulist.com/restorant/${item.slug}`,
                          )}&screenshot=true&meta=false&embed=screenshot.url`}
                          alt={`${item.name} QR menü örneği — telefonda dijital menü görünümü`}
                          width={200}
                          height={360}
                          loading="lazy"
                          unoptimized={false}
                          className="w-full h-full object-cover object-top opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/20 to-transparent opacity-80 pointer-events-none" />
                      </div>
                    </div>
                    <p className="text-center text-white/60 text-xs lg:text-sm mt-2 lg:mt-3 group-hover:text-violet-400 transition-colors">
                      {item.name}
                    </p>
                  </Link>
                ),
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-[#0f0f1a] to-[#0a0a0a]" />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-violet-600/10 rounded-full blur-[150px]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 rounded-full px-4 py-2 mb-6">
              <Icon name="auto_awesome" className="text-violet-400 text-sm" />
              <span className="text-sm text-violet-300">
                {t.landing.features.badge}
              </span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">
              {t.landing.features.title}{" "}
              <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                {t.landing.features.titleHighlight}
              </span>
              ?
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg">
              {t.landing.features.subtitle}
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div
                key={i}
                className="group relative bg-gradient-to-br from-white/[0.08] to-white/[0.02] p-8 rounded-3xl border border-white/10 hover:border-violet-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-violet-500/10 hover:-translate-y-1"
              >
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-violet-500/0 to-fuchsia-500/0 group-hover:from-violet-500/5 group-hover:to-fuchsia-500/5 transition-all duration-300" />
                <div className="relative z-10">
                  <div
                    className={`w-16 h-16 ${f.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg`}
                  >
                    <Icon name={f.icon} className="text-white text-3xl" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 group-hover:text-violet-300 transition-colors">
                    {f.title}
                  </h3>
                  <p className="text-gray-400 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-fuchsia-400 font-medium mb-4 block">
              {t.landing.howItWorks.badge}
            </span>
            <h2 className="text-4xl font-bold mb-4">
              {t.landing.howItWorks.title}
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              {t.landing.howItWorks.subtitle}
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="relative">
              <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-full flex items-center justify-center text-xl font-bold">
                1
              </div>
              <div className="bg-white/5 p-8 pt-12 rounded-2xl border border-white/10 h-full">
                <Icon name="person_add" className="text-violet-400 text-4xl mb-4 block" />
                <h3 className="text-xl font-bold mb-2">
                  {t.landing.howItWorks.step1.title}
                </h3>
                <p className="text-gray-400">
                  {t.landing.howItWorks.step1.description}
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-full flex items-center justify-center text-xl font-bold">
                2
              </div>
              <div className="bg-white/5 p-8 pt-12 rounded-2xl border border-white/10 h-full">
                <Icon name="menu_book" className="text-fuchsia-400 text-4xl mb-4 block" />
                <h3 className="text-xl font-bold mb-2">
                  {t.landing.howItWorks.step2.title}
                </h3>
                <p className="text-gray-400">
                  {t.landing.howItWorks.step2.description}
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-full flex items-center justify-center text-xl font-bold">
                3
              </div>
              <div className="bg-white/5 p-8 pt-12 rounded-2xl border border-white/10 h-full">
                <Icon name="share" className="text-cyan-400 text-4xl mb-4 block" />
                <h3 className="text-xl font-bold mb-2">
                  {t.landing.howItWorks.step3.title}
                </h3>
                <p className="text-gray-400">
                  {t.landing.howItWorks.step3.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/*
        Müşteri Yorumları.

        Buradaki üç yorum (Ahmet Kaya / Lezzet Durağı, Mehmet Yılmaz / Pizza
        House, Zeynep Demir / Cafe Mocha) gerçek müşteri listesiyle
        örtüşmüyordu ve sayfada aynı anda `aggregateRating 4.9 / 500` schema'sı
        duruyordu. Google, sayfada doğrulanabilir karşılığı olmayan puan/yorum
        işaretlemesini manuel işlem sebebi sayıyor — bu yüzden uydurma yorumlar
        kaldırıldı.

        Bölüm artık lib/testimonials.ts'ten besleniyor: gerçek yorum eklendiği
        anda hem burası hem AggregateRating schema'sı otomatik geri gelir.
      */}
      {TESTIMONIALS.length > 0 && (
        <section className="py-24 bg-[#0a0a0a] relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-0 w-96 h-96 bg-violet-600/10 rounded-full blur-[150px]" />
            <div className="absolute top-1/2 right-0 w-96 h-96 bg-fuchsia-600/10 rounded-full blur-[150px]" />
          </div>
          <div className="relative z-10 max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-pink-500/10 border border-pink-500/20 rounded-full px-4 py-2 mb-6">
                <Icon name="format_quote" className="text-pink-400 text-sm" />
                <span className="text-sm text-pink-300">
                  {t.landing.testimonials.badge}
                </span>
              </div>
              <h2 className="text-4xl sm:text-5xl font-bold mb-4">
                {t.landing.testimonials.title}{" "}
                <span className="bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent">
                  {t.landing.testimonials.titleHighlight}
                </span>
              </h2>
              <p className="text-gray-400 max-w-2xl mx-auto text-lg">
                {t.landing.testimonials.subtitle}
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {TESTIMONIALS.map((testimonial, i) => (
                <div
                  key={testimonial.name}
                  className="bg-gradient-to-br from-white/[0.08] to-white/[0.02] p-8 rounded-3xl border border-white/10 hover:border-pink-500/30 transition-all duration-300"
                >
                  <div className="flex items-center gap-1 mb-4">
                    {Array.from({ length: testimonial.rating }).map((_, j) => (
                      <Icon
                        key={j}
                        name="star"
                        className="text-yellow-400 text-lg"
                        fill
                      />
                    ))}
                  </div>
                  <p className="text-gray-300 mb-6 leading-relaxed">
                    &quot;{testimonial.text}&quot;
                  </p>
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 bg-gradient-to-br ${testimonialColors[i % testimonialColors.length]} rounded-full flex items-center justify-center text-white font-bold`}
                    >
                      {testimonial.initials}
                    </div>
                    <div>
                      <h3 className="font-semibold">{testimonial.name}</h3>
                      {testimonial.slug ? (
                        <Link
                          href={`/restorant/${testimonial.slug}`}
                          className="text-sm text-gray-400 hover:text-violet-400 transition-colors"
                        >
                          {testimonial.role}
                        </Link>
                      ) : (
                        <p className="text-sm text-gray-400">{testimonial.role}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-b from-[#0a0a0a] to-[#0f0f1a]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8">
            <div className="text-center p-6 bg-white/5 rounded-2xl border border-white/10">
              <div className="w-14 h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Icon name="store" className="text-white text-2xl lg:text-3xl" />
              </div>
              <div className="text-3xl lg:text-4xl font-bold mb-2 bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                {SITE_STATS.restaurants}
              </div>
              <p className="text-gray-400 text-sm lg:text-base">
                {t.landing.stats.restaurants}
              </p>
            </div>
            <div className="text-center p-6 bg-white/5 rounded-2xl border border-white/10">
              <div className="w-14 h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Icon name="visibility" className="text-white text-2xl lg:text-3xl" />
              </div>
              <div className="text-3xl lg:text-4xl font-bold mb-2 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                {SITE_STATS.menuViews}
              </div>
              <p className="text-gray-400 text-sm lg:text-base">
                {t.landing.stats.views}
              </p>
            </div>
            <div className="text-center p-6 bg-white/5 rounded-2xl border border-white/10">
              <div className="w-14 h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Icon name="qr_code_scanner" className="text-white text-2xl lg:text-3xl" />
              </div>
              <div className="text-3xl lg:text-4xl font-bold mb-2 bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                {SITE_STATS.qrScans}
              </div>
              <p className="text-gray-400 text-sm lg:text-base">
                {t.landing.stats.scans}
              </p>
            </div>
            <div className="text-center p-6 bg-white/5 rounded-2xl border border-white/10">
              <div className="w-14 h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Icon name="thumb_up" className="text-white text-2xl lg:text-3xl" />
              </div>
              <div className="text-3xl lg:text-4xl font-bold mb-2 bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                {SITE_STATS.satisfaction}
              </div>
              <p className="text-gray-400 text-sm lg:text-base">
                {t.landing.stats.satisfaction}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/*
        Referanslar. Eskiden burada Lezzet Durağı / Pizza House / Sushi Master /
        Cafe Mocha gibi uydurma isimler vardı. Artık lib/testimonials.ts'teki
        GERÇEK müşteriler listelenip her biri kendi canlı menüsüne link veriyor
        — hem doğrulanabilir bir güven sinyali hem de restoran sayfalarına iç link.
      */}
      <section className="py-20 bg-[#0f0f1a]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-gray-400 text-lg">{t.landing.partners.title}</h2>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10 lg:gap-14">
            {REFERENCE_CUSTOMERS.map((customer) => (
              <Link
                key={customer.slug}
                href={`/restorant/${customer.slug}`}
                className="flex items-center gap-2 lg:gap-3 text-gray-500 hover:text-white transition-colors"
                title={`${customer.name} QR menüsünü gör`}
              >
                <Icon name={customer.icon} className="text-3xl lg:text-4xl" />
                <span className="text-base lg:text-xl font-semibold">
                  {customer.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/*
        "QR Menü Nedir?" — SSS'nin üstünde düz metin bölümü.

        Neden: sayfada ürün özellikleri, ikonlar ve sloganlar vardı ama "qr
        menü" kelimesinin geçtiği anlamlı bir metin bloğu yoktu. Google, "qr
        menü" sorgusu için sayfanın konuyu gerçekten açıkladığını görmek
        istiyor. Bölüm aynı zamanda 4 para sayfasına bağlam içi, kelime
        içeren anchor'larla link veriyor — ana sayfadan bu sayfalara HİÇ link
        yoktu ve /ucretsiz-qr-menu'nun 54. sırada olmasının en muhtemel sebebi
        buydu.
      */}
      <section className="py-20 lg:py-24 bg-[#0a0a0a]">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            QR Menü Nedir?
          </h2>

          <div className="space-y-5 text-gray-300 leading-relaxed text-base sm:text-lg">
            <p>
              <strong className="text-white">QR menü</strong>, restoran veya kafenizin
              menüsünün masadaki bir karekodu telefonla okutarak açılan dijital
              hâlidir. Müşteri kamerayı QR koda tutar, menü tarayıcıda anında
              açılır — uygulama indirmesi, üyelik ya da kurulum gerekmez. Türkiye&apos;de
              aynı sistem <strong className="text-white">karekod menü</strong> veya{" "}
              <strong className="text-white">dijital menü</strong> adıyla da bilinir.
            </p>

            <p>
              Basılı menüyle arasındaki temel fark güncellemede ortaya çıkar. Basılı
              menüde bir ürünün fiyatı değiştiğinde tüm menülerin yeniden
              tasarlanıp bastırılması gerekir; bu hem masraf hem gecikmedir. QR
              menüde fiyatı panelden değiştirdiğiniz anda masadaki karekod aynı
              menüyü günceli ile gösterir. QR kodun kendisi hiç değişmez, bir kez
              bastırırsınız.
            </p>

            <p>
              QR menü ayrıca basılı menünün veremediği iki şeyi verir: her ürüne
              fotoğraf ve açıklama ekleyebilirsiniz (fotoğraflı ürünler daha çok
              sipariş alır), ve hangi ürünün kaç kez görüntülendiğini
              görebilirsiniz. Turist yoğun bölgelerde menünün İngilizce sürümünü
              yapay zeka çevirisiyle tek tıkla oluşturmak da mümkündür.
            </p>

            <p>
              QR Menülist&apos;te süreç üç adımdan oluşur: ücretsiz hesap açar,
              kategorileri ve ürünleri eklersiniz, QR kodunuzu indirip masaya
              koyarsınız. Ortalama kurulum süresi 5 dakikadır.{" "}
              {t.landing.hero.trialNote}.
            </p>

            {/* Bağlam içi iç linkler — anchor metni birebir hedef kelime */}
            <p className="text-gray-400">
              Detaylar için:{" "}
              <Link
                href="/qr-menu-olusturma"
                className="text-violet-400 hover:text-violet-300 underline underline-offset-4"
              >
                QR menü oluşturma rehberi
              </Link>
              ,{" "}
              <Link
                href="/ucretsiz-qr-menu"
                className="text-violet-400 hover:text-violet-300 underline underline-offset-4"
              >
                ücretsiz QR menü
              </Link>
              ,{" "}
              <Link
                href="/dijital-menu"
                className="text-violet-400 hover:text-violet-300 underline underline-offset-4"
              >
                dijital menü sistemi
              </Link>{" "}
              ve{" "}
              <Link
                href="/restoran-menu-programi"
                className="text-violet-400 hover:text-violet-300 underline underline-offset-4"
              >
                restoran menü programı
              </Link>
              . Karşılaştırma ve maliyet analizleri için{" "}
              <Link
                href="/blog/qr-menu-mu-basili-menu-mu"
                className="text-violet-400 hover:text-violet-300 underline underline-offset-4"
              >
                QR menü mü basılı menü mü?
              </Link>{" "}
              ve{" "}
              <Link
                href="/blog/qr-menu-fiyatlari"
                className="text-violet-400 hover:text-violet-300 underline underline-offset-4"
              >
                QR menü fiyatları
              </Link>{" "}
              yazılarına bakabilirsiniz.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-[#0a0a0a]">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-2 mb-6">
              <Icon name="help" className="text-blue-400 text-sm" />
              <span className="text-sm text-blue-300">
                {t.landing.faq.badge}
              </span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">
              {t.landing.faq.title}{" "}
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                {t.landing.faq.titleHighlight}
              </span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg">
              {t.landing.faq.subtitle}
            </p>
          </div>
          <div className="space-y-4">
            {t.landing.faq.items.map((faq, i) => (
              <div
                key={i}
                className="bg-white/5 rounded-2xl border border-white/10 p-6 hover:border-blue-500/30 transition-colors"
              >
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-3">
                  <Icon name="help_outline" className="text-blue-400" />
                  {faq.q}
                </h3>
                <p className="text-gray-400 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-900/30 via-fuchsia-900/20 to-[#0a0a0a]" />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-600/20 rounded-full blur-[150px]" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2 mb-8">
            <Icon name="rocket_launch" className="text-violet-400 text-sm" />
            <span className="text-sm text-white/80">{t.landing.cta.badge}</span>
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
            <span className="text-white">{t.landing.cta.title1}</span>
            <br />
            <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-orange-400 bg-clip-text text-transparent">
              {t.landing.cta.title2}
            </span>
          </h2>
          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
            {t.landing.cta.subtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register">
              <Button
                size="lg"
                className="text-lg px-12 py-6 bg-gradient-to-r from-violet-600 to-fuchsia-600 border-0 w-full sm:w-auto shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-shadow"
              >
                <Icon name="arrow_forward" className="mr-2" />
                {t.landing.cta.button}
              </Button>
            </Link>
            <Link href="#features">
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-12 py-6 border-white/30 bg-white/5 hover:bg-white/15 w-full sm:w-auto text-white"
              >
                <Icon name="play_circle" className="mr-2" />
                {t.landing.cta.buttonSecondary}
              </Button>
            </Link>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6 mt-12">
            <div className="flex items-center gap-2">
              <Icon name="check_circle" className="text-emerald-400" />
              <span className="text-gray-400 text-sm">
                {t.landing.cta.features.noCard}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Icon name="check_circle" className="text-emerald-400" />
              <span className="text-gray-400 text-sm">
                {t.landing.cta.features.freeTrial}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Icon name="check_circle" className="text-emerald-400" />
              <span className="text-gray-400 text-sm">
                {t.landing.cta.features.cancelAnytime}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/*
        Footer artık tüm sitede TEK bileşen (components/site-footer.tsx).
        Eskiden ana sayfa ile /blog farklı footer kullanıyordu: /blog'un
        footer'ında 4 para sayfasının linki vardı, ana sayfada hiçbiri yoktu.
        Ana sayfa sitenin en fazla link alan sayfası olduğu için bu, o
        sayfalara akacak otoritenin büyük kısmını kaybettiriyordu. Ayrıca
        yasal linkler href="#" idi; artık gerçek sayfalara gidiyor.
      */}
      <SiteFooter />
    </div>
  );
}

export default function HomePage() {
  return (
    <LocaleProvider>
      <HomePageContent />
    </LocaleProvider>
  );
}
