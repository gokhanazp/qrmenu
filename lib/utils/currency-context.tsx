'use client'

/**
 * Restoranın para birimini istemci bileşenlerine taşır. Sağlayıcı yoksa TRY
 * (eski davranış) kullanılır; yani sarmalanmamış sayfalar bozulmaz.
 */
import { createContext, useContext, type ReactNode } from 'react'
import { DEFAULT_CURRENCY, normalizeCurrency } from './currency'

const CurrencyContext = createContext<string>(DEFAULT_CURRENCY)

export function CurrencyProvider({ currency, children }: { currency?: string | null; children: ReactNode }) {
  return <CurrencyContext.Provider value={normalizeCurrency(currency)}>{children}</CurrencyContext.Provider>
}

export function useCurrency(): string {
  return useContext(CurrencyContext)
}
