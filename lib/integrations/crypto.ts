/**
 * Credential şifreleme (sunucu). AES-256-GCM, anahtar INTEGRATION_SECRET_KEY
 * (64 hex karakter = 32 byte). Format: v1.<iv b64>.<ciphertext b64>.<tag b64>
 */
import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto'
import { IntegrationError } from './errors'

const ALGORITHM = 'aes-256-gcm'
const VERSION = 'v1'

export function getIntegrationKey(): Buffer {
  const raw = process.env.INTEGRATION_SECRET_KEY
  if (!raw) {
    throw new IntegrationError('config', 'INTEGRATION_SECRET_KEY tanımlı değil. .env.local ve Vercel ortam değişkenlerine 64 karakterlik hex anahtar ekleyin.')
  }
  const buf = /^[0-9a-fA-F]{64}$/.test(raw) ? Buffer.from(raw, 'hex') : Buffer.from(raw, 'base64')
  if (buf.length !== 32) {
    throw new IntegrationError('config', 'INTEGRATION_SECRET_KEY 32 byte olmalı (64 hex karakter).')
  }
  return buf
}

export function encryptJson(value: unknown): string {
  const key = getIntegrationKey()
  const iv = randomBytes(12)
  const cipher = createCipheriv(ALGORITHM, key, iv)
  const plaintext = Buffer.from(JSON.stringify(value), 'utf8')
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()])
  const tag = cipher.getAuthTag()
  return [VERSION, iv.toString('base64'), ciphertext.toString('base64'), tag.toString('base64')].join('.')
}

export function decryptJson<T = unknown>(payload: string): T {
  const key = getIntegrationKey()
  const parts = payload.split('.')
  if (parts.length !== 4 || parts[0] !== VERSION) {
    throw new IntegrationError('config', 'Şifreli credential formatı tanınmadı')
  }
  const [, ivB64, ctB64, tagB64] = parts
  const decipher = createDecipheriv(ALGORITHM, key, Buffer.from(ivB64, 'base64'))
  decipher.setAuthTag(Buffer.from(tagB64, 'base64'))
  const plaintext = Buffer.concat([decipher.update(Buffer.from(ctB64, 'base64')), decipher.final()])
  return JSON.parse(plaintext.toString('utf8')) as T
}

export function generateIntegrationKey(): string {
  return randomBytes(32).toString('hex')
}
