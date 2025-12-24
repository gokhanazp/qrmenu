import { tr } from './tr'
import { en } from './en'
import { Locale } from '../config'

export const translations = {
  tr,
  en,
} as const

export function getTranslations(locale: Locale) {
  return translations[locale] || translations.tr
}