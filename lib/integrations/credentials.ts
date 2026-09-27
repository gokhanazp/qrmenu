/**
 * Platform başına credential alan tanımları, doğrulama ve maskeleme (saf).
 * Gizli alanlar (secret: true) istemciye asla düz metin gitmez.
 */
import type { IntegrationEnvironment, MarketplacePlatform } from './types'

export interface CredentialField {
  key: string
  label: string
  secret: boolean
  required: boolean
  placeholder?: string
  help?: string
}

export const PLATFORM_CREDENTIAL_FIELDS: Record<MarketplacePlatform, CredentialField[]> = {
  trendyol_food: [
    { key: 'supplierId', label: 'Satıcı ID (Cari ID)', secret: false, required: true, placeholder: '123456', help: 'Trendyol Partner Paneli → Hesap Bilgilerim → Entegrasyon Bilgileri' },
    { key: 'apiKey', label: 'API Key', secret: true, required: true },
    { key: 'apiSecret', label: 'API Secret', secret: true, required: true },
    { key: 'storeId', label: 'Restoran (Şube) ID', secret: false, required: true, placeholder: '987654', help: 'Bu şubeye ait storeId; zincirde birden fazla şube varsa her şube kendi ID\'siyle bağlanır' },
    { key: 'integratorName', label: 'Entegratör Adı', secret: false, required: false, placeholder: 'SelfIntegration', help: 'User-Agent için; boşsa SelfIntegration' },
    { key: 'executorEmail', label: 'İşlem Yapan E-posta', secret: false, required: false, placeholder: 'ornek@restoran.com', help: 'x-executor-user başlığı; boşsa panel kullanıcısının e-postası' },
  ],
  yemeksepeti: [
    { key: 'clientId', label: 'Client ID', secret: false, required: true, help: 'Yemeksepeti Account Manager tarafından verilir' },
    { key: 'clientSecret', label: 'Client Secret', secret: true, required: true },
    { key: 'chainId', label: 'Chain ID', secret: false, required: true, placeholder: 'f9cc1b05-…' },
    { key: 'vendorId', label: 'Vendor (Mağaza) ID', secret: false, required: true },
    { key: 'baseUrl', label: 'API Adresi (isteğe bağlı)', secret: false, required: false, placeholder: 'https://yemeksepeti.partner.deliveryhero.io', help: 'Sandbox için Yemeksepeti\'nin verdiği adres; boşsa canlı adres' },
  ],
  getir_food: [],
  migros_food: [],
}

export const PLATFORM_ENVIRONMENTS: Record<MarketplacePlatform, IntegrationEnvironment[]> = {
  trendyol_food: ['production', 'stage'],
  yemeksepeti: ['production'],
  getir_food: ['production'],
  migros_food: ['production'],
}

export function isMarketplacePlatform(value: string): value is MarketplacePlatform {
  return value === 'trendyol_food' || value === 'yemeksepeti' || value === 'getir_food' || value === 'migros_food'
}

export interface CredentialValidation {
  ok: boolean
  errors: Record<string, string>
  values: Record<string, string>
}

/**
 * İstemciden gelen alanları temizler; bilinmeyen anahtarları atar, zorunluları
 * denetler. `existing` verilirse boş bırakılan gizli alanlar mevcut değerle korunur
 * (kullanıcı yalnızca değişeni girer).
 */
export function validateCredentials(
  platform: MarketplacePlatform,
  input: Record<string, unknown>,
  existing?: Record<string, string> | null
): CredentialValidation {
  const errors: Record<string, string> = {}
  const values: Record<string, string> = {}
  for (const field of PLATFORM_CREDENTIAL_FIELDS[platform]) {
    const raw = input[field.key]
    let value = typeof raw === 'string' ? raw.trim() : ''
    if (!value && field.secret && existing?.[field.key]) value = existing[field.key]
    if (!value && field.required) {
      errors[field.key] = `${field.label} zorunludur`
      continue
    }
    if (value.length > 500) {
      errors[field.key] = `${field.label} çok uzun`
      continue
    }
    if (field.key === 'baseUrl' && value && !/^https:\/\/[a-z0-9.-]+(\/[^\s]*)?$/i.test(value)) {
      errors[field.key] = 'API adresi https:// ile başlamalı'
      continue
    }
    if (value) values[field.key] = value
  }
  return { ok: Object.keys(errors).length === 0, errors, values }
}

export const MASK = '••••••••'

/** UI için: gizli alanlar maskelenir, diğerleri olduğu gibi. */
export function maskCredentials(platform: MarketplacePlatform, values: Record<string, string> | null | undefined): Record<string, string> {
  const out: Record<string, string> = {}
  if (!values) return out
  for (const field of PLATFORM_CREDENTIAL_FIELDS[platform]) {
    const v = values[field.key]
    if (!v) continue
    out[field.key] = field.secret ? MASK : v
  }
  return out
}

/** Platformun zincir / mağaza kimliklerini credential'lardan çıkarır (sütunlara yazılır). */
export function extractExternalIds(platform: MarketplacePlatform, values: Record<string, string>): { chainId: string | null; storeId: string | null } {
  switch (platform) {
    case 'trendyol_food':
      return { chainId: values.supplierId || null, storeId: values.storeId || null }
    case 'yemeksepeti':
      return { chainId: values.chainId || null, storeId: values.vendorId || null }
    default:
      return { chainId: null, storeId: null }
  }
}
