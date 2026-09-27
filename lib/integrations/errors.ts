export type IntegrationErrorCode =
  | 'config'
  | 'auth'
  | 'not_supported'
  | 'not_implemented'
  | 'rate_limited'
  | 'network'
  | 'platform'
  | 'validation'

export class IntegrationError extends Error {
  readonly code: IntegrationErrorCode
  readonly httpStatus?: number
  readonly details?: unknown

  constructor(code: IntegrationErrorCode, message: string, options?: { httpStatus?: number; details?: unknown }) {
    super(message)
    this.name = 'IntegrationError'
    this.code = code
    this.httpStatus = options?.httpStatus
    this.details = options?.details
  }
}

export class NotSupportedError extends IntegrationError {
  constructor(operation: string, platformLabel: string) {
    super('not_supported', `${platformLabel} bu işlemi desteklemiyor: ${operation}`)
    this.name = 'NotSupportedError'
  }
}

export class NotImplementedError extends IntegrationError {
  constructor(operation: string) {
    super('not_implemented', `Henüz uygulanmadı: ${operation}`)
    this.name = 'NotImplementedError'
  }
}

/** Loglara ve UI'ya giden mesajlarda credential sızmasın diye kısaltır. */
export function toSafeErrorMessage(error: unknown): string {
  if (error instanceof IntegrationError) return error.message
  if (error instanceof Error) return error.message.slice(0, 300)
  return String(error).slice(0, 300)
}
