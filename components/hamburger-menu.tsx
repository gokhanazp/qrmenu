'use client'

import { useState } from 'react'
import Image from 'next/image'

interface HamburgerMenuProps {
  restaurant: {
    name: string
    logo_url?: string
    about_us?: string
    phone?: string
    email?: string
    address?: string
    whatsapp?: string
    instagram?: string
    facebook?: string
    twitter?: string
    primary_color?: string
    background_color?: string
    surface_color?: string
    text_color?: string
  }
  iconColor?: string
  hamburgerBgColor?: string
}

export function HamburgerMenu({ restaurant, iconColor, hamburgerBgColor }: HamburgerMenuProps) {
  const [isOpen, setIsOpen] = useState(false)

  const hasSocialMedia = restaurant.whatsapp || restaurant.instagram || restaurant.facebook || restaurant.twitter
  
  const primaryColor = restaurant.primary_color || '#FF6B35'
  const backgroundColor = restaurant.background_color || '#ffffff'
  const surfaceColor = restaurant.surface_color || '#f9fafb'
  const textColor = restaurant.text_color || '#111827'
  const finalIconColor = iconColor || textColor
  const finalHamburgerBgColor = hamburgerBgColor || '#ffffff'
  const borderColor = textColor + '20'

  return (
    <>
      {/* Menu Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center justify-center p-2 rounded-full transition-colors hover:opacity-80"
        style={{
          color: finalIconColor,
          backgroundColor: finalHamburgerBgColor
        }}
        aria-label="Menü"
      >
        <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>
          menu
        </span>
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[250] backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-80 max-w-[85vw] shadow-2xl z-[251] transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{
          backgroundColor: surfaceColor,
          borderRight: `1px solid ${borderColor}`
        }}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div
            className="flex items-center justify-between p-4 flex-shrink-0"
            style={{
              backgroundColor: surfaceColor,
              borderBottom: `1px solid ${borderColor}`
            }}
          >
            <div className="flex items-center gap-3">
              {restaurant.logo_url && (
                <Image
                  src={restaurant.logo_url}
                  alt={restaurant.name}
                  width={50}
                  height={50}
                  className="rounded-lg object-contain"
                />
              )}
              <h2
                className="font-bold text-lg"
                style={{ color: textColor }}
              >
                {restaurant.name}
              </h2>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-full transition-colors hover:opacity-80"
              style={{ color: finalIconColor }}
              aria-label="Kapat"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 p-4 space-y-6" style={{ backgroundColor: surfaceColor }}>
            {/* About Us */}
            {restaurant.about_us && (
              <section>
                <h3
                  className="flex items-center gap-2 text-sm font-bold mb-3 uppercase tracking-wide"
                  style={{ color: textColor }}
                >
                  <span className="material-symbols-outlined" style={{ color: finalIconColor }}>info</span>
                  Hakkımızda
                </h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: textColor, opacity: 0.8 }}
                >
                  {restaurant.about_us}
                </p>
              </section>
            )}

            {/* Contact Info */}
            <section>
              <h3
                className="flex items-center gap-2 text-sm font-bold mb-3 uppercase tracking-wide"
                style={{ color: textColor }}
              >
                <span className="material-symbols-outlined" style={{ color: finalIconColor }}>contact_phone</span>
                İletişim
              </h3>
              <div className="space-y-3">
                {/* Phone */}
                {restaurant.phone ? (
                  <a
                    href={`tel:${restaurant.phone}`}
                    className="flex items-center gap-3 p-3 rounded-lg transition-colors hover:opacity-90"
                    style={{ backgroundColor: surfaceColor }}
                  >
                    <span className="material-symbols-outlined flex-shrink-0" style={{ color: finalIconColor }}>call</span>
                    <span className="text-sm" style={{ color: textColor }}>{restaurant.phone}</span>
                  </a>
                ) : (
                  <div
                    className="flex items-center gap-3 p-3 rounded-lg"
                    style={{ backgroundColor: surfaceColor }}
                  >
                    <span className="material-symbols-outlined flex-shrink-0" style={{ color: finalIconColor }}>call</span>
                    <span className="text-sm" style={{ color: textColor, opacity: 0.6 }}>Telefon bilgisi eklenmemiş</span>
                  </div>
                )}
                
                {/* Email */}
                {restaurant.email ? (
                  <a
                    href={`mailto:${restaurant.email}`}
                    className="flex items-center gap-3 p-3 rounded-lg transition-colors hover:opacity-90"
                    style={{ backgroundColor: surfaceColor }}
                  >
                    <span className="material-symbols-outlined flex-shrink-0" style={{ color: finalIconColor }}>mail</span>
                    <span className="text-sm break-all" style={{ color: textColor }}>{restaurant.email}</span>
                  </a>
                ) : (
                  <div
                    className="flex items-center gap-3 p-3 rounded-lg"
                    style={{ backgroundColor: surfaceColor }}
                  >
                    <span className="material-symbols-outlined flex-shrink-0" style={{ color: finalIconColor }}>mail</span>
                    <span className="text-sm" style={{ color: textColor, opacity: 0.6 }}>E-posta bilgisi eklenmemiş</span>
                  </div>
                )}
                
                {/* Address */}
                {restaurant.address ? (
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(restaurant.address)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-3 p-3 rounded-lg transition-colors hover:opacity-90"
                    style={{ backgroundColor: surfaceColor }}
                  >
                    <span className="material-symbols-outlined flex-shrink-0" style={{ color: finalIconColor }}>location_on</span>
                    <span className="text-sm flex-1" style={{ color: textColor }}>{restaurant.address}</span>
                  </a>
                ) : (
                  <div
                    className="flex items-start gap-3 p-3 rounded-lg"
                    style={{ backgroundColor: surfaceColor }}
                  >
                    <span className="material-symbols-outlined flex-shrink-0" style={{ color: finalIconColor }}>location_on</span>
                    <span className="text-sm flex-1" style={{ color: textColor, opacity: 0.6 }}>Adres bilgisi eklenmemiş</span>
                  </div>
                )}
              </div>
            </section>

            {/* Social Media */}
            {hasSocialMedia && (
              <section>
                <h3
                  className="flex items-center gap-2 text-sm font-bold mb-3 uppercase tracking-wide"
                  style={{ color: textColor }}
                >
                  <span className="material-symbols-outlined" style={{ color: finalIconColor }}>share</span>
                  Sosyal Medya
                </h3>
                <div className="flex gap-2 flex-wrap">
                  {restaurant.whatsapp && (
                    <a
                      href={`https://wa.me/${restaurant.whatsapp.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center w-10 h-10 rounded-full bg-green-500 text-white hover:scale-110 transition-transform"
                      aria-label="WhatsApp"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                      </svg>
                    </a>
                  )}
                  {restaurant.instagram && (
                    <a
                      href={restaurant.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 text-white hover:scale-110 transition-transform"
                      aria-label="Instagram"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                      </svg>
                    </a>
                  )}
                  {restaurant.facebook && (
                    <a
                      href={restaurant.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 text-white hover:scale-110 transition-transform"
                      aria-label="Facebook"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                    </a>
                  )}
                  {restaurant.twitter && (
                    <a
                      href={restaurant.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center w-10 h-10 rounded-full bg-black text-white hover:scale-110 transition-transform"
                      aria-label="Twitter / X"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                      </svg>
                    </a>
                  )}
                </div>
              </section>
            )}
          </div>

          {/* Footer */}
          <div
            className="p-4 flex-shrink-0"
            style={{
              backgroundColor: surfaceColor,
              borderTop: `1px solid ${borderColor}`
            }}
          >
            <p 
              className="text-xs text-center"
              style={{ color: textColor, opacity: 0.5 }}
            >
              Powered by QR Menü
            </p>
          </div>
        </div>
      </aside>
    </>
  )
}