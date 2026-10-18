/**
 * Para birimi yardımcıları. Restoran bazında para birimi (`restaurants.currency`)
 * ile fiyatlar o ülkenin alışık olduğu biçimde gösterilir: TRY → "₺35,00",
 * CAD → "$35.00", EUR → "35,00 €".
 */
export const DEFAULT_CURRENCY = 'TRY'

export const SUPPORTED_CURRENCIES: { code: string; label: string; locale: string }[] = [
  { code: 'TRY', label: 'Türk Lirası (₺)', locale: 'tr-TR' },
  { code: 'USD', label: 'US Dollar ($)', locale: 'en-US' },
  { code: 'EUR', label: 'Euro (€)', locale: 'de-DE' },
  { code: 'GBP', label: 'British Pound (£)', locale: 'en-GB' },
  { code: 'CAD', label: 'Canadian Dollar ($)', locale: 'en-CA' },
  { code: 'AUD', label: 'Australian Dollar ($)', locale: 'en-AU' },
  { code: 'CHF', label: 'Swiss Franc (CHF)', locale: 'de-CH' },
  { code: 'AED', label: 'UAE Dirham (AED)', locale: 'en-AE' },
  { code: 'SAR', label: 'Saudi Riyal (SAR)', locale: 'en-SA' },
  { code: 'QAR', label: 'Qatari Riyal (QAR)', locale: 'en-QA' },
  { code: 'AZN', label: 'Azerbaijani Manat (₼)', locale: 'az-AZ' },
  { code: 'GEL', label: 'Georgian Lari (₾)', locale: 'ka-GE' },
  { code: 'RUB', label: 'Russian Ruble (₽)', locale: 'ru-RU' },
  { code: 'SEK', label: 'Swedish Krona (kr)', locale: 'sv-SE' },
  { code: 'NOK', label: 'Norwegian Krone (kr)', locale: 'nb-NO' },
  { code: 'DKK', label: 'Danish Krone (kr)', locale: 'da-DK' },
  { code: 'PLN', label: 'Polish Złoty (zł)', locale: 'pl-PL' },
]

/** Geçerli 3 harfli kod değilse TRY. */
export function normalizeCurrency(value: unknown): string {
  const v = String(value ?? '').trim().toUpperCase()
  return /^[A-Z]{3}$/.test(v) ? v : DEFAULT_CURRENCY
}

export function localeForCurrency(currency: string): string {
  return SUPPORTED_CURRENCIES.find((c) => c.code === currency)?.locale || 'en-US'
}

export function formatCurrency(
  amount: number,
  currency: string = DEFAULT_CURRENCY,
  locale?: string
): string {
  const code = normalizeCurrency(currency)
  try {
    return new Intl.NumberFormat(locale || localeForCurrency(code), { style: 'currency', currency: code }).format(amount)
  } catch {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: DEFAULT_CURRENCY }).format(amount)
  }
}

/** "₺", "$", "€" gibi yalnızca sembol (form etiketleri için). */
export function currencySymbol(currency: string = DEFAULT_CURRENCY): string {
  const code = normalizeCurrency(currency)
  try {
    const part = new Intl.NumberFormat(localeForCurrency(code), { style: 'currency', currency: code })
      .formatToParts(0)
      .find((p) => p.type === 'currency')
    return part?.value || code
  } catch {
    return code
  }
}
