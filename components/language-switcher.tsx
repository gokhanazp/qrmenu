'use client'

import { useLocale } from '@/lib/i18n/use-locale'
import { locales, localeNames, Locale } from '@/lib/i18n/config'

export function LanguageSwitcher() {
  const { locale, setLocale } = useLocale()

  return (
    <div className="flex items-center gap-2">
      {locales.map((loc) => (
        <button
          key={loc}
          onClick={() => setLocale(loc)}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            locale === loc
              ? 'bg-[#ec6d13] text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          {localeNames[loc]}
        </button>
      ))}
    </div>
  )
}