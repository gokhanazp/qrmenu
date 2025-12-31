'use client'

import { useRouter } from 'next/navigation'

interface PublicLanguageSwitcherProps {
  supportedLanguages: string[]
  iconColor?: string
  backgroundColor?: string
  slug: string
  currentLang: string
}

const languageNames: Record<string, string> = {
  tr: 'TR',
  en: 'EN',
}

const languageFlags: Record<string, string> = {
  tr: '🇹🇷',
  en: '🇬🇧',
}

export function PublicLanguageSwitcher({
  supportedLanguages,
  iconColor = '#111827',
  backgroundColor = '#ffffff',
  slug,
  currentLang
}: PublicLanguageSwitcherProps) {
  const router = useRouter()

  // Sadece birden fazla dil destekleniyorsa göster
  if (!supportedLanguages || supportedLanguages.length <= 1) {
    return null
  }

  const handleLanguageChange = (lang: string) => {
    if (lang === 'tr') {
      router.push(`/restorant/${slug}`)
    } else {
      router.push(`/restorant/${slug}?lang=${lang}`)
    }
  }

  return (
    <div className="flex items-center">
      {supportedLanguages.map((lang, index) => (
        <button
          key={lang}
          onClick={() => handleLanguageChange(lang)}
          className={`flex items-center justify-center w-8 h-8 rounded-full transition-all ${
            currentLang === lang ? 'ring-2' : 'opacity-50 hover:opacity-100'
          }`}
          style={{
            backgroundColor: currentLang === lang ? `${iconColor}10` : 'transparent',
            ['--tw-ring-color' as string]: `${iconColor}60`
          }}
          title={lang === 'tr' ? 'Türkçe' : 'English'}
        >
          <span className="text-lg">{languageFlags[lang]}</span>
        </button>
      ))}
    </div>
  )
}