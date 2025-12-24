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
    instagram?: string
    facebook?: string
    twitter?: string
    primary_color?: string
    background_color?: string
    surface_color?: string
    text_color?: string
  }
}

export function HamburgerMenu({ restaurant }: HamburgerMenuProps) {
  const [isOpen, setIsOpen] = useState(false)

  const hasSocialMedia = restaurant.instagram || restaurant.facebook || restaurant.twitter
  
  const primaryColor = restaurant.primary_color || '#FF6B35'
  const backgroundColor = restaurant.background_color || '#ffffff'
  const surfaceColor = restaurant.surface_color || '#f9fafb'
  const textColor = restaurant.text_color || '#111827'
  const borderColor = textColor + '20'

  return (
    <>
      {/* Menu Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center justify-center p-2 rounded-full transition-colors hover:opacity-80"
        style={{ color: textColor }}
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
                  width={40}
                  height={40}
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
              style={{ color: textColor }}
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
                  <span className="material-symbols-outlined" style={{ color: primaryColor }}>info</span>
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
                <span className="material-symbols-outlined" style={{ color: primaryColor }}>contact_phone</span>
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
                    <span className="material-symbols-outlined flex-shrink-0" style={{ color: primaryColor }}>call</span>
                    <span className="text-sm" style={{ color: textColor }}>{restaurant.phone}</span>
                  </a>
                ) : (
                  <div 
                    className="flex items-center gap-3 p-3 rounded-lg"
                    style={{ backgroundColor: surfaceColor }}
                  >
                    <span className="material-symbols-outlined flex-shrink-0" style={{ color: primaryColor }}>call</span>
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
                    <span className="material-symbols-outlined flex-shrink-0" style={{ color: primaryColor }}>mail</span>
                    <span className="text-sm break-all" style={{ color: textColor }}>{restaurant.email}</span>
                  </a>
                ) : (
                  <div 
                    className="flex items-center gap-3 p-3 rounded-lg"
                    style={{ backgroundColor: surfaceColor }}
                  >
                    <span className="material-symbols-outlined flex-shrink-0" style={{ color: primaryColor }}>mail</span>
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
                    <span className="material-symbols-outlined flex-shrink-0" style={{ color: primaryColor }}>location_on</span>
                    <span className="text-sm flex-1" style={{ color: textColor }}>{restaurant.address}</span>
                  </a>
                ) : (
                  <div 
                    className="flex items-start gap-3 p-3 rounded-lg"
                    style={{ backgroundColor: surfaceColor }}
                  >
                    <span className="material-symbols-outlined flex-shrink-0" style={{ color: primaryColor }}>location_on</span>
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
                  <span className="material-symbols-outlined" style={{ color: primaryColor }}>share</span>
                  Sosyal Medya
                </h3>
                <div className="flex gap-3">
                  {restaurant.instagram && (
                    <a
                      href={restaurant.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 text-white hover:scale-110 transition-transform"
                      aria-label="Instagram"
                    >
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                      </svg>
                    </a>
                  )}
                  {restaurant.facebook && (
                    <a
                      href={restaurant.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-600 text-white hover:scale-110 transition-transform"
                      aria-label="Facebook"
                    >
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                    </a>
                  )}
                  {restaurant.twitter && (
                    <a
                      href={restaurant.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center w-12 h-12 rounded-full bg-black text-white hover:scale-110 transition-transform"
                      aria-label="Twitter / X"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
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